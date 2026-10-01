"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search, Eye, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchPayments = () => {
    fetch("/api/payments/list")
      .then((r) => r.json())
      .then((data) => { if (data.success) setPayments(data.data || []); setLoading(false); })
      .catch(() => {
        fetch("/api/teams/all").then((r) => r.json()).then((d) => {
          if (d.success) setPayments(d.data.map((t: any) => t.payment).filter(Boolean));
          setLoading(false);
        }).catch(() => setLoading(false));
      });
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleVerify = async (paymentId: string) => {
    setSubmitting(true); setMessage("");
    try {
      const res = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
      const data = await res.json();
      if (data.success) { setMessage(data.message); fetchPayments(); } else alert(data.error?.message || "Failed to verify");
    } catch { alert("Error verifying payment"); } finally { setSubmitting(false); }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment || !rejectionReason.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId: rejectingPayment.id, rejectionReason }) });
      const data = await res.json();
      if (data.success) { setMessage(data.message); setRejectingPayment(null); setRejectionReason(""); fetchPayments(); }
      else alert(data.error?.message || "Failed to reject");
    } catch { alert("Error"); } finally { setSubmitting(false); }
  };

  const handleResendEmail = async (paymentId: string) => {
    setSubmitting(true); setMessage("");
    try {
      const res = await fetch("/api/payments/resend-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
      const data = await res.json();
      if (data.success) { setMessage(data.message || "Email resent."); fetchPayments(); }
      else alert(typeof data.error === "string" ? data.error : data.error?.message || "Failed");
    } catch { alert("Error"); } finally { setSubmitting(false); }
  };

  const filtered = payments.filter((p) => {
    const s = search.toLowerCase();
    const matchesSearch = p.utr_number?.toLowerCase().includes(s) || p.payer_name?.toLowerCase().includes(s) || p.team?.team_code?.toLowerCase().includes(s) || p.team?.team_name?.toLowerCase().includes(s);
    return matchesSearch && (statusFilter === "ALL" || p.status === statusFilter);
  });

  const badgeClass = (s?: string) => {
    if (s === "VERIFIED") return "badge-confirmed";
    if (s === "PENDING")  return "badge-pending";
    if (s === "REJECTED") return "badge-rejected";
    return "badge-neutral";
  };

  return (
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAEAEA]">
        <div>
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-1">Admin · Payments</p>
          <h1 className="text-xl font-bold text-[#111111] flex items-center gap-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            <CreditCard className="w-5 h-5 text-[#1D4ED8]" />
            Payment Verification
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">Review UTR IDs and payment proof screenshots to verify or reject team payments.</p>
        </div>
        <button onClick={fetchPayments} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#737373] border border-[#EAEAEA] rounded-md bg-white hover:bg-[#F7F7F5] transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {message && <div className="px-4 py-3 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md text-xs font-medium text-[#16803C]">{message}</div>}

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by team, payer name, or UTR..." className="w-full pl-9 pr-4 py-2 glass-input text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 glass-input text-sm appearance-none">
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center bg-white border border-[#EAEAEA] rounded-md">
          <div className="vx-spinner mx-auto mb-3" /><p className="text-xs text-[#737373]">Loading payments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center bg-white border border-[#EAEAEA] rounded-md">
          <p className="text-xs text-[#BDBDBD]">No payment records match your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#EAEAEA] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="vx-table">
              <thead>
                <tr>
                  <th>Team</th><th>Payer</th><th>UTR</th><th>Amount</th>
                  <th>Submitted</th><th>Status</th><th>Email</th><th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const ticket = p.team?.ticket;
                  const emailStatus = ticket?.email_status || "PENDING";
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="font-semibold text-[#111111] text-sm">{p.team?.team_name || "—"}</div>
                        <div className="font-mono text-xs text-[#1D4ED8]">{p.team?.team_code}</div>
                      </td>
                      <td className="text-[#262626]">{p.payer_name}</td>
                      <td className="font-mono text-[#111111] font-semibold">{p.utr_number}</td>
                      <td className="font-mono font-semibold text-[#16803C]">₹{p.amount}</td>
                      <td className="text-[#737373] text-xs">{new Date(p.submitted_at).toLocaleDateString()} {new Date(p.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td>
                        <span className={badgeClass(p.status)}>{p.status}</span>
                        {ticket && <div className="text-[10px] text-[#737373] mt-1 font-mono">{ticket.ticket_code}</div>}
                      </td>
                      <td>
                        {p.status === "VERIFIED" ? (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${emailStatus === "SENT" ? "bg-[#ECFDF3] text-[#16803C]" : emailStatus === "FAILED" ? "bg-[#FEF3F2] text-[#B42318]" : "bg-[#FFFBEB] text-[#B45309]"}`}>
                            {emailStatus}
                          </span>
                        ) : <span className="text-[#DCDCDC] text-xs">—</span>}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button onClick={() => setSelectedScreenshot(p.screenshot_url)} className="p-1.5 rounded-md border border-[#EAEAEA] text-[#737373] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors" title="View screenshot">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {p.status !== "VERIFIED" && (
                            <button disabled={submitting} onClick={() => handleVerify(p.id)} className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#ECFDF3] text-[#16803C] border border-[#BBF7D0] hover:bg-[#D1FAE5] transition-colors">
                              Verify
                            </button>
                          )}
                          {p.status === "VERIFIED" && (
                            <button disabled={submitting} onClick={() => handleResendEmail(p.id)} className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors">
                              Resend Email
                            </button>
                          )}
                          {p.status !== "REJECTED" && (
                            <button disabled={submitting} onClick={() => setRejectingPayment(p)} className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#FEF3F2] text-[#B42318] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors">
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedScreenshot(null)}>
          <div className="bg-white max-w-2xl w-full p-5 rounded-lg border border-[#EAEAEA] space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
              <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>Payment Screenshot Proof</h3>
              <button onClick={() => setSelectedScreenshot(null)} className="text-[#737373] hover:text-[#111111] text-lg leading-none">✕</button>
            </div>
            <div className="bg-[#F7F7F5] rounded-md flex items-center justify-center min-h-[200px] max-h-[65vh] overflow-hidden">
              {selectedScreenshot.startsWith("/uploads/") || selectedScreenshot === "" ? (
                <div className="text-center py-10 text-[#737373]">
                  <p className="text-sm font-semibold">No screenshot available</p>
                  <p className="text-xs mt-1">This payment was submitted before image upload was available,<br/>or the file was stored on the old server and is no longer accessible.</p>
                </div>
              ) : (
                <img
                  src={selectedScreenshot}
                  alt="Payment Proof"
                  className="max-h-[60vh] object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<div class="text-center py-10 text-gray-500"><p class="text-sm font-semibold">Screenshot unavailable</p><p class="text-xs mt-1">The image could not be loaded.</p></div>';
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}


      {/* Rejection Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-lg border border-[#FECACA] space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#B42318]" />
              <h3 className="text-sm font-semibold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Reject Payment — {rejectingPayment.team?.team_name}
              </h3>
            </div>
            <p className="text-xs text-[#737373]">Provide a clear reason so the team leader can re-submit valid proof.</p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#262626] mb-1.5">Rejection Reason *</label>
                <textarea required rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Invalid UTR number or illegible screenshot..." className="w-full p-3 glass-input text-sm resize-none" />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setRejectingPayment(null)} className="px-4 py-2 text-xs font-semibold text-[#737373] border border-[#EAEAEA] rounded-md hover:bg-[#F7F7F5] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-semibold bg-[#B42318] text-white rounded-md hover:bg-[#991B1B] transition-colors disabled:opacity-50">
                  {submitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
