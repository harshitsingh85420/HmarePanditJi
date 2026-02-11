"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING";
type ActiveTab = "upcoming" | "completed" | "cancelled";

interface Booking {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  eventDate: string;
  ritual?: { name: string };
  venueAddress?: { line1?: string; city?: string; state?: string; pincode?: string };
  pricing?: { total?: number };
  customer?: { user?: { fullName?: string; phone?: string } };
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk1",
    bookingNumber: "HPJ-001",
    status: "CONFIRMED",
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    ritual: { name: "Satyanarayan Puja" },
    venueAddress: { line1: "A-42, Sector 62", city: "Noida", state: "UP", pincode: "201301" },
    pricing: { total: 11000 },
    customer: { user: { fullName: "Rajesh Kumar Ji", phone: "+919876543210" } },
  },
  {
    id: "bk2",
    bookingNumber: "HPJ-002",
    status: "CONFIRMED",
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ritual: { name: "Griha Pravesh" },
    venueAddress: { line1: "C-15, Sector 4", city: "Indirapuram", state: "UP", pincode: "201014" },
    pricing: { total: 21000 },
    customer: { user: { fullName: "Sunita Sharma Ji", phone: "+919812345678" } },
  },
  {
    id: "bk3",
    bookingNumber: "HPJ-003",
    status: "COMPLETED",
    eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ritual: { name: "Vivah Puja" },
    venueAddress: { city: "Varanasi", state: "UP", pincode: "221001" },
    pricing: { total: 52750 },
    customer: { user: { fullName: "Amit Singh Ji", phone: "+919845678901" } },
  },
  {
    id: "bk4",
    bookingNumber: "HPJ-004",
    status: "COMPLETED",
    eventDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    ritual: { name: "Namkaran Puja" },
    venueAddress: { city: "Delhi", state: "DL", pincode: "110001" },
    pricing: { total: 8500 },
    customer: { user: { fullName: "Priya Gupta Ji", phone: "+919867890123" } },
  },
  {
    id: "bk5",
    bookingNumber: "HPJ-005",
    status: "CANCELLED",
    eventDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ritual: { name: "Mundan Puja" },
    venueAddress: { city: "Gurgaon", state: "HR", pincode: "122001" },
    pricing: { total: 7000 },
    customer: { user: { fullName: "Deepak Verma Ji", phone: "+919823456789" } },
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtAmt(n?: number) {
  return (n ?? 0).toLocaleString("en-IN");
}
function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
function isPastOrToday(iso: string) {
  return new Date(iso) <= new Date(new Date().setHours(23, 59, 59, 999));
}
function mapsUrl(b: Booking) {
  const a = b.venueAddress;
  const q = [a?.line1, a?.city, a?.state, a?.pincode].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/bookings/mine`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.data?.bookings ?? data.bookings ?? MOCK_BOOKINGS);
        } else {
          setBookings(MOCK_BOOKINGS);
        }
      } catch {
        setBookings(MOCK_BOOKINGS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = bookings.filter((b) => {
    if (activeTab === "upcoming") return b.status === "CONFIRMED" || b.status === "PENDING";
    if (activeTab === "completed") return b.status === "COMPLETED";
    return b.status === "CANCELLED";
  });

  const handleMarkComplete = async (id: string) => {
    setCompleting(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "COMPLETED" } : b))
        );
        setCompletedIds((prev) => new Set(prev).add(id));
      }
    } catch {
      // silently fail — mock mode
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "COMPLETED" } : b))
      );
      setCompletedIds((prev) => new Set(prev).add(id));
    } finally {
      setCompleting(false);
      setConfirmId(null);
    }
  };

  const tabs: { key: ActiveTab; label: string; count: number }[] = [
    {
      key: "upcoming",
      label: "Upcoming",
      count: bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: bookings.filter((b) => b.status === "COMPLETED").length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: bookings.filter((b) => b.status === "CANCELLED").length,
    },
  ];

  const borderColor: Record<ActiveTab, string> = {
    upcoming: "border-primary",
    completed: "border-green-500",
    cancelled: "border-red-400",
  };

  const badgeColor: Record<BookingStatus, string> = {
    CONFIRMED: "bg-primary/10 text-primary",
    PENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  const badgeLabel: Record<BookingStatus, string> = {
    CONFIRMED: "Upcoming",
    PENDING: "Pending",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const confirmBooking = bookings.find((b) => b.id === confirmId);

  return (
    <div className="py-8 space-y-6">
      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[32px] font-bold text-slate-900 leading-tight">My Bookings</h1>
        <p className="mt-1 text-base text-slate-500">Aapke saare booking records</p>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 shadow-sm w-full sm:w-auto sm:inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                activeTab === tab.key ? "bg-white/30 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Booking Cards ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border animate-pulse h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-100 flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-slate-300 text-[64px]">event_busy</span>
          <p className="text-base font-medium text-slate-500">
            {activeTab === "upcoming"
              ? "Koi upcoming booking nahi hai"
              : activeTab === "completed"
              ? "Koi completed booking nahi hai"
              : "Koi cancelled booking nahi hai"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((b) => {
            const canComplete =
              b.status === "CONFIRMED" && isPastOrToday(b.eventDate) && !completedIds.has(b.id);

            return (
              <div
                key={b.id}
                className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 border-l-4 ${
                  borderColor[activeTab]
                }`}
              >
                {/* Top row: badge + booking number */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                      badgeColor[b.status]
                    }`}
                  >
                    {badgeLabel[b.status]}
                  </span>
                  <span className="text-xs font-mono text-slate-400">#{b.bookingNumber}</span>
                </div>

                {/* Ceremony + Date */}
                <div className="mb-3">
                  <p className="text-lg font-bold text-slate-900 leading-tight">
                    {b.ritual?.name ?? "Puja Ceremony"}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-base leading-none">
                      calendar_today
                    </span>
                    <span>{formatDate(b.eventDate)}</span>
                    {isToday(b.eventDate) && (
                      <span className="ml-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer info */}
                <div className="flex items-center gap-4 flex-wrap mb-3">
                  <a
                    href={`tel:${b.customer?.user?.phone}`}
                    className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-base leading-none">person</span>
                    <span className="font-medium">{b.customer?.user?.fullName ?? "Customer"}</span>
                  </a>
                  <a
                    href={`tel:${b.customer?.user?.phone}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-base leading-none">call</span>
                    <span>{b.customer?.user?.phone ?? "—"}</span>
                  </a>
                </div>

                {/* Address */}
                {b.venueAddress && (
                  <a
                    href={mapsUrl(b)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-3"
                  >
                    <span className="material-symbols-outlined text-base leading-none mt-0.5">
                      location_on
                    </span>
                    <span className="underline underline-offset-2">
                      {[b.venueAddress.line1, b.venueAddress.city, b.venueAddress.state, b.venueAddress.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </a>
                )}

                {/* Bottom row: Amount + Action */}
                <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base leading-none">
                      payments
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      ₹{fmtAmt(b.pricing?.total)}
                    </span>
                  </div>

                  {canComplete && (
                    <button
                      onClick={() => setConfirmId(b.id)}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg px-4 py-2.5 min-h-[44px] transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base leading-none">
                        task_alt
                      </span>
                      पूजा संपन्न
                    </button>
                  )}

                  {completedIds.has(b.id) && b.status === "COMPLETED" && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                      <span className="material-symbols-outlined text-base leading-none">
                        check_circle
                      </span>
                      Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Mark Complete Confirmation Dialog ────────────────────────────── */}
      {confirmId && confirmBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span
                className="material-symbols-outlined text-green-600 text-[36px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                task_alt
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-1">
              Puja Sampann Karein?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-1">
              <strong>{confirmBooking.ritual?.name ?? "Puja"}</strong> ko completed mark karein.
            </p>
            <p className="text-xs text-slate-400 text-center mb-6">
              Customer ko review reminder SMS bheja jaayega.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold rounded-xl py-3 hover:border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkComplete(confirmId)}
                disabled={completing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
              >
                {completing ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-base leading-none">check</span>
                )}
                Haan, Sampann Karo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
