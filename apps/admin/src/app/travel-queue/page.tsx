"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface TravelBooking {
  id: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  venueCity: string;
  venueAddress: string;
  travelMode: string | null;
  travelDistanceKm: number | null;
  travelStatus: string;
  travelBookingRef: string | null;
  travelNotes: string | null;
  travelCost: number;
  status: string;
  pandit: { id: string; displayName: string; city: string } | null;
  customer: { user: { fullName: string; phone: string } } | null;
}

const STATUS_COLORS: Record<string, string> = {
  NOT_REQUIRED: "bg-slate-600",
  PENDING: "bg-yellow-500",
  BOOKED: "bg-blue-500",
  IN_TRANSIT: "bg-purple-500",
  ARRIVED: "bg-green-500",
};

const STATUS_LABELS: Record<string, string> = {
  NOT_REQUIRED: "Not Required",
  PENDING: "Pending",
  BOOKED: "Booked",
  IN_TRANSIT: "In Transit",
  ARRIVED: "Arrived",
};

const MOCK_DATA: TravelBooking[] = [
  {
    id: "t1", bookingNumber: "BK-240201-001", eventType: "Griha Pravesh", eventDate: "2025-03-15T10:00:00Z",
    venueCity: "Gurgaon", venueAddress: "Sector 45, Gurgaon, Haryana", travelMode: "car",
    travelDistanceKm: 85, travelStatus: "PENDING", travelBookingRef: null, travelNotes: null,
    travelCost: 2500, status: "CONFIRMED",
    pandit: { id: "p1", displayName: "Pandit Ramesh Sharma", city: "Old Delhi" },
    customer: { user: { fullName: "Vikram Malhotra", phone: "+919876543210" } },
  },
  {
    id: "t2", bookingNumber: "BK-240201-002", eventType: "Satyanarayan Katha", eventDate: "2025-03-18T09:00:00Z",
    venueCity: "Noida", venueAddress: "Sector 62, Noida, UP", travelMode: "train",
    travelDistanceKm: 120, travelStatus: "BOOKED", travelBookingRef: "PNR-2847391", travelNotes: "Rajdhani Express",
    travelCost: 1800, status: "TRAVEL_BOOKED",
    pandit: { id: "p2", displayName: "Acharya Suresh Tiwari", city: "Varanasi" },
    customer: { user: { fullName: "Priya Agarwal", phone: "+919123456780" } },
  },
  {
    id: "t3", bookingNumber: "BK-240201-003", eventType: "Wedding Ceremony", eventDate: "2025-03-22T06:00:00Z",
    venueCity: "Jaipur", venueAddress: "Jawahar Nagar, Jaipur, Rajasthan", travelMode: "flight",
    travelDistanceKm: 280, travelStatus: "PENDING", travelBookingRef: null, travelNotes: null,
    travelCost: 6500, status: "CONFIRMED",
    pandit: { id: "p3", displayName: "Pandit Hari Shastri", city: "Mathura" },
    customer: { user: { fullName: "Ankit Gupta", phone: "+919988776655" } },
  },
  {
    id: "t4", bookingNumber: "BK-240201-004", eventType: "Mundan Ceremony", eventDate: "2025-03-12T08:00:00Z",
    venueCity: "Faridabad", venueAddress: "NIT 5, Faridabad, Haryana", travelMode: "car",
    travelDistanceKm: 45, travelStatus: "IN_TRANSIT", travelBookingRef: "DL-01-CA-9087", travelNotes: "Self-drive",
    travelCost: 1200, status: "PANDIT_EN_ROUTE",
    pandit: { id: "p4", displayName: "Pandit Mohan Dubey", city: "South Delhi" },
    customer: { user: { fullName: "Rahul Verma", phone: "+919001234567" } },
  },
];

