"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatusChip } from "@/components/ui/StatusChip";
import { Toast } from "@/components/ui/Toast";
import { SpeakOnMount } from "@/components/VoiceBar";
import { useVoice } from "@/hooks/useVoice";
import { DiyaLoader } from "@/components/moments/DiyaLoader";

interface Booking {
  id: string;
  bookingNumber: string;
  pujaType: string;
  eventType: string;
  eventDate: string;
  venueAddress: string;
  venueCity: string;
  status: string;
}

interface EarningsSummary {
  today: number;
  month: number;
  pendingPayout: number;
}

export default function HomePage() {
  const router = useRouter();
  const { speak } = useVoice();

  // Loading/Profile States
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);

  // Widgets Data
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary>({
    today: 0,
    month: 0,
    pendingPayout: 0,
  });

  // Polling Alerts State
  const [newRequestBooking, setNewRequestBooking] = useState<Booking | null>(null);

  // Toast / Error Notifications
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const knownRequestedIdsRef = useRef<Set<string>>(new Set());

  // Fetch initial profile, earnings, and bookings
  const loadData = async () => {
    // 1. Profile
    const meRes = await api("/auth/me");
    if (!meRes.success) {
      localStorage.removeItem("pandit_token");
      router.push("/login");
      return;
    }
    const user = meRes.data.user;
    setProfile(user);
    setIsOnline(user.panditProfile?.isOnline || false);

    // 2. Today's Bookings
    const bookingsRes = await api("/pandit/bookings?date=today");
    if (bookingsRes.success) {
      setTodayBookings(bookingsRes.data);
    }

    // 3. Earnings summary
    const earningsRes = await api("/pandit/earnings/summary");
    if (earningsRes.success) {
      setEarnings(earningsRes.data);
    }

    // 4. Initialize first poll known requests
    const initialPollRes = await api("/pandit/bookings?status=REQUESTED");
    if (initialPollRes.success) {
      const currentIds = new Set<string>();
      (initialPollRes.data as Booking[]).forEach((b) => currentIds.add(b.id));
      knownRequestedIdsRef.current = currentIds;
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [router]);

  // Audio synthesizer chime beep
  const playChimeBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Chime AudioContext beep failed:", e);
    }
  };

  // Polling for NEW REQUESTED bookings every 30 seconds
  useEffect(() => {
    const runPoll = async () => {
      const res = await api("/pandit/bookings?status=REQUESTED");
      if (!res.success || !res.data) return;

      const currentRequested: Booking[] = res.data;
      let newlyDiscovered: Booking | null = null;

      // Scan for any booking ID that wasn't in our known set
      for (const b of currentRequested) {
        if (!knownRequestedIdsRef.current.has(b.id)) {
          newlyDiscovered = b;
          break;
        }
      }

      // Sync known set with all current requested items
      const updatedIds = new Set<string>();
      currentRequested.forEach((b) => updatedIds.add(b.id));
      knownRequestedIdsRef.current = updatedIds;

      // Alert if a new booking request is found
      if (newlyDiscovered) {
        playChimeBeep();
        speak(hi.booking.newRequest);
        setNewRequestBooking(newlyDiscovered);
      }
    };

    pollIntervalRef.current = setInterval(runPoll, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [speak]);

  // Status toggle handler (with optimistic updates and rollbacks)
  const handleToggleStatus = async () => {
    if (profile?.panditProfile?.verificationStatus === "PENDING") {
      return; // disabled
    }

    const previousState = isOnline;
    const targetState = !previousState;

    // Optimistic Update
    setIsOnline(targetState);

    const res = await api("/pandit/status", {
      method: "PATCH",
      body: JSON.stringify({ isOnline: targetState }),
    });

    if (!res.success) {
      // Rollback
      setIsOnline(previousState);
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
      return;
    }

    // Success announcements
    const announceMsg = targetState ? hi.home.onlineVoice : hi.home.offlineVoice;
    speak(announceMsg);
    setToastMsg(targetState ? hi.home.onlineVoice : hi.home.offlineVoice);
  };

  if (loading) {
    return <DiyaLoader />;
  }

  const firstName = profile?.name ? profile.name.split(" ")[0] : "पंडित";
  const isPending = profile?.panditProfile?.verificationStatus === "PENDING";

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-cream text-ink pb-28">
      {/* HEADER */}
      <Header title={`🙏 नमस्ते, ${firstName} जी`} showBack={false} />

      <AnimatePresence>
        {newRequestBooking && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-saffron px-4 py-3 text-center sticky top-[56px] z-40 shadow-md"
          >
            <button
              onClick={() => router.push(`/bookings/${newRequestBooking.id}/request`)}
              className="text-white text-[18px] font-bold font-hindi flex items-center justify-center gap-2 mx-auto"
              style={{ minHeight: "56px" }}
            >
              {hi.booking.viewNewBooking}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[430px] mx-auto px-4 pt-4 flex flex-col gap-4">
        {/* PENDING VERIFICATION BANNER */}
        {isPending && (
          <>
            <SpeakOnMount text={hi.home.pendingVerification} />
            <div className="bg-yellow-50 border-2 border-amber-300 rounded-card p-4 flex items-center gap-3">
              <span className="text-[24px]">⚠️</span>
              <p className="text-[18px] font-bold text-amber-800 font-hindi leading-snug">
                {hi.home.pendingVerification}
              </p>
            </div>
          </>
        )}

        {/* STATUS TOGGLE BUTTON */}
        <button
          onClick={handleToggleStatus}
          disabled={isPending}
          className={`w-full h-20 rounded-btn flex items-center justify-center font-bold text-[22px] font-hindi shadow-md transition-all active:scale-[0.98] ${
            isPending
              ? "bg-slate-200 text-softgrey cursor-not-allowed"
              : isOnline
              ? "bg-leaf-700 hover:bg-leaf-800 text-white"
              : "bg-softgrey text-white"
          }`}
          style={{ minHeight: "80px", fontSize: "22px" }}
        >
          {isOnline ? hi.home.goOffline : hi.home.goOnline}
        </button>

        {/* TODAY'S BOOKINGS SECTION */}
        <Card className="p-4 bg-white border border-saffron-100 flex flex-col gap-3">
          <h3 className="text-[18px] font-bold text-temple-600 font-hindi border-b border-saffron-100 pb-2">
            {hi.home.todayBookings}
          </h3>

          {todayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-1.5">
              <span className="text-[52px]">🌤️</span>
              <p className="text-[18px] font-bold text-softgrey font-hindi">
                {hi.home.noBookings}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {todayBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() =>
                    router.push(b.status === "REQUESTED" ? `/bookings/${b.id}/request` : `/bookings/${b.id}`)
                  }
                  className="p-3 border-b border-slate-50 last:border-0 flex items-center justify-between cursor-pointer active:bg-slate-50 rounded-btn"
                >
                  <div className="flex flex-col">
                    {/* Time (28px bold) */}
                    <span className="text-[28px] font-bold text-ink leading-tight font-mono">
                      {formatTime(b.eventDate)}
                    </span>
                    <span className="text-[18px] font-bold text-temple-700 font-hindi leading-snug mt-1">
                      {b.pujaType || b.eventType}
                    </span>
                    <span className="text-[16px] text-softgrey font-hindi truncate max-w-[240px]">
                      {b.venueAddress.split(",")[0]}
                    </span>
                  </div>
                  <StatusChip status={b.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* EARNINGS SUMMARY WIDGET */}
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[18px] font-bold text-softgrey font-hindi">
              {hi.home.monthEarnings}
            </span>
            {/* Monthly earnings big ₹ figure */}
            <span className="text-[40px] font-bold text-leaf-700 leading-tight">
              ₹{earnings.month ? earnings.month.toLocaleString("en-IN") : "0"}
            </span>
          </div>

          <div className="border-t border-saffron-100/50 pt-3 flex justify-between items-center px-2">
            <span className="text-[18px] font-semibold text-softgrey font-hindi">
              {hi.earnings.pendingPayout}
            </span>
            <span className="text-[20px] font-bold text-leaf-700 font-mono">
              ₹{earnings.pendingPayout ? earnings.pendingPayout.toLocaleString("en-IN") : "0"}
            </span>
          </div>
        </Card>
      </main>

      {/* BOTTOM NAV */}
      <BottomNav activeTab={0} onChange={(idx) => {
        if (idx === 1) router.push("/bookings");
        else if (idx === 2) router.push("/earnings"); // redirect or fallback page
        else if (idx === 3) router.push("/calendar"); // redirect or fallback page
      }} />

      {/* Global Error Display */}
      {errorMsg && (
        <div className="fixed bottom-28 left-4 right-4 z-40 px-4 py-2 bg-red-50 rounded-card border border-danger/20">
          <p className="text-danger text-[20px] font-semibold text-center leading-normal">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}
