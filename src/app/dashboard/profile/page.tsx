"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: "", phone: "",
    college: "", course: "", department: "",
    year: "", rollNumber: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.participant) {
          const p = data.data.participant;
          setFormData({
            name: p.name || "",
            phone: p.phone || "",
            college: p.college || "",
            course: p.course || "",
            department: p.department || "",
            year: p.year || "",
            rollNumber: p.roll_number || "",
          });
        } else if (!data.success) {
          setError("Failed to load profile data.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || "Failed to update profile");
      } else {
        setSuccess("Profile updated successfully!");
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: "name",       label: "Full Name",              type: "text", required: true },
    { name: "phone",      label: "Phone Number",           type: "tel",  required: true },
    { name: "college",    label: "College / Institute",    type: "text", required: true, colSpan: true },
    { name: "course",     label: "Degree / Course",        type: "text", required: true },
    { name: "department", label: "Department",             type: "text", required: true },
    { name: "year",       label: "Academic Year",          type: "text", required: true },
    { name: "rollNumber", label: "Roll / Student ID",      type: "text", required: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="vx-spinner mx-auto mb-3" />
          <p className="text-xs text-[#737373]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#111111]">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-[#737373] hover:text-[#111111] transition-colors mb-6">
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-2">Participant Profile</p>
          <h1 className="text-2xl font-bold text-[#111111]" style={{ fontFamily: "Manrope, sans-serif", letterSpacing: "-0.02em" }}>
            Edit Details
          </h1>
        </div>

        <div className="bg-white border border-[#EAEAEA] rounded-lg p-7">
          {error && (
            <div className="mb-6 px-4 py-3 bg-[#FEF3F2] border border-[#FECACA] rounded-md text-xs font-medium text-[#B42318]">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 px-4 py-3 bg-[#ECFDF3] border border-[#BBF7D0] rounded-md text-xs font-medium text-[#16803C]">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.name} className={f.colSpan ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-[#262626] mb-1.5">
                    {f.label} {f.required && <span className="text-[#B42318]">*</span>}
                  </label>
                  <input
                    type={f.type}
                    name={f.name}
                    required={f.required}
                    value={(formData as any)[f.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 glass-input text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 mt-6 border-t border-[#EAEAEA] flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
