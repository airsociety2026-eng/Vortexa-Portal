import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { generateCertificateCode, apiResponse, apiError } from "@/lib/utils";
import { logAuditAction } from "@/lib/audit";
import { z } from "zod";

const publishSchema = z.object({
  publish: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const isAdmin = isAdminOrSuper(session);

    // If participant, only return if published
    const results = await db.result.findMany({
      where: isAdmin ? {} : { status: "PUBLISHED" },
      include: {
        team: {
          include: {
            submission: true,
            members: {
              include: { participant: true },
            },
          },
        },
      },
      orderBy: { rank: "asc" },
    });

    return apiResponse(true, results);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch results", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!isAdminOrSuper(session)) {
      return apiError("Unauthorized: Admin permissions required", 403);
    }

    const body = await req.json();
    const { publish } = publishSchema.parse(body);

    // Compute rankings across all teams with submissions
    const submissions = await db.submission.findMany({
      include: {
        team: {
          include: {
            members: {
              include: { participant: true },
            },
          },
        },
        scores: {
          include: { criteria: true },
        },
      },
    });

    const teamScoresMap: { teamId: string; totalScore: number }[] = [];

    for (const sub of submissions) {
      const scoreTotal = sub.scores.reduce((sum, item) => sum + item.score_value, 0);
      teamScoresMap.push({
        teamId: sub.team_id,
        totalScore: scoreTotal,
      });
    }

    // Sort descending by total score
    teamScoresMap.sort((a, b) => b.totalScore - a.totalScore);

    const status = publish ? "PUBLISHED" : "DRAFT";
    const publishedAt = publish ? new Date() : null;

    const savedResults = [];

    for (let index = 0; index < teamScoresMap.length; index++) {
      const item = teamScoresMap[index];
      const rank = index + 1;
      let award = "Finalist";
      let certType = "FINALIST";

      if (rank === 1) {
        award = "🏆 1st Place Winner";
        certType = "WINNER";
      } else if (rank === 2) {
        award = "🥈 1st Runner Up";
        certType = "RUNNER_UP";
      } else if (rank === 3) {
        award = "🥉 2nd Runner Up";
        certType = "RUNNER_UP";
      }

      const result = await db.result.upsert({
        where: { team_id: item.teamId },
        update: {
          total_score: item.totalScore,
          rank,
          award,
          status,
          published_at: publishedAt,
        },
        create: {
          team_id: item.teamId,
          total_score: item.totalScore,
          rank,
          award,
          status,
          published_at: publishedAt,
        },
      });

      savedResults.push(result);

      // Auto-issue Certificates if Published
      if (publish) {
        const team = await db.team.findUnique({
          where: { id: item.teamId },
          include: { members: true },
        });

        if (team) {
          for (const member of team.members) {
            const certCode = generateCertificateCode();
            await db.certificate.upsert({
              where: { certificate_code: certCode },
              update: {},
              create: {
                certificate_code: certCode,
                participant_id: member.participant_id,
                team_id: team.id,
                certificate_type: certType,
                event_name: "VORTEXA 2026",
                issue_date: new Date(),
              },
            });
          }
        }
      }
    }

    // Audit Log
    await logAuditAction({
      actorId: session!.userId,
      actorEmail: session!.email,
      action: publish ? "RESULTS_PUBLISHED" : "RESULTS_SAVED_DRAFT",
      entity: "Result",
      details: `Hackathon results ${publish ? "PUBLISHED" : "SAVED AS DRAFT"} for ${savedResults.length} teams.`,
    });

    return apiResponse(
      true,
      savedResults,
      publish ? "🎉 Hackathon Results Published successfully! Certificates are now ready." : "Results saved as draft."
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to publish results", 500);
  }
}
