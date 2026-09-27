"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileCode, Sparkles, BookOpen, ExternalLink } from "lucide-react";

export default function ProblemsPage() {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/problems")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProblems(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileCode className="w-6 h-6 text-cyan-400" />
            <span>Hackathon Problem Statements & Tracks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose a problem statement for your team submission. Ensure compliance with all track rules.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center glass-card rounded-2xl">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading problem statements...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl border border-white/10 text-center py-12">
            <p className="text-xs text-slate-400">No problem statements published yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {problems.map((prob) => (
              <div key={prob.id} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {prob.category}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                      prob.difficulty === "Hard"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    }`}
                  >
                    Difficulty: {prob.difficulty}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white">{prob.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{prob.description}</p>

                {prob.rules && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
                    <span className="font-bold text-amber-400 block mb-1">Track Rules:</span>
                    <p className="text-slate-400">{prob.rules}</p>
                  </div>
                )}

                {prob.resources && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
                    <span className="font-bold text-cyan-400 block mb-1">Resources & Datasets:</span>
                    <p className="text-slate-400">{prob.resources}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
