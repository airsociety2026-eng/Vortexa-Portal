"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";

export interface JourneyState {
  registered: boolean;
  hasTeam: boolean;
  teamCode?: string;
  paymentSubmitted: boolean;
  paymentStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  ticketGenerated: boolean;
  checkedIn: boolean;
  roomAllocated: boolean;
  roomName?: string;
  submitted: boolean;
  resultsPublished: boolean;
  certificateAvailable: boolean;
}

export function ProgressTracker({ state }: { state: JourneyState }) {
  const steps = [
    { id: "reg",         label: "Registration",  completed: state.registered,            current: false,                              detail: "Account Created" },
    { id: "team",        label: "Team",           completed: state.hasTeam,               current: !state.hasTeam,                     detail: state.hasTeam ? state.teamCode || "Formed" : "Pending" },
    { id: "payment",     label: "Payment",        completed: state.paymentSubmitted,      current: state.hasTeam && !state.paymentSubmitted, detail: state.paymentSubmitted ? "Uploaded" : "?500 Due" },
    { id: "verify",      label: "Verification",   completed: state.paymentStatus === "VERIFIED", current: state.paymentStatus === "PENDING", detail: state.paymentStatus === "VERIFIED" ? "Confirmed" : state.paymentStatus === "REJECTED" ? "Rejected" : state.paymentStatus === "PENDING" ? "Under Review" : "Awaiting" },
    { id: "ticket",      label: "Ticket",         completed: state.ticketGenerated,       current: state.paymentStatus === "VERIFIED" && !state.ticketGenerated, detail: state.ticketGenerated ? "QR Active" : "Locked" },
    { id: "checkin",     label: "Check-in",       completed: state.checkedIn,             current: state.ticketGenerated && !state.checkedIn, detail: state.checkedIn ? "Checked In" : "Event Day" },
    { id: "room",        label: "Room",           completed: state.roomAllocated,         current: state.checkedIn && !state.roomAllocated, detail: state.roomAllocated ? state.roomName || "Assigned" : "Pending" },
    { id: "submission",  label: "Submission",     completed: state.submitted,             current: state.roomAllocated && !state.submitted, detail: state.submitted ? "Submitted" : "Open" },
    { id: "results",     label: "Results",        completed: state.resultsPublished,      current: state.submitted && !state.resultsPublished, detail: state.resultsPublished ? "Published" : "Judging" },
    { id: "certificate", label: "Certificate",    completed: state.certificateAvailable,  current: state.resultsPublished && !state.certificateAvailable, detail: state.certificateAvailable ? "Available" : "Pending" },
  ];

  return (
    <div className="w-full bg-white border border-[#EAEAEA] rounded-lg p-5 mb-6">
      <div className="mb-4">
        <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Registration Progress</p>
        <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>
          Hackathon Journey
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col items-center p-2.5 rounded-md border text-center ${
              step.completed
                ? "bg-[#ECFDF3] border-[#BBF7D0]"
                : step.current
                ? "bg-[#EFF6FF] border-[#BFDBFE]"
                : "bg-[#F7F7F5] border-[#EAEAEA]"
            }`}
          >
            <div className="mb-1.5">
              {step.completed ? (
                <CheckCircle2 className="w-4 h-4 text-[#16803C]" />
              ) : step.current ? (
                <Clock className="w-4 h-4 text-[#1D4ED8]" />
              ) : (
                <Circle className="w-4 h-4 text-[#DCDCDC]" />
              )}
            </div>
            <span className={`text-[10px] font-semibold leading-tight ${step.completed ? "text-[#16803C]" : step.current ? "text-[#1D4ED8]" : "text-[#737373]"}`}>
              {step.label}
            </span>
            <span className="text-[9px] mt-0.5 text-[#A3A3A3] leading-tight">{step.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
