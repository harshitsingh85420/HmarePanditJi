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
import { VoiceActionListener } from "@/components/voice/VoiceActionListener";
import { PanchangStrip } from "@/components/moments/PanchangStrip";
import { FestivalBanner } from "@/components/moments/FestivalBanner";
import { PragatiCard } from "@/components/moments/PragatiCard";
import { CelebrationScreen } from "@/components/moments/CelebrationScreen";
import { milestoneLabel, milestoneEmoji } from "@/components/moments/PragatiCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActiveFestival, isFestivalDay } from "@/lib/festivals2026";
import { playBell, playChime } from "@/lib/sounds";
import { FirstUseTip } from "@/components/moments/FirstUseTip";

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
  const [tomorrowBookings, setTomorrowBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary>({
    today: 0,
    month: 0,
    pendingPayout: 0,
  });

  // Polling Alerts State
  const [newRequestBooking, setNewRequestBooking] = useState<Booking | null>(null);

  // Milestones (dignity-first pragati)
  const [milestones, setMilestones] = useState<Array<{ kind: string }>>([]);
  const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);

  // Toast / Error Notifications
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
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
    setMilestones(meRes.data.milestones || []);
    const unseen = meRes.data.unseenMilestones || [];
    if (unseen.length > 0) {
      setCelebratingMilestone(unseen[0].kind);
      playChime();
    }

    // 2. Today's + tomorrow's bookings
    const bookingsRes = await api("/pandit/bookings?date=today");
    if (bookingsRes.success) {
      setTodayBookings(bookingsRes.data);
    }
    const allRes = await api("/pandit/bookings");
    if (allRes.success && Array.isArray(allRes.data)) {
      const tmr = new Date();
      tmr.setDate(tmr.getDate() + 1);
      setTomorrowBookings(
        (allRes.data as Booking[]).filter((b) => {
          const d = new Date(b.eventDate);
          return (
            d.getFullYear() === tmr.getFullYear() &&
            d.getMonth() === tmr.getMonth() &&
            d.getDate() === tmr.getDate()
          );
        }),
      );
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
        playBell();
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
    const isApproved =
      profile?.panditProfile?.verificationStatus === "APPROVED" ||
      profile?.panditProfile?.verificationStatus === "VERIFIED";
    if (!isApproved) {
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

  // Greeting name: skip honorific prefixes like "Pt." / "पं." so the header
  // reads "नमस्ते, Ramesh जी" rather than "नमस्ते, Pt. जी"
  const nameParts: string[] = (profile?.name || "").split(" ").filter((w: string) => !/^(pt\.?|पं\.?|pandit|पंडित)$/i.test(w));
  const firstName = nameParts[0] || "पंडित";
  const isPending = profile?.panditProfile?.verificationStatus === "PENDING";
  const isApproved =
    profile?.panditProfile?.verificationStatus === "APPROVED" ||
    profile?.panditProfile?.verificationStatus === "VERIFIED";
  const isRejected = profile?.panditProfile?.verificationStatus === "REJECTED";

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const activeFestival = getActiveFestival();
  const festivalLine = activeFestival
    ? ` ${activeFestival.name} ${hi.festival.greeting}। ${hi.festival.hint}`
    : "";
  const todaySummary =
    todayBookings.length === 0
      ? hi.homeSummary.none
      : todayBookings.length === 1
      ? hi.homeSummary.one.replace("{time}", formatTime(todayBookings[0].eventDate))
      : hi.homeSummary.many.replace("{count}", String(todayBookings.length));
  const welcomeSpeakText = (isOnline
    ? "आप अभी ऑनलाइन हैं। नई बुकिंग के लिए तैयार रहें।"
    : "आप अभी ऑफलाइन हैं। काम शुरू करने के लिए ऑनलाइन जाएं।") + " " + todaySummary + festivalLine;

  const voiceCommands = [
    {
      keywords: ["ऑनलाइन", "online", "चालू", "chalu"],
      action: async () => {
        if (!isOnline) {
          await handleToggleStatus();
        }
      },
    },
    {
      keywords: ["ऑफलाइन", "offline", "बंद", "band"],
      action: async () => {
        if (isOnline) {
          await handleToggleStatus();
        }
      },
    },
    { keywords: ["बुकिंग", "booking"], action: () => router.push("/bookings") },
    { keywords: ["कमाई", "kamai", "earnings"], action: () => router.push("/earnings") },
    { keywords: ["मदद", "help", "sahayata"], action: () => router.push("/help") },
  ];

  const HomeHeaderRightSlot = () => (
    <button
      onClick={() => router.push("/settings")}
      className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white shadow-card hover:bg-saffron-50 active:scale-90 flex items-center justify-center text-[18px] transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
      aria-label="Settings"
    >
      ⚙️
    </button>
  );

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* HEADER */}
      <Header
        title={<span className="font-display font-normal">{isFestivalDay() && <span className="animate-diya-sm mr-1" role="img" aria-hidden="true">🪔</span>}{`नमस्ते, ${firstName} जी`}</span>}
        showBack={false}
        rightSlot={<HomeHeaderRightSlot />}
      />

      {/* Voice commands listener */}
      <VoiceActionListener
        commands={voiceCommands}
        narratingText={welcomeSpeakText}
        promptText={welcomeSpeakText}
      />

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

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-6 flex flex-col gap-3 page-enter">
        {/* PANCHANG STRIP */}
        <PanchangStrip />

        {/* FESTIVAL BANNER (auto-hidden when no festival near) */}
        <FestivalBanner />

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

        {/* REJECTED VERIFICATION BANNER */}
        {isRejected && (
          <>
            <SpeakOnMount text={`${hi.home.rejectedTitle}。 ${profile?.panditProfile?.rejectionReason || ""}`} />
            <div className="bg-red-50 border-2 border-red-300 rounded-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[24px]">❌</span>
                <div className="flex flex-col">
                  <span className="text-[18px] font-bold text-red-800 font-hindi">
                    {hi.home.rejectedTitle}
                  </span>
                  <span className="text-[16px] text-red-700 font-hindi mt-1 leading-snug">
                    {profile?.panditProfile?.rejectionReason || "जानकारी में कुछ त्रुटि है।"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  router.push("/onboarding?step=6");
                }}
                className="w-full min-h-[56px] text-[18px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-btn transition active:scale-[0.98] flex items-center justify-center"
                style={{ minHeight: "56px" }}
              >
                {hi.home.resubmit}
              </button>
            </div>
          </>
        )}

        {/* STATUS TOGGLE BUTTON */}
        <FirstUseTip tipId="homeGoOnline" targetRef={toggleRef} />
        <button
          ref={toggleRef}
          onClick={handleToggleStatus}
          disabled={!isApproved}
          className={`w-full h-20 rounded-btn flex items-center justify-center font-bold text-[22px] font-hindi shadow-md transition-all active:scale-[0.98] ${
            !isApproved
              ? "bg-slate-200 text-softgrey cursor-not-allowed"
              : isOnline
              ? "bg-leaf-700 hover:bg-leaf-800 text-white online-glow"
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
            <EmptyState
              emoji="🌤️"
              title={hi.empty.todayNoBookingsTitle}
              hint={hi.empty.todayNoBookingsHint}
              className="shadow-none py-8"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {todayBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() =>
                    router.push(b.status === "REQUESTED" ? `/bookings/${b.id}/request` : `/bookings/${b.id}`)
                  }
                  className={`p-3 border-b border-slate-50 last:border-0 flex items-center justify-between cursor-pointer active:bg-slate-50 active:scale-[0.97] transition-transform rounded-btn border-l-4 ${
                    b.status === "COMPLETED" ? "border-l-leaf-700" :
                    b.status === "REQUESTED" ? "border-l-saffron-500" :
                    "border-l-sky-500"
                  }`}
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

        {/* TOMORROW'S BOOKINGS */}
        {tomorrowBookings.length > 0 && (
          <Card className="p-4 bg-white border border-saffron-100 flex flex-col gap-3">
            <h3 className="text-[18px] font-bold text-temple-600 font-hindi border-b border-saffron-100 pb-2">
              {hi.homeSummary.tomorrow}
            </h3>
            <div className="flex flex-col gap-3">
              {tomorrowBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => router.push(`/bookings/${b.id}`)}
                  className="p-3 border-b border-slate-50 last:border-0 flex items-center justify-between cursor-pointer active:bg-slate-50 active:scale-[0.97] transition-transform rounded-btn border-l-4 border-l-sky-500"
                >
                  <div className="flex flex-col">
                    <span className="text-[26px] font-bold text-ink leading-tight font-mono">
                      {formatTime(b.eventDate)}
                    </span>
                    <span className="text-[18px] font-bold text-temple-700 font-hindi leading-snug mt-1">
                      {b.pujaType || b.eventType}
                    </span>
                    <span className="text-[16px] text-softgrey font-hindi truncate max-w-[240px]">
                      {b.venueAddress?.split(",")[0]}
                    </span>
                  </div>
                  <StatusChip status={b.status} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* EARNINGS SUMMARY WIDGET */}
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[18px] font-bold text-softgrey font-hindi">
              {hi.home.monthEarnings}
            </span>
            {/* Monthly earnings big ₹ figure */}
            <span className="t-money-hero leading-tight">
              ₹{earnings.month ? earnings.month.toLocaleString("en-IN") : "0"}
            </span>
          </div>

          <div className="border-t border-saffron-100/50 pt-3 flex justify-between items-center px-2">
            <span className="text-[18px] font-semibold text-softgrey font-hindi">
              {hi.earnings.pendingPayout}
            </span>
            <span className="text-[20px] font-display text-leaf-700">
              ₹{earnings.pendingPayout ? earnings.pendingPayout.toLocaleString("en-IN") : "0"}
            </span>
          </div>
        </Card>

        {/* PRAGATI (PROGRESS) CARD */}
        <PragatiCard earnedKinds={milestones.map((m) => m.kind)} />

        {/* SAMAGRI PACKAGES LINK */}
        <Card
          className="p-4 bg-white border border-saffron-100 cursor-pointer min-h-[56px] flex items-center justify-center text-center"
          onClick={() => router.push("/samagri")}
        >
          <span className="text-[20px] font-bold text-ink font-hindi">
            {hi.home.samagriLink}
          </span>
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

      {/* MILESTONE CELEBRATION */}
      {celebratingMilestone && (
        <CelebrationScreen
          emoji={milestoneEmoji(celebratingMilestone)}
          title={hi.milestones.title}
          message={milestoneLabel(celebratingMilestone)}
          ctaLabel={hi.common.next}
          onCta={async () => {
            setCelebratingMilestone(null);
            await api("/pandit/milestones/seen", { method: "POST" });
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}
