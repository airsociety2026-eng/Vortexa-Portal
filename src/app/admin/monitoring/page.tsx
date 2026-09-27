"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  Users,
  Clock,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Github,
  Search,
  Code,
  Activity,
  Layers,
} from "lucide-react";

function AdminMonitoringContent() {
  const searchParams = useSearchParams();
  const initialTeamId = searchParams.get("teamId") || "";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId);
  const [selectedTeamData, setSelectedTeamData] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [search, setSearch] = useState("");
  const [timeWindow, setTimeWindow] = useState<"1h" | "3h" | "all">("1h");

  const fetchOverview = () => {
    setRefreshing(true);
    fetch("/api/github/monitor?all=true")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
          // Auto select first team if none selected
          if (!selectedTeamId && res.data.teams?.length > 0) {
            const firstTeamWithSub = res.data.teams.find((t: any) => t.hasSubmission);
            if (firstTeamWithSub) {
              setSelectedTeamId(firstTeamWithSub.id);
            }
          }
        }
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const fetchTeamDetails = (teamId: string) => {
    if (!teamId) return;
    setLoadingTeam(true);
    fetch(`/api/github/monitor?teamId=${teamId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setSelectedTeamData(res.data);
        }
        setLoadingTeam(false);
      })
      .catch(() => setLoadingTeam(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      fetchTeamDetails(selectedTeamId);
    }
  }, [selectedTeamId]);

  const stats = data?.stats || {};
  const teams = data?.teams || [];

  const filteredTeams = teams.filter((t: any) => {
    const matchesSearch =
      t.team_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.team_code?.toLowerCase().includes(search.toLowerCase()) ||
      t.projectTitle?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (timeWindow === "1h") {
      if (!t.lastCommitTime) return false;
      const diffMs = new Date().getTime() - new Date(t.lastCommitTime).getTime();
      return diffMs <= 60 * 60 * 1000;
    }

    if (timeWindow === "3h") {
      if (!t.lastCommitTime) return false;
      const diffMs = new Date().getTime() - new Date(t.lastCommitTime).getTime();
      return diffMs <= 3 * 60 * 60 * 1000;
    }

    return true;
  });

  const selectedTeam = selectedTeamData?.team;
  const repoDetails = selectedTeamData?.repoDetails;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2">
            <Github className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white">Live Hackathon Project Monitor</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GitHub activity tracking, commit timelines, and repository stats for all registered teams.
          </p>
        </div>

        <button
          onClick={() => {
            fetchOverview();
            if (selectedTeamId) fetchTeamDetails(selectedTeamId);
          }}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-glow self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Synchronizing..." : "Refresh GitHub Data"}</span>
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Teams</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.totalTeams || 0}</div>
          <div className="text-[10px] text-slate-500">{stats.totalSubmissions || 0} Submitted Repositories</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span>Active Repositories</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{stats.activeRepos || 0}</div>
          <div className="text-[10px] text-emerald-400/70">Verified & Accessible</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-cyan-400 text-xs">
            <span>Recent Activity (1 Hour)</span>
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400">{stats.last1Hour || 0}</div>
          <div className="text-[10px] text-slate-400">{stats.last3Hours || 0} teams active in last 3 hours</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span>No Recent Activity</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{stats.noRecentActivity || 0}</div>
          <div className="text-[10px] text-slate-400">No commits in last 3 hours</div>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Selector */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center justify-between">
              <span>Select Hackathon Team</span>
              <span className="text-[10px] font-mono text-slate-400">({filteredTeams.length} teams)</span>
            </h3>

            {/* Search and Time Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter team..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex rounded-xl bg-slate-900/80 p-1 border border-white/5 text-[10px] font-mono">
                <button
                  onClick={() => setTimeWindow("all")}
                  className={`flex-1 py-1 rounded-lg font-bold transition ${
                    timeWindow === "all" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Teams
                </button>
                <button
                  onClick={() => setTimeWindow("1h")}
                  className={`flex-1 py-1 rounded-lg font-bold transition ${
                    timeWindow === "1h" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Last 1 Hour
                </button>
                <button
                  onClick={() => setTimeWindow("3h")}
                  className={`flex-1 py-1 rounded-lg font-bold transition ${
                    timeWindow === "3h" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Last 3 Hours
                </button>
              </div>
            </div>

            {/* Team List */}
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs text-slate-400">Loading teams...</span>
              </div>
            ) : filteredTeams.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No teams match your filter.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredTeams.map((t: any) => {
                  const isSelected = selectedTeamId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                          : "bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{t.team_name}</span>
                        <span className="font-mono text-[10px] text-cyan-400">{t.team_code}</span>
                      </div>

                      {t.projectTitle && (
                        <span className="text-[11px] text-slate-400 truncate">{t.projectTitle}</span>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <GitCommit className="w-3 h-3 text-purple-400" />
                          {t.totalCommits || 0} commits
                        </span>
                        <span
                          className={`font-semibold ${
                            t.accessible ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {t.accessible ? "✓ Active" : t.hasSubmission ? "Private / Error" : "No Submission"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed GitHub Activity Monitor for Selected Team */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedTeamId ? (
            <div className="glass-card p-12 rounded-2xl border border-white/10 text-center">
              <Github className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400">Select a team from the list to view GitHub monitoring details.</p>
            </div>
          ) : loadingTeam ? (
            <div className="glass-card p-16 rounded-2xl border border-white/10 text-center">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Fetching GitHub API activity...</p>
            </div>
          ) : selectedTeamData ? (
            <div className="space-y-6">
              {/* Selected Team Overview Card */}
              <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold text-xs">{selectedTeam.team_code}</span>
                      <h2 className="text-xl font-extrabold text-white">{selectedTeam.team_name}</h2>
                    </div>
                    {selectedTeamData.projectTitle && (
                      <p className="text-xs text-slate-300 font-semibold mt-1">
                        Project: {selectedTeamData.projectTitle}
                      </p>
                    )}
                  </div>

                  {selectedTeamData.githubUrl && (
                    <a
                      href={selectedTeamData.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center gap-1.5 self-start"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Open GitHub Repo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {!selectedTeamData.hasSubmission ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    This team has not submitted a GitHub repository link yet.
                  </div>
                ) : !repoDetails?.accessible ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Repository Monitoring Status</span>
                    </div>
                    <p>{repoDetails?.errorMessage || "Private repository or unauthorized access."}</p>
                    <p className="text-[11px] text-amber-400/80">
                      Note: If this repository is private, authorized GitHub integration or a public repository URL is required.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Activity Metric Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                        <span className="text-slate-400 text-[10px] font-mono block">TOTAL COMMITS</span>
                        <span className="text-xl font-extrabold text-purple-400 flex items-center gap-1.5">
                          <GitCommit className="w-4 h-4" /> {repoDetails.totalCommits}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                        <span className="text-slate-400 text-[10px] font-mono block">CONTRIBUTORS</span>
                        <span className="text-xl font-extrabold text-emerald-400 flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> {repoDetails.contributors.length}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                        <span className="text-slate-400 text-[10px] font-mono block">BRANCHES</span>
                        <span className="text-xl font-extrabold text-cyan-400 flex items-center gap-1.5">
                          <GitBranch className="w-4 h-4" /> {repoDetails.branches.length}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                        <span className="text-slate-400 text-[10px] font-mono block">PULL REQUESTS</span>
                        <span className="text-xl font-extrabold text-blue-400 flex items-center gap-1.5">
                          <GitPullRequest className="w-4 h-4" /> {repoDetails.pullRequests.length}
                        </span>
                      </div>
                    </div>

                    {/* Roster & Contributors Mapping */}
                    <div className="pt-2 space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">
                        GitHub Contributors Breakdown
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {repoDetails.contributors.map((c: any) => (
                          <div
                            key={c.login}
                            className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-2.5"
                          >
                            <img src={c.avatarUrl} alt={c.login} className="w-8 h-8 rounded-full border border-white/10" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <a
                                  href={c.htmlUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-xs text-white hover:text-cyan-300 truncate"
                                >
                                  {c.login}
                                </a>
                                <span className="text-[10px] font-mono text-purple-300 font-bold">
                                  {c.contributions} commits
                                </span>
                              </div>
                              {c.matchedMemberName ? (
                                <span className="text-[10px] text-emerald-400 font-semibold block">
                                  ✓ Matched: {c.matchedMemberName}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 block">GitHub Contributor</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Commit Activity Timeline */}
                    <div className="pt-2 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center justify-between">
                        <span>Recent Commit Timeline</span>
                        <span className="text-[10px] text-slate-400 font-normal">Showing latest commits</span>
                      </h4>

                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                        {repoDetails.commits.map((commit: any) => (
                          <div
                            key={commit.sha}
                            className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <p className="font-semibold text-xs text-white flex items-center gap-1.5">
                                <GitCommit className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span>{commit.message}</span>
                              </p>
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                                <span>Author: <strong className="text-slate-200">{commit.authorName}</strong></span>
                                <span>•</span>
                                <span>{new Date(commit.date).toLocaleDateString()} {new Date(commit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>

                            <a
                              href={commit.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20 self-start sm:self-auto shrink-0 flex items-center gap-1"
                            >
                              <span>{commit.shortSha}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminMonitoringPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading GitHub monitor...</div>}>
      <AdminMonitoringContent />
    </Suspense>
  );
}
