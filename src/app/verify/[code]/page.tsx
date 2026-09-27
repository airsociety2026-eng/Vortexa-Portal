"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Award, CheckCircle2, XCircle, Building2, Calendar, Users, FileText } from "lucide-react";

export default function CertificateVerificationResult() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (code) {
      fetch(`/api/certificates/verify/${code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setCert(data.data);
          } else {
            setError(data.error?.message || "Certificate not found");
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to connect to verification server");
          setLoading(false);
        });
    }
  }, [code]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl glass-card p-8 rounded-2xl border border-white/10 shadow-glass">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs text-slate-400">Verifying Certificate Code: {code}...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Invalid Certificate Code</h2>
              <p className="text-xs text-red-400 max-w-md mx-auto">{error}</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                      ✓ OFFICIAL VERIFIED CERTIFICATE
                    </span>
                    <h1 className="text-xl font-extrabold text-white">VORTEXA 2026 Certificate</h1>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  {cert.certificateType}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-8">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Award className="w-4 h-4 text-cyan-400" /> Recipient Name
                  </span>
                  <p className="text-base font-bold text-white">{cert.participantName}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Building2 className="w-4 h-4 text-purple-400" /> College / Institution
                  </span>
                  <p className="text-sm font-semibold text-slate-200">{cert.college}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Users className="w-4 h-4 text-amber-400" /> Team Name & Code
                  </span>
                  <p className="text-sm font-bold text-white">
                    {cert.teamName} <span className="font-mono text-xs text-cyan-400">({cert.teamCode})</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-4 h-4 text-emerald-400" /> Date of Issue
                  </span>
                  <p className="text-sm font-mono text-slate-200">{new Date(cert.issueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-slate-300">ID: {cert.certificateCode}</span>
                </div>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Authenticated
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
