"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Search, ArrowRight, Award } from "lucide-react";

export default function VerifyCheckPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) router.push(`/verify/${code.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-6 h-6 text-[#16803C]" />
            </div>
            <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-3">Verification</p>
            <div className="border-t border-[#DCDCDC] mb-5" />
            <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
              Certificate Verification
            </h1>
            <p className="text-sm text-[#737373] mt-2 max-w-sm mx-auto">
              Enter the unique Certificate ID to verify authenticity of a VORTEXA hackathon certificate.
            </p>
          </div>

          <div className="bg-white border border-[#EAEAEA] rounded-md p-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#262626] mb-1.5">Certificate ID</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VTX-CERT-XXXXX"
                    className="w-full pl-9 pr-4 py-2.5 glass-input text-sm font-mono uppercase"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] transition-colors flex items-center justify-center gap-2"
              >
                Verify Certificate <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#EAEAEA] flex items-center gap-2 text-xs text-[#737373]">
              <Award className="w-4 h-4 text-[#1D4ED8]" />
              <span>Certificates are cryptographically issued by the VORTEXA Platform Engine.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
