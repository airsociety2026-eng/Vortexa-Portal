"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success || !data.data) { router.push("/login"); return; }
        const role = data.data.role;
        if (role !== "VOLUNTEER") {
          router.push("/dashboard"); return;
        }
        setUser(data.data);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="vx-spinner mx-auto mb-3" />
          <p className="text-xs text-[#737373]">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#EAEAEA] h-14 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#1D4ED8] rounded flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">V</span>
          </div>
          <span className="text-xs font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>VORTEXA 2026</span>
          <span className="text-[#DCDCDC] text-sm">/</span>
          <span className="text-xs text-[#1D4ED8]">Staff / Volunteer Console</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-xs text-[#737373]">{user?.name || user?.email}</div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className="text-[#737373] hover:text-[#B42318] transition" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
