"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => { if (data.success && data.data) setUser(data.data); })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const navLinks = [
    { href: "/#about", label: "About" },
    { href: "/#problems", label: "Problem Statements" },
    { href: "/#timeline", label: "Timeline" },
    { href: "/#rules", label: "Rules" },
    { href: "/#prizes", label: "Prizes" },
    { href: "/#schedule", label: "Schedule" },
    { href: "/#faqs", label: "FAQs" },
  ];

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "JUDGE") return "/judge";
    if (user.role === "VOLUNTEER") return "/staff";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#1D4ED8] rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold leading-none">V</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-800 text-sm tracking-tight text-[#111111] leading-none" style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800 }}>
              VORTEXA
            </span>
            <span className="text-[9px] text-[#737373] tracking-widest uppercase leading-none mt-0.5">
              2026
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-semibold text-[#737373] hover:text-[#111111] hover:bg-[#F1F1EF] px-3 py-1.5 rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Session */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={getDashboardLink()}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#EAEAEA] bg-[#F7F7F5] hover:bg-[#F1F1EF] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white text-[9px] font-bold flex items-center justify-center">
                  {user.name?.[0] || user.email?.[0] || "U"}
                </div>
                <span className="text-xs font-medium text-[#262626] max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-[#737373] hover:text-[#B42318] hover:bg-[#FEF3F2] border border-[#EAEAEA] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#737373] hover:text-[#111111] px-3 py-1.5 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-3.5 py-1.5 bg-[#1D4ED8] text-white rounded-md hover:bg-[#1E40AF] transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-md text-[#737373] hover:bg-[#F1F1EF] transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#EAEAEA] bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link 
              key={link.label}
              href={link.href} 
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#262626] hover:bg-[#F1F1EF] rounded-md"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link 
              href={getDashboardLink()} 
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1D4ED8] hover:bg-[#EFF6FF] rounded-md mt-2"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
