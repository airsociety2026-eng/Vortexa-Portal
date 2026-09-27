"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, CreditCard, QrCode, CheckCircle,
  Building, Bell, FileCode, FolderGit2, Activity, Gavel, Sliders,
  Trophy, Award, BarChart3, ShieldAlert, Settings,
} from "lucide-react";

export function AdminSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  const navGroups = [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Registration",
      items: [
        { href: "/admin/participants", label: "Participants", icon: Users },
        { href: "/admin/teams", label: "Teams", icon: UserCheck },
      ],
    },
    {
      title: "Payments",
      items: [
        { href: "/admin/payments", label: "Payment Verification", icon: CreditCard },
      ],
    },
    {
      title: "Event Day",
      items: [
        { href: "/admin/checkins", label: "Check-in Desk", icon: CheckCircle },
        { href: "/admin/rooms", label: "Room Allocation", icon: Building },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/announcements", label: "Announcements", icon: Bell },
        { href: "/admin/problems", label: "Problem Statements", icon: FileCode },
      ],
    },
    {
      title: "Judging",
      items: [
        { href: "/admin/submissions", label: "Submissions", icon: FolderGit2 },
        { href: "/admin/monitoring", label: "GitHub Monitor", icon: Activity },
        { href: "/admin/judges", label: "Judges", icon: Gavel },
        { href: "/admin/criteria", label: "Criteria", icon: Sliders },
      ],
    },
    {
      title: "Results",
      items: [
        { href: "/admin/results", label: "Leaderboard", icon: Trophy },
        { href: "/admin/certificates", label: "Certificates", icon: Award },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/admin/staff", label: "Staff Management", icon: ShieldAlert },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-56 bg-[#111111] border-r border-[#1E1E1E] min-h-[calc(100vh-3.5rem)] p-3 flex flex-col shrink-0 overflow-y-auto">
      {/* Role badge */}
      <div className="px-3 py-2 mb-4 rounded-md bg-[#1a1a1a] border border-[#2a2a2a]">
        <div className="text-[10px] font-semibold text-[#525252] uppercase tracking-widest">Admin Console</div>
        <div className="text-xs font-semibold text-[#1D4ED8] mt-0.5">{userRole}</div>
      </div>

      <nav className="space-y-5 flex-1">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className="text-[9px] font-semibold uppercase tracking-widest text-[#525252] px-3 mb-1">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[rgba(29,78,216,0.2)] text-white"
                        : "text-[#A3A3A3] hover:text-white hover:bg-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#60A5FA]" : "text-[#525252]"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4 border-t border-[#1E1E1E] mt-4">
        <p className="text-[10px] text-[#525252] text-center">VORTEXA Core v1.0</p>
      </div>
    </aside>
  );
}
