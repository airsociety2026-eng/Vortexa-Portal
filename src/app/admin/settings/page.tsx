"use client";

import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("VORTEXA 2026");
  const [eventYear, setEventYear] = useState("2026");
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [registrationClose, setRegistrationClose] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(500);
  const [upiId, setUpiId] = useState("vortexa2026@upi");
  const [upiQrUrl, setUpiQrUrl] = useState("");
  const [venue, setVenue] = useState("VORTEXA Innovation Center, Main Campus");
  const [officialEmail, setOfficialEmail] = useState("support@vortexa.io");

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchSettings = () => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const s = data.data;
          setEventName(s.event_name || "VORTEXA 2026");
          setEventYear(s.event_year || "2026");
          setRegistrationOpen(s.registration_open ?? true);
          setRegistrationClose(s.registration_close ?? false);
          setPaymentAmount(s.payment_amount || 500);
          setUpiId(s.upi_id || "vortexa2026@upi");
          setUpiQrUrl(s.upi_qr_url || "");
          setVenue(s.venue || "");
          setOfficialEmail(s.official_email || "support@vortexa.io");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventYear,
          registrationOpen,
          registrationClose,
          paymentAmount: Number(paymentAmount),
          upiId,
          upiQrUrl,
          venue,
          officialEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchSettings();
      } else {
        alert(data.error?.message || "Failed to update settings");
      }
    } catch (err) {
      alert("Error updating settings");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            <span>Event Settings & Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure hackathon name, UPI payment handle, entry fee amount, venue, and registration windows.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading configuration...</p>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-glass">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input font-bold text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Event Edition / Year *</label>
                <input
                  type="text"
                  required
                  value={eventYear}
                  onChange={(e) => setEventYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Entry Fee per Team (₹) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl glass-input font-mono text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official UPI Handle ID *</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input font-mono text-cyan-300 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Custom UPI QR Image (Optional)</label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={upiQrUrl}
                      onChange={(e) => setUpiQrUrl(e.target.value)}
                      placeholder="e.g. /uploads/my_qr_code.png or https://imgur.com/my_qr"
                      className="w-full px-4 py-2.5 rounded-xl glass-input font-mono mb-1"
                    />
                    <p className="text-[10px] text-slate-400">If left blank, VORTEXA will auto-generate a generic UPI deep-link QR.</p>
                  </div>
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-xs transition-colors flex-shrink-0">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          alert("Image must be under 10MB");
                          return;
                        }
                        setMsg("Compressing image...");
                        const img = new Image();
                        const objectUrl = URL.createObjectURL(file);
                        img.onload = () => {
                          URL.revokeObjectURL(objectUrl);
                          const MAX = 600; // QR codes don't need to be large
                          let w = img.width, h = img.height;
                          if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                          if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
                          const canvas = document.createElement("canvas");
                          canvas.width = w; canvas.height = h;
                          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                          const compressed = canvas.toDataURL("image/jpeg", 0.85);
                          setUpiQrUrl(compressed);
                          setMsg("Image ready! Click Save to apply.");
                        };
                        img.onerror = () => alert("Failed to load image");
                        img.src = objectUrl;
                      }}
                    />
                  </label>

                </div>
                {upiQrUrl && (
                  <div className="mt-3 p-2 border border-white/10 rounded-lg inline-block bg-black/20">
                    <img src={upiQrUrl} alt="QR Preview" className="h-24 w-24 object-contain rounded" />
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Official Event Venue Address *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Support Email *</label>
                <input
                  type="email"
                  required
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-4 rounded-xl gradient-btn font-bold text-xs text-white shadow-glow flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Saving Configuration..." : "Save Event Configuration"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
