export interface GitHubCommit {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorEmail?: string;
  authorAvatarUrl?: string;
  authorUsername?: string;
  date: string;
  htmlUrl: string;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
  sha: string;
}

export interface GitHubPullRequest {
  id: number;
  title: string;
  state: "open" | "closed";
  user: string;
  createdAt: string;
  htmlUrl: string;
}

export interface GitHubContributor {
  login: string;
  avatarUrl: string;
  contributions: number;
  htmlUrl: string;
  matchedMemberName?: string;
}

export interface GitHubRepoDetails {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  openIssuesCount: number;
  isPrivate: boolean;
  lastUpdated: string;
  htmlUrl: string;
  accessible: boolean;
  errorMessage?: string;
  totalCommits: number;
  lastCommitTime: string | null;
  commits: GitHubCommit[];
  branches: GitHubBranch[];
  pullRequests: GitHubPullRequest[];
  contributors: GitHubContributor[];
  syncedAt: string;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url || typeof url !== "string") return null;

  let cleaned = url.trim();
  cleaned = cleaned.replace(/\.git$/, "");
  cleaned = cleaned.replace(/\/$/, "");

  // Match patterns like https://github.com/owner/repo or github.com/owner/repo
  const match = cleaned.match(/(?:github\.com\/|^)([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (match && match[1] && match[2]) {
    return { owner: match[1], repo: match[2] };
  }

  return null;
}

export async function fetchGitHubRepoData(
  owner: string,
  repo: string,
  teamMembers?: { name: string }[]
): Promise<GitHubRepoDetails> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "VORTEXA-Hackathon-Platform",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const result: GitHubRepoDetails = {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    description: null,
    defaultBranch: "main",
    stars: 0,
    forks: 0,
    openIssuesCount: 0,
    isPrivate: false,
    lastUpdated: new Date().toISOString(),
    htmlUrl: `https://github.com/${owner}/${repo}`,
    accessible: false,
    totalCommits: 0,
    lastCommitTime: null,
    commits: [],
    branches: [],
    pullRequests: [],
    contributors: [],
    syncedAt: new Date().toISOString(),
  };

  try {
    // 1. Fetch Repository Overview
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 300 }, // 5 min cache
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404 || repoRes.status === 403) {
        result.errorMessage =
          repoRes.status === 404
            ? "Repository not found or private. Authorized GitHub integration required."
            : "GitHub API rate limit exceeded or access forbidden.";
      } else {
        result.errorMessage = `GitHub API Error (${repoRes.status}): ${repoRes.statusText}`;
      }
      return result;
    }

    const repoData = await repoRes.json();
    result.accessible = true;
    result.description = repoData.description || null;
    result.defaultBranch = repoData.default_branch || "main";
    result.stars = repoData.stargazers_count || 0;
    result.forks = repoData.forks_count || 0;
    result.openIssuesCount = repoData.open_issues_count || 0;
    result.isPrivate = repoData.private || false;
    result.lastUpdated = repoData.updated_at || new Date().toISOString();
    result.htmlUrl = repoData.html_url || `https://github.com/${owner}/${repo}`;

    // 2. Fetch Commits
    try {
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`,
        { headers, next: { revalidate: 300 } }
      );
      if (commitsRes.ok) {
        const commitsData = await commitsRes.json();
        if (Array.isArray(commitsData)) {
          result.totalCommits = commitsData.length;
          result.commits = commitsData.map((c: any) => ({
            sha: c.sha,
            shortSha: c.sha.substring(0, 7),
            message: c.commit?.message?.split("\n")[0] || "No message",
            authorName: c.commit?.author?.name || c.author?.login || "Unknown",
            authorEmail: c.commit?.author?.email,
            authorAvatarUrl: c.author?.avatar_url,
            authorUsername: c.author?.login,
            date: c.commit?.author?.date || new Date().toISOString(),
            htmlUrl: c.html_url,
          }));

          if (result.commits.length > 0) {
            result.lastCommitTime = result.commits[0].date;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch commits:", err);
    }

    // 3. Fetch Branches
    try {
      const branchesRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches?per_page=10`,
        { headers, next: { revalidate: 300 } }
      );
      if (branchesRes.ok) {
        const branchesData = await branchesRes.json();
        if (Array.isArray(branchesData)) {
          result.branches = branchesData.map((b: any) => ({
            name: b.name,
            protected: b.protected || false,
            sha: b.commit?.sha?.substring(0, 7) || "",
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch branches:", err);
    }

    // 4. Fetch Pull Requests
    try {
      const prsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=10`,
        { headers, next: { revalidate: 300 } }
      );
      if (prsRes.ok) {
        const prsData = await prsRes.json();
        if (Array.isArray(prsData)) {
          result.pullRequests = prsData.map((p: any) => ({
            id: p.number,
            title: p.title,
            state: p.state,
            user: p.user?.login || "Unknown",
            createdAt: p.created_at,
            htmlUrl: p.html_url,
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch PRs:", err);
    }

    // 5. Fetch Contributors
    try {
      const contribRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`,
        { headers, next: { revalidate: 300 } }
      );
      if (contribRes.ok) {
        const contribData = await contribRes.json();
        if (Array.isArray(contribData)) {
          result.contributors = contribData.map((c: any) => {
            // Attempt simple string matching to team member names if provided
            let matchedMemberName: string | undefined = undefined;
            if (teamMembers && teamMembers.length > 0) {
              const matched = teamMembers.find((m) =>
                m.name.toLowerCase().includes(c.login.toLowerCase()) ||
                c.login.toLowerCase().includes(m.name.toLowerCase().split(" ")[0])
              );
              if (matched) matchedMemberName = matched.name;
            }

            return {
              login: c.login,
              avatarUrl: c.avatar_url,
              contributions: c.contributions,
              htmlUrl: c.html_url,
              matchedMemberName,
            };
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch contributors:", err);
    }

    return result;
  } catch (error: any) {
    result.errorMessage = error.message || "Failed to reach GitHub API";
    return result;
  }
}
