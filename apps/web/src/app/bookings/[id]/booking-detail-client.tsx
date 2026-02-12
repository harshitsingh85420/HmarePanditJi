"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  eventDate: string;
  eventTime?: string;
  muhurat?: string;
  venueAddress: {
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state?: string;
    pincode?: string;
  };
  specialRequirements?: string;
  numberOfAttendees?: number;
  travelMode?: string;
  travelNotes?: string;
  pricing: {
    basePrice: number;
    travelCharge?: number;
    samagriCharge?: number;
    platformFee?: number;
    discount?: number;
    total: number;
  };
  paymentId?: string;
  orderId?: string;
  refundId?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  panditAcceptedAt?: string;
  pandit: {
    id: string;
    displayName: string;
    profilePhotoUrl?: string;
    phone?: string;
    averageRating?: number;
    totalBookings?: number;
    experienceYears?: number;
    languages?: string[];
    specializations?: string[];
  };
  ritual: {
    id: string;
    name: string;
    nameHindi?: string;
    description?: string;
    durationMinutes?: number;
    imageUrl?: string;
  };
  review?: {
    id: string;
    ratings: Record<string, number>;
    comment: string;
    anonymous: boolean;
    createdAt: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999";

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "Ceremony in Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  REFUNDED: "bg-slate-100 text-slate-600 border-slate-200",
};

// Timeline steps: which statuses unlock which steps
const TIMELINE_STEPS: {
  key: BookingStatus | "booked";
  label: string;
  icon: string;
}[] = [
  { key: "booked", label: "Booking Placed", icon: "receipt" },
  { key: "CONFIRMED", label: "Confirmed", icon: "verified" },
  { key: "IN_PROGRESS", label: "Ceremony Started", icon: "self_improvement" },
  { key: "COMPLETED", label: "Completed", icon: "celebration" },
];