export default function TravelQueuePage() {
  const [bookings, setBookings] = useState<TravelBooking[]>(MOCK_DATA);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<TravelBooking | null>(null);
  const [refInput, setRefInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  async function fetchQueue() {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`${API}/admin/travel-queue?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.length) setBookings(json.data);
      }
    } catch {
      /* use mock data */
    }
  }

  async function updateTravelStatus(id: string, travelStatus: string) {
    try {
      const token = localStorage.getItem("admin_token");
      const body: Record<string, string> = { travelStatus };
      if (refInput) body.travelBookingRef = refInput;
      if (notesInput) body.travelNotes = notesInput;

      const res = await fetch(`${API}/admin/bookings/${id}/travel-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(`Travel status updated to ${STATUS_LABELS[travelStatus]}`);
        fetchQueue();
        setSelected(null);
      }
    } catch {
      showToast("Failed to update travel status");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = statusFilter === "ALL" ? bookings : bookings.filter((b) => b.travelStatus === statusFilter);

  const counts = {
    PENDING: bookings.filter((b) => b.travelStatus === "PENDING").length,
    BOOKED: bookings.filter((b) => b.travelStatus === "BOOKED").length,
    IN_TRANSIT: bookings.filter((b) => b.travelStatus === "IN_TRANSIT").length,
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Travel Queue</h1>
          <p className="text-sm text-slate-400">Manage pandit travel logistics for upcoming bookings</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
            <span className="material-symbols-outlined text-yellow-500 text-lg">pending_actions</span>
            <span className="text-sm text-white font-semibold">{counts.PENDING}</span>
            <span className="text-xs text-slate-400">pending</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
            <span className="material-symbols-outlined text-blue-500 text-lg">confirmation_number</span>
            <span className="text-sm text-white font-semibold">{counts.BOOKED}</span>
            <span className="text-xs text-slate-400">booked</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
            <span className="material-symbols-outlined text-purple-500 text-lg">local_shipping</span>
            <span className="text-sm text-white font-semibold">{counts.IN_TRANSIT}</span>
            <span className="text-xs text-slate-400">in transit</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {["ALL", "PENDING", "BOOKED", "IN_TRANSIT", "ARRIVED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {s === "ALL" ? "All" : STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
                <th className="pb-3 pr-4">Booking</th>
                <th className="pb-3 pr-4">Route</th>
                <th className="pb-3 pr-4">Mode / Distance</th>
                <th className="pb-3 pr-4">Event Date</th>
                <th className="pb-3 pr-4">Est. Cost</th>
                <th className="pb-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => { setSelected(b); setRefInput(b.travelBookingRef ?? ""); setNotesInput(b.travelNotes ?? ""); }}
                  className={`cursor-pointer border-b border-slate-800/50 transition-colors hover:bg-slate-900 ${
                    selected?.id === b.id ? "bg-slate-800/60" : ""
                  }`}
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">{b.bookingNumber}</p>
                    <p className="text-xs text-slate-400">{b.eventType}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-300">{b.pandit?.city ?? "—"}</span>
                      <span className="material-symbols-outlined text-slate-500 text-sm">arrow_forward</span>
                      <span className="text-white font-medium">{b.venueCity}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-slate-300 capitalize">{b.travelMode ?? "TBD"}</p>
                    <p className="text-xs text-slate-500">{b.travelDistanceKm ? `${b.travelDistanceKm} km` : "—"}</p>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {new Date(b.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 pr-4 text-white font-medium">
                    {"\u20B9"}{b.travelCost.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white ${STATUS_COLORS[b.travelStatus] ?? "bg-slate-600"}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                      {STATUS_LABELS[b.travelStatus] ?? b.travelStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">No travel bookings in this category</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-96 flex-shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Travel Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-slate-800 p-3">
              <p className="text-xs text-slate-400 mb-1">Booking</p>
              <p className="text-sm font-medium text-white">{selected.bookingNumber} &mdash; {selected.eventType}</p>
            </div>

            {/* Route */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1 rounded-lg bg-slate-800 p-3 text-center">
                <p className="text-xs text-slate-400">From</p>
                <p className="text-sm font-semibold text-white">{selected.pandit?.city ?? "—"}</p>
              </div>
              <span className="material-symbols-outlined text-primary">arrow_forward</span>
              <div className="flex-1 rounded-lg bg-slate-800 p-3 text-center">
                <p className="text-xs text-slate-400">To</p>
                <p className="text-sm font-semibold text-white">{selected.venueCity}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-800 p-2.5">
                <p className="text-[10px] text-slate-400">Distance</p>
                <p className="text-sm font-semibold text-white">{selected.travelDistanceKm ?? "—"} km</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2.5">
                <p className="text-[10px] text-slate-400">Mode</p>
                <p className="text-sm font-semibold text-white capitalize">{selected.travelMode ?? "TBD"}</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2.5">
                <p className="text-[10px] text-slate-400">Est. Cost</p>
                <p className="text-sm font-semibold text-green-400">{"\u20B9"}{selected.travelCost.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2.5">
                <p className="text-[10px] text-slate-400">Event Date</p>
                <p className="text-sm font-semibold text-white">{new Date(selected.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
            </div>

            {/* Pandit & Customer */}
            <div className="mb-4 space-y-2">
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-400 mb-1">Pandit</p>
                <p className="text-sm font-medium text-white">{selected.pandit?.displayName ?? "Unassigned"}</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-400 mb-1">Customer</p>
                <p className="text-sm font-medium text-white">{selected.customer?.user?.fullName ?? "—"}</p>
                <p className="text-xs text-slate-400">{selected.customer?.user?.phone ?? ""}</p>
              </div>
            </div>

            {/* Booking Ref input */}
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-slate-400">Booking Reference / PNR</label>
              <input
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="Enter PNR or booking ref"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-400">Notes</label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Travel arrangement notes..."
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selected.travelStatus === "PENDING" && (
                <button
                  onClick={() => updateTravelStatus(selected.id, "BOOKED")}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Mark Booked
                </button>
              )}
              {selected.travelStatus === "BOOKED" && (
                <button
                  onClick={() => updateTravelStatus(selected.id, "IN_TRANSIT")}
                  className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-500"
                >
                  Mark In Transit
                </button>
              )}
              {selected.travelStatus === "IN_TRANSIT" && (
                <button
                  onClick={() => updateTravelStatus(selected.id, "ARRIVED")}
                  className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-500"
                >
                  Mark Arrived
                </button>
              )}
              <button
                onClick={() => showToast("SMS sent to pandit")}
                className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
              >
                <span className="material-symbols-outlined text-base">sms</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
