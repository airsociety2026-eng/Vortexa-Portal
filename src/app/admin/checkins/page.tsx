"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Search } from "lucide-react";

export default function AdminCheckinsPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/teams/all")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const checkedIn = (data.data || []).filter((t: any) => t.checkin);
          setTeams(checkedIn);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span>Checked-In Teams Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of teams checked in at the event entrance desk.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading check-in log...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl border border-white/10 text-center py-12">
          <p className="text-xs text-slate-400">No teams checked in yet.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Team Code & Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Checked-In At</th>
                  <th className="p-4">Checked-In By</th>
                  <th className="p-4">Allocated Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{t.team_name}</div>
                      <span className="font-mono text-cyan-400 text-[11px]">{t.team_code}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{t.checkin.location}</td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">
                      {new Date(t.checkin.checked_in_at).toLocaleTimeString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{t.checkin.checked_in_by}</td>
                    <td className="p-4 font-bold text-white">
                      {t.room_allocation?.room?.room_name || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
