import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";
import { parseGitHubUrl, fetchGitHubRepoData, syncTeamCommitsFromGitHub, matchContributorToMembers } from "@/lib/github";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const all = searchParams.get("all") === "true";
    const forceSync = searchParams.get("sync") === "true";

    // 1. Single Team GitHub Monitoring Request
    if (teamId) {
      const team = await db.team.findUnique({
        where: { id: teamId },
        include: {
          submission: true,
          commits: {
            orderBy: { timestamp: "desc" },
            take: 100,
          },
          members: {
            include: {
              participant: {
                include: { user: true },
              },
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
            members: team.members.map((m) => m.participant.name),
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
            members: team.members.map((m) => m.participant.name),
          },
          hasSubmission: true,
          githubUrl: team.submission.github_url,
          accessible: false,
          errorMessage: "Invalid GitHub URL format provided by participant.",
        });
      }

      const teamMembersList = team.members.map((m) => ({
        name: m.participant.name,
        email: m.participant.user?.email || null,
      }));

      // If forceSync requested or if 0 commits stored so far, backfill from GitHub REST API
      if (forceSync || team.commits.length === 0) {
        await syncTeamCommitsFromGitHub(team.id, parsed.owner, parsed.repo);
      }

      // Re-fetch persisted commits from DB
      const dbCommits = await db.commit.findMany({
        where: { team_id: team.id },
        orderBy: { timestamp: "desc" },
        take: 100,
      });

      // Try fetching live metadata (branches, PRs, stargazers)
      let liveRepoData = await fetchGitHubRepoData(parsed.owner, parsed.repo, teamMembersList);

      // Merge DB commits if liveRepoData failed or returned fewer commits
      const mergedCommits = dbCommits.map((c) => {
        const match = matchContributorToMembers(
          { name: c.author_name, email: c.author_email },
          teamMembersList
        );
        return {
          sha: c.sha,
          shortSha: c.sha.substring(0, 7),
          message: c.message,
          authorName: c.author_name,
          authorEmail: c.author_email,
          date: c.timestamp.toISOString(),
          htmlUrl: c.url,
          isMatched: match.matched,
          matchedMemberName: match.memberName,
        };
      });

      // Aggregate contributor statistics from persisted commits
      const contributorStats: Record<string, { count: number; email?: string; matchedMemberName?: string; isMatched: boolean }> = {};
      mergedCommits.forEach((c) => {
        const key = c.authorName || "Unknown";
        if (!contributorStats[key]) {
          const match = matchContributorToMembers(
            { name: c.authorName, email: c.authorEmail },
            teamMembersList
          );
          contributorStats[key] = {
            count: 0,
            email: c.authorEmail || undefined,
            matchedMemberName: match.memberName,
            isMatched: match.matched,
          };
        }
        contributorStats[key].count++;
      });

      const aggregatedContributors = Object.entries(contributorStats).map(([name, data]) => ({
        login: name,
        avatarUrl: `https://github.com/${name.replace(/\s+/g, "")}.png`,
        contributions: data.count,
        htmlUrl: `https://github.com/${parsed.owner}/${parsed.repo}/commits?author=${encodeURIComponent(name)}`,
        matchedMemberName: data.matchedMemberName,
        isUnmatched: !data.isMatched,
      }));

      const finalRepoDetails = {
        owner: parsed.owner,
        repo: parsed.repo,
        fullName: `${parsed.owner}/${parsed.repo}`,
        description: liveRepoData.accessible ? liveRepoData.description : null,
        defaultBranch: liveRepoData.accessible ? liveRepoData.defaultBranch : "main",
        stars: liveRepoData.stars,
        forks: liveRepoData.forks,
        openIssuesCount: liveRepoData.openIssuesCount,
        isPrivate: liveRepoData.isPrivate,
        lastUpdated: liveRepoData.lastUpdated,
        htmlUrl: team.submission.github_url,
        accessible: liveRepoData.accessible || mergedCommits.length > 0,
        errorMessage: liveRepoData.errorMessage,
        totalCommits: mergedCommits.length,
        lastCommitTime: mergedCommits[0]?.date || null,
        commits: mergedCommits,
        branches: liveRepoData.branches,
        pullRequests: liveRepoData.pullRequests,
        contributors: aggregatedContributors.length > 0 ? aggregatedContributors : liveRepoData.contributors,
        unmatchedContributors: aggregatedContributors.filter((c) => c.isUnmatched).map((c) => c.login),
        syncedAt: team.submission.github_last_synced_at?.toISOString() || new Date().toISOString(),
      };

      // Retrieve recent Webhook events count
      const webhookEventsCount = await db.webhookEvent.count({
        where: {
          payload: { contains: parsed.repo },
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
        lastSyncedAt: team.submission.github_last_synced_at,
        webhookEventsReceived: webhookEventsCount,
        repoDetails: finalRepoDetails,
      });
    }

    // 2. All Teams Overview Request for Live Admin Monitoring (DB Optimized)
    if (all) {
      const teams = await db.team.findMany({
        include: {
          submission: true,
          commits: {
            orderBy: { timestamp: "desc" },
            take: 1, // Only need latest commit for the list table
          },
          _count: {
            select: { commits: true },
          },
        },
        orderBy: { created_at: "desc" },
      });

      const monitoredTeams = teams.map((t) => {
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

        const latestCommit = t.commits[0];
        const totalCommits = t._count.commits;

        return {
          id: t.id,
          team_code: t.team_code,
          team_name: t.team_name,
          hasSubmission: true,
          githubUrl: t.submission.github_url,
          projectTitle: t.submission.project_title,
          accessible: totalCommits > 0 || !!t.submission.github_owner,
          totalCommits,
          lastCommitTime: latestCommit ? latestCommit.timestamp.toISOString() : null,
          latestCommitMessage: latestCommit ? latestCommit.message : null,
          latestCommitAuthor: latestCommit ? latestCommit.author_name : null,
          lastSyncedAt: t.submission.github_last_synced_at?.toISOString() || null,
        };
      });

      // Compute statistics directly
      const totalTeams = teams.length;
      const totalSubmissions = monitoredTeams.filter((t) => t.hasSubmission).length;
      const activeRepos = monitoredTeams.filter((t) => t.accessible && t.totalCommits > 0).length;

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
        (t) =>
          t.hasSubmission &&
          (!t.lastCommitTime || now - new Date(t.lastCommitTime).getTime() > 3 * 60 * 60 * 1000)
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