const STATUS_ORDER: Record<BookingStatus | "booked", number> = {
  booked: 0,
  PENDING: 0,
  CONFIRMED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  CANCELLED: -1,
  REFUNDED: -1,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="bg-white border-b border-slate-100 px-4 py-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {[140, 200, 180, 160].map((h, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 animate-pulse"
            style={{ height: h }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <span className="material-symbols-outlined text-base text-[#f49d25]">{icon}</span>
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
    </div>
  );
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────

function CancelModal({
  booking,
  onClose,
  onConfirm,
  loading,
}: {
  booking: BookingDetail;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");
  const REASONS = [
    "Change of plans",
    "Found another pandit",
    "Family emergency",
    "Rescheduling required",
    "Other",
  ];

  const hoursUntil = (new Date(booking.eventDate).getTime() - Date.now()) / 36e5;
  let refundPct = 100;
  if (hoursUntil < 24) refundPct = 0;
  else if (hoursUntil < 48) refundPct = 75;
  else if (hoursUntil < 72) refundPct = 90;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500">cancel</span>
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Cancel Booking</h2>
            <p className="text-xs text-slate-400">{booking.bookingNumber}</p>
          </div>
        </div>

        <div
          className={`rounded-xl p-4 mb-5 ${refundPct > 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`material-symbols-outlined text-base ${refundPct > 0 ? "text-green-600" : "text-red-500"}`}
            >
              {refundPct > 0 ? "payments" : "money_off"}
            </span>
            <span
              className={`text-sm font-semibold ${refundPct > 0 ? "text-green-700" : "text-red-600"}`}
            >
              {refundPct > 0 ? `${refundPct}% refund eligible` : "No refund available"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {refundPct > 0
              ? `₹${Math.round((booking.pricing.total * refundPct) / 100).toLocaleString("en-IN")} will be refunded within 5–7 business days.`
              : "Cancellations within 24 hours of the event are non-refundable per our policy."}
          </p>
        </div>

        <p className="text-sm font-medium text-slate-700 mb-2">Reason for cancellation</p>
        <div className="space-y-2 mb-5">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl border transition-colors ${
                reason === r
                  ? "bg-[#f49d25]/10 border-[#f49d25] text-[#c47c0e] font-medium"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason || loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {loading ? "Cancelling…" : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────

const SUB_RATINGS = [
  { key: "punctuality", label: "Punctuality", labelHi: "समय पर पहुंचे", icon: "schedule" },
  { key: "knowledge", label: "Knowledge", labelHi: "विद्वत्ता", icon: "menu_book" },
  { key: "conduct", label: "Conduct", labelHi: "व्यवहार", icon: "handshake" },
  { key: "accuracy", label: "Ritual Accuracy", labelHi: "शुद्धता", icon: "verified" },
  { key: "samagri", label: "Samagri Quality", labelHi: "सामग्री", icon: "inventory_2" },
] as const;

type SubRatingKey = (typeof SUB_RATINGS)[number]["key"];

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${s} stars`}
        >
          <span
            className={`material-symbols-outlined text-2xl ${
              s <= (hover || value) ? "text-[#f49d25]" : "text-slate-200"
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

function ReviewModal({
  booking,
  onClose,
  onSubmit,
  loading,
}: {
  booking: BookingDetail;
  onClose: () => void;
  onSubmit: (data: {
    ratings: Record<SubRatingKey, number>;
    comment: string;
    anonymous: boolean;
  }) => void;
  loading: boolean;
}) {
  const [ratings, setRatings] = useState<Record<SubRatingKey, number>>({
    punctuality: 0,
    knowledge: 0,
    conduct: 0,
    accuracy: 0,
    samagri: 0,
  });
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const overall =
    Object.values(ratings).every((v) => v > 0)
      ? Math.round(
          (Object.values(ratings).reduce((a, b) => a + b, 0) / SUB_RATINGS.length) * 10
        ) / 10
      : 0;

  const canSubmit = Object.values(ratings).every((v) => v > 0) && comment.trim().length >= 10;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Rate Your Experience</h2>
            <p className="text-xs text-slate-400 mt-0.5">{booking.pandit.displayName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {overall > 0 && (
            <div className="bg-[#f49d25]/5 border border-[#f49d25]/20 rounded-xl p-4 flex items-center gap-4">
              <div className="text-4xl font-bold text-[#f49d25]">{overall}</div>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`material-symbols-outlined text-lg ${s <= Math.round(overall) ? "text-[#f49d25]" : "text-slate-200"}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Overall rating</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {SUB_RATINGS.map(({ key, label, labelHi, icon }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-base text-[#f49d25] shrink-0">
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{labelHi}</p>
                  </div>
                </div>
                <StarRow
                  value={ratings[key]}
                  onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Your Review
              <span className="text-slate-400 font-normal ml-1">(min. 10 characters)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with future customers…"
              rows={3}
              maxLength={500}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] transition"
            />
            <p className="text-xs text-slate-400 mt-1">{comment.length} / 500 characters</p>
          </div>

          <button
            onClick={() => setAnonymous((v) => !v)}
            className={`flex items-center gap-3 w-full p-3.5 rounded-xl border transition-colors text-left ${
              anonymous ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                anonymous ? "bg-[#f49d25] border-[#f49d25]" : "border-slate-300"
              }`}
            >
              {anonymous && (
                <span className="material-symbols-outlined text-white text-sm">check</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Post anonymously</p>
              <p className="text-xs text-slate-400">Your name won't appear on the review</p>
            </div>
          </button>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4">
          <button
            onClick={() => onSubmit({ ratings, comment, anonymous })}
            disabled={!canSubmit || loading}
            className="w-full py-3 rounded-xl bg-[#f49d25] hover:bg-[#e08c14] disabled:opacity-50 text-white font-semibold text-sm transition-colors"
          >
            {loading ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Review Display ────────────────────────────────────────────────────────────

function ReviewDisplay({ review }: { review: NonNullable<BookingDetail["review"]> }) {
  const overall =
    Math.round(
      (Object.values(review.ratings).reduce((a: number, b: unknown) => a + (b as number), 0) /
        Object.keys(review.ratings).length) *
        10
    ) / 10;

  return (
    <Card>
      <CardHeader icon="star" title="Your Review" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-[#f49d25]">{overall}</span>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`material-symbols-outlined text-lg ${s <= Math.round(overall) ? "text-[#f49d25]" : "text-slate-200"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {review.anonymous ? "Posted anonymously" : "Posted by you"} ·{" "}
              {formatShortDate(review.createdAt)}
            </p>
          </div>
        </div>
        {review.comment && (
          <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
        )}
      </div>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BookingDetailClient({ bookingId }: { bookingId: string }) {
  const { user, accessToken, openLoginModal, loading: authLoading } = useAuth();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCancel, setShowCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 404) {
        setError("Booking not found.");
        return;
      }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setBooking(json.data ?? json);
    } catch {
      setError("Could not load booking details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [bookingId, accessToken]);

  useEffect(() => {
    if (!authLoading && !user) openLoginModal();
  }, [authLoading, user, openLoginModal]);

  useEffect(() => {
    if (user && accessToken) fetchBooking();
  }, [user, accessToken, fetchBooking]);

  const handleCancel = async (reason: string) => {
    if (!booking || !accessToken) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`${API}/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      setShowCancel(false);
      fetchBooking();
    } catch {
      alert("Could not cancel. Please contact support via WhatsApp.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReview = async (data: {
    ratings: Record<SubRatingKey, number>;
    comment: string;
    anonymous: boolean;
  }) => {
    if (!booking || !accessToken) return;
    setReviewLoading(true);
    try {
      const res = await fetch(`${API}/bookings/${booking.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setShowReview(false);
      fetchBooking();
    } catch {
      alert("Could not submit review. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (authLoading || loading) return <Skeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-red-400">error</span>
          </div>
          <h2 className="text-slate-700 font-semibold text-lg mb-2">{error}</h2>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={fetchBooking}
              className="px-4 py-2 text-sm bg-[#f49d25] text-white rounded-xl font-medium hover:bg-[#e08c14] transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/bookings"
              className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isCancellable = ["PENDING", "CONFIRMED"].includes(booking.status);
  const isRateable = booking.status === "COMPLETED" && !booking.review;
  const isCancelled = ["CANCELLED", "REFUNDED"].includes(booking.status);
  const whatsappMsg = encodeURIComponent(
    `Namaste! I have a booking #${booking.bookingNumber} for ${booking.ritual.name} on ${formatDate(booking.eventDate)}. I need assistance.`
  );

  // Compute timeline current step
  const currentStepIdx = isCancelled
    ? -1
    : STATUS_ORDER[booking.status] ?? 0;

  return (
    <>
      <div className="min-h-screen bg-[#f8f7f5] pb-24">
        {/* Top Nav */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-slate-500">arrow_back</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-slate-800 truncate">
                {booking.ritual.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono">{booking.bookingNumber}</p>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[booking.status]}`}
            >
              {STATUS_LABEL[booking.status]}
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {/* ── Cancelled Banner ── */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
              <span className="material-symbols-outlined text-red-400 shrink-0">cancel</span>
              <div>
                <p className="text-sm font-semibold text-red-700">Booking Cancelled</p>
                {booking.cancellationReason && (
                  <p className="text-xs text-red-500 mt-0.5">
                    Reason: {booking.cancellationReason}
                  </p>
                )}
                {booking.cancelledAt && (
                  <p className="text-xs text-red-400 mt-0.5">
                    On {formatDatetime(booking.cancelledAt)}
                  </p>
                )}
                {booking.paymentStatus === "REFUNDED" && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    Refund processed · {booking.refundId}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Timeline ── */}
          {!isCancelled && (
            <Card>
              <CardHeader icon="timeline" title="Booking Progress" />
              <div className="px-5 py-4">
                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100" />

                  <div className="space-y-5">
                    {TIMELINE_STEPS.map(({ key, label, icon }, idx) => {
                      const done = idx <= currentStepIdx;
                      const active = idx === currentStepIdx;
                      return (
                        <div key={key} className="flex items-start gap-4 relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                              done
                                ? "bg-[#f49d25] shadow-sm"
                                : "bg-white border-2 border-slate-200"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-sm ${done ? "text-white" : "text-slate-300"}`}
                              style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              {icon}
                            </span>
                          </div>
                          <div className="pt-1">
                            <p
                              className={`text-sm font-medium ${
                                active
                                  ? "text-[#c47c0e]"
                                  : done
                                  ? "text-slate-700"
                                  : "text-slate-300"
                              }`}
                            >
                              {label}
                            </p>
                            {active && (
                              <p className="text-xs text-slate-400 mt-0.5">Current status</p>
                            )}
                            {key === "CONFIRMED" && booking.panditAcceptedAt && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatDatetime(booking.panditAcceptedAt)}
                              </p>
                            )}
                            {key === "COMPLETED" && booking.completedAt && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatDatetime(booking.completedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ── Event Details ── */}
          <Card>
            <CardHeader icon="event" title="Ceremony Details" />
            <div className="divide-y divide-slate-100">
              <div className="flex items-start gap-3 px-5 py-3.5">
                <span className="material-symbols-outlined text-base text-[#f49d25] mt-0.5 shrink-0">
                  auto_awesome
                </span>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Ritual</p>
                  <p className="text-sm font-medium text-slate-700">
                    {booking.ritual.name}
                    {booking.ritual.nameHindi && (
                      <span className="ml-1.5 text-slate-400 font-normal">
                        ({booking.ritual.nameHindi})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 px-5 py-3.5">
                <span className="material-symbols-outlined text-base text-[#f49d25] mt-0.5 shrink-0">
                  calendar_month
                </span>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Date &amp; Time</p>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDate(booking.eventDate)}
                    {booking.eventTime && (
                      <span className="text-slate-500 font-normal">
                        {" "}at {formatTime(booking.eventTime)}
                      </span>
                    )}
                  </p>
                  {booking.muhurat && (
                    <p className="text-xs text-[#c47c0e] mt-0.5">
                      Muhurat: {booking.muhurat}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 px-5 py-3.5">
                <span className="material-symbols-outlined text-base text-[#f49d25] mt-0.5 shrink-0">
                  location_on
                </span>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Venue</p>
                  <p className="text-sm font-medium text-slate-700">
                    {booking.venueAddress.line1}
                    {booking.venueAddress.line2 && `, ${booking.venueAddress.line2}`}
                  </p>
                  {booking.venueAddress.landmark && (
                    <p className="text-xs text-slate-500">Near {booking.venueAddress.landmark}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {booking.venueAddress.city}
                    {booking.venueAddress.pincode && ` — ${booking.venueAddress.pincode}`}
                  </p>
                </div>
              </div>

              {booking.numberOfAttendees && (
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <span className="material-symbols-outlined text-base text-[#f49d25] mt-0.5 shrink-0">
                    groups
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Attendees</p>
                    <p className="text-sm font-medium text-slate-700">
                      {booking.numberOfAttendees} people
                    </p>
                  </div>
                </div>
              )}

              {booking.specialRequirements && (
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <span className="material-symbols-outlined text-base text-[#f49d25] mt-0.5 shrink-0">
                    note
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Special Requirements</p>
                    <p className="text-sm text-slate-700">{booking.specialRequirements}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ── Pandit Card ── */}
          <Card>
            <CardHeader icon="person" title="Your Pandit Ji" />
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#f49d25]/10 border border-[#f49d25]/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {booking.pandit.profilePhotoUrl ? (
                    <img
                      src={booking.pandit.profilePhotoUrl}
                      alt={booking.pandit.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-2xl text-[#f49d25]">
                      person
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">{booking.pandit.displayName}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {booking.pandit.averageRating && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <span
                          className="material-symbols-outlined text-sm text-[#f49d25]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        {booking.pandit.averageRating.toFixed(1)}
                      </span>
                    )}
                    {booking.pandit.experienceYears && (
                      <span className="text-xs text-slate-500">
                        {booking.pandit.experienceYears}+ yrs exp
                      </span>
                    )}
                    {booking.pandit.totalBookings && (
                      <span className="text-xs text-slate-500">
                        {booking.pandit.totalBookings} ceremonies
                      </span>
                    )}
                  </div>
                  {booking.pandit.languages && booking.pandit.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {booking.pandit.languages.slice(0, 3).map((l) => (
                        <span
                          key={l}
                          className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <a
                  href={`https://wa.me/${WA}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C4C] rounded-xl text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  Contact Support
                </a>
                <Link
                  href={`/pandit/${booking.pandit.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  View Profile
                </Link>
              </div>
            </div>
          </Card>

          {/* ── Payment Receipt ── */}
          <Card>
            <CardHeader icon="receipt_long" title="Payment Receipt" />
            <div className="p-5 space-y-3">
              {/* Breakdown */}
              <div className="space-y-2 text-sm">
                {[
                  { label: "Base Price", value: booking.pricing.basePrice },
                  { label: "Travel Charge", value: booking.pricing.travelCharge },
                  { label: "Samagri", value: booking.pricing.samagriCharge },
                  { label: "Platform Fee", value: booking.pricing.platformFee },
                ]
                  .filter((row) => row.value)
                  .map((row) => (
                    <div key={row.label} className="flex justify-between text-slate-600">
                      <span>{row.label}</span>
                      <span>₹{row.value!.toLocaleString("en-IN")}</span>
                    </div>
                  ))}

                {booking.pricing.discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−₹{booking.pricing.discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex justify-between font-semibold text-slate-800">
                <span>Total Paid</span>
                <span>₹{booking.pricing.total.toLocaleString("en-IN")}</span>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    booking.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : booking.paymentStatus === "REFUNDED"
                      ? "bg-blue-100 text-blue-700"
                      : booking.paymentStatus === "FAILED"
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {booking.paymentStatus === "PAID"
                    ? "Payment Successful"
                    : booking.paymentStatus === "REFUNDED"
                    ? "Refunded"
                    : booking.paymentStatus === "FAILED"
                    ? "Payment Failed"
                    : "Payment Pending"}
                </span>
              </div>

              {/* Transaction IDs */}
              {(booking.paymentId || booking.orderId) && (
                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-500 font-mono">
                  {booking.orderId && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Order ID</span>
                      <span className="truncate text-right">{booking.orderId}</span>
                    </div>
                  )}
                  {booking.paymentId && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Payment ID</span>
                      <span className="truncate text-right">{booking.paymentId}</span>
                    </div>
                  )}
                  {booking.refundId && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Refund ID</span>
                      <span className="truncate text-right">{booking.refundId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Booking meta */}
              <div className="text-xs text-slate-400 space-y-0.5 pt-1">
                <p>Booked on {formatShortDate(booking.createdAt)}</p>
                <p>
                  Travel: {booking.travelMode ?? "Arranged by platform"}
                  {booking.travelNotes && ` · ${booking.travelNotes}`}
                </p>
              </div>
            </div>
          </Card>

          {/* ── Review (if submitted) ── */}
          {booking.review && <ReviewDisplay review={booking.review} />}
        </div>
      </div>

      {/* ── Sticky Bottom Actions ── */}
      {(isCancellable || isRateable) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 z-10">
          <div className="max-w-2xl mx-auto flex gap-3">
            {isCancellable && (
              <button
                onClick={() => setShowCancel(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-base">cancel</span>
                Cancel Booking
              </button>
            )}
            {isRateable && (
              <button
                onClick={() => setShowReview(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#f49d25] hover:bg-[#e08c14] text-white rounded-xl font-semibold text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-base">star</span>
                Rate Experience
              </button>
            )}
            {!isRateable && isCancellable && (
              <a
                href={`https://wa.me/${WA}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#f49d25] hover:bg-[#e08c14] text-white rounded-xl font-semibold text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                Contact Support
              </a>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCancel && booking && (
        <CancelModal
          booking={booking}
          onClose={() => setShowCancel(false)}
          onConfirm={handleCancel}
          loading={cancelLoading}
        />
      )}
      {showReview && booking && (
        <ReviewModal
          booking={booking}
          onClose={() => setShowReview(false)}
          onSubmit={handleReview}
          loading={reviewLoading}
        />
      )}
    </>
  );
}
