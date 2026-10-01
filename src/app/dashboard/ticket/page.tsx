"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TicketPage() {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/teams/my-team")
      .then((r) => r.json())
      .then((data) => { if (data.success) setTeamData(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const team = teamData?.team;
  const ticket = team?.ticket;
  const payment = team?.payment;
  const checkin = team?.checkin;
  const room = team?.room_allocation?.room;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-2">03 / Ticket</p>
          <div className="border-t border-[#DCDCDC] mb-5" />
          <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
            Event Ticket & QR Pass
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            Present this QR code at the entrance desk for event-day check-in.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center bg-white border border-[#EAEAEA] rounded-md">
            <div className="vx-spinner mx-auto mb-3" />
            <p className="text-xs text-[#737373]">Loading ticket...</p>
          </div>
        ) : !ticket || payment?.status !== "VERIFIED" ? (
          <div className="bg-white border border-[#FDE68A] rounded-md p-8 text-center">
            <AlertCircle className="w-8 h-8 text-[#B45309] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#111111] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
              Ticket Locked
            </h3>
            <p className="text-sm text-[#737373] max-w-sm mx-auto mb-6">
              Your ticket will be issued once your payment proof is verified by admin.
            </p>
            <Link
              href="/dashboard/payment"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] transition-colors"
            >
              View Payment Status
            </Link>
          </div>
        ) : (
          /* Swiss Editorial Ticket */
          <>
            <div className="bg-white border border-[#EAEAEA] rounded-md overflow-hidden">
            {/* Ticket Header */}
            <div className="bg-[#111111] px-7 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-widest mb-2">
                    VORTEXA 2026 · Team Entry Pass
                  </p>
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
                    {team.team_name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-widest mb-1">Team Code</p>
                  <p className="text-lg font-bold font-mono text-[#60A5FA]">{team.team_code}</p>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-7 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Details */}
              <div className="md:col-span-2 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Email Status",   value: ticket.email_status === "SENT" ? "Sent to Leader" : ticket.email_status || "Sent" },
                    { label: "Check-in",       value: checkin ? "Checked In" : "Pending", ok: !!checkin },
                    { label: "Room",           value: room ? `${room.room_name} · ${room.building}` : "Awaiting assignment" },
                    { label: "Ticket Code",    value: ticket.ticket_code, mono: true },
                  ].map((item) => (
                    <div key={item.label} className="p-3 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md">
                      <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">{item.label}</p>
                      <p className={`text-xs font-semibold truncate ${item.ok === true ? "text-[#16803C]" : item.ok === false ? "text-[#B45309]" : "text-[#111111]"} ${item.mono ? "font-mono" : ""}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Team Roster */}
                <div>
                  <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-2">Team Members</p>
                  <div className="space-y-1.5">
                    {team.members?.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between px-3 py-2 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md">
                        <span className="text-sm text-[#262626] font-medium">{m.participant.name}</span>
                        <span className="text-[10px] font-semibold text-[#737373] uppercase">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirmed badge */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-[#16803C] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#16803C]">Payment Verified — Team Confirmed</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-white border border-[#EAEAEA] rounded-md mb-3">
                  <img
                    src={ticket.qr_code_url || `https://quickchart.io/qr?text=${ticket.ticket_code}&size=300`}
                    alt="Ticket QR Code"
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Scan at Desk</p>
                <p className="font-mono text-xs font-bold text-[#1D4ED8]">{ticket.ticket_code}</p>

                <div className="mt-4 w-full pt-4 border-t border-[#EAEAEA] text-[10px] text-[#737373] space-y-1">
                  <p>DIT Pimpri · Pune</p>
                  <p>VORTEXA 2026</p>
                </div>
              </div>
            </div>
          </div>
          
          {ticket && (
            <div className="flex justify-end pt-2">
              <Link href="/dashboard/room" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-md transition-colors shadow-sm">
                Next: Room & Check-in <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
