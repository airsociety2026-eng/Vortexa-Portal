"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "",
    college: "", course: "",
    year: "3rd Year", rollNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Registration failed");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const fields = [
    { name: "name",       label: "Full Name",              type: "text",     required: true,  placeholder: "Kunal Adhar" },
    { name: "email",      label: "Email Address",          type: "email",    required: true,  placeholder: "kunal@college.edu" },
    { name: "password",   label: "Password",               type: "password", required: true,  placeholder: "At least 6 characters" },
    { name: "phone",      label: "Phone Number",           type: "tel",      required: true,  placeholder: "+91 98765 43210" },
    { name: "college",    label: "College / Institute",    type: "text",     required: true,  placeholder: "PICT College of Engineering", colSpan: true },
    { name: "course",     label: "Degree / Course",        type: "text",     required: true,  placeholder: "B.Tech Computer Engineering" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-3">Participant Registration</p>
            <div className="border-t border-[#DCDCDC] mb-5" />
            <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
              Create Account
            </h1>
            <p className="text-sm text-[#737373] mt-1">
              Register your participant profile to form or join a team of 2–4 members.
            </p>
          </div>

          <div className="bg-white border border-[#EAEAEA] rounded-lg p-7">
            {error && (
              <div className="mb-6 px-4 py-3 bg-[#FEF3F2] border border-[#FECACA] rounded-md text-xs font-medium text-[#B42318]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-0">
              {/* Personal Details */}
              <div className="mb-6">
                <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-4">Personal Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.slice(0, 4).map((f) => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold text-[#262626] mb-1.5">
                        {f.label} {f.required && <span className="text-[#B42318]">*</span>}
                      </label>
                      <input
                        type={f.type}
                        name={f.name}
                        required={f.required}
                        value={(formData as any)[f.name]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 glass-input text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#EAEAEA] mb-6" />

              {/* Academic Details */}
              <div className="mb-6">
                <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-4">Academic Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#262626] mb-1.5">
                      College / Institute <span className="text-[#B42318]">*</span>
                    </label>
                    <input
                      type="text"
                      name="college"
                      required
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="PICT College of Engineering"
                      className="w-full px-3 py-2.5 glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1.5">
                      Degree / Course <span className="text-[#B42318]">*</span>
                    </label>
                    <input
                      type="text"
                      name="course"
                      required
                      value={formData.course}
                      onChange={handleChange}
                      placeholder="B.Tech Computer Engineering"
                      className="w-full px-3 py-2.5 glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1.5">
                      Academic Year <span className="text-[#B42318]">*</span>
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 glass-input text-sm appearance-none"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                </div>
              </div>

              <div className="border-t border-[#EAEAEA] mb-6" />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1D4ED8] text-white text-sm font-semibold rounded-md hover:bg-[#1E40AF] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Creating Account..." : "Create Account & Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-[#737373]">
            Already registered?{" "}
            <Link href="/login" className="text-[#1D4ED8] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
