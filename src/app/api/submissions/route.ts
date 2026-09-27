import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const submissionSchema = z.object({
  projectTitle: z.string().min(3, "Project title required"),
  description: z.string().min(10, "Project description required"),
  techStack: z.string().min(2, "Tech stack required"),
  githubUrl: z
    .string()
    .url("Valid GitHub repository URL required")
    .refine((url) => url.toLowerCase().includes("github.com"), "Must be a valid github.com repository URL"),
  demoUrl: z
    .string()
    .url("Valid Live Demo URL required")
    .min(1, "Live Demo URL is required"),
  youtubeUrl: z
    .string()
    .url("Invalid YouTube URL")
    .refine(
      (url) => !url || url.toLowerCase().includes("youtube.com") || url.toLowerCase().includes("youtu.be"),
      "Must be a valid YouTube URL"
    )
    .or(z.literal(""))
    .optional(),
  googleDriveUrl: z
    .string()
    .url("Invalid Google Drive URL")
    .refine(
      (url) => !url || url.toLowerCase().includes("drive.google.com"),
      "Must be a valid Google Drive URL"
    )
    .or(z.literal(""))
    .optional(),
  videoUrl: z.string().optional(),
  additionalLinks: z.string().optional(),
  projectFiles: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).default("SUBMITTED"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return apiError("Authentication required", 401);

    if (isAdminOrSuper(session)) {
      const submissions = await db.submission.findMany({
        include: {
          team: {
            include: {
              members: {
                include: { participant: true },
              },
              result: true,
            },
          },
          scores: {
            include: {
              criteria: true,
              judge: true,
            },
          },
        },
        orderBy: { submitted_at: "desc" },
      });
      return apiResponse(true, submissions);
    }

    if (session.role === "JUDGE") {
      const judge = await db.judge.findUnique({
        where: { user_id: session.userId },
      });

      if (!judge) {
        // If judge profile doesn't exist yet, return empty list gracefully
        return apiResponse(true, []);
      }

      const assignments = await db.judgeAssignment.findMany({
        where: { judge_id: judge.id },
        select: { team_id: true },
      });

      const assignedTeamIds = assignments.map((a) => a.team_id);

      const submissions = await db.submission.findMany({
        where: {
          team_id: { in: assignedTeamIds },
        },
        include: {
          team: {
            include: {
              members: {
                include: { participant: true },
              },
              result: true,
            },
          },
          scores: {
            include: {
              criteria: true,
              judge: true,
            },
          },
        },
        orderBy: { submitted_at: "desc" },
      });

      return apiResponse(true, submissions);
    }

    if (!session.participantId) return apiError("Participant profile required", 400);

    const membership = await db.teamMember.findFirst({
      where: { participant_id: session.participantId },
    });

    if (!membership) return apiResponse(true, null, "No team membership found");

    const submission = await db.submission.findUnique({
      where: { team_id: membership.team_id },
      include: { team: true },
    });

    return apiResponse(true, submission);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch submission", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.participantId) {
      return apiError("Authentication required", 401);
    }

    // Verify user is Team Leader
    const membership = await db.teamMember.findFirst({
      where: { participant_id: session.participantId, role: "LEADER" },
      include: { team: true },
    });

    if (!membership || !membership.team) {
      return apiError("Only the Team Leader can submit or update the team's project", 403);
    }

    const team = membership.team;

    // Check submission deadline from EventSettings
    const settings = await db.eventSettings.findFirst();
    if (settings && settings.submission_deadline) {
      const now = new Date();
      if (now > new Date(settings.submission_deadline)) {
        return apiError(
          "Submission window is LOCKED! The deadline passed at " +
            new Date(settings.submission_deadline).toLocaleString(),
          400
        );
      }
    }

    const body = await req.json();
    const validated = submissionSchema.parse(body);

    const existingSubmission = await db.submission.findUnique({
      where: { team_id: team.id },
    });

    if (existingSubmission && existingSubmission.status === "LOCKED") {
      return apiError("Your submission has been locked by event administrators and cannot be modified.", 403);
    }

    // Extract owner & repo from GitHub URL for monitoring
    let githubOwner = null;
    let githubRepo = null;
    try {
      const cleanUrl = validated.githubUrl.replace(/\/$/, "");
      const parts = cleanUrl.split("github.com/")[1]?.split("/");
      if (parts && parts.length >= 2) {
        githubOwner = parts[0];
        githubRepo = parts[1];
      }
    } catch (_) {}

    const submission = await db.submission.upsert({
      where: { team_id: team.id },
      update: {
        project_title: validated.projectTitle,
        description: validated.description,
        tech_stack: validated.techStack,
        github_url: validated.githubUrl,
        demo_url: validated.demoUrl,
        youtube_url: validated.youtubeUrl || null,
        google_drive_url: validated.googleDriveUrl || null,
        video_url: validated.youtubeUrl || validated.googleDriveUrl || validated.videoUrl || null,
        github_owner: githubOwner,
        github_repo: githubRepo,
        additional_links: validated.additionalLinks || null,
        project_files: validated.projectFiles || null,
        status: validated.status,
        updated_at: new Date(),
      },
      create: {
        team_id: team.id,
        project_title: validated.projectTitle,
        description: validated.description,
        tech_stack: validated.techStack,
        github_url: validated.githubUrl,
        demo_url: validated.demoUrl,
        youtube_url: validated.youtubeUrl || null,
        google_drive_url: validated.googleDriveUrl || null,
        video_url: validated.youtubeUrl || validated.googleDriveUrl || validated.videoUrl || null,
        github_owner: githubOwner,
        github_repo: githubRepo,
        additional_links: validated.additionalLinks || null,
        project_files: validated.projectFiles || null,
        status: validated.status,
      },
    });

    return apiResponse(
      true,
      submission,
      `Project "${submission.project_title}" ${validated.status === "SUBMITTED" ? "submitted" : "saved as draft"} successfully!`
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError(error.errors[0].message, 400);
    }
    return apiError(error.message || "Failed to process project submission", 500);
  }
}
