import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { parseGitHubUrl, fetchGitHubRepoData } from "@/lib/github";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const all = searchParams.get("all") === "true";

    // 1. Single Team GitHub Monitoring Request
    if (teamId) {
      const team = await db.team.findUnique({
        where: { id: teamId },
        include: {
          submission: true,
          members: {
            include: {
              participant: true,
            },
          },
        },
      });

      if (!team) {
        return apiError("Team not found", 404);
      }

      if (!team.submission || !team.submission.github_url) {
        return apiResponse(true, {
          team: {
            id: team.id,
            team_code: team.team_code,
            team_name: team.team_name,
          },
          hasSubmission: false,
          message: "Team has not submitted a GitHub repository URL yet.",
        });
      }

      const parsed = parseGitHubUrl(team.submission.github_url);
      if (!parsed) {
        return apiResponse(true, {
          team: {
            id: team.id,
            team_code: team.team_code,
            team_name: team.team_name,
          },
          hasSubmission: true,
          githubUrl: team.submission.github_url,
          accessible: false,
          errorMessage: "Invalid GitHub URL format provided by participant.",
        });
      }

      const teamMemberNames = team.members.map((m) => ({
        name: m.participant.name,
      }));

      // Fetch real GitHub API activity
      const repoDetails = await fetchGitHubRepoData(
        parsed.owner,
        parsed.repo,
        teamMemberNames
      );

      // Update submission metadata in DB
      await db.submission.update({
        where: { id: team.submission.id },
        data: {
          github_owner: parsed.owner,
          github_repo: parsed.repo,
          github_last_synced_at: new Date(),
        },
      });

      return apiResponse(true, {
        team: {
          id: team.id,
          team_code: team.team_code,
          team_name: team.team_name,
          members: team.members.map((m) => m.participant.name),
        },
        hasSubmission: true,
        githubUrl: team.submission.github_url,
        projectTitle: team.submission.project_title,
        repoDetails,
      });
    }

    // 2. All Teams Overview Request for Live Admin Monitoring
    if (all) {
      const teams = await db.team.findMany({
        include: {
          submission: true,
          members: {
            include: {
              participant: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      const monitoredTeams = await Promise.all(
        teams.map(async (t) => {
          if (!t.submission || !t.submission.github_url) {
            return {
              id: t.id,
              team_code: t.team_code,
              team_name: t.team_name,
              hasSubmission: false,
              githubUrl: null,
              accessible: false,
              totalCommits: 0,
              lastCommitTime: null,
            };
          }

          const parsed = parseGitHubUrl(t.submission.github_url);
          if (!parsed) {
            return {
              id: t.id,
              team_code: t.team_code,
              team_name: t.team_name,
              hasSubmission: true,
              githubUrl: t.submission.github_url,
              accessible: false,
              totalCommits: 0,
              lastCommitTime: null,
              errorMessage: "Invalid URL",
            };
          }

          const memberNames = t.members.map((m) => ({ name: m.participant.name }));
          const repoDetails = await fetchGitHubRepoData(parsed.owner, parsed.repo, memberNames);

          return {
            id: t.id,
            team_code: t.team_code,
            team_name: t.team_name,
            hasSubmission: true,
            githubUrl: t.submission.github_url,
            projectTitle: t.submission.project_title,
            accessible: repoDetails.accessible,
            totalCommits: repoDetails.totalCommits,
            lastCommitTime: repoDetails.lastCommitTime,
            latestCommitMessage: repoDetails.commits[0]?.message || null,
            latestCommitAuthor: repoDetails.commits[0]?.authorName || null,
            contributorsCount: repoDetails.contributors.length,
            branchesCount: repoDetails.branches.length,
            pullRequestsCount: repoDetails.pullRequests.length,
            errorMessage: repoDetails.errorMessage,
          };
        })
      );

      // Compute statistics
      const totalTeams = teams.length;
      const totalSubmissions = monitoredTeams.filter((t) => t.hasSubmission).length;
      const activeRepos = monitoredTeams.filter((t) => t.accessible).length;

      const now = new Date().getTime();
      const last1Hour = monitoredTeams.filter((t) => {
        if (!t.lastCommitTime) return false;
        const diffMs = now - new Date(t.lastCommitTime).getTime();
        return diffMs <= 60 * 60 * 1000;
      }).length;

      const last3Hours = monitoredTeams.filter((t) => {
        if (!t.lastCommitTime) return false;
        const diffMs = now - new Date(t.lastCommitTime).getTime();
        return diffMs <= 3 * 60 * 60 * 1000;
      }).length;

      const noRecentActivity = monitoredTeams.filter(
        (t) => t.hasSubmission && (!t.lastCommitTime || now - new Date(t.lastCommitTime).getTime() > 3 * 60 * 60 * 1000)
      ).length;

      return apiResponse(true, {
        stats: {
          totalTeams,
          totalSubmissions,
          activeRepos,
          last1Hour,
          last3Hours,
          noRecentActivity,
        },
        teams: monitoredTeams,
      });
    }

    return apiError("Please specify teamId or all=true parameter", 400);
  } catch (error: any) {
    return apiError(error.message || "Failed to monitor GitHub repository", 500);
  }
}
