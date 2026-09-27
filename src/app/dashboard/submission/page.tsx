"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FolderGit2, Github, Globe, Youtube, HardDrive, Lock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function SubmissionPage() {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>(null);

  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSubmission = () => {
    fetch("/api/submissions")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const sub = data.data;
          setProjectTitle(sub.project_title || "");
          setDescription(sub.description || "");
          setTechStack(sub.tech_stack || "");
          setGithubUrl(sub.github_url || "");
          setDemoUrl(sub.demo_url || "");
          setYoutubeUrl(sub.youtube_url || sub.video_url || "");
          setGoogleDriveUrl(sub.google_drive_url || "");
        }
      })
      .catch(() => {});

    fetch("/api/teams/my-team")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTeamData(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmission();
  }, []);

  const handleSubmit = async (e: React.FormEvent, status = "SUBMITTED") => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

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
      if (!data.success) {
        setError(data.error?.message || "Failed to process submission");
        setSubmitting(false);
        return;
      }

      setSuccess(data.message);
      fetchSubmission();
    } catch (err: any) {
      setError("Network error submitting project");
    } finally {
      setSubmitting(false);
    }
  };

  const team = teamData?.team;
  const isLeader = teamData?.isLeader;
  const submission = team?.submission;

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-cyan-400" />
            <span>Project Submission Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Team leaders can submit or edit the final hackathon project before the submission deadline lock.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center glass-card rounded-2xl">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading submission data...</p>
          </div>
        ) : !team ? (
          <div className="glass-card p-8 rounded-2xl border border-white/10 text-center py-12">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Team Required</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
              You must belong to a registered team to submit a project.
            </p>
            <a href="/dashboard/team" className="px-6 py-2.5 rounded-xl gradient-btn text-xs font-bold shadow-glow">
              Join / Create Team
            </a>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-glass">
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">SUBMISSION FORM</span>
                <h2 className="text-xl font-bold text-white">Team: {team.team_name} ({team.team_code})</h2>
              </div>

              {submission?.status && (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${
                    submission.status === "LOCKED"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "badge-confirmed"
                  }`}
                >
                  STATUS: {submission.status}
                </span>
              )}
            </div>

            {!isLeader && (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                ℹ️ Note: Only your Team Leader can submit or modify project details. You are viewing the submission as a team member.
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, "SUBMITTED")} className="space-y-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    disabled={!isLeader || submission?.status === "LOCKED"}
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. VORTEXA AI Emergency Dispatcher"
                    className="w-full px-4 py-2.5 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Project Description *</label>
                  <textarea
                    required
                    rows={4}
                    disabled={!isLeader || submission?.status === "LOCKED"}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the problem solved, real-world utility, and key technical innovations..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tech Stack *</label>
                  <input
                    type="text"
                    required
                    disabled={!isLeader || submission?.status === "LOCKED"}
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="e.g. Next.js, TypeScript, Tailwind CSS, Prisma, SQLite"
                    className="w-full px-4 py-2.5 rounded-xl glass-input"
                  />
                </div>
              </div>

              {/* PROJECT LINKS SECTION */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">PROJECT LINKS</h3>
                  <span className="text-[10px] text-slate-400">* Required | Optional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GitHub Repository (REQUIRED) */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">GitHub Repository URL * (Required)</label>
                    <div className="relative">
                      <Github className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="url"
                        required
                        disabled={!isLeader || submission?.status === "LOCKED"}
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username/repository"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input font-mono"
                      />
                    </div>
                  </div>

                  {/* Demo / Live Link (REQUIRED) */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Demo / Live Project URL * (Required)</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="url"
                        required
                        disabled={!isLeader || submission?.status === "LOCKED"}
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder="https://your-demo-app.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input font-mono"
                      />
                    </div>
                  </div>

                  {/* YouTube Video (OPTIONAL) */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">YouTube Video URL (Optional)</label>
                    <div className="relative">
                      <Youtube className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="url"
                        disabled={!isLeader || submission?.status === "LOCKED"}
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... (Optional)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input font-mono"
                      />
                    </div>
                  </div>

                  {/* Google Drive Video (OPTIONAL) */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Google Drive Video URL (Optional)</label>
                    <div className="relative">
                      <HardDrive className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="url"
                        disabled={!isLeader || submission?.status === "LOCKED"}
                        value={googleDriveUrl}
                        onChange={(e) => setGoogleDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... (Optional)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isLeader && submission?.status !== "LOCKED" && (
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, "DRAFT")}
                    className="w-full sm:w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                  >
                    Save Draft
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-2/3 py-3 rounded-xl gradient-btn font-bold text-white shadow-glow flex items-center justify-center gap-2"
                  >
                    {submitting ? "Submitting..." : "Submit Final Project"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
