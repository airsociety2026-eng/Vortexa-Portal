"use client";

import { useEffect, useState } from "react";
import { Building, Plus, Users, ArrowRight } from "lucide-react";

export default function AdminRoomsPage() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  const [roomName, setRoomName] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("1st Floor");
  const [capacity, setCapacity] = useState(4);
  const [description, setDescription] = useState("");

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = () => {
    Promise.all([
      fetch("/api/rooms").then((r) => r.json()),
      fetch("/api/teams/all").then((r) => r.json()),
    ])
      .then(([rData, tData]) => {
        if (rData.success) setRooms(rData.data || []);
        if (tData.success) setTeams(tData.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          building,
          floor,
          capacity: Number(capacity),
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setRoomName("");
        setBuilding("");
        setDescription("");
        fetchData();
      } else {
        alert(data.error?.message || "Failed to create room");
      }
    } catch (err) {
      alert("Error creating room");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !selectedRoomId) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/rooms/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeamId,
          roomId: selectedRoomId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setSelectedTeamId("");
        setSelectedRoomId("");
        fetchData();
      } else {
        alert(data.error?.message || "Failed to allocate room");
      }
    } catch (err) {
      alert("Error allocating room");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-cyan-400" />
            <span>Room & Venue Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create venue rooms, monitor capacities, and assign teams to specific labs/rooms.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Room Form */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create New Room</span>
          </h3>

          <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Room Name / Number *</label>
              <input
                type="text"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. A-101"
                className="w-full px-3 py-2 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Building Block *</label>
              <input
                type="text"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Main Tech Block"
                className="w-full px-3 py-2 rounded-xl glass-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Floor Level</label>
                <input
                  type="text"
                  required
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Max Capacity (Teams)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Description / Equipment</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Air-Conditioned, Ethernet, Power"
                className="w-full px-3 py-2 rounded-xl glass-input resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl gradient-btn font-bold text-xs text-white shadow-glow"
            >
              {submitting ? "Creating..." : "Create Room"}
            </button>
          </form>
        </div>

        {/* Allocate Team to Room Box */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Allocate Team → Room</span>
          </h3>

          <form onSubmit={handleAllocate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Team *</label>
              <select
                required
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs"
              >
                <option value="">Select Team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.team_name} ({t.team_code}) — {t.room_allocation ? `Assigned (${t.room_allocation.room.room_name})` : "Unassigned"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Room *</label>
              <select
                required
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs"
              >
                <option value="">Select Room...</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_name} ({r.building}) — Occupancy: {r.allocations?.length || 0}/{r.capacity} teams
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-glow-purple flex items-center justify-center gap-1.5"
            >
              {submitting ? "Assigning..." : "Assign Team to Room"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Existing Rooms Cards */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm">Venue Rooms Roster</h3>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {rooms.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{r.room_name}</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {r.allocations?.length || 0} / {r.capacity} Teams
                  </span>
                </div>
                <p className="text-slate-400">
                  {r.building} ({r.floor})
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
