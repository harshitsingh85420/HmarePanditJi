"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/auth-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

interface BookingSummary {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  eventDate: string;
  eventTime?: string;
  venueAddress: {
    line1: string;
    city: string;
    pincode?: string;
  };
  pricing: {
    total: number;
  };
  pandit: {
    id: string;
    displayName: string;
    profilePhotoUrl?: string;
    phone?: string;
  };
  ritual: {
    name: string;
    nameHindi?: string;
    durationMinutes?: number;
  };
  hasReview: boolean;
  createdAt: string;
}

type Tab = "upcoming" | "past" | "cancelled";

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999";

const TAB_STATUSES: Record<Tab, BookingStatus[]> = {
  upcoming: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
  past: ["COMPLETED"],
  cancelled: ["CANCELLED", "REFUNDED"],
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
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

const STATUS_DOT: Record<BookingStatus, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-blue-500",
  IN_PROGRESS: "bg-purple-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-400",
  REFUNDED: "bg-slate-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse space-y-4">
      <div className="flex justify-between">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-6 w-20 bg-slate-200 rounded-full" />
      </div>
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-slate-200 rounded-lg" />
        <div className="h-8 w-20 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

// ── Booking Card ──────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onCancelClick,
  onRateClick,
}: {
  booking: BookingSummary;
  onCancelClick: (b: BookingSummary) => void;
  onRateClick: (b: BookingSummary) => void;
}) {
  const router = useRouter();
  const isCancellable = ["PENDING", "CONFIRMED"].includes(booking.status);
  const isRateable = booking.status === "COMPLETED" && !booking.hasReview;
  const whatsappMsg = encodeURIComponent(
    `Namaste! I have a booking #${booking.bookingNumber} for ${booking.ritual.name} on ${formatDate(booking.eventDate)}. I need help.`
  );

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/bookings/${booking.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <p className="text-xs text-slate-400 font-mono">{booking.bookingNumber}</p>
          <h3 className="font-semibold text-slate-800 mt-0.5">
            {booking.ritual.name}
            {booking.ritual.nameHindi && (
              <span className="ml-1.5 text-slate-400 font-normal text-sm">
                ({booking.ritual.nameHindi})
              </span>
            )}
          </h3>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${STATUS_COLORS[booking.status]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[booking.status]}`} />
          {STATUS_LABEL[booking.status]}
        </span>
      </div>

      {/* Pandit Row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#f49d25]/10 border border-[#f49d25]/20 flex items-center justify-center shrink-0 overflow-hidden">
          {booking.pandit.profilePhotoUrl ? (
            <img
              src={booking.pandit.profilePhotoUrl}
              alt={booking.pandit.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-[#f49d25] text-lg">person</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">{booking.pandit.displayName}</p>
          <p className="text-xs text-slate-400">Verified Pandit Ji</p>
        </div>
      </div>

      {/* Date / Venue */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="material-symbols-outlined text-base text-[#f49d25]">calendar_month</span>
          <span>
            {formatDate(booking.eventDate)}
            {booking.eventTime && (
              <span className="text-slate-400 ml-1.5">at {formatTime(booking.eventTime)}</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="material-symbols-outlined text-base text-[#f49d25]">location_on</span>
          <span className="truncate">
            {booking.venueAddress.line1}, {booking.venueAddress.city}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 mb-4" />

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold text-slate-800">
          ₹{booking.pricing.total.toLocaleString("en-IN")}
          {booking.paymentStatus === "PAID" && (
            <span className="ml-1.5 text-xs font-normal text-green-600">Paid</span>
          )}
          {booking.paymentStatus === "REFUNDED" && (
            <span className="ml-1.5 text-xs font-normal text-blue-600">Refunded</span>
          )}
        </p>

        <div className="flex items-center gap-2">
          {/* Contact Pandit */}
          {["CONFIRMED", "IN_PROGRESS"].includes(booking.status) && booking.pandit.phone && (
            <a
              href={`https://wa.me/${WA}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#25D366]/10 text-[#128C4C] rounded-lg hover:bg-[#25D366]/20 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              Contact
            </a>
          )}

          {/* Cancel */}
          {isCancellable && (
            <button
              onClick={() => onCancelClick(booking)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-sm">cancel</span>
              Cancel
            </button>
          )}

          {/* Rate */}
          {isRateable && (
            <button
              onClick={() => onRateClick(booking)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#f49d25]/10 text-[#c47c0e] rounded-lg hover:bg-[#f49d25]/20 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-sm">star</span>
              Rate
            </button>
          )}

          {/* Rebook */}
          {["COMPLETED", "CANCELLED", "REFUNDED"].includes(booking.status) && (
            <Link
              href={`/search?ritual=${booking.ritual.name}`}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-sm">replay</span>
              Rebook
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { icon: string; title: string; sub: string }> = {
    upcoming: {
      icon: "event",
      title: "No upcoming bookings",
      sub: "Your next ceremony will appear here once you book.",
    },
    past: {
      icon: "history",
      title: "No past bookings yet",
      sub: "Completed ceremonies will show up here.",
    },
    cancelled: {
      icon: "cancel",
      title: "No cancelled bookings",
      sub: "You haven't cancelled any bookings.",
    },
  };
  const { icon, title, sub } = messages[tab];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-[#f49d25]/10 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-[#f49d25]">{icon}</span>
      </div>
      <h3 className="text-slate-700 font-semibold text-lg mb-1">{title}</h3>
      <p className="text-slate-400 text-sm mb-6">{sub}</p>
      {tab !== "past" && (
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f49d25] hover:bg-[#e08c14] text-white rounded-xl font-medium text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-sm">search</span>
          Find a Pandit
        </Link>
      )}
    </div>
  );
}

// ── Cancel Confirm Modal ───────────────────────────────────────────────────────

function CancelModal({
  booking,
  onClose,
  onConfirm,
  loading,
}: {
  booking: BookingSummary;
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

        {/* Refund Info */}
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
              {refundPct > 0 ? `${refundPct}% refund eligible` : "No refund"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {refundPct > 0
              ? `₹${Math.round((booking.pricing.total * refundPct) / 100).toLocaleString("en-IN")} will be refunded within 5–7 business days.`
              : "Cancellations within 24 hours of the event are non-refundable."}
          </p>
        </div>

        {/* Reason */}
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
            {loading ? "Cancelling…" : "Cancel Booking"}
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
  { key: "samagri", label: "Samagri", labelHi: "सामग्री", icon: "inventory_2" },
] as const;

type SubRatingKey = (typeof SUB_RATINGS)[number]["key"];

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
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
  booking: BookingSummary;
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
        {/* Header */}
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
          {/* Overall score preview */}
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

          {/* Sub-ratings */}
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

          {/* Comment */}
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
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#f49d25]/40 focus:border-[#f49d25] transition"
            />
            <p className="text-xs text-slate-400 mt-1">{comment.length} / 500 characters</p>
          </div>

          {/* Anonymous toggle */}
          <button
            onClick={() => setAnonymous((v) => !v)}
            className={`flex items-center gap-3 w-full p-3.5 rounded-xl border transition-colors text-left ${
              anonymous
                ? "border-slate-300 bg-slate-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                anonymous ? "bg-[#f49d25] border-[#f49d25]" : "border-slate-300"
              }`}
            >
              {anonymous && (
                <span className="material-symbols-outlined text-white text-sm">check</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Post anonymously</p>
              <p className="text-xs text-slate-400">Your name won't be shown on the review</p>
            </div>
          </button>
        </div>

        {/* Footer */}
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

// ── Main Component ────────────────────────────────────────────────────────────

export default function BookingsClient() {
  const { user, accessToken, openLoginModal, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("upcoming");
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [error, setError] = useState("");

  const [cancelTarget, setCancelTarget] = useState<BookingSummary | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [rateTarget, setRateTarget] = useState<BookingSummary | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  // Fetch bookings for current tab
  const fetchBookings = useCallback(async () => {
    if (!accessToken) return;
    setLoadingBookings(true);
    setError("");
    try {
      const statuses = TAB_STATUSES[tab].join(",");
      const res = await fetch(`${API}/api/v1/bookings/my?status=${statuses}&limit=20`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to load bookings");
      const json = await res.json();
      setBookings(json.data ?? []);
    } catch {
      setError("Could not load bookings. Please try again.");
    } finally {
      setLoadingBookings(false);
    }
  }, [tab, accessToken]);

  useEffect(() => {
    if (!authLoading && !user) {
      openLoginModal();
    }
  }, [authLoading, user, openLoginModal]);

  useEffect(() => {
    if (user && accessToken) fetchBookings();
  }, [user, accessToken, fetchBookings]);

  // Cancel booking
  const handleCancel = async (reason: string) => {
    if (!cancelTarget || !accessToken) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/bookings/${cancelTarget.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      setCancelTarget(null);
      fetchBookings();
    } catch {
      alert("Could not cancel booking. Please try again or contact support.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Submit review
  const handleReview = async (data: {
    ratings: Record<SubRatingKey, number>;
    comment: string;
    anonymous: boolean;
  }) => {
    if (!rateTarget || !accessToken) return;
    setRateLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/bookings/${rateTarget.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setRateTarget(null);
      fetchBookings();
    } catch {
      alert("Could not submit review. Please try again.");
    } finally {
      setRateLoading(false);
    }
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "upcoming", label: "Upcoming", icon: "event_upcoming" },
    { key: "past", label: "Past", icon: "history" },
    { key: "cancelled", label: "Cancelled", icon: "cancel" },
  ];

  const filteredBookings = bookings.filter((b) =>
    TAB_STATUSES[tab].includes(b.status)
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#f49d25] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f49d25]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[#f49d25]">lock</span>
          </div>
          <h2 className="text-slate-700 font-semibold text-lg mb-2">Sign in to view bookings</h2>
          <p className="text-slate-400 text-sm mb-6">Your bookings will appear here after signing in.</p>
          <button
            onClick={openLoginModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#f49d25] hover:bg-[#e08c14] text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f8f7f5]">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => router.back()}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Go back"
              >
                <span className="material-symbols-outlined text-slate-500">arrow_back</span>
              </button>
              <h1 className="text-xl font-bold text-slate-800">My Bookings</h1>
            </div>
            <p className="text-sm text-slate-400 ml-11">
              Manage your ceremonies and puja appointments
            </p>
          </div>

          {/* Tabs */}
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex gap-1">
              {TABS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === key
                      ? "border-[#f49d25] text-[#c47c0e]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          {error && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchBookings}
                className="ml-auto text-xs text-red-600 underline"
              >
                Retry
              </button>
            </div>
          )}

          {loadingBookings ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onCancelClick={setCancelTarget}
                  onRateClick={setRateTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
          loading={cancelLoading}
        />
      )}

      {/* Review Modal */}
      {rateTarget && (
        <ReviewModal
          booking={rateTarget}
          onClose={() => setRateTarget(null)}
          onSubmit={handleReview}
          loading={rateLoading}
        />
      )}
    </>
  );
}
