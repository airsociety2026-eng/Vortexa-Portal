"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>(null);
  const [eventSettings, setEventSettings] = useState<any>(null);
  const [payerName, setPayerName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [amount, setAmount] = useState(500);
  const [screenshotUrl, setScreenshotUrl] = useState("/uploads/sample_payment_screenshot.png");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = () => {
    Promise.all([
      fetch("/api/teams/my-team").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
    ]).then(([tData, sData]) => {
      if (tData.success) {
        setTeamData(tData.data);
        if (tData.data?.team?.payment) {
          const p = tData.data.team.payment;
          setPayerName(p.payer_name); setUpiId(p.upi_id);
          setUtrNumber(p.utr_number); setAmount(p.amount); setScreenshotUrl(p.screenshot_url);
        }
      }
      if (sData.success && sData.data) {
        setEventSettings(sData.data);
        if (!tData.data?.team?.payment) setAmount(sData.data.payment_amount || 500);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payerName, upiId, utrNumber, amount: Number(amount), screenshotUrl }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error?.message || "Failed to submit payment"); return; }
      setSuccess("Payment proof submitted. Status set to PENDING admin review.");
      fetchData();
    } catch { setError("Network error"); } finally { setSubmitting(false); }
  };

  const team = teamData?.team;
  const isLeader = teamData?.isLeader;
  const payment = team?.payment;

  const statusBadge = (s?: string) => {
    if (s === "VERIFIED") return "badge-confirmed";
    if (s === "PENDING")  return "badge-pending";
    if (s === "REJECTED") return "badge-rejected";
    return "badge-neutral";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-2">02 / Payment</p>
          <div className="border-t border-[#DCDCDC] mb-5" />
          <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
            UPI Payment Verification
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            Pay via official VORTEXA UPI QR and submit transaction details for admin verification.
          </p>
        </div>

        {error && <div className="mb-5 px-4 py-3 bg-[#FEF3F2] border border-[#FECACA] rounded-md text-xs font-medium text-[#B42318]">{error}</div>}
        {success && <div className="mb-5 px-4 py-3 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md text-xs font-medium text-[#16803C]">{success}</div>}

        {loading ? (
          <div className="py-16 text-center bg-white border border-[#EAEAEA] rounded-md">
            <div className="vx-spinner mx-auto mb-3" />
            <p className="text-xs text-[#737373]">Loading payment status...</p>
          </div>
        ) : !team ? (
          <div className="bg-white border border-[#FDE68A] rounded-md p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-[#B45309] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#111111] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Team Required</h3>
            <p className="text-sm text-[#737373] mb-5">You must create or join a team before submitting payment.</p>
            <Link href="/dashboard/team" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] transition-colors">
              Go to Team Management
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* UPI QR */}
            <div className="bg-white border border-[#EAEAEA] rounded-md p-6 flex flex-col items-center text-center">
              <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-3">Official UPI Payment</p>
              <div className="border-t border-[#EAEAEA] w-full mb-5" />
              <h3 className="text-lg font-bold text-[#111111] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
                Scan & Pay ?{eventSettings?.payment_amount || 500}
              </h3>
              <p className="text-xs text-[#737373] mb-5">Per team entry fee</p>
              <div className="p-3 border border-[#EAEAEA] rounded-md mb-4">
                <img
                  src={eventSettings?.upi_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=vortexa2026@upi&pn=VORTEXA%20Hackathon&am=500&cu=INR`}
                  alt="Official VORTEXA UPI QR"
                  className="w-44 h-44 object-contain"
                />
              </div>
              <div className="w-full p-3 bg-[#F7F7F5] border border-[#EAEAEA] rounded-md text-left">
                <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">UPI ID</p>
                <p className="font-mono text-sm font-semibold text-[#111111] select-all">{eventSettings?.upi_id || "vortexa2026@upi"}</p>
              </div>
            </div>

            {/* Payment Form / Status */}
            <div className="lg:col-span-2 bg-white border border-[#EAEAEA] rounded-md p-6">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#EAEAEA]">
                <div>
                  <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>Payment Status</h3>
                  <p className="text-xs text-[#737373] mt-0.5">{team.team_name} · {team.team_code}</p>
                </div>
                <span className={statusBadge(payment?.status)}>{payment?.status || "NOT SUBMITTED"}</span>
              </div>

              {payment?.status === "REJECTED" && (
                <div className="mb-5 p-4 bg-[#FEF3F2] border border-[#FECACA] rounded-md">
                  <div className="flex items-center gap-2 text-[#B42318] font-semibold text-xs mb-1">
                    <XCircle className="w-4 h-4" /> Payment Rejected by Admin
                  </div>
                  <p className="text-xs text-[#737373]">Reason: "{payment.rejection_reason}"</p>
                  <p className="text-xs text-[#737373] mt-1">Please correct the details and resubmit below.</p>
                </div>
              )}

              {payment?.status === "VERIFIED" ? (
                <div className="p-5 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md space-y-4">
                  <div className="flex items-center gap-2 text-[#16803C] font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Payment Verified & Confirmed
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "UTR / Transaction ID", value: payment.utr_number, mono: true },
                      { label: "Payer Name",            value: payment.payer_name },
                      { label: "Amount Paid",           value: `?${payment.amount}`, mono: true },
                      { label: "Verified At",           value: new Date(payment.verified_at).toLocaleString() },
                    ].map((item) => (
                      <div key={item.label} className="bg-white border border-[#EAEAEA] rounded-md p-3">
                        <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">{item.label}</p>
                        <p className={`text-sm font-semibold text-[#111111] ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-[#16803C]">
                    Your ticket and QR code are now active. View them under Ticket.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  {!isLeader && (
                    <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-md text-xs text-[#B45309]">
                      Only the Team Leader can submit or edit payment proof.
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Payer Full Name",           name: "payerName",    value: payerName,    setter: setPayerName,    placeholder: "Name on bank / UPI account", mono: false },
                      { label: "Your UPI ID",               name: "upiId",        value: upiId,        setter: setUpiId,        placeholder: "name@okaxis", mono: false },
                      { label: "UTR / Transaction Ref ID",  name: "utrNumber",    value: utrNumber,    setter: setUtrNumber,    placeholder: "UTR9876543210", mono: true },
                    ].map((f) => (
                      <div key={f.name}>
                        <label className="block text-xs font-semibold text-[#262626] mb-1.5">{f.label} *</label>
                        <input
                          type="text"
                          required
                          disabled={!isLeader}
                          value={f.value}
                          onChange={(e) => f.setter(e.target.value)}
                          placeholder={f.placeholder}
                          className={`w-full px-3 py-2.5 glass-input text-sm ${f.mono ? "font-mono" : ""}`}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-[#262626] mb-1.5">Amount (?) *</label>
                      <input
                        type="number"
                        required
                        readOnly
                        value={amount}
                        className="w-full px-3 py-2.5 glass-input text-sm font-mono font-semibold bg-[#F7F7F5] text-[#1D4ED8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1.5">Screenshot Proof (Upload or URL) *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        disabled={!isLeader}
                        value={screenshotUrl}
                        onChange={(e) => setScreenshotUrl(e.target.value)}
                        placeholder="/uploads/screenshot.png"
                        className="w-full px-3 py-2.5 glass-input text-sm font-mono flex-1"
                      />
                      {isLeader && (
                        <label className="cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-md transition-colors flex items-center justify-center flex-shrink-0">
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("file", file);
                              try {
                                const res = await fetch("/api/upload", { method: "POST", body: formData });
                                const data = await res.json();
                                if (data.success) {
                                  setScreenshotUrl(data.url);
                                } else {
                                  alert(data.error || "Upload failed");
                                }
                              } catch {
                                alert("Network error during upload");
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  {isLeader && (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? "Submitting..." : payment ? "Resubmit Payment Proof" : "Submit Payment Proof"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
