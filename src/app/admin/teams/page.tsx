"use client";

import { useEffect, useState } from "react";
import { UserCheck, Search, ShieldCheck } from "lucide-react";

export default function AdminTeamsPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/teams/all")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTeams(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = teams.filter(
    (t) =>
      t.team_code?.toLowerCase().includes(search.toLowerCase()) ||
      t.team_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-400" />
            <span>Teams Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search and inspect all hackathon teams, members, payment statuses, tickets, and check-in records.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Team ID (e.g. VTX26-00421) or Team Name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading teams...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Team Code & Name</th>
                  <th className="p-4">Members Count</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Ticket QR</th>
                  <th className="p-4">Check-in</th>
                  <th className="p-4">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{t.team_name}</div>
                      <span className="font-mono text-cyan-400 text-[11px]">{t.team_code}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{t.members?.length || 0} / 4</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          t.payment?.status === "VERIFIED" ? "badge-confirmed" : "badge-pending"
                        }`}
                      >
                        {t.payment?.status || "NOT_SUBMITTED"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{t.ticket ? "ACTIVE" : "LOCKED"}</td>
                    <td className="p-4 font-mono">{t.checkin ? "✓ CHECKED IN" : "PENDING"}</td>
                    <td className="p-4 font-bold text-slate-200">
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
