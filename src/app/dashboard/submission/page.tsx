"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProgressTracker } from "@/components/ProgressTracker";
import {
  FolderGit2,
  Github,
  Globe,
  Youtube,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  Users,
  Copy,
  Check,
  Webhook,
  Lock,
  ArrowRight,
  ShieldCheck,
  Code2,
} from "lucide-react";

export default function SubmissionPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [gitDetails, setGitDetails] = useState<any>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");

  const fetchData = async () => {
    try {
      const [uRes, tRes, sRes] = await Promise.all([
        fetch("/api/auth/me").then((r) => r.json()),
        fetch("/api/teams/my-team").then((r) => r.json()),
        fetch("/api/submissions").then((r) => r.json()),
      ]);

      if (uRes.success) setUser(uRes.data);
      if (tRes.success) setTeamData(tRes.data);

      if (sRes.success && sRes.data) {
        setSubmission(sRes.data);
        setProjectTitle(sRes.data.project_title || "");
        setDescription(sRes.data.description || "");
        setTechStack(sRes.data.tech_stack || "");
        setGithubUrl(sRes.data.github_url || "");
        setDemoUrl(sRes.data.demo_url || "");
        setYoutubeUrl(sRes.data.youtube_url || "");
        setGoogleDriveUrl(sRes.data.google_drive_url || "");

        // Fetch Git monitor data for this team
        if (tRes.data?.team?.id) {
          fetchGitData(tRes.data.team.id);
        }
      }
      setLoading(false);
    } catch (_) {
      setLoading(false);
    }
  };

  const fetchGitData = (teamId: string) => {
    fetch(`/api/github/monitor?teamId=${teamId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setGitDetails(res.data);
        }
      })
      .catch(() => {});
  };

  const handleSyncGit = async () => {
    if (!team?.id) return;
    setSyncing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message || "Git activity synchronized successfully!" });
        fetchGitData(team.id);
      } else {
        setMsg({ type: "error", text: data.error || "Failed to synchronize Git commits." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Network error while syncing." });
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (status: "DRAFT" | "SUBMITTED") => {
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          description,
          techStack,
          githubUrl,
          demoUrl,
          youtubeUrl,
          googleDriveUrl,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmission(data.data);
        setMsg({ type: "success", text: data.message || "Project saved successfully!" });
        if (team?.id) {
          fetchGitData(team.id);
        }
      } else {
        setMsg({ type: "error", text: data.error || "Failed to save submission." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Network error." });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const team = teamData?.team;
  const isLeader = teamData?.role === "LEADER";
  const isLocked = submission?.status === "LOCKED";
  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/github/webhook` : "/api/github/webhook";
  const webhookSecret = "vortexa_webhook_secret_2026";

  const copyText = (text: string, type: "url" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const journeyState = {
    registered: !!user,
    hasTeam: !!team,
    teamCode: team?.team_code,
    paymentSubmitted: !!team?.payment,
    paymentStatus: (team?.payment?.status as any) || "NOT_SUBMITTED",
    ticketGenerated: !!team?.ticket,
    checkedIn: !!team?.checkin,
    roomAllocated: !!team?.room_allocation,
    roomName: team?.room_allocation?.room?.room_name,
    submitted: !!submission && submission.status === "SUBMITTED",
    resultsPublished: !!team?.result && team?.result?.status === "PUBLISHED",
    certificateAvailable: (team?.certificates?.length || 0) > 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="vx-spinner mx-auto mb-3" />
          <p className="text-xs text-[#737373]">Loading project submission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#111111]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Progress Tracker */}
        <ProgressTracker state={journeyState} />

        {/* Header */}
        <div className="bg-white border border-[#EAEAEA] rounded-lg p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderGit2 className="w-5 h-5 text-[#1D4ED8]" />
              <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Project Submission & Git Tracker
              </h1>
            </div>
            <p className="text-xs text-[#737373]">
              Submit your team&apos;s project details, connect your GitHub repository, and monitor verified commit progress.
            </p>
          </div>

          {team && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] px-3 py-1 rounded-md border border-[#BFDBFE]">
                Team: {team.team_name} ({team.team_code})
              </span>
              {submission && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    submission.status === "SUBMITTED"
                      ? "bg-[#ECFDF3] text-[#16803C] border border-[#BBF7D0]"
                      : submission.status === "LOCKED"
                      ? "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]"
                      : "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
                  }`}
                >
                  Status: {submission.status}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Message Banner */}
        {msg && (
          <div
            className={`p-4 rounded-lg mb-6 text-xs font-semibold border flex items-center justify-between ${
              msg.type === "success"
                ? "bg-[#ECFDF3] text-[#16803C] border-[#BBF7D0]"
                : "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]"
            }`}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="text-sm font-bold ml-2">
              ×
            </button>
          </div>
        )}

        {!team ? (
          <div className="bg-white border border-[#EAEAEA] rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-[#BDBDBD] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#111111] mb-1">You must join or create a team first</h3>
            <p className="text-xs text-[#737373] mb-4">Project submission is managed per team.</p>
            <Link
              href="/dashboard/team"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] text-white text-xs font-semibold rounded-md hover:bg-[#1E40AF] transition-colors"
            >
              Go to Team Management
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Submission Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-[#EAEAEA] rounded-lg p-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA] mb-6">
                  <div>
                    <h2 className="text-base font-bold text-[#111111]">Project Details</h2>
                    <p className="text-xs text-[#737373]">
                      {isLeader
                        ? "Enter your hackathon project specifications below."
                        : "Only your Team Leader can submit or edit project details."}
                    </p>
                  </div>
                  {isLocked && (
                    <span className="flex items-center gap-1 text-xs text-[#B42318] bg-[#FEF3F2] px-2.5 py-1 rounded border border-[#FECDCA] font-semibold">
                      <Lock className="w-3.5 h-3.5" /> Locked by Admin
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isLeader || isLocked}
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. AI-Powered Disaster Relief Coordinator"
                      className="w-full px-3 py-2 border border-[#EAEAEA] rounded-md text-xs focus:outline-none focus:border-[#1D4ED8] disabled:bg-[#F7F7F5] disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1">
                      Tech Stack <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isLeader || isLocked}
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      placeholder="e.g. Next.js, FastAPI, PyTorch, Supabase"
                      className="w-full px-3 py-2 border border-[#EAEAEA] rounded-md text-xs focus:outline-none focus:border-[#1D4ED8] disabled:bg-[#F7F7F5] disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1">
                      Project Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      disabled={!isLeader || isLocked}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what your project does, problem solved, and key features..."
                      className="w-full px-3 py-2 border border-[#EAEAEA] rounded-md text-xs focus:outline-none focus:border-[#1D4ED8] disabled:bg-[#F7F7F5] disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1">
                      GitHub Repository URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
                      <input
                        type="url"
                        disabled={!isLeader || isLocked}
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username/repository"
                        className="w-full pl-9 pr-3 py-2 border border-[#EAEAEA] rounded-md text-xs focus:outline-none focus:border-[#1D4ED8] disabled:bg-[#F7F7F5] disabled:cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-[#737373] mt-1">
                      Must be public or integrated with VORTEXA webhook. Each team must link their own distinct repository.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1">
                      Live Demo / Deployment URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
                      <input
                        type="url"
                        disabled={!isLeader || isLocked}
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder="https://myproject.vercel.app"
                        className="w-full pl-9 pr-3 py-2 border border-[#EAEAEA] rounded-md text-xs focus:outline-none focus:border-[#1D4ED8] disabled:bg-[#F7F7F5] disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        YouTube Demo Video URL (Optional)
                      </label>
                      <div className="relative">
                        <Youtube className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
                        <input
                          type="url"
                          disabled={!isLeader || isLocked}
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full pl-9 pr-3 py-2 border border-[#EAEAEA] rounded-md text-xs focus:outline-none focus:border-[#1D4ED8] disabled:bg-[#F7F7F5] disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Google Drive / Assets Link (Optional)
                      </label>
                      <input
                        type="url"
                        disabled={!isLeader || isLocked}
                        value={googleDriveUrl}
                        onChange={(e) => setGoogleDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 border border-[#EAEAEA] rounded-md text-xs focus:outline-none focus:border-[#1D4ED8] disabled:bg-[#F7F7F5] disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {isLeader && !isLocked && (
                    <div className="pt-4 flex items-center gap-3 border-t border-[#EAEAEA]">
                      <button
                        type="button"
                        onClick={() => handleSubmit("DRAFT")}
                        disabled={submitting}
                        className="px-4 py-2 border border-[#EAEAEA] hover:bg-[#F7F7F5] text-[#111111] text-xs font-semibold rounded-md transition-colors"
                      >
                        {submitting ? "Saving..." : "Save Draft"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmit("SUBMITTED")}
                        disabled={submitting}
                        className="px-5 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{submitting ? "Submitting..." : "Submit Final Project"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Webhook Configuration Guide Card */}
              <div className="bg-white border border-[#EAEAEA] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Webhook className="w-5 h-5 text-[#1D4ED8]" />
                  <h3 className="text-sm font-bold text-[#111111]">
                    Automatic GitHub Webhook Setup Guide
                  </h3>
                </div>
                <p className="text-xs text-[#737373] mb-4">
                  To automatically stream your commits into the live judging and monitoring system upon every push:
                </p>

                <div className="space-y-3 bg-[#F7F7F5] p-4 rounded-md border border-[#EAEAEA] text-xs">
                  <div>
                    <span className="font-semibold text-[#111111] block mb-1">1. Payload URL:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-2.5 py-1.5 rounded border border-[#EAEAEA] text-[11px] font-mono flex-1 truncate text-[#1D4ED8]">
                        {webhookUrl}
                      </code>
                      <button
                        onClick={() => copyText(webhookUrl, "url")}
                        className="px-2.5 py-1.5 bg-white border border-[#EAEAEA] hover:bg-[#F7F7F5] rounded text-[11px] font-semibold text-[#111111] flex items-center gap-1 shrink-0"
                      >
                        {copiedWebhook ? <Check className="w-3.5 h-3.5 text-[#16803C]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedWebhook ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-[#111111] block mb-1">2. Content type:</span>
                    <code className="bg-white px-2.5 py-1 rounded border border-[#EAEAEA] text-[11px] font-mono text-[#111111]">
                      application/json
                    </code>
                  </div>

                  <div>
                    <span className="font-semibold text-[#111111] block mb-1">3. Secret:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-2.5 py-1.5 rounded border border-[#EAEAEA] text-[11px] font-mono flex-1 truncate text-[#111111]">
                        {webhookSecret}
                      </code>
                      <button
                        onClick={() => copyText(webhookSecret, "secret")}
                        className="px-2.5 py-1.5 bg-white border border-[#EAEAEA] hover:bg-[#F7F7F5] rounded text-[11px] font-semibold text-[#111111] flex items-center gap-1 shrink-0"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5 text-[#16803C]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSecret ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-[#111111] block mb-1">4. Which events would you like to trigger this webhook?</span>
                    <span className="text-[#4B4B4B]">Select &quot;Just the push event&quot; and click &quot;Add webhook&quot;.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Git Tracker & Verified Commits (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#EAEAEA] rounded-lg p-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA] mb-4">
                  <div className="flex items-center gap-2">
                    <Github className="w-5 h-5 text-[#111111]" />
                    <h3 className="text-sm font-bold text-[#111111]">Live Repository Tracker</h3>
                  </div>

                  {githubUrl && (
                    <button
                      onClick={handleSyncGit}
                      disabled={syncing}
                      className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Sync recent commits from GitHub"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                      <span>{syncing ? "Syncing..." : "Sync Now"}</span>
                    </button>
                  )}
                </div>

                {!githubUrl ? (
                  <div className="py-8 text-center text-xs text-[#737373]">
                    Please provide your team&apos;s GitHub repository URL in the project details section.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Repository Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-[#F7F7F5] border border-[#EAEAEA] p-3 rounded-md">
                        <span className="text-[10px] uppercase font-semibold text-[#737373] block mb-0.5">
                          Total Commits
                        </span>
                        <span className="text-lg font-bold font-mono text-[#1D4ED8]">
                          {gitDetails?.repoDetails?.totalCommits || 0}
                        </span>
                      </div>

                      <div className="bg-[#F7F7F5] border border-[#EAEAEA] p-3 rounded-md">
                        <span className="text-[10px] uppercase font-semibold text-[#737373] block mb-0.5">
                          Active Authors
                        </span>
                        <span className="text-lg font-bold font-mono text-[#16803C]">
                          {gitDetails?.repoDetails?.contributors?.length || 0}
                        </span>
                      </div>
                    </div>

                    {/* Contributor Roster Verification */}
                    <div>
                      <h4 className="text-xs font-bold text-[#111111] mb-2 uppercase tracking-wide">
                        Roster Authors Audit
                      </h4>
                      {gitDetails?.repoDetails?.contributors?.length === 0 ? (
                        <p className="text-xs text-[#A3A3A3]">No author data recorded yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {gitDetails?.repoDetails?.contributors?.map((c: any) => (
                            <div
                              key={c.login}
                              className={`p-2 rounded border text-xs flex items-center justify-between ${
                                c.isUnmatched
                                  ? "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]"
                                  : "bg-[#F7F7F5] border-[#EAEAEA] text-[#111111]"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-semibold truncate">{c.login}</span>
                                {c.matchedMemberName ? (
                                  <span className="text-[10px] text-[#16803C] font-semibold flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> {c.matchedMemberName}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#B45309] font-semibold flex items-center gap-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5" /> Unmatched
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[10px] font-bold shrink-0">
                                {c.contributions} commits
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Commit Activity Timeline */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wide">
                          Commit Timeline
                        </h4>
                        <span className="text-[10px] text-[#737373] font-mono">Latest recorded</span>
                      </div>

                      {gitDetails?.repoDetails?.commits?.length === 0 ? (
                        <div className="p-4 bg-[#F7F7F5] border border-[#EAEAEA] rounded text-center text-xs text-[#737373]">
                          No commits synced yet. Click &quot;Sync Now&quot; above to import existing commits.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {gitDetails?.repoDetails?.commits?.map((commit: any) => (
                            <div
                              key={commit.sha}
                              className="p-2.5 bg-[#F7F7F5] border border-[#EAEAEA] rounded hover:border-[#BFDBFE] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-xs font-semibold text-[#111111] line-clamp-1">
                                  {commit.message}
                                </p>
                                <a
                                  href={commit.htmlUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-mono font-bold text-[#1D4ED8] hover:underline flex items-center gap-0.5 shrink-0"
                                >
                                  {commit.shortSha} <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-[#737373]">
                                <span>{commit.authorName}</span>
                                <span>{new Date(commit.date).toLocaleDateString()} {new Date(commit.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
