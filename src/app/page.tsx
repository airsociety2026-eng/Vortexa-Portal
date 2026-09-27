import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, ShieldCheck, Users, CreditCard, QrCode, Zap, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#111111]">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-6">
            01 / Hackathon
          </p>
          <div className="border-t border-[#DCDCDC] mb-8" />

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-[#111111] mb-8 leading-none" style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, letterSpacing: "-0.04em" }}>
            VORTEXA<br />
            2026
          </h1>

          <p className="text-2xl sm:text-3xl font-semibold text-[#262626] mb-3 tracking-tight" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
            BUILD.<br />BREAK.<br />REIMAGINE.
          </p>

          <p className="text-sm text-[#737373] mb-2 mt-6 uppercase tracking-widest font-medium">
            12-HOUR HACKATHON · DIT PIMPRI · PUNE
          </p>

          <div className="border-t border-[#EAEAEA] my-8" />

          <p className="text-base text-[#4B4B4B] max-w-xl leading-relaxed mb-10">
            A serious technology event platform for team registration, payment verification, QR check-in, project submission, multi-criteria judging, and digital certificates.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] transition-colors"
            >
              Register Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#111111] text-sm font-semibold rounded-md border border-[#DCDCDC] hover:bg-[#F1F1EF] transition-colors"
            >
              Sign In to Dashboard
            </Link>
            <Link
              href="/verify/check"
              className="inline-flex items-center gap-2 px-6 py-3 text-[#737373] text-sm font-medium rounded-md hover:text-[#111111] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Stages */}
      <section className="bg-white border-y border-[#EAEAEA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-3">02 / Platform</p>
            <div className="border-t border-[#EAEAEA] mb-6" />
            <h2 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
              End-to-End Architecture
            </h2>
            <p className="text-sm text-[#737373] mt-2 max-w-lg">
              Every stage of the hackathon connected by human-readable Team IDs (e.g. VTX26-00421).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EAEAEA]">
            {[
              { num: "01", icon: Users, title: "Team Formation & VTX ID", desc: "Create teams of 1–4 members. Share your unique Team Code (e.g. VTX26-00421) for seamless onboarding." },
              { num: "02", icon: CreditCard, title: "Payment Verification", desc: "Pay via official VORTEXA UPI QR, submit UTR number and screenshot. Admin reviews and confirms your team." },
              { num: "03", icon: QrCode, title: "QR Ticket & Check-in", desc: "Verified teams unlock an active digital ticket with QR. Volunteers scan on event day for instant check-in." },
              { num: "04", icon: Zap, title: "Tracks & Submission", desc: "Access problem statements. Submit project title, tech stack, and GitHub repository before the deadline." },
              { num: "05", icon: Trophy, title: "Judge Scoring", desc: "Judges evaluate submissions across weighted criteria: Innovation, Technical Execution, Impact, and Pitch." },
              { num: "06", icon: ShieldCheck, title: "Results & Certificates", desc: "Admin publishes rankings and awards. PDF certificates with tamper-proof verification codes issued digitally." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.num} className="bg-white p-7 hover:bg-[#F7F7F5] transition-colors">
                  <div className="flex items-start gap-5">
                    <div>
                      <span className="text-[10px] font-semibold text-[#DCDCDC]">{item.num}</span>
                      <Icon className="w-5 h-5 text-[#1D4ED8] mt-2" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#111111] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#737373] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
