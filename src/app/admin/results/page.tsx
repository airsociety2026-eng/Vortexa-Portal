"use client";

import { useEffect, useState } from "react";
import { Trophy, Award, CheckCircle2, RefreshCw, Sparkles, Send } from "lucide-react";

export default function AdminResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  const fetchResults = () => {
    fetch("/api/results/publish")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setResults(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handlePublishResults = async (publish: boolean) => {
    setPublishing(true);
    setMessage("");

    try {
      const res = await fetch("/api/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        fetchResults();
      } else {
        alert(data.error?.message || "Failed to publish results");
      }
    } catch (err) {
      alert("Error publishing results");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-amber-500/30">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            HACKATHON RESULT ENGINE
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Leaderboard Calculation & Publishing</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compute total judge scores, rank teams, and publish the official leaderboard to participants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={publishing}
            onClick={() => handlePublishResults(false)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Save Draft Ranks
          </button>

          <button
            disabled={publishing}
            onClick={() => handlePublishResults(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 text-black font-extrabold text-xs shadow-glow hover:scale-105 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>PUBLISH OFFICIAL RESULTS</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {message}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Calculating rankings...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl border border-white/10 text-center py-12">
          <p className="text-xs text-slate-400 mb-4">No results calculated yet. Click below to compute scores.</p>
          <button
            onClick={() => handlePublishResults(false)}
            className="px-6 py-2.5 rounded-xl gradient-btn font-bold text-xs shadow-glow"
          >
            Calculate Initial Leaderboard
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((res) => (
            <div
              key={res.id}
              className={`glass-card p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                res.rank === 1
                  ? "border-amber-500/50 bg-amber-950/20"
                  : res.rank === 2
                  ? "border-slate-300/40 bg-slate-900/40"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
                  #{res.rank}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{res.team?.team_name}</h3>
                  <span className="text-xs font-mono text-cyan-400">Team Code: {res.team?.team_code}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold font-mono text-cyan-300 block">
                  Total Score: {res.total_score} pts
                </span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">{res.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
