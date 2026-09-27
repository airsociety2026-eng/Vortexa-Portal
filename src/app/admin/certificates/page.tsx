"use client";

import { useEffect, useState } from "react";
import { Award, Plus, Download, ShieldCheck } from "lucide-react";

export default function AdminCertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCertificates(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-rose-400" />
            <span>Certificates Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View all issued hackathon digital certificates and tamper-proof verification IDs.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading certificates...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Certificate ID</th>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Team</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Issue Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-cyan-300">{c.certificate_code}</td>
                    <td className="p-4 font-bold text-white">{c.participant?.name}</td>
                    <td className="p-4 text-slate-300">{c.team?.team_name}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {c.certificate_type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{new Date(c.issue_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
