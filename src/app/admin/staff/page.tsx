"use client";

import { useEffect, useState } from "react";
import { Shield, UserPlus, Users, Power, PowerOff } from "lucide-react";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "VOLUNTEER"
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    setLoading(true);
    fetch("/api/admin/staff")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStaffList(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        setFormData({ name: "", email: "", password: "", role: "VOLUNTEER" });
        fetchStaff();
      } else {
        setErrorMsg(data.error?.message || "Failed to create staff");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this account?`)) return;

    setMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_active: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchStaff();
      } else {
        setErrorMsg(data.error?.message || "Failed to update status");
      }
    } catch (err) {
      setErrorMsg("Network error.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span>Staff & Roles Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create and manage Admins, Judges, and Volunteers.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyan-400" />
            Create Staff Account
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-input"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-input"
                placeholder="staff@vortexa.io"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Temporary Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-input"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Role</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-input"
              >
                <option value="VOLUNTEER">VOLUNTEER</option>
                <option value="JUDGE">JUDGE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 rounded-xl gradient-btn font-bold text-xs text-white shadow-glow"
            >
              {creating ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Active Staff Directory
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/5 uppercase text-[10px] text-slate-500">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">No staff found.</td>
                  </tr>
                ) : (
                  staffList.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-white">{user.name}</td>
                      <td className="p-3 font-mono text-[10px] text-cyan-400">{user.email}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px]">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.is_active ? (
                          <span className="text-emerald-400 font-bold">Active</span>
                        ) : (
                          <span className="text-red-400 font-bold">Deactivated</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          className={`px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 ml-auto ${
                            user.is_active
                              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          } transition-colors`}
                        >
                          {user.is_active ? (
                            <>
                              <PowerOff className="w-3 h-3" /> Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="w-3 h-3" /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
