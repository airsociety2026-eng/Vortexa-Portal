"use client";

import { useEffect, useState } from "react";
import { FileCode, Plus, Send } from "lucide-react";

export default function AdminProblemsPage() {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Artificial Intelligence");
  const [difficulty, setDifficulty] = useState("Medium");
  const [rules, setRules] = useState("");
  const [resources, setResources] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchProbs = () => {
    fetch("/api/problems")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProblems(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProbs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, difficulty, rules, resources }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        setTitle("");
        setDescription("");
        setRules("");
        setResources("");
        fetchProbs();
      } else {
        alert(data.error?.message || "Failed to publish problem");
      }
    } catch (err) {
      alert("Error publishing problem");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileCode className="w-6 h-6 text-cyan-400" />
            <span>Problem Statements & Track Rules</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, publish, and manage track challenge statements for hackathon teams.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Publish New Track</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Track Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Autonomous AI Emergency Response"
                className="w-full px-3 py-2 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category / Domain *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="w-full px-3 py-2 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed problem statement..."
                className="w-full px-3 py-2 rounded-xl glass-input resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Track Rules</label>
              <input
                type="text"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Specific rules or constraints..."
                className="w-full px-3 py-2 rounded-xl glass-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl gradient-btn font-bold text-xs text-white shadow-glow"
            >
              {submitting ? "Publishing..." : "Publish Problem Statement"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm">Published Tracks ({problems.length})</h3>

          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              {problems.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{p.title}</span>
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">{p.category}</span>
                  </div>
                  <p className="text-slate-300">{p.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
