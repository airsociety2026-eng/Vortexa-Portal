import crypto from "crypto";
import { db } from "@/lib/db";

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
  isMatched?: boolean;
  matchedMemberName?: string;
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
  isUnmatched?: boolean;
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
  unmatchedContributors: string[];
  syncedAt: string;
}

/**
 * Parses any GitHub URL or string into owner and repo name.
 * e.g., "https://github.com/airsociety2026-eng/Vortexa-Portal.git" -> { owner: "airsociety2026-eng", repo: "Vortexa-Portal" }
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url || typeof url !== "string") return null;

  let cleaned = url.trim();
  cleaned = cleaned.replace(/\?.*$/, ""); // strip query params
  cleaned = cleaned.replace(/#.*$/, ""); // strip hash
  cleaned = cleaned.replace(/\.git$/, ""); // strip .git suffix
  cleaned = cleaned.replace(/\/$/, ""); // strip trailing slash

  // Match patterns like https://github.com/owner/repo or github.com/owner/repo or owner/repo
  const match = cleaned.match(/(?:github\.com\/|^)([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (match && match[1] && match[2]) {
    // Avoid false positives like "http://github.com"
    if (match[1] === "http:" || match[1] === "https:") return null;
    return { owner: match[1], repo: match[2] };
  }

  return null;
}

/**
 * Constant-time verification of GitHub Webhook HMAC SHA-256 signature (X-Hub-Signature-256).
 */
export function verifyGitHubWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.GITHUB_WEBHOOK_SECRET || "vortexa_webhook_secret_2026";
  if (!signatureHeader || !webhookSecret) return false;

  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") return false;

  const signatureHash = parts[1];
  try {
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(rawBody);
    const computedHash = hmac.digest("hex");

    const sigBuffer = Buffer.from(signatureHash, "hex");
    const compBuffer = Buffer.from(computedHash, "hex");

    if (sigBuffer.length !== compBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, compBuffer);
  } catch (err) {
    console.error("Webhook signature verification error:", err);
    return false;
  }
}

/**
 * Match a contributor/author against registered team members.
 */
export function matchContributorToMembers(
  author: { name?: string | null; email?: string | null; login?: string | null },
  members: { name: string; email?: string | null }[]
): { matched: boolean; memberName?: string } {
  if (!members || members.length === 0) return { matched: false };

  const authorNameLower = (author.name || "").toLowerCase().trim();
  const authorEmailLower = (author.email || "").toLowerCase().trim();
  const authorLoginLower = (author.login || "").toLowerCase().trim();

  for (const member of members) {
    const memberNameLower = (member.name || "").toLowerCase().trim();
    const memberEmailLower = (member.email || "").toLowerCase().trim();

    // 1. Exact or email match
    if (authorEmailLower && memberEmailLower && authorEmailLower === memberEmailLower) {
      return { matched: true, memberName: member.name };
    }

    // 2. Name contains / match
    if (authorNameLower && memberNameLower) {
      if (authorNameLower === memberNameLower) {
        return { matched: true, memberName: member.name };
      }
      const memberFirst = memberNameLower.split(" ")[0];
      if (memberFirst.length > 2 && (authorNameLower.includes(memberFirst) || memberNameLower.includes(authorNameLower))) {
        return { matched: true, memberName: member.name };
      }
    }

    // 3. GitHub username match against first name
    if (authorLoginLower && memberNameLower) {
      const memberFirst = memberNameLower.split(" ")[0];
      if (memberFirst.length > 2 && authorLoginLower.includes(memberFirst)) {
        return { matched: true, memberName: member.name };
      }
    }
  }

  return { matched: false };
}

/**
 * Common headers for GitHub REST API requests
 */
function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "VORTEXA-Hackathon-Platform",
  };

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim().length > 0) {
    headers["Authorization"] = `token ${process.env.GITHUB_TOKEN.trim()}`;
  }

  return headers;
}

/**
 * Fetches repository overview, commits, branches, PRs, and contributors from GitHub REST API.
 */
