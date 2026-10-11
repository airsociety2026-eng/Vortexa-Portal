import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isAdminOrSuper } from "@/lib/rbac";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { parseGitHubUrl, syncTeamCommitsFromGitHub } from "@/lib/github";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return apiError("Authentication required", 401);
    }

    let targetTeamId: string | null = null;
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    if (body.teamId) {
      if (!isAdminOrSuper(session)) {
        // Non-admin can only sync their own team
        const membership = await db.teamMember.findFirst({
          where: { participant_id: session.participantId || "" },
        });
        if (!membership || membership.team_id !== body.teamId) {
          return apiError("You do not have permission to sync another team's repository", 403);
        }
      }
      targetTeamId = body.teamId;
    } else {
      // Default to participant's team
      if (!session.participantId) {
        return apiError("Participant profile or teamId required", 400);
      }
      const membership = await db.teamMember.findFirst({
        where: { participant_id: session.participantId },
      });
      if (!membership) {
        return apiError("You are not part of any team yet", 400);
      }
      targetTeamId = membership.team_id;
    }

    if (!targetTeamId) {
      return apiError("Team identification required", 400);
    }

    const team = await db.team.findUnique({
      where: { id: targetTeamId },
      include: {
        submission: true,
      },
    });

    if (!team) {
      return apiError("Team not found", 404);
    }

    if (!team.submission || !team.submission.github_url) {
      return apiError("No GitHub repository URL submitted for this team yet", 400);
    }

    const parsed = parseGitHubUrl(team.submission.github_url);
    if (!parsed) {
      return apiError("Invalid GitHub repository URL format", 400);
    }

    const syncResult = await syncTeamCommitsFromGitHub(team.id, parsed.owner, parsed.repo);

    if (!syncResult.success) {
      return apiError(syncResult.error || "Failed to synchronize commits from GitHub", 400);
    }

    const commits = await db.commit.findMany({
      where: { team_id: team.id },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return apiResponse(true, {
      message: `Synchronized ${syncResult.count} commits successfully!`,
      totalCommits: commits.length,
      lastSyncedAt: new Date().toISOString(),
      commits,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to sync GitHub repository", 500);
  }
}
