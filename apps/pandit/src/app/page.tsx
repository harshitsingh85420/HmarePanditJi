"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useBookingPolling } from "../hooks/useBookingPolling";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const REQUEST_WINDOW = 6 * 60 * 60; // 6 hours in seconds

function getToken() {
  return (
    localStorage.getItem("hpj_pandit_token") ||
    localStorage.getItem("hpj_pandit_access_token") ||
    localStorage.getItem("token")
  );
}

function fmtRupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function relativeDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aaj";
  if (diff === 1) return "Kal";
  if (diff === -1) return "Kal tha";
  if (diff > 0) return `${diff} din baad`;
  return `${Math.abs(diff)} din pehle`;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Countdown Timer component ──────────────────────────────────────────────
function CountdownTimer({ createdAt, onExpired }: { createdAt: string; onExpired: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const expiredRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const end = new Date(createdAt).getTime() + REQUEST_WINDOW * 1000;
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setSeconds(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpired();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt, onExpired]);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const label = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const isUrgent = seconds <= 3600;

  return (
    <p className={`text-sm font-bold font-mono ${isUrgent ? "text-red-600" : "text-amber-700"}`}>
      ⏱ Sweekar karne ka samay: {label}
    </p>
  );
}

// ── Interfaces ────────────────────────────────────────────────────────────
interface PendingRequest {
  id: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  venueCity: string;
  venueArea?: string;
  createdAt: string;
  estimatedEarning?: number;
  customer?: { name?: string; rating?: number };
}

interface Booking {
  id: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  venueCity: string;
  venueAddress?: string;
  status: string;
  customer?: { name?: string };
  dakshinaAmount?: number;
  panditPayout?: number;
}

interface EarningsSummary {
  thisMonthTotal: number;
  pendingPayout: number;
  lastPayoutAmount: number;
  lastPayoutDate: string;
}

interface Stats {
  totalBookingsAllTime: number;
  averageRating: number;
  completionRate: number;
  totalReviews: number;
}

interface DashboardData {
  pandit: {
    name: string;
    verificationStatus: string;
    profileCompletionPercent: number;
    isOnline: boolean;
  };
  todaysBooking: Booking | null;
  upcomingBookings: Booking[];
  pendingRequests: PendingRequest[];
  earningsSummary: EarningsSummary;
  stats: Stats;
}

