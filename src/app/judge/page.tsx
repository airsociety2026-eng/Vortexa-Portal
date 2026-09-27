"use client";

import { useEffect, useState } from "react";
import { Sliders, FolderGit2, Star, CheckCircle2, Github, Globe, Youtube, HardDrive, ExternalLink, ArrowRight, AlertTriangle, RefreshCw, Users } from "lucide-react";

export default function AdminScoringPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  const [scoresInput, setScoresInput] = useState<{ [key: string]: number }>({});
  const [commentsInput, setCommentsInput] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = () => {
    setLoading(true);
    setErrorMsg("");

    Promise.all([
      fetch("/api/submissions").then((r) => r.json()),
      fetch("/api/judges/criteria").then((r) => r.json()),
    ])
      .then(([subData, critData]) => {
        if (subData.success) {
          setSubmissions(subData.data || []);
          if (subData.data?.length > 0) {
            setSelectedSub(subData.data[0]);
            // Pre-fill existing scores if any
            const existingScores = subData.data[0].scores || [];
            const initialScores: { [key: string]: number } = {};
            const initialComments: { [key: string]: string } = {};
            existingScores.forEach((s: any) => {
              initialScores[s.criteria_id] = s.score_value;
              if (s.comments) initialComments[s.criteria_id] = s.comments;
            });
            setScoresInput(initialScores);
            setCommentsInput(initialComments);
          }
        } else {
          setErrorMsg(subData.error?.message || "Failed to load assigned submissions");
        }

        if (critData.success) {
          setCriteria(critData.data || []);
        } else {
          setErrorMsg((prev) => prev || critData.error?.message || "Failed to load judging criteria");
        }
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg("Network error connecting to scoring server. Please check your connection.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectSubmission = (sub: any) => {
    setSelectedSub(sub);
    setMessage("");
    setErrorMsg("");
    const existingScores = sub.scores || [];
    const initialScores: { [key: string]: number } = {};
    const initialComments: { [key: string]: string } = {};
    existingScores.forEach((s: any) => {
      initialScores[s.criteria_id] = s.score_value;
      if (s.comments) initialComments[s.criteria_id] = s.comments;
    });
    setScoresInput(initialScores);
    setCommentsInput(initialComments);
  };

  const handleScoreChange = (criteriaId: string, val: number) => {
    setScoresInput({ ...scoresInput, [criteriaId]: val });
  };

  const handleCommentChange = (criteriaId: string, text: string) => {
    setCommentsInput({ ...commentsInput, [criteriaId]: text });
  };

  const handleSubmitScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSubmitting(true);
    setMessage("");
    setErrorMsg("");

    const scorePayload = criteria.map((c) => ({
      criteriaId: c.id,
      scoreValue: Number(scoresInput[c.id] || 0),
      comments: commentsInput[c.id] || "",
    }));

    try {
      const res = await fetch("/api/judges/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          scores: scorePayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        fetchData();
      } else {
        setErrorMsg(data.error?.message || "Failed to submit scores");
      }
    } catch (err) {
      setErrorMsg("Error submitting scores to server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <span>Judge Scoring Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate assigned project submissions across dynamic weighted criteria and enter feedback comments.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading submissions & criteria...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List Selector */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-bold text-white text-sm">Assigned Submissions ({submissions.length})</h3>

            {submissions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No team submissions assigned to your judge profile yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    className={`w-full p-4 rounded-xl text-left transition border ${
                      selectedSub?.id === sub.id
                        ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-glow"
                        : "bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="font-bold text-sm text-white truncate">{sub.project_title}</div>
                    <span className="text-xs font-mono text-cyan-400 block mt-0.5">
                      Team: {sub.team?.team_name} ({sub.team?.team_code})
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">Tech: {sub.tech_stack}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scoring Detail Form */}
          {selectedSub ? (
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-6">
              <div className="pb-4 border-b border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">EVALUATING SUBMISSION</span>
                  <span className="text-xs font-mono text-slate-400">
                    Team ID: <strong className="text-white">{selectedSub.team?.team_code}</strong>
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-white">{selectedSub.project_title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedSub.description}</p>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
                  <span className="font-bold text-white block mb-1">Tech Stack:</span>
                  <span className="font-mono text-cyan-300">{selectedSub.tech_stack}</span>
                </div>

                {/* Team Roster */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                  <span className="font-bold text-slate-300 block mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> Team Members ({selectedSub.team?.members?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedSub.team?.members?.map((m: any) => (
                      <span key={m.id} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-medium text-[11px]">
                        {m.participant?.name} ({m.role})
                      </span>
                    ))}
                  </div>
                </div>

                {/* PROJECT RESOURCES & LINKS SECTION */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono mb-2.5">PROJECT RESOURCES & LINKS</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* GitHub URL (Required) */}
                    <a
                      href={selectedSub.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 text-cyan-300 flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <Github className="w-4 h-4 text-cyan-400" /> GitHub Repository
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                        Open GitHub <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>

                    {/* Demo URL (Required) */}
                    {selectedSub.demo_url ? (
                      <a
                        href={selectedSub.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 text-cyan-300 flex items-center justify-between transition"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Globe className="w-4 h-4 text-cyan-400" /> Demo / Live Link
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                          Open Demo <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-2 font-semibold">
                          <Globe className="w-4 h-4" /> Demo / Live Link
                        </span>
                        <span className="text-[11px] font-mono">Not provided</span>
                      </div>
                    )}

                    {/* YouTube Video (Optional) */}
                    {selectedSub.youtube_url || selectedSub.video_url?.includes("youtube") || selectedSub.video_url?.includes("youtu.be") ? (
                      <a
                        href={selectedSub.youtube_url || selectedSub.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-900/80 border border-red-500/30 hover:border-red-500/60 text-red-300 flex items-center justify-between transition"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Youtube className="w-4 h-4 text-red-400" /> YouTube Video
                        </span>
                        <span className="text-[11px] font-mono text-red-400 flex items-center gap-1">
                          Watch Video <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-2 font-semibold">
                          <Youtube className="w-4 h-4" /> YouTube Video
                        </span>
                        <span className="text-[11px] font-mono">Not provided</span>
                      </div>
                    )}

                    {/* Google Drive Video (Optional) */}
                    {selectedSub.google_drive_url || selectedSub.video_url?.includes("drive.google.com") ? (
                      <a
                        href={selectedSub.google_drive_url || selectedSub.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-900/80 border border-blue-500/30 hover:border-blue-500/60 text-blue-300 flex items-center justify-between transition"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <HardDrive className="w-4 h-4 text-blue-400" /> Google Drive Video
                        </span>
                        <span className="text-[11px] font-mono text-blue-400 flex items-center gap-1">
                          Open Drive <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-2 font-semibold">
                          <HardDrive className="w-4 h-4" /> Google Drive Video
                        </span>
                        <span className="text-[11px] font-mono">Not provided</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <a
                      href={`/admin/monitoring?teamId=${selectedSub.team?.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold hover:bg-purple-500/20 transition flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4 text-purple-400" />
                      <span>VIEW TEAM GITHUB COMMIT TIMELINE & ACTIVITY</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Scoring Inputs Form */}
              <form onSubmit={handleSubmitScores} className="space-y-4">
                <h3 className="font-bold text-white text-sm">Criteria Score Evaluation</h3>

                <div className="space-y-4">
                  {criteria.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-sm">{c.name}</span>
                          <span className="text-xs text-slate-400 block">{c.description}</span>
                        </div>
                        <span className="font-mono text-cyan-300 font-bold text-xs bg-slate-800 px-2.5 py-1 rounded-lg">
                          Max: {c.max_score} pts
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Score (0 to {c.max_score}) *
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            max={c.max_score}
                            step={0.5}
                            value={scoresInput[c.id] ?? 0}
                            onChange={(e) => handleScoreChange(c.id, Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl glass-input font-mono font-bold text-cyan-300 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Feedback / Comments
                          </label>
                          <input
                            type="text"
                            value={commentsInput[c.id] ?? ""}
                            onChange={(e) => handleCommentChange(c.id, e.target.value)}
                            placeholder="Optional judge remarks..."
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl gradient-btn font-extrabold text-sm text-white shadow-glow flex items-center justify-center gap-2"
                >
                  {submitting ? "Submitting Scores..." : "Submit All Scores & Feedback"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-2 glass-card p-8 rounded-2xl text-center py-16">
              <p className="text-xs text-slate-400">Select a submission from the list to begin evaluation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
