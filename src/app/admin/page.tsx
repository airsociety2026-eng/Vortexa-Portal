"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserCheck, CreditCard, QrCode, Building, FolderGit2, Trophy, Award, DollarSign, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((data) => { if (data.success) setStats(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Participants",     value: stats?.totalParticipants ?? "—",  sub: "Registered accounts",      icon: Users },
    { label: "Teams",            value: stats?.totalTeams ?? "—",          sub: `${stats?.confirmedTeams ?? 0} confirmed`, icon: UserCheck },
    { label: "Pending Payments", value: stats?.pendingPayments ?? "—",    sub: "Awaiting verification",     icon: CreditCard, urgent: true },
    { label: "Revenue",          value: `₹${stats?.totalRevenue ?? 0}`,   sub: `${stats?.verifiedPayments ?? 0} verified payments`, icon: DollarSign },
    { label: "Checked In",       value: stats?.checkedInTeams ?? "—",     sub: "Event day check-in",        icon: QrCode },
    { label: "Submissions",      value: stats?.totalSubmissions ?? "—",   sub: "GitHub repos linked",       icon: FolderGit2 },
    { label: "Certificates",     value: stats?.totalCertificates ?? "—",  sub: "Verified PDFs issued",      icon: Award },
    { label: "Rooms",            value: stats?.totalRooms ?? "—",         sub: "Active venue labs",         icon: Building },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAEAEA]">
        <div>
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Admin Console</p>
          <h1 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
            Overview & Analytics
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">Real-time metrics for registrations, payments, check-ins, and judging.</p>
        </div>
        <Link
          href="/admin/scanner"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] text-white text-xs font-semibold rounded-md hover:bg-[#1E40AF] transition-colors"
        >
          <QrCode className="w-4 h-4" />
          Open QR Scanner
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center bg-white border border-[#EAEAEA] rounded-md">
          <div className="vx-spinner mx-auto mb-3" />
          <p className="text-xs text-[#737373]">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`bg-white border rounded-md p-4 ${s.urgent && stats?.pendingPayments > 0 ? "border-[#FDE68A]" : "border-[#EAEAEA]"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest">{s.label}</span>
                  <Icon className="w-4 h-4 text-[#BDBDBD]" />
                </div>
                <div className={`text-2xl font-bold ${s.urgent && stats?.pendingPayments > 0 ? "text-[#B45309]" : "text-[#111111]"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
                  {s.value}
                </div>
                <p className="text-[10px] text-[#BDBDBD] mt-1">{s.sub}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="border-t border-[#EAEAEA] mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              href: "/admin/payments",
              title: "Payment Verification",
              desc: "Review UTR numbers and payment proof screenshots from team leaders.",
              badge: `${stats?.pendingPayments ?? 0} Pending`,
              badgeClass: "bg-[#FFFBEB] text-[#B45309]",
            },
            {
              href: "/admin/scanner",
              title: "QR Check-in Scanner",
              desc: "Scan attendee ticket QR codes for instant event-day check-in.",
              badge: "Ready",
              badgeClass: "bg-[#ECFDF3] text-[#16803C]",
            },
            {
              href: "/admin/results",
              title: "Results & Certificates",
              desc: "Compute scores, publish the leaderboard, and issue verified certificates.",
              badge: "Engine Ready",
              badgeClass: "bg-[#EFF6FF] text-[#1D4ED8]",
            },
          ].map((action) => (
            <div key={action.href} className="bg-white border border-[#EAEAEA] rounded-md p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>{action.title}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${action.badgeClass}`}>{action.badge}</span>
              </div>
              <p className="text-xs text-[#737373] mb-4">{action.desc}</p>
              <Link
                href={action.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline"
              >
                Open <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
