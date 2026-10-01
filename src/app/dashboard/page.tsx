"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProgressTracker } from "@/components/ProgressTracker";
import { Users, CreditCard, QrCode, Building, Bell, FolderGit2, Clock, ArrowRight } from "lucide-react";

export default function ParticipantDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/teams/my-team").then((r) => r.json()),
      fetch("/api/announcements").then((r) => r.json()),
    ])
      .then(([userData, teamRes, annRes]) => {
        if (userData.success) setUser(userData.data);
        if (teamRes.success) setTeamData(teamRes.data);
        if (annRes.success) setAnnouncements(annRes.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const team = teamData?.team;

  const journeyState = {
    registered: !!user,
    hasTeam: !!team,
    teamCode: team?.team_code,
    paymentSubmitted: !!team?.payment,
    paymentStatus: (team?.payment?.status as any) || "NOT_SUBMITTED",
    ticketGenerated: !!team?.ticket,
    checkedIn: !!team?.checkin,
    roomAllocated: !!team?.room_allocation,
    roomName: team?.room_allocation?.room?.room_name,
    submitted: !!team?.submission && team?.submission?.status === "SUBMITTED",
    resultsPublished: !!team?.result && team?.result?.status === "PUBLISHED",
    certificateAvailable: (team?.certificates?.length || 0) > 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="vx-spinner mx-auto mb-3" />
          <p className="text-xs text-[#737373]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/dashboard",             label: "Overview" },
    { href: "/dashboard/team",        label: "1. Team" },
    { href: "/dashboard/payment",     label: "2. Payment" },
    { href: "/dashboard/ticket",      label: "3. Ticket" },
    { href: "/dashboard/room",        label: "4. Room" },
    { href: "/dashboard/problems",    label: "5. Tracks" },
    { href: "/dashboard/submission",  label: "6. Submission" },
    { href: "/dashboard/results",     label: "7. Results" },
    { href: "/dashboard/certificate", label: "8. Certificate" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#111111]">
      <Navbar />

      {/* Sub Nav */}
      <div className="bg-white border-b border-[#EAEAEA] sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-0 h-10 scrollbar-none">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-[#111111] hover:bg-[#F7F7F5] rounded-md whitespace-nowrap transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-2">Participant Dashboard</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
                {user?.name || user?.email || "Participant"}
              </h1>
              <Link href="/dashboard/profile" className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2 py-1 rounded transition-colors">
                Edit Profile
              </Link>
            </div>
            <p className="text-sm text-[#737373] mt-1">
              {user?.participant?.college || "College not set"}
              {user?.participant?.department ? ` · ${user.participant.department}` : ""}
            </p>
          </div>

          {team ? (
            <div className="bg-white border border-[#EAEAEA] rounded-md px-5 py-4 text-right">
              <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Team Code</p>
              <p className="text-xl font-bold font-mono text-[#1D4ED8]">{team.team_code}</p>
              <p className="text-xs text-[#737373] mt-0.5">{team.team_name}</p>
            </div>
          ) : (
            <Link
              href="/dashboard/team"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] text-white text-xs font-semibold rounded-md hover:bg-[#1E40AF] transition-colors"
            >
              <Users className="w-4 h-4" />
              Create / Join Team
            </Link>
          )}
        </div>

        <div className="border-t border-[#EAEAEA] mb-8" />

        {/* Progress Tracker */}
        <ProgressTracker state={journeyState} />

        {/* Step Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { href: "/dashboard/team",       step: "01", icon: Users,       title: "Team",          detail: team?.team_code || "No team yet" },
            { href: "/dashboard/payment",    step: "02", icon: CreditCard,  title: "Payment",       detail: team?.payment?.status || "Not submitted" },
            { href: "/dashboard/ticket",     step: "03", icon: QrCode,      title: "Ticket",        detail: team?.ticket ? "Active" : "Awaiting verification" },
            { href: "/dashboard/room",       step: "04", icon: Building,    title: "Room",          detail: team?.room_allocation?.room?.room_name || "Pending check-in" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="bg-white border border-[#EAEAEA] rounded-md p-4 hover:border-[#1D4ED8] transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-4 h-4 text-[#BDBDBD] group-hover:text-[#1D4ED8] transition-colors" />
                  <span className="text-[10px] font-semibold text-[#DCDCDC]">{c.step}</span>
                </div>
                <p className="text-sm font-semibold text-[#111111]">{c.title}</p>
                <p className="text-xs text-[#737373] mt-0.5 truncate">{c.detail}</p>
              </Link>
            );
          })}
        </div>

        {/* Announcements & Submission */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#EAEAEA] rounded-md p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-4 h-4 text-[#1D4ED8]" />
              <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Announcements
              </h3>
            </div>

            {announcements.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-[#BDBDBD]">No announcements published yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-[#111111]">{ann.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                        ann.priority === "URGENT" ? "bg-[#FEF3F2] text-[#B42318]" :
                        ann.priority === "IMPORTANT" ? "bg-[#FFFBEB] text-[#B45309]" :
                        "bg-[#F1F1EF] text-[#737373]"
                      }`}>
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[#4B4B4B]">{ann.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#EAEAEA] rounded-md p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <FolderGit2 className="w-4 h-4 text-[#1D4ED8]" />
              <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Project Submission
              </h3>
            </div>

            <div className="flex-1">
              {team?.submission ? (
                <div className="p-4 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#111111]">{team.submission.project_title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                      team.submission.status === "SUBMITTED" ? "bg-[#ECFDF3] text-[#16803C]" :
                      team.submission.status === "LOCKED"    ? "bg-[#FEF3F2] text-[#B42318]" :
                      "bg-[#F1F1EF] text-[#737373]"
                    }`}>
                      {team.submission.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B4B4B] line-clamp-2">{team.submission.description}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-[#EAEAEA] rounded-md">
                  <Clock className="w-6 h-6 text-[#DCDCDC] mb-2" />
                  <p className="text-xs text-[#BDBDBD]">No submission yet</p>
                </div>
              )}
            </div>

            <Link
              href="/dashboard/submission"
              className="mt-5 w-full py-2.5 bg-[#1D4ED8] text-white text-xs font-semibold rounded-md hover:bg-[#1E40AF] transition-colors flex items-center justify-center gap-2"
            >
              {team?.submission ? "Edit Submission" : "Submit Project"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
