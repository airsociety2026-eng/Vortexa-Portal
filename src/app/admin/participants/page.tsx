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
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>Participants Directory</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            View all registered participants across colleges, courses, and hackathon teams.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted" />
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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted">Loading directory...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="vx-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>College</th>
                  <th>Course & Year</th>
                  <th>Phone</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-foreground">{p.name}</td>
                    <td className="text-muted">{p.college}</td>
                    <td className="text-muted font-mono">
                      {p.course} ({p.year})
                    </td>
                    <td className="font-mono text-muted">{p.phone}</td>
                    <td>
                      <span className="font-bold text-foreground block">{p.teamName}</span>
                      <span className="font-mono text-primary text-[11px]">{p.teamCode}</span>
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
