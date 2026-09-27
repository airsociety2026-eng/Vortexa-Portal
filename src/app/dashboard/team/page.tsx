"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, UserPlus, Crown, User, Copy, Check, ArrowRight } from "lucide-react";

export default function TeamManagementPage() {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>(null);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTeam = () => {
    fetch("/api/teams/my-team")
      .then((r) => r.json())
      .then((data) => { if (data.success) setTeamData(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/teams/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamName: createName }) });
      const data = await res.json();
      if (!data.success) { setError(data.error?.message || "Failed to create team"); return; }
      setSuccess(data.message); setCreateName(""); fetchTeam();
    } catch { setError("Network error"); } finally { setSubmitting(false); }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/teams/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamCode: joinCode }) });
      const data = await res.json();
      if (!data.success) { setError(data.error?.message || "Failed to join team"); return; }
      setSuccess(data.message); setJoinCode(""); fetchTeam();
    } catch { setError("Network error"); } finally { setSubmitting(false); }
  };

  const copyCode = () => {
    if (teamData?.team?.team_code) {
      navigator.clipboard.writeText(teamData.team.team_code);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const team = teamData?.team;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-2">01 / Team</p>
          <div className="border-t border-[#DCDCDC] mb-5" />
          <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
            Team Management
          </h1>
          <p className="text-sm text-[#737373] mt-1">Form a team of 1–4 members. Share your Team Code for others to join.</p>
        </div>

        {error   && <div className="mb-5 px-4 py-3 bg-[#FEF3F2] border border-[#FECACA] rounded-md text-xs font-medium text-[#B42318]">{error}</div>}
        {success && <div className="mb-5 px-4 py-3 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md text-xs font-medium text-[#16803C]">{success}</div>}

        {loading ? (
          <div className="py-16 text-center bg-white border border-[#EAEAEA] rounded-md">
            <div className="vx-spinner mx-auto mb-3" /><p className="text-xs text-[#737373]">Loading team details...</p>
          </div>
        ) : team ? (
          <div className="space-y-5">
            {/* Team header card */}
            <div className="bg-white border border-[#EAEAEA] rounded-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Your Team</p>
                <h2 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>{team.team_name}</h2>
                <span className={`mt-1 ${team.status === "CONFIRMED" ? "badge-confirmed" : "badge-pending"}`}>{team.status}</span>
              </div>
              <div className="bg-[#F7F7F5] border border-[#EAEAEA] rounded-md px-5 py-3 flex items-center gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Team Code</p>
                  <p className="font-mono text-lg font-bold text-[#1D4ED8]">{team.team_code}</p>
                </div>
                <button onClick={copyCode} className="p-2 border border-[#EAEAEA] bg-white rounded-md text-[#737373] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors" title="Copy team code">
                  {copied ? <Check className="w-4 h-4 text-[#16803C]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Members Roster */}
            <div className="bg-white border border-[#EAEAEA] rounded-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Team Members
                </h3>
                <span className="text-xs text-[#737373]">{team.members?.length || 0} / 4</span>
              </div>
              <div className="space-y-2">
                {team.members?.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center ${m.role === "LEADER" ? "bg-[#FFFBEB] border border-[#FDE68A]" : "bg-[#EFF6FF] border border-[#BFDBFE]"}`}>
                        {m.role === "LEADER" ? <Crown className="w-3.5 h-3.5 text-[#B45309]" /> : <User className="w-3.5 h-3.5 text-[#1D4ED8]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#111111]">{m.participant.name}</span>
                          {m.role === "LEADER" && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">Leader</span>}
                        </div>
                        <p className="text-xs text-[#737373]">{m.participant.college} · {m.participant.course}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-mono text-[#4B4B4B]">{m.participant.phone}</p>
                      <p className="text-xs text-[#737373] truncate max-w-[160px]">{m.participant.user?.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* No Team */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Create */}
            <div className="bg-white border border-[#EAEAEA] rounded-md p-6">
              <div className="w-8 h-8 bg-[#EFF6FF] border border-[#BFDBFE] rounded-md flex items-center justify-center mb-4">
                <UserPlus className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <h2 className="text-base font-bold text-[#111111] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Create a New Team</h2>
              <p className="text-xs text-[#737373] mb-5">You become the Team Leader and receive a unique Team Code to share with up to 3 teammates.</p>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#262626] mb-1.5">Team Name *</label>
                  <input type="text" required value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Code Titans" className="w-full px-3 py-2.5 glass-input text-sm" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {submitting ? "Creating..." : "Create Team"} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Join */}
            <div className="bg-white border border-[#EAEAEA] rounded-md p-6">
              <div className="w-8 h-8 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md flex items-center justify-center mb-4">
                <Users className="w-4 h-4 text-[#737373]" />
              </div>
              <h2 className="text-base font-bold text-[#111111] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Join Existing Team</h2>
              <p className="text-xs text-[#737373] mb-5">Enter the Team Code provided by your leader (e.g. VTX26-00421).</p>
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#262626] mb-1.5">Team Code *</label>
                  <input type="text" required value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="VTX26-XXXXX" className="w-full px-3 py-2.5 glass-input text-sm font-mono uppercase" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-white text-[#111111] text-sm font-semibold rounded-md border border-[#DCDCDC] hover:bg-[#F1F1EF] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {submitting ? "Joining..." : "Join Team"} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
