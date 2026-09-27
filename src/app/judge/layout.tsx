"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success || !data.data) { router.push("/login"); return; }
        const role = data.data.role;
        if (role !== "JUDGE") {
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
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Top bar */}
      <div className="bg-slate-900 border-b border-white/10 h-14 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-cyan-500 rounded flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">V</span>
          </div>
          <span className="text-xs font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>VORTEXA 2026</span>
          <span className="text-white/20 text-sm">/</span>
          <span className="text-xs text-cyan-400">Judge Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-300">{user?.name || user?.email}</div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
