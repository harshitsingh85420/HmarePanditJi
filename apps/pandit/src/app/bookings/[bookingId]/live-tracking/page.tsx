"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

function getToken() {
  return (
    localStorage.getItem("hpj_pandit_token") ||
    localStorage.getItem("hpj_pandit_access_token") ||
    localStorage.getItem("token")
  );
}

type BookingStatus =
  | "CONFIRMED" | "TRAVEL_BOOKED" | "PANDIT_EN_ROUTE" | "PANDIT_ARRIVED_HOTEL"
  | "PANDIT_ARRIVED" | "PUJA_IN_PROGRESS" | "COMPLETED" | "RETURN_IN_PROGRESS";

interface BookingSummary {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  eventType: string;
  eventDate: string;
  venueCity: string;
  customer: { name?: string | null; phone?: string | null };
  isOutstation?: boolean;
  foodAllowanceAmount?: number;
  travelDays?: number;
  pujaDaysWithAllowance?: number;
  documents?: { type: string; label: string; url: string }[];
}

const ALL_STEPS = [
  { id: "start-journey", label: "Yatra Shuru Karein", subLabel: "Journey start karo", icon: "directions_car", endpoint: "start-journey", requiredStatuses: ["CONFIRMED", "TRAVEL_BOOKED"] as string[], nextStatus: "PANDIT_EN_ROUTE", outstation: false },
  { id: "reached-hotel", label: "Hotel Pahuncha", subLabel: "Hotel check-in ho gaya", icon: "hotel", endpoint: "reached-hotel", requiredStatuses: ["PANDIT_EN_ROUTE"] as string[], nextStatus: "PANDIT_ARRIVED_HOTEL", outstation: true },
  { id: "arrived", label: "Venue Pahuncha", subLabel: "Main aa gaya/aayi 🙏", icon: "where_to_vote", endpoint: "arrived", requiredStatuses: ["PANDIT_ARRIVED_HOTEL", "PANDIT_EN_ROUTE"] as string[], nextStatus: "PANDIT_ARRIVED", outstation: false },
  { id: "start-puja", label: "Puja Shuru", subLabel: "Puja ki shuruat ho gayi", icon: "auto_stories", endpoint: "start-puja", requiredStatuses: ["PANDIT_ARRIVED"] as string[], nextStatus: "PUJA_IN_PROGRESS", outstation: false },
  { id: "complete", label: "Puja Sampann", subLabel: "Puja poori ho gayi", icon: "celebration", endpoint: "complete", requiredStatuses: ["PUJA_IN_PROGRESS"] as string[], nextStatus: "COMPLETED", outstation: false },
  { id: "return-journey", label: "Wapsi Shuru", subLabel: "Return yatra shuru", icon: "home", endpoint: "return-journey", requiredStatuses: ["COMPLETED"] as string[], nextStatus: "RETURN_IN_PROGRESS", outstation: true },
];

function statusToCompletedCount(status: string): number {
  const map: Record<string, number> = {
    CONFIRMED: 0, TRAVEL_BOOKED: 0,
    PANDIT_EN_ROUTE: 1,
    PANDIT_ARRIVED_HOTEL: 2,
    PANDIT_ARRIVED: 3,
    PUJA_IN_PROGRESS: 4,
    COMPLETED: 5,
    RETURN_IN_PROGRESS: 6,
  };
  return map[status] ?? 0;
}

