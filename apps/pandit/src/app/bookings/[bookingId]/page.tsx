"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const REQUEST_WINDOW_S = 6 * 60 * 60;

function getToken() {
  return (
    localStorage.getItem("hpj_pandit_token") ||
    localStorage.getItem("hpj_pandit_access_token") ||
    localStorage.getItem("token")
  );
}

function fmtRupees(n?: number) {
  return `₹${Math.max(0, n ?? 0).toLocaleString("en-IN")}`;
}

function fmtDate(s?: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function fmtTime(s?: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

type BookingStatus =
  | "CREATED" | "PANDIT_REQUESTED" | "CONFIRMED" | "TRAVEL_BOOKED"
  | "PANDIT_EN_ROUTE" | "PANDIT_ARRIVED_HOTEL" | "PANDIT_ARRIVED"
  | "PUJA_IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REFUNDED";

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  eventType: string;
  eventDate: string;
  eventEndDate?: string | null;
  muhuratTime?: string | null;
  venueAddress: string;
  venueCity: string;
  venuePincode?: string;
  travelMode?: string | null;
  travelCost: number;
  travelStatus?: string | null;
  foodArrangement: "CUSTOMER_PROVIDES" | "PLATFORM_ALLOWANCE";
  foodAllowanceDays: number;
  foodAllowanceAmount: number;
  travelDays?: number;
  pujaDaysWithAllowance?: number;
  accommodationArrangement: "NOT_NEEDED" | "CUSTOMER_ARRANGES" | "PLATFORM_BOOKS";
  samagriPreference: "PANDIT_BRINGS" | "CUSTOMER_ARRANGES" | "NEED_HELP";
  samagriAmount: number;
  samagriPackageName?: string | null;
  samagriPackageTier?: string | null;
  dakshinaAmount: number;
  platformFee: number;
  panditPayout: number;
  guestCount?: number | null;
  specialInstructions?: string | null;
  createdAt: string;
  customer: {
    name?: string | null;
    phone?: string | null;
    rating?: number | null;
    customerProfile?: { gotra?: string | null; preferredLanguages?: string[] | null } | null;
  };
  isOutstation?: boolean;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PANDIT_REQUESTED: { label: "Nayi Request", cls: "bg-amber-100 text-amber-700 border border-amber-300" },
  CREATED: { label: "Nayi Request", cls: "bg-amber-100 text-amber-700 border border-amber-300" },
  CONFIRMED: { label: "Confirmed", cls: "bg-blue-100 text-blue-700 border border-blue-300" },
  PANDIT_EN_ROUTE: { label: "Yatra Mein", cls: "bg-purple-100 text-purple-700" },
  PANDIT_ARRIVED: { label: "Pahunche", cls: "bg-indigo-100 text-indigo-700" },
  PUJA_IN_PROGRESS: { label: "Puja Chal Rahi Hai", cls: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Sampann", cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
};

const REJECT_REASONS = [
  "Us din upalabdh nahin hun",
  "Yatra bahut dur hai",
  "Yeh puja nahin karta",
  "Personal / Family emergency",
  "Anya",
];

// ── Countdown Timer ────────────────────────────────────────────────────────
function CountdownTimer({ createdAt, onExpired }: { createdAt: string; onExpired: () => void }) {
  const [secs, setSecs] = useState(0);
  const expiredRef = { current: false };

  useEffect(() => {
    const tick = () => {
      const end = new Date(createdAt).getTime() + REQUEST_WINDOW_S * 1000;
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setSecs(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpired();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const isUrgent = secs <= 3600;

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? "text-red-600" : "text-amber-700"}`}>
      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
      <span className="text-sm font-bold">Sweekar karne ka samay bachha hai: </span>
      <span className={`font-mono font-bold text-base ${isUrgent ? "text-red-600" : "text-amber-700"}`}>{label}</span>
    </div>
  );
}

// ── Phone Reveal ───────────────────────────────────────────────────────────
function phoneDisplay(phone: string | null | undefined, status: BookingStatus) {
  if (!phone) return { text: "📞 Confirm ke baad dikhega", masked: true };
  if (["PANDIT_REQUESTED", "CREATED"].includes(status)) return { text: "📞 ****-****-XXXX", masked: true };
  if (["CONFIRMED", "TRAVEL_BOOKED"].includes(status)) return { text: `📞 ${phone.slice(0, 2)}XX-XXXX-XXXX`, masked: true };
  return { text: `📞 +91 ${phone}`, masked: false };
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BookingDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const bookingId = params?.bookingId;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptConfirm, setAcceptConfirm] = useState(false);

  const isPending = booking?.status === "PANDIT_REQUESTED" || booking?.status === "CREATED";
  const isActive = booking && !isPending &&
    !["COMPLETED", "CANCELLED", "REFUNDED"].includes(booking.status);

  const netDakshina = Math.max(0, (booking?.dakshinaAmount ?? 0) - (booking?.platformFee ?? 0));
  const scenarioATotal = netDakshina + (booking?.travelCost ?? 0) + (booking?.foodAllowanceAmount ?? 0) + (booking?.samagriAmount ?? 0);
  const scenarioBTotal = netDakshina + (booking?.travelCost ?? 0) + (booking?.foodAllowanceAmount ?? 0);
  const applicableTotal = booking?.samagriPreference === "PANDIT_BRINGS" ? scenarioATotal : scenarioBTotal;

  const load = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const token = getToken();
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

  async function runAction(action: "accept" | "decline") {
    if (!booking) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/pandit/bookings/${booking.id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: action === "decline" ? JSON.stringify({ reason: rejectReason }) : undefined,
      });
      if (!res.ok) throw new Error("Action fail ho gaya");
      const data = await res.json();
      setBooking(data?.data?.booking ?? data?.data ?? data);
      setRejectOpen(false);
      setAcceptConfirm(false);
      if (action === "decline") {
        setTimeout(() => router.push("/?declined=1"), 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kuch galat ho gaya");
    } finally {
      setActionLoading(false);
    }
  }

  const statusInfo = useMemo(() => {
    if (!booking) return null;
    return STATUS_MAP[booking.status] ?? { label: booking.status, cls: "bg-gray-100 text-gray-600" };
  }, [booking]);

  if (loading) return (
    <div className="py-20 flex items-center justify-center">
      <span className="w-10 h-10 border-3 border-[#f09942] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="py-16 space-y-4">
      <p className="text-red-600 font-semibold">{error || "Booking nahin mili."}</p>
      <Link href="/bookings" className="text-[#f09942] font-semibold hover:underline">← Wapas</Link>
    </div>
  );

  const phoneInfo = phoneDisplay(booking.customer.phone, booking.status);
  const duration = booking.eventEndDate
    ? Math.ceil((new Date(booking.eventEndDate).getTime() - new Date(booking.eventDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  return (
    <div className="space-y-4 pb-8">
      {/* Back + Booking number */}
      <div className="flex items-center justify-between">
        <Link href="/bookings" className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-[#f09942]">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Bookings
        </Link>
        <span className="text-xs font-mono text-gray-500 bg-[#f09942]/10 px-3 py-1 rounded-full">
          #{booking.bookingNumber}
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* ── SECTION 1: PENDING ALERT ── */}
      {isPending && !expired && (
        <section className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>notification_important</span>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Nayi Booking Alert</p>
            {statusInfo && <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{booking.eventType}</h1>
          <p className="text-sm text-gray-700">
            {fmtDate(booking.eventDate)} · {booking.venueCity}
            {booking.customer.name && ` · ${booking.customer.name.split(" ")[0]} Ji`}
          </p>
          <p className="text-lg font-bold text-green-700">
            Estimated Earning: {fmtRupees(booking.panditPayout || applicableTotal)}
          </p>
          <CountdownTimer createdAt={booking.createdAt} onExpired={() => setExpired(true)} />
        </section>
      )}

      {expired && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-center">
          <p className="text-red-700 font-bold">Yeh request expire ho gayi.</p>
          <p className="text-red-600 text-sm mt-1">Admin ko reassign kar rahe hain...</p>
          <Link href="/" className="inline-block mt-3 text-sm text-[#f09942] font-semibold hover:underline">Dashboard par Jaain</Link>
        </div>
      )}

      {/* Non-pending header */}
      {!isPending && (
        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{booking.eventType}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{fmtDate(booking.eventDate)} · {booking.venueCity}</p>
            </div>
            {statusInfo && <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span>}
          </div>
        </section>
      )}

      {/* ── SECTION 2: EVENT DETAILS ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Event Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Puja</p>
            <p className="font-semibold text-gray-900">{booking.eventType}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Date</p>
            <p className="font-semibold text-gray-900">{fmtDate(booking.eventDate)}</p>
          </div>
          {booking.muhuratTime && (
            <div>
              <p className="text-gray-400 text-xs">Shubh Muhurat</p>
              <p className="font-semibold text-[#f09942]">Subah {booking.muhuratTime}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs">Duration</p>
            <p className="font-semibold text-gray-900">{duration} din</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Venue</p>
            <p className="font-semibold text-gray-900">
              {isPending ? booking.venueCity : `${booking.venueAddress}, ${booking.venueCity}`}
            </p>
          </div>
          {booking.guestCount && (
            <div>
              <p className="text-gray-400 text-xs">Mehman</p>
              <p className="font-semibold text-gray-900">{booking.guestCount} log</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs">Customer</p>
            <p className="font-semibold text-gray-900">
              {booking.customer.name ? `${booking.customer.name.split(" ")[0]} Ji` : "Customer"}
              {booking.customer.rating && <span className="text-yellow-500 ml-1">★ {booking.customer.rating}</span>}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Gotra</p>
            <p className="font-semibold text-gray-900">{booking.customer.customerProfile?.gotra || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Phone</p>
            <p className={`font-semibold ${phoneInfo.masked ? "text-gray-400" : "text-gray-900"}`}>
              {phoneInfo.text}
            </p>
            {!phoneInfo.masked && (
              <a href={`tel:${booking.customer.phone}`} className="text-xs text-[#f09942] font-semibold">Call Karen</a>
            )}
          </div>
        </div>
        {booking.specialInstructions && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <strong>Special Instructions:</strong> {booking.specialInstructions}
          </div>
        )}
      </section>

      {/* ── SECTION 3: SAMAGRI CHOICE ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Samagri Choice</h2>
        {booking.samagriPreference === "PANDIT_BRINGS" ? (
          <div className="rounded-xl border-2 border-[#f09942] bg-[#f09942]/5 p-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f09942] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
              <span className="text-sm font-bold text-[#f09942]">
                Pandit Ji ka Package: {booking.samagriPackageTier} — {fmtRupees(booking.samagriAmount)}
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-1">Is package ki full price milegi ✓</p>
          </div>
        ) : booking.samagriPreference === "CUSTOMER_ARRANGES" ? (
          <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
              <span className="text-sm font-bold text-blue-700">Platform Custom List</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">Customer apni samagri khud manage karegi. Aapki samagri earning: ₹0 (sirf dakshina + travel + food allowance)</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
            Customer ko samagri arrange karne mein help chahiye. Platform handle karega.
          </div>
        )}
      </section>

      {/* ── SECTION 4: FOOD ALLOWANCE ── */}
      {booking.foodAllowanceDays > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Bhojan Bhatta (Food Allowance)</h2>
          <div className="space-y-1.5">
            {(booking.travelDays ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">यात्रा के दिन ({booking.travelDays} दिन)</span>
                <span className="font-semibold text-green-700">{fmtRupees((booking.travelDays ?? 0) * 1000)}</span>
              </div>
            )}
            {(booking.pujaDaysWithAllowance ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">पूजा के दिन ({booking.pujaDaysWithAllowance} दिन, meals not provided)</span>
                <span className="font-semibold text-green-700">{fmtRupees((booking.pujaDaysWithAllowance ?? 0) * 1000)}</span>
              </div>
            )}
            {booking.foodArrangement === "CUSTOMER_PROVIDES" && (
              <p className="text-xs text-gray-500">Customer puja ke din bhojan denge — food allowance nahin</p>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mt-2">
              <span className="text-gray-700">कुल भत्ता</span>
              <span className="text-green-700">{fmtRupees(booking.foodAllowanceAmount)}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 5: EARNINGS BREAKDOWN ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Aapki Kamai</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Scenario A — with samagri */}
          <div className={`rounded-xl border-2 p-3 space-y-1.5 ${booking.samagriPreference === "PANDIT_BRINGS" ? "border-[#f09942] bg-[#f09942]/5" : "border-gray-100 bg-gray-50 opacity-70"}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-[#f09942]">Scenario A — Pandit Package</p>
            <Row label="Dakshina" val={fmtRupees(booking.dakshinaAmount)} />
            <Row label="Platform Fee (15%)" val={`−${fmtRupees(booking.platformFee)}`} neg />
            <Row label="Net Dakshina" val={fmtRupees(netDakshina)} />
            <Row label="Samagri Earnings" val={fmtRupees(booking.samagriAmount)} />
            <Row label="Travel Reimbursement" val={fmtRupees(booking.travelCost)} />
            <Row label="Food Allowance" val={fmtRupees(booking.foodAllowanceAmount)} />
            <div className="h-px bg-[#f09942]/30 my-1" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[#f09942]">Total Earning</span>
              <span className="text-[#f09942]">{fmtRupees(scenarioATotal)}</span>
            </div>
          </div>

          {/* Scenario B — without samagri */}
          <div className={`rounded-xl border-2 p-3 space-y-1.5 ${booking.samagriPreference !== "PANDIT_BRINGS" ? "border-blue-300 bg-blue-50" : "border-gray-100 bg-gray-50 opacity-70"}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Scenario B — Platform List</p>
            <Row label="Dakshina" val={fmtRupees(booking.dakshinaAmount)} />
            <Row label="Platform Fee (15%)" val={`−${fmtRupees(booking.platformFee)}`} neg />
            <Row label="Net Dakshina" val={fmtRupees(netDakshina)} />
            <Row label="Samagri Earnings" val="₹0" />
            <Row label="Travel Reimbursement" val={fmtRupees(booking.travelCost)} />
            <Row label="Food Allowance" val={fmtRupees(booking.foodAllowanceAmount)} />
            <div className="h-px bg-blue-200 my-1" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-blue-700">Total Earning</span>
              <span className="text-blue-700">{fmtRupees(scenarioBTotal)}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500">Note: Travel amount final hogi jab admin travel book karegi.</p>
      </section>

      {/* ── SECTION 6: TRAVEL PREVIEW ── */}
      {booking.isOutstation && (
        <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Yatra ki Jankari</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Travel Mode</p>
              <p className="font-semibold">{booking.travelMode || "Admin arrange karegi"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Accommodation</p>
              <p className="font-semibold">{
                booking.accommodationArrangement === "CUSTOMER_ARRANGES" ? "Customer arrange karegi" :
                booking.accommodationArrangement === "PLATFORM_BOOKS" ? "Platform book karegi" :
                "Not needed"
              }</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
            Platform aapki yatra arrange karegi. Ticket/booking amount pandit wallet mein credit ki jayegi.
          </p>
        </section>
      )}

      {/* ── ACCEPT / DECLINE ZONE ── */}
      {isPending && !expired && (
        <section className="space-y-3">
          <button
            onClick={() => setAcceptConfirm(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Accept Karein
          </button>
          <button
            onClick={() => setRejectOpen(true)}
            className="w-full border-2 border-red-400 text-red-600 font-bold py-4 rounded-xl text-base hover:bg-red-50 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">cancel</span>
            Decline Karein
          </button>
        </section>
      )}

      {/* Active booking actions */}
      {isActive && (
        <div className="flex gap-3">
          <Link href={`/bookings/${booking.id}/live-tracking`} className="flex-1">
            <span className="block w-full bg-[#f09942] text-white font-bold py-3.5 rounded-xl text-center text-sm">
              I&apos;m Here Updates →
            </span>
          </Link>
        </div>
      )}

      {booking.status === "COMPLETED" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <span className="material-symbols-outlined text-green-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          <p className="text-green-700 font-bold mt-1">Puja Sampann! 🙏</p>
          <p className="text-xs text-green-600 mt-1">Payment 24 ghante mein aayegi.</p>
        </div>
      )}

      {/* ── ACCEPT CONFIRM MODAL ── */}
      {acceptConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Booking Accept Karein?</h3>
            <p className="text-sm text-gray-600">
              Kya aap <strong>{booking.eventType}</strong> ki booking accept karna chahte hain?<br />
              Date: {fmtDate(booking.eventDate)}<br />
              Estimated Earning: {fmtRupees(applicableTotal)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAcceptConfirm(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl">
                Wapas
              </button>
              <button onClick={() => void runAction("accept")} disabled={actionLoading}
                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-1">
                {actionLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Haan, Accept Karein"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DECLINE MODAL ── */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Decline Karein</h3>
              <button onClick={() => setRejectOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-gray-600">Kripya decline karne ki wajah batayein:</p>
            <div className="space-y-2">
              {REJECT_REASONS.map((r) => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${rejectReason === r ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
                  <input type="radio" name="reason" value={r} checked={rejectReason === r}
                    onChange={() => setRejectReason(r)} className="text-red-500" />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectOpen(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl">Wapas</button>
              <button onClick={() => void runAction("decline")} disabled={actionLoading}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-1">
                {actionLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Decline Karein"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, val, neg }: { label: string; val: string; neg?: boolean }) {
  return (
    <div className="flex justify-between text-xs text-gray-600">
      <span>{label}</span>
      <span className={neg ? "text-red-600" : "text-gray-800 font-medium"}>{val}</span>
    </div>
  );
}
