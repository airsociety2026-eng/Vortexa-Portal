"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, QrCode } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Statistical breakdown of hackathon registrations, revenue distribution, check-in conversion, and submissions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Computing analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Conversion Metrics</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Payment Verification Rate</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {stats?.totalTeams > 0
                    ? Math.round((stats.verifiedPayments / stats.totalTeams) * 100)
                    : 0}
                  %
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Event Day Attendance Rate</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {stats?.confirmedTeams > 0
                    ? Math.round((stats.checkedInTeams / stats.confirmedTeams) * 100)
                    : 0}
                  %
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Project Submission Completion</span>
                <span className="font-mono font-bold text-purple-400 text-sm">
                  {stats?.checkedInTeams > 0
                    ? Math.round((stats.totalSubmissions / stats.checkedInTeams) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Financial Overview</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Total Revenue Collected</span>
                <span className="font-mono font-bold text-emerald-400 text-base">₹{stats?.totalRevenue || 0}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Verified Transactions</span>
                <span className="font-mono font-bold text-white text-sm">{stats?.verifiedPayments || 0}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Pending Review Transactions</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{stats?.pendingPayments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