export default function LiveTrackingPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params?.bookingId;

  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState<typeof ALL_STEPS[0] | null>(null);

  const load = useCallback(async () => {
    if (!bookingId) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Booking load nahin ho saki");
      const data = await res.json();
      setBooking(data?.data?.booking ?? data?.data ?? data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kuch galat ho gaya");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { void load(); }, [load]);

  const executeStep = async (step: typeof ALL_STEPS[0]) => {
    if (!booking) return;
    setActionLoading(step.id);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/pandit/bookings/${booking.id}/${step.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error("Status update nahin hua");
      const data = await res.json();
      const newStatus: BookingStatus = data?.data?.booking?.status ?? step.nextStatus as BookingStatus;
      setBooking((prev) => prev ? { ...prev, status: newStatus } : prev);
      setConfirmStep(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kuch galat ho gaya");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="py-20 flex items-center justify-center">
      <span className="w-10 h-10 border-3 border-[#f09942] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="py-16 space-y-4">
      <p className="text-red-600">{error || "Booking nahin mili."}</p>
      <Link href="/bookings" className="text-[#f09942] font-semibold">← Wapas</Link>
    </div>
  );

  const isOutstation = booking.isOutstation ?? false;
  const visibleSteps = ALL_STEPS.filter((s) => !s.outstation || isOutstation);
  const completedCount = statusToCompletedCount(booking.status);
  const isCompleted = ["COMPLETED", "RETURN_IN_PROGRESS"].includes(booking.status);

  const showPhone = ["PANDIT_ARRIVED", "PUJA_IN_PROGRESS", "COMPLETED"].includes(booking.status);

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <Link href={`/bookings/${bookingId}`} className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-[#f09942]">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Booking Details
        </Link>
        <span className="text-xs font-mono bg-gray-100 text-gray-500 px-3 py-1 rounded-full">#{booking.bookingNumber}</span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      {/* Summary card */}
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-900">{booking.eventType}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(booking.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {booking.venueCity}
        </p>

        {/* Customer contact */}
        <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-1">Customer:</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">
              {booking.customer.name?.split(" ")[0] ?? "Customer"} Ji
            </span>
            {showPhone && booking.customer.phone ? (
              <div className="flex gap-2">
                <a href={`tel:+91${booking.customer.phone}`}
                  className="flex items-center gap-1 bg-[#f09942] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">call</span>Call
                </a>
                <a href={`https://wa.me/91${booking.customer.phone}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  WhatsApp
                </a>
              </div>
            ) : (
              <span className="text-xs text-gray-400">📞 Venue pahunchne ke baad dikhega</span>
            )}
          </div>
        </div>
      </section>

      {/* Food allowance */}
      {(booking.foodAllowanceAmount ?? 0) > 0 && (
        <section className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            <p className="text-sm font-bold text-green-800">Food Allowance Milega</p>
          </div>
          <div className="space-y-1 text-sm text-green-700">
            {(booking.travelDays ?? 0) > 0 && <p>Travel {booking.travelDays} din × ₹1,000 = ₹{(booking.travelDays ?? 0) * 1000}</p>}
            {(booking.pujaDaysWithAllowance ?? 0) > 0 && <p>Puja {booking.pujaDaysWithAllowance} din × ₹1,000 = ₹{(booking.pujaDaysWithAllowance ?? 0) * 1000}</p>}
            <p className="font-bold text-green-800 border-t border-green-200 pt-1 mt-1">Total: ₹{booking.foodAllowanceAmount?.toLocaleString("en-IN")}</p>
          </div>
        </section>
      )}

      {/* Completion */}
      {isCompleted && (
        <section className="bg-green-50 border-2 border-green-300 rounded-xl p-5 text-center">
          <span className="material-symbols-outlined text-green-500 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          <h2 className="text-xl font-bold text-green-800 mt-2">Puja Sampann! 🙏</h2>
          <p className="text-sm text-green-700 mt-1">Bahut achhe kaam ke liye Dhanyawad!</p>
          <p className="text-xs text-green-600 mt-1">Payment 24 ghante mein process hogi.</p>
          <Link href="/" className="inline-block mt-4 bg-[#f09942] text-white font-bold px-6 py-2.5 rounded-xl text-sm">
            Dashboard par Jaain
          </Link>
        </section>
      )}

      {/* Sequential status buttons */}
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Live Status Updates</h2>
        <p className="text-xs text-gray-400 mb-4">Har update par customer ko SMS jayega</p>

        <div className="space-y-2">
          {visibleSteps.map((step, idx) => {
            const isDone = idx < completedCount;
            const isCurrent = !isDone && step.requiredStatuses.includes(booking.status);
            const isFuture = !isDone && !isCurrent;
            const isLoading = actionLoading === step.id;

            return (
              <div key={step.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                isDone ? "border-green-200 bg-green-50" :
                isCurrent ? "border-[#f09942] bg-[#f09942]/5" :
                "border-gray-100 bg-white opacity-40"
              }`}>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDone ? "bg-green-500" : isCurrent ? "bg-[#f09942]" : "bg-gray-100"
                }`}>
                  {isDone ? (
                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  ) : (
                    <span className={`material-symbols-outlined text-xl ${isCurrent ? "text-white" : "text-gray-300"}`} style={isCurrent ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {step.icon}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isDone ? "text-green-700" : isCurrent ? "text-gray-900" : "text-gray-300"}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${isDone ? "text-green-600" : isCurrent ? "text-gray-500" : "text-gray-300"}`}>
                    {step.subLabel}
                  </p>
                </div>

                {isDone && (
                  <span className="text-green-600 font-bold text-xs">✓ Done</span>
                )}

                {isCurrent && (
                  <button
                    onClick={() => setConfirmStep(step)}
                    disabled={isLoading}
                    className={`flex-shrink-0 font-bold text-sm py-2.5 px-4 rounded-xl transition-colors ${
                      step.id === "complete" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-[#f09942] hover:bg-[#dc6803] text-white"
                    } disabled:opacity-60 flex items-center gap-1`}
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : step.id === "complete" ? "Sampann ✓" : "Confirm"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Documents */}
      {booking.documents && booking.documents.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Documents & Tickets</h2>
          <div className="space-y-2">
            {booking.documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f09942]">description</span>
                  <span className="text-sm font-medium text-gray-700">{doc.label}</span>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold text-[#f09942] border border-[#f09942] rounded-lg px-3 py-1.5">
                  Dekhein
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirm modal */}
      {confirmStep && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#f09942]/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#f09942] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {confirmStep.icon}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">{confirmStep.label}</h3>
            <p className="text-sm text-gray-500 text-center">
              {confirmStep.id === "complete"
                ? "Puja sampann mark karne par customer ko review link bheja jayega aur payment process hogi."
                : `${confirmStep.subLabel} — customer ko SMS jayega.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmStep(null)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm">
                Wapas
              </button>
              <button
                onClick={() => void executeStep(confirmStep)}
                disabled={actionLoading === confirmStep.id}
                className={`flex-1 font-bold py-3 rounded-xl text-white text-sm disabled:opacity-60 flex items-center justify-center gap-1 ${
                  confirmStep.id === "complete" ? "bg-green-600" : "bg-[#f09942]"
                }`}
              >
                {actionLoading === confirmStep.id ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : "Haan, Confirm Karein"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
