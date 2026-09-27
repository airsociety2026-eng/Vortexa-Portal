"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Building, MapPin, Users, CheckCircle2, Clock } from "lucide-react";

export default function RoomPage() {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/teams/my-team")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTeamData(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const team = teamData?.team;
  const allocation = team?.room_allocation;
  const room = allocation?.room;

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-cyan-400" />
            <span>Your Allocated Room & Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time venue room assignment assigned by event organizers upon check-in.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center glass-card rounded-2xl">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading room assignment...</p>
          </div>
        ) : !room ? (
          <div className="glass-card p-8 rounded-2xl border border-white/10 text-center py-12">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Room Allocated Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Your room will be allocated by the desk volunteers upon payment verification and event arrival check-in.
            </p>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl border border-cyan-500/30 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">YOUR WORKSPACE</span>
                <h2 className="text-3xl font-extrabold text-white">{room.room_name}</h2>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> ACTIVE ALLOCATION
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px]">BUILDING / BLOCK</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" /> {room.building}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px]">FLOOR LEVEL</span>
                <span className="text-sm font-bold text-white">{room.floor}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px]">LAB CAPACITY</span>
                <span className="text-sm font-bold text-white">{room.capacity} Teams</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-300">
              <span className="font-bold text-white block mb-1">Room Description & Utilities:</span>
              <p className="text-slate-400">{room.description || "Gigabit LAN network ports, high-power sockets, and whiteboards available."}</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
