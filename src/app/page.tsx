import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, ShieldCheck, Users, CreditCard, QrCode, Zap, Trophy, MapPin, Calendar, Clock, Laptop, Wallet } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#111111]">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-6">
            Organized by AIRS · DIT Pimpri
          </p>
          <div className="border-t border-[#DCDCDC] mb-8" />

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-[#111111] mb-8 leading-none" style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, letterSpacing: "-0.04em" }}>
            VORTEXA 3.0<br />
            12-HOUR HACKATHON
          </h1>

          <p className="text-2xl sm:text-3xl font-semibold text-[#262626] mb-3 tracking-tight" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
            Build. Innovate. Solve.
          </p>

          <p className="text-sm text-[#737373] mb-2 mt-6 uppercase tracking-widest font-medium">
            11–12 OCTOBER 2026 · PUNE, MAHARASHTRA
          </p>

          <div className="border-t border-[#EAEAEA] my-8" />

          <p className="text-base text-[#4B4B4B] max-w-xl leading-relaxed mb-10">
            A 12-hour offline hackathon bringing together students, developers, innovators, and problem-solvers to build technology-driven solutions to real-world challenges.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] transition-colors"
            >
              Complete Official Registration
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#111111] text-sm font-semibold rounded-md border border-[#DCDCDC] hover:bg-[#F1F1EF] transition-colors"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="bg-white border-y border-[#EAEAEA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-3">Event Overview</p>
            <div className="border-t border-[#EAEAEA] mb-6" />
            <h2 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
              Quick Facts
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EAEAEA]">
            {[
              { icon: Calendar, title: "Dates", desc: "11 Oct: 12-Hour Hackathon\n12 Oct: Evaluation & Results" },
              { icon: MapPin, title: "Venue", desc: "Dr. D. Y. Patil Institute of Technology\nPimpri, Pune, Maharashtra (Offline)" },
              { icon: Users, title: "Team Size", desc: "2 to 4 members per team.\nOne designated Team Leader." },
              { icon: Wallet, title: "Registration Fee", desc: "₹625 per team.\nTotal fee regardless of team size." },
              { icon: Trophy, title: "Prize Pool", desc: "Up to ₹75,000*\nPlus certificates for eligible participants." },
              { icon: Clock, title: "Shortlisting", desc: "No elimination round.\nDirect participation for verified teams." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white p-7 hover:bg-[#F7F7F5] transition-colors">
                  <div className="flex items-start gap-5">
                    <div>
                      <Icon className="w-5 h-5 text-[#1D4ED8]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#111111] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#737373] leading-relaxed whitespace-pre-line">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-3">Timeline</p>
            <div className="border-t border-[#DCDCDC] mb-6" />
            <h2 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
              Event Schedule
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#EAEAEA] rounded-md p-6">
              <div className="inline-block px-3 py-1 bg-[#111111] text-white text-xs font-semibold rounded mb-4">
                DAY 1: 11 OCTOBER 2026
              </div>
              <h3 className="text-lg font-bold mb-2">12-Hour Hackathon</h3>
              <p className="text-sm text-[#737373] mb-6">9:00 AM – 9:00 PM</p>
              
              <ul className="space-y-4 text-sm text-[#4B4B4B]">
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">1</span> Report at venue & QR Check-in</li>
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">2</span> Problem Statements Revealed</li>
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">3</span> 12-Hour Development Phase (Lunch provided)</li>
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">4</span> Project Submission</li>
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">5</span> 9:00 PM: Hackathon Ends. Participants leave venue.</li>
              </ul>
              
              <div className="mt-6 p-3 bg-[#FEF3F2] border border-[#FECACA] rounded-md text-xs text-[#B42318]">
                <strong>Important:</strong> No accommodation or overnight stay is provided. You must arrange your own stay and travel.
              </div>
            </div>

            <div className="bg-white border border-[#EAEAEA] rounded-md p-6">
              <div className="inline-block px-3 py-1 bg-[#111111] text-white text-xs font-semibold rounded mb-4">
                DAY 2: 12 OCTOBER 2026
              </div>
              <h3 className="text-lg font-bold mb-2">Evaluation & Results</h3>
              <p className="text-sm text-[#737373] mb-6">Participants return to venue</p>
              
              <ul className="space-y-4 text-sm text-[#4B4B4B]">
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">1</span> Project Presentations</li>
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">2</span> Live Demonstrations</li>
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">3</span> Judge Interaction & Evaluation</li>
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">4</span> Final Results</li>
                <li className="flex gap-3"><span className="text-[#1D4ED8] font-bold">5</span> Prize Distribution</li>
              </ul>

              <div className="mt-6 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-md text-xs text-[#1D4ED8]">
                <strong>Evaluation Criteria:</strong> Innovation, Technical Implementation, Impact, Feasibility, UX, and Presentation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Process */}
      <section className="bg-white border-y border-[#EAEAEA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-3">Registration</p>
            <div className="border-t border-[#EAEAEA] mb-6" />
            <h2 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
              Official Registration Flow
            </h2>
            <p className="text-sm text-[#737373] mt-2 max-w-lg">
              Participants who initially registered through Unstop must complete the official VORTEXA registration process through this portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EAEAEA]">
            {[
              { num: "01", icon: Users, title: "Profile & Team Creation", desc: "Create your participant profile. Team leader creates the team (2-4 members) and members join using the Team ID." },
              { num: "02", icon: CreditCard, title: "₹625 Payment & Proof", desc: "Team leader pays the ₹625 team fee via the provided method and submits the UTR Number and Screenshot on the portal." },
              { num: "03", icon: ShieldCheck, title: "Admin Verification", desc: "Our organizing team manually verifies the UTR/Transaction ID and payment screenshot." },
              { num: "04", icon: QrCode, title: "Ticket Generation", desc: "Upon verification, a digital ticket with a unique QR code is generated and emailed to the Team Leader." },
              { num: "05", icon: Zap, title: "Event Day Check-in", desc: "Report to the venue on 11 Oct. Volunteers will scan your QR code ticket for instant check-in." },
              { num: "06", icon: Laptop, title: "Project Submission", desc: "Submit your final project details, code repository, and deployment links through the portal before 9:00 PM." },
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

          <div className="mt-12 flex justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#111111] text-white text-sm font-semibold rounded-md hover:bg-black transition-colors shadow-sm"
            >
              Start Official Registration
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
