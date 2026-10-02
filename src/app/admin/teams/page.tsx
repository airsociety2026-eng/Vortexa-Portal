"use client";

import { useEffect, useState } from "react";
import { UserCheck, Search, ShieldCheck } from "lucide-react";

export default function AdminTeamsPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [reminding, setReminding] = useState<string | null>(null);

  const handleRemind = async (teamId: string) => {
    setReminding(teamId);
    try {
      const res = await fetch("/api/admin/payments/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Reminder email sent successfully!");
      } else {
        alert(data.error?.message || "Failed to send reminder.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setReminding(null);
    }
  };

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
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" />
            <span>Teams Directory</span>
          </h1>
          <p className="text-xs text-muted mt-1">
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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted">Loading teams...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="vx-table">
              <thead>
                <tr>
                  <th>Team Code & Name</th>
                  <th>Members Count</th>
                  <th>Payment Status</th>
                  <th>Ticket QR</th>
                  <th>Check-in</th>
                  <th>Room</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const leader = t.members?.find((m: any) => m.role === "LEADER" || m.participant?.user_id === t.leader_id);
                  const leaderPhone = leader?.participant?.phone || "N/A";
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="font-bold text-foreground">{t.team_name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-primary text-[11px]">{t.team_code}</span>
                          <span className="text-[10px] text-slate-500 border-l border-slate-200 pl-2">
                            📞 {leaderPhone}
                          </span>
                        </div>
                      </td>
                    <td className="font-bold">{t.members?.length || 0} / 4</td>
                    <td>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          t.payment?.status === "VERIFIED" ? "badge-confirmed" : "badge-pending"
                        }`}
                      >
                        {t.payment?.status || "NOT_SUBMITTED"}
                      </span>
                    </td>
                    <td className="font-mono text-muted">{t.ticket ? "ACTIVE" : "LOCKED"}</td>
                    <td className="font-mono">{t.checkin ? "✓ CHECKED IN" : "PENDING"}</td>
                    <td className="font-bold">
                      {t.room_allocation?.room?.room_name || "Unassigned"}
                    </td>
                    <td>
                      {t.payment?.status !== "VERIFIED" && (
                        <button
                          onClick={() => handleRemind(t.id)}
                          disabled={reminding === t.id}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded shadow disabled:opacity-50"
                        >
                          {reminding === t.id ? "Sending..." : "Send Reminder"}
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
