"use client";

import { useEffect, useState } from "react";
import { Gavel, UserPlus, Users, ArrowRight } from "lucide-react";

export default function AdminJudgesPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/teams/all")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTeams(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    setSubmitting(true);
    setMsg("");

    try {
      const res = await fetch("/api/judges/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judgeId: selectedJudgeId || "judge-default-id",
          teamId: selectedTeamId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
      } else {
        alert(data.error?.message || "Failed to assign judge");
      }
    } catch (err) {
      alert("Error assigning judge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Gavel className="w-6 h-6 text-purple-400" />
            <span>Judge Roster & Team Assignments</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign judges to specific hackathon teams for evaluation and scoring.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm">Assign Judge → Team</h3>

          <form onSubmit={handleAssign} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Judge</label>
              <select
                value={selectedJudgeId}
                onChange={(e) => setSelectedJudgeId(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input"
              >
                <option value="">Dr. Alex Rivera (Distributed Systems & AI)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Team *</label>
              <select
                required
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input"
              >
                <option value="">Select Team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.team_name} ({t.team_code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl gradient-btn font-bold text-xs text-white shadow-glow"
            >
              {submitting ? "Assigning..." : "Confirm Assignment"}
            </button>
          </form>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm">Active Judge Panel</h3>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-xs">
            <span className="font-bold text-white text-sm">Dr. Alex Rivera</span>
            <p className="text-slate-400">Expertise: Distributed Systems, AI Agents & Cloud Security</p>
            <span className="font-mono text-cyan-400 text-[10px] block">judge.alex@vortexa.io</span>
          </div>
        </div>
      </div>
    </div>
  );
}