export async function fetchGitHubRepoData(
  owner: string,
  repo: string,
  teamMembers?: { name: string; email?: string | null }[]
): Promise<GitHubRepoDetails> {
  const headers = getGitHubHeaders();

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
    unmatchedContributors: [],
    syncedAt: new Date().toISOString(),
  };

  try {
    // 1. Fetch Repository Overview
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 60 },
    });

    if (!repoRes.ok) {
      const remaining = repoRes.headers.get("x-ratelimit-remaining");
      const reset = repoRes.headers.get("x-ratelimit-reset");

      if (repoRes.status === 403 && remaining === "0") {
        const resetTime = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : "soon";
        result.errorMessage = `GitHub API rate limit exceeded. Resets at ${resetTime}.`;
      } else if (repoRes.status === 404) {
        result.errorMessage = "Repository not found or private. Public repository or authorized GitHub token required.";
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

    // 2. Fetch Commits (up to 50)
    try {
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`,
        { headers, next: { revalidate: 60 } }
      );
      if (commitsRes.ok) {
        const commitsData = await commitsRes.json();
        if (Array.isArray(commitsData)) {
          result.totalCommits = commitsData.length;
          result.commits = commitsData.map((c: any) => {
            const authorName = c.commit?.author?.name || c.author?.login || "Unknown";
            const authorEmail = c.commit?.author?.email;
            const authorLogin = c.author?.login;

            let matchResult: { matched: boolean; memberName?: string } = { matched: false };
            if (teamMembers) {
              matchResult = matchContributorToMembers(
                { name: authorName, email: authorEmail, login: authorLogin },
                teamMembers
              );
            }

            return {
              sha: c.sha,
              shortSha: c.sha.substring(0, 7),
              message: (c.commit?.message || "No commit message").split("\n")[0],
              authorName,
              authorEmail,
              authorAvatarUrl: c.author?.avatar_url,
              authorUsername: authorLogin,
              date: c.commit?.author?.date || new Date().toISOString(),
              htmlUrl: c.html_url,
              isMatched: matchResult.matched,
              matchedMemberName: matchResult.memberName,
            };
          });

          if (result.commits.length > 0) {
            result.lastCommitTime = result.commits[0].date;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch commits from GitHub:", err);
    }

    // 3. Fetch Branches
    try {
      const branchesRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches?per_page=10`,
        { headers, next: { revalidate: 120 } }
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
        { headers, next: { revalidate: 120 } }
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

    // 5. Fetch Contributors & Match Roster
    try {
      const contribRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=20`,
        { headers, next: { revalidate: 120 } }
      );
      if (contribRes.ok) {
        const contribData = await contribRes.json();
        if (Array.isArray(contribData)) {
          const unmatched: string[] = [];
          result.contributors = contribData.map((c: any) => {
            let matchedMemberName: string | undefined = undefined;
            let isUnmatched = true;

            if (teamMembers && teamMembers.length > 0) {
              const match = matchContributorToMembers(
                { name: c.login, login: c.login },
                teamMembers
              );
              if (match.matched) {
                matchedMemberName = match.memberName;
                isUnmatched = false;
              }
            }

            if (isUnmatched) {
              unmatched.push(c.login);
            }

            return {
              login: c.login,
              avatarUrl: c.avatar_url,
              contributions: c.contributions,
              htmlUrl: c.html_url,
              matchedMemberName,
              isUnmatched,
            };
          });
          result.unmatchedContributors = unmatched;
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

/**
 * Synchronizes and backfills commits from GitHub REST API into the database `Commit` model.
 * Safe against duplicates using `upsert`.
 */
export async function syncTeamCommitsFromGitHub(
  teamId: string,
  owner: string,
  repo: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const headers = getGitHubHeaders();

    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`,
      { headers, cache: "no-store" }
    );

    if (!commitsRes.ok) {
      const remaining = commitsRes.headers.get("x-ratelimit-remaining");
      if (commitsRes.status === 403 && remaining === "0") {
        return { success: false, count: 0, error: "GitHub API rate limit exceeded. Please wait a few minutes." };
      }
      return {
        success: false,
        count: 0,
        error: `GitHub API error (${commitsRes.status}): ${commitsRes.statusText}`,
      };
    }

    const commitsData = await commitsRes.json();
    if (!Array.isArray(commitsData)) {
      return { success: false, count: 0, error: "Unexpected response format from GitHub API" };
    }

    let saved = 0;
    for (const c of commitsData) {
      if (!c.sha) continue;

      const message = (c.commit?.message || "No commit message").split("\n")[0];
      const authorName = c.commit?.author?.name || c.author?.login || "Unknown";
      const authorEmail = c.commit?.author?.email || null;
      const url = c.html_url || `https://github.com/${owner}/${repo}/commit/${c.sha}`;
      const timestamp = c.commit?.author?.date ? new Date(c.commit.author.date) : new Date();

      await db.commit.upsert({
        where: { sha: c.sha },
        update: {
          message,
          author_name: authorName,
          author_email: authorEmail,
          url,
          timestamp,
        },
        create: {
          sha: c.sha,
          message,
          author_name: authorName,
          author_email: authorEmail,
          url,
          timestamp,
          team_id: teamId,
        },
      });
      saved++;
    }

    // Update submission last synced timestamp
    await db.submission.updateMany({
      where: { team_id: teamId },
      data: {
        github_owner: owner,
        github_repo: repo,
        github_last_synced_at: new Date(),
      },
    });

    return { success: true, count: saved };
  } catch (error: any) {
    console.error("Failed to sync team commits from GitHub:", error);
    return { success: false, count: 0, error: error.message || "Failed to synchronize commits" };
  }
}
