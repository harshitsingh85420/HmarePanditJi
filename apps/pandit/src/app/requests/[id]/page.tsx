"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const TIMER_SECONDS = 5 * 60; // 5 minutes

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: string;
  eventDate: string;
  eventEndDate?: string;
  eventTime?: string | null;
  ritual?: { name: string };
  venueAddress?: {
    city?: string;
    state?: string;
    line1?: string;
  };
  pricing?: {
    total?: number;
    dakshina?: number;
    travelAllowance?: number;
    foodStay?: number;
    samagri?: number;
  };
  customer?: {
    user?: {
      fullName?: string;
      phone?: string;
    };
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingRequestPage({
  params,
}: {
  params: { id: string };
}) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionDone, setActionDone] = useState<"accepted" | "rejected" | null>(null);

  // ── Fetch booking details ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchBooking() {
      try {
        const token = localStorage.getItem("hpj_pandit_access_token");
        const res = await fetch(`${API_BASE}/bookings/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch booking");
        const json = await res.json();
        setBooking(json.data?.booking ?? json.data ?? json);
      } catch {
        setError("Could not load booking details. Showing demo data.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [params.id]);

  // ── Countdown timer ────────────────────────────────────────────────────────
  const handleAutoReject = useCallback(async () => {
    setIsExpired(true);
    try {
      const token = localStorage.getItem("hpj_pandit_access_token");
      await fetch(`${API_BASE}/bookings/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: "CANCELLED",
          reason: "Auto-rejected: response timer expired",
        }),
      });
    } catch {
      // silent — auto-reject failure is non-critical
    }
  }, [params.id]);

  useEffect(() => {
    if (isExpired || actionDone) return;
    if (timeLeft <= 0) {
      handleAutoReject();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleAutoReject();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExpired, actionDone, timeLeft, handleAutoReject]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // ── Accept ─────────────────────────────────────────────────────────────────
  async function handleAccept() {
    setIsAccepting(true);
    setError(null);
    try {
      const token = localStorage.getItem("hpj_pandit_access_token");
      const res = await fetch(`${API_BASE}/bookings/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      if (!res.ok) throw new Error("Failed to accept booking");
      setActionDone("accepted");
    } catch {
      setError("Failed to accept booking. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  }

  // ── Reject ─────────────────────────────────────────────────────────────────
  async function handleReject() {
    if (!rejectReason.trim()) return;
    setIsRejecting(true);
    setError(null);
    try {
      const token = localStorage.getItem("hpj_pandit_access_token");
      const res = await fetch(`${API_BASE}/bookings/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "CANCELLED", reason: rejectReason }),
      });
      if (!res.ok) throw new Error("Failed to reject booking");
      setActionDone("rejected");
      setShowRejectModal(false);
    } catch {
      setError("Failed to reject booking. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  }

  // ── Derive display data ────────────────────────────────────────────────────
  const ritualName =
    booking?.ritual?.name ?? "Delhi Grand Wedding Ceremony";

  const eventDateStr = booking?.eventDate
    ? new Date(booking.eventDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Dec 15 – Dec 17";

  const venueAddress = booking?.venueAddress as
    | Record<string, string>
    | undefined;
  const city = venueAddress?.city
    ? `${venueAddress.city}${venueAddress.state ? `, ${venueAddress.state}` : ""}`
    : "New Delhi, NCR Region";

  const pricing = (booking?.pricing ?? {}) as Record<string, number>;
  const dakshina = pricing.dakshina ?? 29_750;
  const travelAllowance = pricing.travelAllowance ?? 12_000;
  const foodStay = pricing.foodStay ?? 3_000;
  const samagri = pricing.samagri ?? 8_000;
  const total = pricing.total ?? dakshina + travelAllowance + foodStay + samagri;

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 0 });

  // ── Success / expired screens ──────────────────────────────────────────────
  if (actionDone === "accepted") {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-green-600 text-[48px] leading-none"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Booking Accepted!</h2>
          <p className="mt-2 text-slate-500 max-w-sm mx-auto">
            The customer has been notified. Please be ready for the ceremony.
          </p>
        </div>
        <a
          href="/bookings"
          className="bg-[#135bec] hover:bg-[#0f4bd4] text-white font-bold rounded-xl px-8 py-4 transition-colors"
        >
          View My Bookings
        </a>
      </div>
    );
  }

  if (actionDone === "rejected" || (isExpired && !actionDone)) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-600 text-[48px] leading-none">
            cancel
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isExpired && !actionDone ? "Time Expired" : "Request Rejected"}
          </h2>
          <p className="mt-2 text-slate-500 max-w-sm mx-auto">
            {isExpired && !actionDone
              ? "The booking request has expired. Admin will find an alternative Pandit Ji."
              : "The booking has been rejected. Admin will find an alternative Pandit Ji."}
          </p>
        </div>
        <a
          href="/"
          className="border border-slate-200 text-slate-700 font-bold rounded-xl px-8 py-4 hover:bg-slate-50 transition-colors"
        >
          Back to Dashboard
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="py-8 space-y-8">

      {/* ── Error toast ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-[20px] leading-none">
            error
          </span>
          <p className="flex-1 text-sm font-medium text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <span className="material-symbols-outlined text-base leading-none">close</span>
          </button>
        </div>
      )}

      {/* ── 1. Urgent Alert Banner ────────────────────────────────────────── */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
        {/* Heading */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="material-symbols-outlined text-red-600 animate-pulse text-[28px] leading-none">
            emergency
          </span>
          <span className="text-red-600 text-2xl font-extrabold uppercase tracking-wide">
            New Booking Request
          </span>
        </div>
        <p className="text-xl font-bold text-slate-800 mb-6">{ritualName}</p>

        {/* Countdown boxes */}
        <div className="flex items-end justify-center gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-16 w-20 bg-white rounded-xl shadow-sm border border-red-100 flex items-center justify-center">
              <span className="text-2xl font-black text-red-600 tabular-nums">
                {String(minutes).padStart(2, "0")}
              </span>
            </div>
            <span className="text-xs uppercase tracking-widest text-red-500 font-medium">
              Minutes
            </span>
          </div>
          <div className="text-red-600 font-black text-2xl pb-7 leading-none select-none">
            :
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-16 w-20 bg-white rounded-xl shadow-sm border border-red-100 flex items-center justify-center">
              <span className="text-2xl font-black text-red-600 tabular-nums">
                {String(seconds).padStart(2, "0")}
              </span>
            </div>
            <span className="text-xs uppercase tracking-widest text-red-500 font-medium">
              Seconds
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Main Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Map & Location Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Map placeholder */}
            <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200">
              {/* Grid lines */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              {/* Road-like diagonals */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, transparent 38%, #e2e8f0 38%, #e2e8f0 42%, transparent 42%), linear-gradient(-45deg, transparent 28%, #e2e8f0 28%, #e2e8f0 32%, transparent 32%), linear-gradient(transparent 58%, #e2e8f0 58%, #e2e8f0 62%, transparent 62%)",
                  backgroundSize: "120px 120px, 200px 200px, 80px 80px",
                }}
              />
              {/* Distance badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                <span className="material-symbols-outlined text-primary text-base leading-none">
                  distance
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  1,200 km away
                </span>
              </div>
            </div>

            {/* Location details */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {eventDateStr}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-slate-500">
                    <span className="material-symbols-outlined text-base leading-none">
                      location_on
                    </span>
                    <span className="text-sm font-medium">{city}</span>
                  </div>
                </div>
                <span className="inline-flex items-center bg-[#135bec]/10 text-[#135bec] text-xs font-bold rounded-full px-3 py-1.5 shrink-0">
                  High Stakes
                </span>
              </div>

              {/* 2-col detail grid */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-base leading-none mt-0.5">
                    directions_car
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                      Travel Type
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      Self-Drive (Your Car)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-base leading-none mt-0.5">
                    inventory_2
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                      Samagri
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      Premium Package
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Breakdown Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-[#135bec] text-[22px] leading-none">
                receipt_long
              </span>
              <h2 className="font-bold text-lg text-slate-900">
                Earnings Breakdown
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { label: "Dakshina (Service Fee)", amount: dakshina },
                { label: "Travel Allowance", amount: travelAllowance },
                { label: "Food & Stay Allowance", amount: foodStay },
                { label: "Samagri Reimbursement", amount: samagri },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-3"
                >
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800">
                    ₹{fmt(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-[#135bec]/20">
              <span className="font-extrabold text-[#135bec] text-xl">
                Guaranteed Total
              </span>
              <span className="font-black text-[#135bec] text-2xl">
                ₹{fmt(total)}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-[#135bec]/20 sticky top-24 space-y-4">
            <h2 className="text-center font-extrabold text-slate-900 text-lg">
              Action Required
            </h2>

            {/* Accept */}
            <button
              onClick={handleAccept}
              disabled={isAccepting || isRejecting}
              className="w-full flex items-center justify-center gap-2 bg-[#135bec] hover:bg-[#0f4bd4] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-5 rounded-xl shadow-lg shadow-[#135bec]/20 transition-all"
            >
              {isAccepting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span
                  className="material-symbols-outlined text-[20px] leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              )}
              <span className="text-base uppercase tracking-wide">
                Accept Booking
              </span>
            </button>

            {/* Reject */}
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isAccepting || isRejecting}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 font-bold py-4 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">
                close
              </span>
              <span className="text-sm uppercase tracking-wide">
                Reject Request
              </span>
            </button>

            {/* Note */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                Accepting requires availability for all 3 days. Penalty applies
                for cancellations within 48h.
              </p>
            </div>

            {/* Info box */}
            <div className="bg-[#135bec]/5 border border-[#135bec]/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="material-symbols-outlined text-[#135bec] text-base leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="text-sm font-bold text-[#135bec]">
                  Premium Service Guarantee
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Selected based on your 4.9/5 star rating
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Reject Modal ───────────────────────────────────────────────── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Reject Booking
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined leading-none">
                  close
                </span>
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Please provide a reason. This helps us find an alternative Pandit
              Ji for the customer.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Not available on those dates…"
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isRejecting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isRejecting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
