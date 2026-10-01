"use client";

import { useEffect, useState } from "react";
import { Users, Search, Download, GraduationCap } from "lucide-react";

export default function AdminParticipantsPage() {
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(() => fetch("/api/teams/all"))
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const parts: any[] = [];
          d.data?.forEach((t: any) => {
            t.members?.forEach((m: any) => {
              parts.push({
                ...m.participant,
                teamCode: t.team_code,
                teamName: t.team_name,
                roleInTeam: m.role,
              });
            });
          });
          setParticipants(parts);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.college?.toLowerCase().includes(q) ||
      p.teamCode?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Participants Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View all registered participants across colleges, courses, and hackathon teams.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by participant name, college, course, or team code..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading directory...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Course & Year</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white">{p.name}</td>
                    <td className="p-4 text-slate-300">{p.college}</td>
                    <td className="p-4 text-slate-400 font-mono">
                      {p.course} ({p.year})
                    </td>
                    <td className="p-4 font-mono text-slate-400">{p.phone}</td>
                    <td className="p-4">
                      <span className="font-bold text-white block">{p.teamName}</span>
                      <span className="font-mono text-cyan-400 text-[11px]">{p.teamCode}</span>
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
