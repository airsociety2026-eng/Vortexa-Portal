"use client";

import { useEffect, useState } from "react";
import { FolderGit2, Github, Globe, Youtube, HardDrive, ExternalLink } from "lucide-react";

export default function AdminSubmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/submissions")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSubmissions(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-blue-400" />
            <span>Project Submissions Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review all submitted team projects, GitHub repositories, live demo links, YouTube videos, and Google Drive links.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading submissions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    Team: {sub.team?.team_name} ({sub.team?.team_code})
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{sub.project_title}</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                  {sub.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{sub.description}</p>
              <div className="text-xs font-mono text-slate-400">Tech Stack: {sub.tech_stack}</div>

              {/* PROJECT LINKS SECTION */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-white uppercase font-mono mb-2">PROJECT LINKS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {/* GitHub Repository (REQUIRED) */}
                  <a
                    href={sub.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 text-cyan-300 flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Github className="w-4 h-4 text-cyan-400" /> GitHub
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                      Open <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>

                  {/* Demo / Live Link (REQUIRED) */}
                  {sub.demo_url ? (
                    <a
                      href={sub.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 text-cyan-300 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Globe className="w-4 h-4 text-cyan-400" /> Live Demo
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                        Open <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Globe className="w-4 h-4" /> Live Demo
                      </span>
                      <span className="text-[11px] font-mono">Not provided</span>
                    </div>
                  )}

                  {/* YouTube Video (OPTIONAL) */}
                  {sub.youtube_url || sub.video_url?.includes("youtube") || sub.video_url?.includes("youtu.be") ? (
                    <a
                      href={sub.youtube_url || sub.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-900/80 border border-red-500/30 hover:border-red-500/60 text-red-300 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Youtube className="w-4 h-4 text-red-400" /> YouTube
                      </span>
                      <span className="text-[11px] font-mono text-red-400 flex items-center gap-1">
                        Watch <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Youtube className="w-4 h-4" /> YouTube Video
                      </span>
                      <span className="text-[11px] font-mono">Not provided</span>
                    </div>
                  )}

                  {/* Google Drive Video (OPTIONAL) */}
                  {sub.google_drive_url || sub.video_url?.includes("drive.google.com") ? (
                    <a
                      href={sub.google_drive_url || sub.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-900/80 border border-blue-500/30 hover:border-blue-500/60 text-blue-300 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <HardDrive className="w-4 h-4 text-blue-400" /> Google Drive
                      </span>
                      <span className="text-[11px] font-mono text-blue-400 flex items-center gap-1">
                        Open Drive <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <HardDrive className="w-4 h-4" /> Google Drive Video
                      </span>
                      <span className="text-[11px] font-mono">Not provided</span>
                    </div>
                  )}
                </div>
              </div>

              {/* GITHUB ACTIVITY LINK */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-400">
                  Submitted: {new Date(sub.submitted_at || Date.now()).toLocaleString()}
                </div>
                <a
                  href={`/admin/monitoring?teamId=${sub.team?.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/20 transition flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5 text-cyan-400" />
                  <span>VIEW FULL GITHUB ACTIVITY</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
