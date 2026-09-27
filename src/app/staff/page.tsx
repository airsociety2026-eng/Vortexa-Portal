"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Search, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function AdminQRScannerPage() {
  const [ticketInput, setTicketInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    let scanner: any = null;
    let isScanning = false;

    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (!isMounted) return;

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText: string) => {
          if (!isScanning) {
            isScanning = true;
            let code = decodedText;
            if (code.includes("/")) {
              const parts = code.split("/");
              code = parts[parts.length - 1];
            }
            setTicketInput(code);
            handleLookup(code).finally(() => {
              setTimeout(() => { isScanning = false; }, 3000);
            });
          }
        },
        () => {} // ignore scan failures
      );
    }).catch((err) => {
      console.error("Failed to load scanner:", err);
      setError("Failed to load scanner module.");
    });

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = async (codeToLookup?: string) => {
    const code = codeToLookup || ticketInput;
    if (!code.trim()) return;
    setLoading(true); setError(""); setSuccessMsg(""); setScanResult(null);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!data.success || !data.data) {
        setError(data.error?.message || `No ticket found for code: "${code}"`);
        return;
      }
      setScanResult(data.data);
    } catch { setError("Network error looking up ticket"); }
    finally { setLoading(false); }
  };

  const handlePerformCheckIn = async () => {
    if (!scanResult) return;
    setLoading(true); setError(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/scanner/scan-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: scanResult.ticket_code, location: "Main Event Entrance Desk" }),
      });
      const data = await res.json();
      if (!data.success && !data.data?.alreadyCheckedIn) { setError(data.error?.message || "Check-in failed"); return; }
      if (data.data?.alreadyCheckedIn) { setError(data.message); } else { setSuccessMsg(data.message); }
      handleLookup(scanResult.ticket_code);
    } catch { setError("Check-in error"); }
    finally { setLoading(false); }
  };

  const payment = scanResult?.team?.payment;
  const isVerified = payment?.status === "VERIFIED";
  const isCheckedIn = !!scanResult?.team?.checkin;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-[#EAEAEA]">
        <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Event Day · Desk Module</p>
        <h1 className="text-xl font-bold text-[#111111] flex items-center gap-2" style={{ fontFamily: "Manrope, sans-serif" }}>
          <QrCode className="w-5 h-5 text-[#1D4ED8]" />
          QR Ticket Check-in Scanner
        </h1>
        <p className="text-xs text-[#737373] mt-1">
          Scan QR or enter Team Code (e.g. VTX26-00421) for instant check-in.
        </p>
      </div>

      {/* QR Scanner Camera */}
      <div className="bg-white border border-[#EAEAEA] rounded-md p-5 flex flex-col items-center justify-center">
        <div id="qr-reader" className="w-full max-w-sm overflow-hidden rounded-md border border-[#DCDCDC] bg-[#F7F7F5] aspect-square flex items-center justify-center text-[#737373] text-sm text-center p-4">
          Requesting camera...
        </div>
        {error && error.includes("Camera access is required") && (
          <p className="mt-4 text-xs font-medium text-[#B42318] text-center">{error}</p>
        )}
      </div>

      {/* Lookup */}
      <div className="bg-white border border-[#EAEAEA] rounded-md p-5">
        <label className="block text-xs font-semibold text-[#262626] mb-2">Ticket ID or Team Code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="e.g. VTX26-00421 or VTX-TICK-98745210"
              className="w-full pl-9 pr-4 py-2.5 glass-input text-sm font-mono uppercase"
              autoFocus
            />
          </div>
          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="px-5 py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "Lookup"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-[#FEF3F2] border border-[#FECACA] rounded-md flex items-start gap-3">
          <XCircle className="w-4 h-4 text-[#B42318] flex-shrink-0 mt-0.5" />
          <span className="text-xs font-medium text-[#B42318]">{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#16803C] flex-shrink-0 mt-0.5" />
          <span className="text-xs font-medium text-[#16803C]">{successMsg}</span>
        </div>
      )}

      {/* Result Card */}
      {scanResult && (
        <div className={`bg-white border-2 rounded-md p-6 space-y-5 ${isCheckedIn ? "border-[#BBF7D0]" : isVerified ? "border-[#BFDBFE]" : "border-[#FECACA]"}`}>
          {/* Team */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Team Found</p>
              <h2 className="text-xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>
                {scanResult.team?.team_name}
              </h2>
              <p className="font-mono text-sm text-[#1D4ED8] font-semibold">{scanResult.team?.team_code}</p>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <span className={isVerified ? "badge-confirmed" : "badge-rejected"}>
                PAYMENT: {payment?.status || "UNPAID"}
              </span>
              <span className={isCheckedIn ? "badge-confirmed" : "badge-pending"}>
                {isCheckedIn ? "? CHECKED IN" : "NOT CHECKED IN"}
              </span>
            </div>
          </div>

          <div className="border-t border-[#EAEAEA]" />

          {/* Details */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Payment UTR",    value: payment?.utr_number || "—", mono: true },
              { label: "Allocated Room", value: scanResult.team?.room_allocation?.room?.room_name || "Unassigned" },
              { label: "Ticket Code",    value: scanResult.ticket_code, mono: true },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md">
                <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">{item.label}</p>
                <p className={`text-xs font-semibold text-[#111111] truncate ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Members */}
          <div>
            <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-2">Team Members</p>
            <div className="space-y-1.5">
              {scanResult.team?.members?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between px-3 py-2 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md">
                  <span className="text-sm font-medium text-[#262626]">{m.participant?.name}</span>
                  <span className="text-[10px] font-semibold text-[#737373] uppercase">{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Check-in Button */}
          {!isCheckedIn ? (
            <button
              onClick={handlePerformCheckIn}
              disabled={loading || !isVerified}
              className="w-full py-3.5 bg-[#16803C] text-white text-sm font-bold rounded-md hover:bg-[#15803d] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {!isVerified ? "Cannot Check In — Payment Not Verified" : "Check In Team Now"}
            </button>
          ) : (
            <div className="p-4 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#16803C] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#16803C]">Team Checked In</p>
                <p className="text-xs text-[#737373]">
                  {new Date(scanResult.team.checkin.checked_in_at).toLocaleTimeString()} — by {scanResult.team.checkin.checked_in_by}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
