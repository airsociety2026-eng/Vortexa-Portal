"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, Send } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"NORMAL" | "IMPORTANT" | "URGENT">("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchAnn = () => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAnnouncements(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnn();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, priority }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        setTitle("");
        setMessage("");
        fetchAnn();
      } else {
        alert(data.error?.message || "Failed to publish");
      }
    } catch (err) {
      alert("Error publishing announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            <span>Announcements Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast event updates, WiFi keys, and urgent schedule changes to participants.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Publish Announcement</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🚀 Welcome to VORTEXA 2026"
                className="w-full px-3 py-2 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="IMPORTANT">IMPORTANT</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Message Body *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message content here..."
                className="w-full px-3 py-2 rounded-xl glass-input resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl gradient-btn font-bold text-xs text-white shadow-glow flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Publishing..." : "Broadcast Announcement"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm">Published Announcements Stream</h3>

          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center">Loading...</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{a.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      {a.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{a.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {new Date(a.published_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
