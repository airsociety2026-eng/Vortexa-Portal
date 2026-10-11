import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { verifyGitHubWebhookSignature } from "@/lib/github";

export async function POST(req: NextRequest) {
  let deliveryId: string | null = null;
  let eventType = "unknown";
  let webhookRecordId: string | null = null;

  try {
    // 1. Extract GitHub Webhook Headers
    deliveryId = req.headers.get("x-github-delivery");
    eventType = req.headers.get("x-github-event") || "unknown";
    const signature = req.headers.get("x-hub-signature-256");

    // 2. Read Raw Request Body for HMAC Signature Verification
    const rawBody = await req.text();
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "vortexa_webhook_secret_2026";

    // 3. Cryptographic Signature Verification
    if (signature || process.env.NODE_ENV === "production") {
      const isValid = verifyGitHubWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn(`[GitHub Webhook] Invalid signature rejected for event: ${eventType}, delivery: ${deliveryId}`);
        return apiError("Invalid x-hub-signature-256 webhook signature", 401);
      }
    }

    // 4. Idempotency Check & Delivery Deduplication
    const effectiveDelivery = deliveryId || `adhoc-${crypto.randomUUID()}`;
    const existingDelivery = await db.webhookEvent.findUnique({
      where: { github_delivery: effectiveDelivery },
    });

    if (existingDelivery && existingDelivery.status === "PROCESSED") {
      return apiResponse(true, {
        message: "Webhook event already processed (idempotent duplicate skipped)",
        deliveryId: effectiveDelivery,
      });
    }

    // 5. Record Webhook Delivery in Database
    const webhookRecord = await db.webhookEvent.upsert({
      where: { github_delivery: effectiveDelivery },
      update: {
        status: "PENDING",
        error_message: null,
      },
      create: {
        github_delivery: effectiveDelivery,
        event_type: eventType,
        payload: rawBody.slice(0, 10000), // Protect against multi-MB push payloads
        status: "PENDING",
      },
    });
    webhookRecordId = webhookRecord.id;

    // 6. Parse JSON Payload
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      await db.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: { status: "FAILED", error_message: "Malformed JSON payload" },
      });
      return apiError("Malformed JSON payload in webhook request", 400);
    }

    // 7. Handle Ping Event
    if (eventType === "ping") {
      await db.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: { status: "PROCESSED" },
      });

      return apiResponse(true, {
        message: "GitHub webhook ping received and verified successfully!",
        zen: payload.zen || "Keep it logically awesome.",
        hookId: payload.hook_id,
      });
    }

    // 8. Handle Push Event
    if (eventType === "push") {
      const repoFullName = payload.repository?.full_name; // e.g. "airsociety/vortexa"
      const repoName = payload.repository?.name;
      const repoOwner =
        payload.repository?.owner?.login || payload.repository?.owner?.name;
      const repoHtmlUrl = payload.repository?.html_url;

      if (!repoFullName && (!repoName || !repoOwner)) {
        await db.webhookEvent.update({
          where: { id: webhookRecord.id },
          data: { status: "FAILED", error_message: "Missing repository information in push payload" },
        });
        return apiError("Missing repository details in webhook payload", 400);
      }

      // Find the Team Submission linked to this repository
      const submission = await db.submission.findFirst({
        where: {
          OR: [
            {
              github_owner: { equals: repoOwner, mode: "insensitive" as const },
              github_repo: { equals: repoName, mode: "insensitive" as const },
            },
            {
              github_url: {
                contains: repoFullName || `${repoOwner}/${repoName}`,
                mode: "insensitive" as const,
              },
            },
            ...(repoHtmlUrl
              ? [{ github_url: { equals: repoHtmlUrl, mode: "insensitive" as const } }]
              : []),
          ],
        },
        include: {
          team: {
            include: {
              members: {
                include: { participant: true },
              },
            },
          },
        },
      });

      if (!submission) {
        // Unknown repo: mark as IGNORED / PROCESSED and return 200 so GitHub doesn't retry
        await db.webhookEvent.update({
          where: { id: webhookRecord.id },
          data: {
            status: "PROCESSED",
            error_message: `No active team registered with repository: ${repoFullName || repoName}`,
          },
        });

        return apiResponse(true, {
          message: `Webhook received but no registered team is linked to repository "${repoFullName || repoName}".`,
          matched: false,
        });
      }

      // Extract & Upsert Commits
      const commits = Array.isArray(payload.commits) ? payload.commits : [];
      let savedCount = 0;

      for (const c of commits) {
        const sha = c.id || c.sha;
        if (!sha) continue;

        const message = (c.message || "No commit message").split("\n")[0].slice(0, 500);
        const authorName =
          c.author?.name || c.committer?.name || c.author?.username || "Unknown";
        const authorEmail = c.author?.email || c.committer?.email || null;
        const url =
          c.url ||
          `https://github.com/${repoOwner}/${repoName}/commit/${sha}`;
        const timestamp = c.timestamp ? new Date(c.timestamp) : new Date();

        await db.commit.upsert({
          where: { sha },
          update: {
            message,
            author_name: authorName,
            author_email: authorEmail,
            url,
            timestamp,
          },
          create: {
            sha,
            message,
            author_name: authorName,
            author_email: authorEmail,
            url,
            timestamp,
            team_id: submission.team_id,
          },
        });
        savedCount++;
      }

      // Update submission's last synced timestamp
      await db.submission.update({
        where: { id: submission.id },
        data: {
          github_owner: repoOwner,
          github_repo: repoName,
          github_last_synced_at: new Date(),
        },
      });

      // Mark WebhookEvent as PROCESSED
      await db.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: { status: "PROCESSED" },
      });

      return apiResponse(true, {
        message: `Successfully processed ${savedCount} commits for Team "${submission.team.team_name}" (${submission.team.team_code})`,
        teamId: submission.team_id,
        teamCode: submission.team.team_code,
        savedCommits: savedCount,
      });
    }

    // 9. Other Webhook Events (e.g. issues, star, workflow_run)
    await db.webhookEvent.update({
      where: { id: webhookRecord.id },
      data: { status: "PROCESSED" },
    });

    return apiResponse(true, {
      message: `GitHub webhook event "${eventType}" acknowledged.`,
    });
  } catch (error: any) {
    console.error("[GitHub Webhook Error]:", error);

    if (webhookRecordId) {
      try {
        await db.webhookEvent.update({
          where: { id: webhookRecordId },
          data: {
            status: "FAILED",
            error_message: error.message || "Unknown error during webhook processing",
          },
        });
      } catch (_) {}
    }

    return apiError(error.message || "Internal server error processing webhook", 500);
  }
}
