"use client";

import { useEffect, useState } from "react";
import { Sliders, Plus } from "lucide-react";

export default function AdminCriteriaPage() {
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxScore, setMaxScore] = useState(20);
  const [weight, setWeight] = useState(1.0);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchCrit = () => {
    fetch("/api/judges/criteria")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCriteria(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCrit();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      const res = await fetch("/api/judges/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, maxScore: Number(maxScore), weight: Number(weight) }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        setName("");
        setDescription("");
        fetchCrit();
      } else {
        alert(data.error?.message || "Failed to create criteria");
      }
    } catch (err) {
      alert("Error creating criteria");
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
            <span>Dynamic Judging Criteria</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure weighted scoring metrics and maximum score bounds for the evaluation panel.
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
            <span>Create Criteria</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Criteria Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Technical Execution"
                className="w-full px-3 py-2 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Description *</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of metric..."
                className="w-full px-3 py-2 rounded-xl glass-input resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Max Score</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Weightage</label>
                <input
                  type="number"
                  required
                  step={0.1}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl gradient-btn font-bold text-xs text-white shadow-glow"
            >
              {submitting ? "Creating..." : "Save Criteria"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm">Active Evaluation Metrics ({criteria.length})</h3>

          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center">Loading...</p>
          ) : (
            <div className="space-y-3">
              {criteria.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="font-mono text-cyan-300 font-bold bg-slate-800 px-2.5 py-0.5 rounded">
                      Max: {c.max_score} pts (Weight: {c.weight})
                    </span>
                  </div>
                  <p className="text-slate-400">{c.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