const MOCK_DATA: DashboardData = {
  pandit: { name: "Pandit Ji", verificationStatus: "DOCUMENTS_SUBMITTED", profileCompletionPercent: 80, isOnline: true },
  todaysBooking: null,
  upcomingBookings: [],
  pendingRequests: [],
  earningsSummary: { thisMonthTotal: 0, pendingPayout: 0, lastPayoutAmount: 0, lastPayoutDate: "" },
  stats: { totalBookingsAllTime: 0, averageRating: 0, completionRate: 0, totalReviews: 0 },
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function PanditDashboard() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [expiredIds, setExpiredIds] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const fetchDashboard = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/pandit/dashboard-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const dashData: DashboardData = json?.data ?? json;
      setData(dashData);
      setPendingRequests(dashData.pendingRequests ?? []);
    } catch {
      // use mock
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();

    // Check if first login after onboarding
    const tutorialSeen = localStorage.getItem("hpj_tutorial_seen");
    if (!tutorialSeen) {
      const onboardingDone = localStorage.getItem("hpj_onboarding_complete");
      if (onboardingDone) {
        setShowTutorial(true);
      }
    }
  }, [fetchDashboard]);

  // Polling hook for new requests
  useBookingPolling({
    onNewRequests: (requests) => {
      setPendingRequests(requests);
    },
    enabled: true,
  });

  const handleExpired = useCallback((id: string) => {
    setExpiredIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    }, 3000);
  }, []);

  const activePendingRequests = pendingRequests.filter((r) => !expiredIds.has(r.id));

  const verificationStatus = data.pandit.verificationStatus;
  const isVerified = verificationStatus === "VERIFIED";

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("hpj_tutorial_seen", "true");
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <span className="w-10 h-10 border-3 border-[#f09942] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Dashboard load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── TUTORIAL OVERLAY ─────────────────────────────────────────── */}
      {showTutorial && (
        <TutorialOverlay
          step={tutorialStep}
          onNext={() => setTutorialStep((s) => Math.min(s + 1, 4))}
          onPrev={() => setTutorialStep((s) => Math.max(s - 1, 0))}
          onClose={closeTutorial}
        />
      )}

      {/* ── VERIFICATION BANNER ──────────────────────────────────────── */}
      {!isVerified && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 text-xl mt-0.5 flex-shrink-0">pending</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Aapka profile verify ho raha hai</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Team 24–48 ghanton mein verify karegi. Verify hone ke baad aap bookings receive karenge.
            </p>
          </div>
          <Link href="/profile#documents" className="text-xs text-amber-700 font-semibold underline whitespace-nowrap">
            Documents Dekhein
          </Link>
        </div>
      )}

      {/* ── SECTION A: URGENT — PENDING BOOKING REQUESTS ─────────────── */}
      {activePendingRequests.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-amber-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              notification_important
            </span>
            <h2 className="text-lg font-bold text-gray-900">Nayi Booking Aayi Hai!</h2>
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activePendingRequests.length} Request{activePendingRequests.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {activePendingRequests.slice(0, 2).map((req) => {
              const isExpiredCard = expiredIds.has(req.id);
              return (
                <div
                  key={req.id}
                  className={`rounded-xl border-2 p-4 ${
                    isExpiredCard
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : "border-amber-400 bg-amber-50 animate-pulse-border"
                  }`}
                  style={
                    !isExpiredCard
                      ? { animation: "pulseBorder 2s ease-in-out infinite" }
                      : {}
                  }
                >
                  {isExpiredCard ? (
                    <p className="text-sm font-semibold text-red-600">
                      Yeh request expire ho gayi. Admin ko reassign kar rahe hain...
                    </p>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{req.eventType}</p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {fmtDate(req.eventDate)}{" "}
                            <span className="text-amber-700 font-medium">({relativeDate(req.eventDate)})</span>
                          </p>
                        </div>
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                          Nayi Request
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {req.venueCity}
                        </span>
                        {req.customer?.name && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {req.customer.name.split(" ")[0]} Ji
                          </span>
                        )}
                      </div>

                      {req.estimatedEarning && (
                        <p className="text-base font-bold text-green-700 mb-2">
                          Estimated Earning: {fmtRupees(req.estimatedEarning)}
                        </p>
                      )}

                      <CountdownTimer
                        createdAt={req.createdAt}
                        onExpired={() => handleExpired(req.id)}
                      />

                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/bookings/${req.id}`}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-2.5 rounded-xl text-center transition-colors"
                        >
                          Accept Karein
                        </Link>
                        <Link
                          href={`/bookings/${req.id}`}
                          className="flex-1 border-2 border-red-300 text-red-600 font-bold text-sm py-2.5 rounded-xl text-center hover:bg-red-50 transition-colors"
                        >
                          Details Dekhein
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {activePendingRequests.length > 2 && (
              <Link href="/bookings" className="block text-center text-sm font-semibold text-amber-700 hover:underline">
                Aur {activePendingRequests.length - 2} requests dekhein →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── SECTION B: TODAY'S SCHEDULE ──────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f09942] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>today</span>
            <h2 className="text-base font-bold text-gray-900">
              Aaj ka Schedule —{" "}
              <span className="text-[#f09942]">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
              </span>
            </h2>
          </div>
          <Link href="/calendar" className="text-xs font-semibold text-[#f09942] hover:underline">
            Calendar →
          </Link>
        </div>

        <div className="p-4">
          {data.todaysBooking ? (
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center min-w-[56px] bg-[#f09942]/10 rounded-lg py-2 px-1 text-center">
                <span className="text-[#f09942] font-bold text-base leading-none">
                  {fmtTime(data.todaysBooking.eventDate)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{data.todaysBooking.eventType}</p>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {data.todaysBooking.venueCity}
                </p>
                {data.todaysBooking.customer?.name && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm">person</span>
                    {data.todaysBooking.customer.name.split(" ")[0]} Ji
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {data.todaysBooking.venueAddress && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(data.todaysBooking.venueAddress + " " + data.todaysBooking.venueCity)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-[#f09942] border border-[#f09942] rounded-lg px-3 py-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">navigation</span>
                    Nakshe
                  </a>
                )}
                <Link
                  href={`/bookings/${data.todaysBooking.id}`}
                  className="text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 text-center"
                >
                  Details
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-4xl text-gray-200">event_available</span>
              <p className="text-gray-400 text-sm mt-2">Aaj koi booking nahin hai</p>
              <p className="text-gray-300 text-xs mt-1">Aaram karein ya online rahein</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION C: EARNINGS WIDGET ───────────────────────────────── */}
      <section
        className="rounded-xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f09942, #dc6803)" }}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/80 text-sm font-medium">Is Mahine ki Kamai</p>
            <span className="material-symbols-outlined text-white/60 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <p className="text-white text-3xl font-bold">
            {fmtRupees(data.earningsSummary.thisMonthTotal)}
          </p>
          <p className="text-white/70 text-xs mt-1">
            {data.stats.totalBookingsAllTime} bookings aaj tak
          </p>
          {data.earningsSummary.pendingPayout > 0 && (
            <p className="text-white/80 text-sm mt-2">
              Pending payout: <span className="font-bold text-white">{fmtRupees(data.earningsSummary.pendingPayout)}</span>
            </p>
          )}
          <Link
            href="/earnings"
            className="inline-flex items-center gap-1 mt-3 bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors"
          >
            Poori Kamai Dekhein
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ── SECTION D: QUICK STATS ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-yellow-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <p className="text-xs text-gray-500 font-medium">Rating</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{data.stats.totalReviews} reviews</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-green-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            <p className="text-xs text-gray-500 font-medium">Completed</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.stats.totalBookingsAllTime}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total bookings</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#f09942] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>percent</span>
            <p className="text-xs text-gray-500 font-medium">Completion</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.stats.completionRate > 0 ? `${data.stats.completionRate}%` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Completion rate</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
            <p className="text-xs text-gray-500 font-medium">Pending</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activePendingRequests.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Requests waiting</p>
        </div>
      </div>

      {/* ── SECTION E: UPCOMING BOOKINGS ─────────────────────────────── */}
      {data.upcomingBookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Aane Wali Bookings</h2>
            <Link href="/bookings" className="text-xs font-semibold text-[#f09942] hover:underline">
              Sabhi Dekhein →
            </Link>
          </div>
          <div className="space-y-2">
            {data.upcomingBookings.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 hover:border-[#f09942]/40 transition-colors"
              >
                <div className="flex flex-col items-center min-w-[44px] text-center">
                  <p className="text-xs font-bold text-[#f09942]">
                    {new Date(b.eventDate).toLocaleDateString("en-IN", { month: "short" })}
                  </p>
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {new Date(b.eventDate).getDate()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{b.eventType}</p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {b.venueCity}
                    {b.customer?.name && ` · ${b.customer.name.split(" ")[0]} Ji`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <BookingStatusBadge status={b.status} />
                  {b.panditPayout ? (
                    <p className="text-xs font-bold text-green-700">{fmtRupees(b.panditPayout)}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state if no activity */}
      {data.upcomingBookings.length === 0 && activePendingRequests.length === 0 && !data.todaysBooking && (
        <div className="text-center py-10">
          <span className="material-symbols-outlined text-5xl text-gray-200">auto_awesome</span>
          <p className="text-gray-500 font-medium mt-3">
            {isVerified ? "Koi upcoming booking nahin hai" : "Verification ke baad bookings aayengi"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Online rahein — bookings milti rahein</p>
        </div>
      )}

      {/* Replay tutorial button */}
      <button
        onClick={() => { setTutorialStep(0); setShowTutorial(true); }}
        className="fixed bottom-20 md:bottom-6 right-4 w-12 h-12 rounded-full bg-[#f09942] text-white shadow-lg flex items-center justify-center hover:bg-[#dc6803] transition-colors z-20"
        title="Tutorial replay karein"
      >
        <span className="material-symbols-outlined text-xl">help</span>
      </button>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────
function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PANDIT_REQUESTED: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: "Confirmed", cls: "bg-blue-100 text-blue-700" },
    PANDIT_EN_ROUTE: { label: "En Route", cls: "bg-purple-100 text-purple-700" },
    PANDIT_ARRIVED: { label: "Arrived", cls: "bg-indigo-100 text-indigo-700" },
    PUJA_IN_PROGRESS: { label: "In Progress", cls: "bg-orange-100 text-orange-700" },
    COMPLETED: { label: "Complete", cls: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  };
  const info = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${info.cls}`}>
      {info.label}
    </span>
  );
}

// ── Tutorial Overlay ───────────────────────────────────────────────────────
const TUTORIAL_SCREENS = [
  {
    title: "GO ONLINE / GO OFFLINE Button",
    icon: "toggle_on",
    content:
      "Is button se aap booking receive kar sakte hain ya band kar sakte hain. Jab aap online ho, tabhi nayi booking aayegi. Hamesha online rahein jab aap available ho.",
    voiceText:
      "Yeh toggle aapki availability control karta hai. Online rahein — booking aayegi.",
  },
  {
    title: "Nayi Booking — 6 Ghante Ka Timer",
    icon: "alarm",
    content:
      "Nayi booking aane par amber card dikhega. 6 ghante mein jawab dena hoga. Timer red hota hai jab 1 ghanta bachta hai. Time khatam hone par request automatically expire ho jaati hai.",
    voiceText:
      "Booking request aane par yeh card dikhega. 6 ghante mein Accept ya Decline karein.",
  },
  {
    title: "Booking Detail — Pura Hisaab",
    icon: "receipt_long",
    content:
      "Har booking mein pura hisaab dikhega — dakshina, platform fee, travel, food allowance, aur total jo aapko milega. Samagri choice bhi clearly dikhega.",
    voiceText:
      "Har booking mein aapki poori kamai ka hisaab dikhega.",
  },
  {
    title: "'Main Aa Gaya' Buttons — Live Status",
    icon: "where_to_vote",
    content:
      "Journey shuru karte samay 'Yatra Shuru', venue pahunchne par 'Main Pahuncha', puja shuru par 'Puja Shuru' button dabayein. Isse customer ko real-time update milti hai.",
    voiceText:
      "Har status update se customer ko SMS jayega.",
  },
  {
    title: "Aapki Kamai aur Calendar",
    icon: "savings",
    content:
      "Earnings section mein har mahine ki kamai dekhein. Calendar mein chhuttiyaan block karein taaki us din booking na aaye.",
    voiceText:
      "Kamai aur calendar section — aapka financial dashboard.",
  },
];

function TutorialOverlay({
  step,
  onNext,
  onPrev,
  onClose,
}: {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  const screen = TUTORIAL_SCREENS[step];
  const isLast = step === TUTORIAL_SCREENS.length - 1;

  const speakText = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(screen.voiceText);
    u.lang = "hi-IN";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
        {/* Skip */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs text-gray-400 hover:text-gray-700 font-semibold"
        >
          Skip Tutorial
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#f09942]/10 flex items-center justify-center mx-auto mb-4">
          <span
            className="material-symbols-outlined text-[#f09942] text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {screen.icon}
          </span>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-4">
          {TUTORIAL_SCREENS.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-[#f09942]" : "bg-gray-200"}`}
            />
          ))}
        </div>

        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{screen.title}</h3>
        <p className="text-sm text-gray-600 text-center leading-relaxed mb-4">{screen.content}</p>

        {/* Voice button */}
        <button
          onClick={speakText}
          className="flex items-center gap-2 mx-auto mb-4 bg-[#f09942]/10 text-[#f09942] text-xs font-semibold px-3 py-1.5 rounded-full"
        >
          <span className="material-symbols-outlined text-sm">volume_up</span>
          Suniye
        </button>

        {/* Navigation */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={onPrev}
              className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm"
            >
              ← Pehle
            </button>
          )}
          {isLast ? (
            <button
              onClick={onClose}
              className="flex-1 bg-[#f09942] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#dc6803] transition-colors"
            >
              Shuru Karein! 🙏
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex-1 bg-[#f09942] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#dc6803] transition-colors"
            >
              Aage →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
