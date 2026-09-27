"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Award, Download, ShieldCheck, ExternalLink, Clock } from "lucide-react";

export default function CertificatePage() {
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
    <div className="min-h-screen flex flex-col bg-[#090d16] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-cyan-400" />
            <span>Issued Certificates & Verification</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Download your official digital hackathon certificates with tamper-proof public verification IDs.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center glass-card rounded-2xl">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading certificates...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl border border-white/10 text-center py-12">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Certificates Issued Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Certificates will be generated automatically upon completion of the event judging and result publication.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="glass-card p-6 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                      {cert.certificate_type} CERTIFICATE
                    </span>
                    <h3 className="text-lg font-bold text-white">{cert.participant?.name || "Participant"}</h3>
                    <p className="text-xs text-slate-400">
                      Team: {cert.team?.team_name} ({cert.team?.team_code}) | Event: {cert.event_name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Link
                    href={`/verify/${cert.certificate_code}`}
                    target="_blank"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Verify Link</span>
                  </Link>

                  <a
                    href={`/verify/${cert.certificate_code}`}
                    target="_blank"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl gradient-btn text-xs font-bold shadow-glow flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
