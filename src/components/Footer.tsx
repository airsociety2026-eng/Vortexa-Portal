import Link from "next/link";
import { ShieldCheck, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#EAEAEA] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#1D4ED8] rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">V</span>
              </div>
              <span className="font-bold text-sm tracking-tight text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800 }}>
                VORTEXA 2026
              </span>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              The premier coding hackathon of the year, bringing together the best minds to solve real-world problems.
            </p>
          </div>

          {/* Participant */}
          <div>
            <h4 className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-4">Participant</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/dashboard/team", label: "Team Management" },
                { href: "/dashboard/payment", label: "Payment" },
                { href: "/dashboard/ticket", label: "Event Ticket & QR" },
                { href: "/dashboard/problems", label: "Problem Tracks" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#4B4B4B] hover:text-[#1D4ED8] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-4">Contact</h4>
            <div className="space-y-2.5 text-xs text-[#4B4B4B]">
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#1D4ED8]" /> support@vortexa.io</p>
              <p>DIT Pimpri · Pune</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#EAEAEA] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#737373]">© 2026 VORTEXA. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-[#737373]">
            <span>Security Verified</span>
            <span>RBAC Protected</span>
            <span>Prisma Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
