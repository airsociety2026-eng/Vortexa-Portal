"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Trophy, Medal, Award, Star, Clock } from "lucide-react";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/results/publish")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setResults(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Official Hackathon Leaderboard</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Official published rankings, total scores, and special award honors.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center glass-card rounded-2xl">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading leaderboard...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl border border-white/10 text-center py-12">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Results Pending</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Judging is currently in progress. Official rankings will appear here once published by administrators.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((res) => (
              <div
                key={res.id}
                className={`glass-card p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  res.rank === 1
                    ? "border-amber-500/50 bg-amber-950/20 shadow-glow"
                    : res.rank === 2
                    ? "border-slate-300/40 bg-slate-900/40"
                    : res.rank === 3
                    ? "border-amber-700/40 bg-amber-950/10"
                    : "border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg ${
                      res.rank === 1
                        ? "bg-amber-500 text-black"
                        : res.rank === 2
                        ? "bg-slate-300 text-black"
                        : res.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-slate-800 text-slate-400 font-mono"
                    }`}
                  >
                    #{res.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{res.team.team_name}</h2>
                      <span className="text-xs font-mono text-cyan-400">({res.team.team_code})</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Project: {res.team.submission?.project_title || "N/A"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Members: {res.team.members?.map((m: any) => m.participant.name).join(", ")}
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  {res.award && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                      {res.award}
                    </span>
                  )}
                  <span className="text-sm font-extrabold font-mono text-cyan-300">
                    Total Score: {res.total_score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
