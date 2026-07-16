"use client";

// ─────────────────────────────────────────────────────────────
// Home CONTAINER — data, voice, polling, handlers. The presentation lives
// in HomeView.tsx (mockup-match harness refactor): this container renders
// EXACTLY the tree it always did — HomeView is that tree, lifted out, with
// the voice-mounting components passed down as slots. Behavior-frozen.
// ─────────────────────────────────────────────────────────────

import { Narrate } from "@/hooks/useScreenVoice";
import { prefetchDashboardNarrations } from "@/lib/dashboardPrefetch";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { mutateOnce } from "@/lib/mutate";
import { voiceController } from "@/lib/voiceController";
import { api } from "@/lib/api";
import { setAgentUserState } from "@/lib/shishyaAgent";

import { useVoice } from "@/hooks/useVoice";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { VoiceActionListener } from "@/components/voice/VoiceActionListener";
import { getActiveFestival, isFestivalDay } from "@/lib/festivals2026";
import { playBell, playChime } from "@/lib/sounds";
import { FirstUseTip } from "@/components/moments/FirstUseTip";
import { purgeUserData } from "@/lib/purgeUserData";
import { HomeView, HomeBooking, HomeEarnings } from "./HomeView";

type Booking = HomeBooking;
type EarningsSummary = HomeEarnings;

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

  // Panchang: does TODAY have muhurat windows? (gates the शुभ-मुहूर्त chip)
  const [shubhMuhurat, setShubhMuhurat] = useState(false);

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
      // L10: force-logout ONLY on a real auth failure (401). A 5xx / timeout
      // / network error (e.g. a Render cold-start) must NOT eject a pandit
      // holding a valid token — surface a retryable error instead of wiping.
      if (meRes.status === 401) {
        purgeUserData();
        router.push("/login");
        return;
      }
      setErrorMsg(t("common.error"));
      setLoading(false);
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

    // 5. Panchang chip: is TODAY a muhurat day? (existing public endpoint;
    // truthful-by-construction — the chip shows only when rows exist)
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const muhuratRes = await api(`/muhurat/pujas-for-date?date=${todayKey}`);
    if (muhuratRes.success && Array.isArray(muhuratRes.data?.muhurats)) {
      setShubhMuhurat(muhuratRes.data.muhurats.length > 0);
    }

    setLoading(false);
  };

  // Q10: warm the dashboard's narration lines once per visit
  useEffect(() => {
    prefetchDashboardNarrations();
  }, []);

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
        speak(t("booking.newRequest"));
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

  // W3: शिष्य sees what the pandit sees — push the home snapshot
  useEffect(() => {
    if (!profile) return;
    const parts: string[] = (profile?.name || "")
      .split(" ")
      .filter((w: string) => !/^(pt\.?|पं\.?|pandit|पंडित)$/i.test(w));
    setAgentUserState({
      firstName: parts[0] || undefined,
      isOnline,
      isBookingReady: profile?.panditProfile?.isBookingReady === true,
      readinessStep: profile?.panditProfile?.readinessStep || 0,
      pendingBookingsCount: knownRequestedIdsRef.current.size,
    });
  }, [profile, isOnline]);

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

    const res = await mutateOnce(`toggle-status:${targetState}`, "/pandit/status", {
      method: "PATCH",
      body: JSON.stringify({ isOnline: targetState }),
    });

    if (!res.success) {
      // Rollback
      setIsOnline(previousState);
      setErrorMsg(t("common.error"));
      speak(t("common.error"));
      return;
    }

    // Success announcements
    const announceMsg = targetState ? t("home.onlineVoice") : t("home.offlineVoice");
    speak(announceMsg);
    setToastMsg(targetState ? t("home.onlineVoice") : t("home.offlineVoice"));

    // H6: the availability toggle is reversible by "वापस करो" within 60s —
    // undo flips it back to the previous state (category "toggle", never money).
    voiceController.registerUndo(
      "toggle-status",
      () => {
        setIsOnline(previousState);
        void mutateOnce(`toggle-status:undo:${previousState}`, "/pandit/status", {
          method: "PATCH",
          body: JSON.stringify({ isOnline: previousState }),
        });
      },
      previousState ? "ऑनलाइन" : "ऑफलाइन",
      "toggle",
    );
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
  // FLOW D: booking capabilities are EARNED via /readiness — until then the
  // GO ONLINE surface is hidden behind the तैयारी hero card
  const isBookingReady = profile?.panditProfile?.isBookingReady === true;
  const readinessStep: number = profile?.panditProfile?.readinessStep || 0;

  // Narration-only time format (the view has its own display formatter)
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
    ? ` ${activeFestival.name} ${t("festival.greeting")}। ${t("festival.hint")}`
    : "";
  const todaySummary =
    todayBookings.length === 0
      ? t("homeSummary.none")
      : todayBookings.length === 1
      ? t("homeSummary.one").replace("{time}", formatTime(todayBookings[0].eventDate))
      : t("homeSummary.many").replace("{count}", String(todayBookings.length));
  const welcomeSpeakText = isBookingReady
    ? (isOnline
        ? "आप अभी ऑनलाइन हैं। नई बुकिंग के लिए तैयार रहें।"
        : "आप अभी ऑफलाइन हैं। काम शुरू करने के लिए ऑनलाइन जाएं।") + " " + todaySummary + festivalLine
    : t("home.readinessHeroVoice");

  // W3: ids = the AGENT's tool vocabulary on this screen (labels are
  // what it reads in its tool list; keywords stay the reflex path)
  const voiceCommands = [
    {
      id: "go-online",
      label: "ऑनलाइन जाओ",
      keywords: ["ऑनलाइन", "online", "चालू", "chalu"],
      action: async () => {
        if (!isOnline) {
          await handleToggleStatus();
        }
      },
    },
    {
      id: "toggle-offline",
      label: "ऑफलाइन जाओ",
      keywords: ["ऑफलाइन", "offline", "बंद", "band"],
      action: async () => {
        if (isOnline) {
          await handleToggleStatus();
        }
      },
    },
    { id: "open-bookings", label: "बुकिंग खोलो", keywords: ["बुकिंग", "booking"], action: () => router.push("/bookings") },
    { id: "open-earnings", label: "कमाई देखो", keywords: ["कमाई", "kamai", "earnings"], action: () => router.push("/earnings") },
    { id: "open-help", label: "मदद खोलो", keywords: ["मदद", "help", "sahayata"], action: () => router.push("/help") },
    // J2: the तैयारी hero card + the remaining nav destinations
    { id: "start-readiness", label: "तैयारी शुरू करो", keywords: ["तैयारी", "taiyari", "शुरू करो", "शुरू करें"], action: () => router.push("/readiness") },
    { id: "open-calendar", label: "कैलेंडर खोलो", keywords: ["कैलेंडर", "calendar"], action: () => router.push("/calendar") },
    { id: "open-settings", label: "सेटिंग खोलो", keywords: ["सेटिंग", "settings"], action: () => router.push("/settings") },
  ];

  return (
    <HomeView
      firstName={firstName}
      festivalDay={isFestivalDay()}
      isPending={isPending}
      isRejected={isRejected}
      rejectionReason={profile?.panditProfile?.rejectionReason || null}
      isApproved={isApproved}
      isBookingReady={isBookingReady}
      readinessStep={readinessStep}
      isOnline={isOnline}
      todayBookings={todayBookings}
      tomorrowBookings={tomorrowBookings}
      earnings={earnings}
      milestoneKinds={milestones.map((m) => m.kind)}
      newRequestBooking={newRequestBooking}
      celebratingMilestone={celebratingMilestone}
      shubhMuhurat={shubhMuhurat}
      errorMsg={errorMsg}
      toastMsg={toastMsg}
      toggleRef={toggleRef}
      onToggleStatus={handleToggleStatus}
      onNavigate={(path) => router.push(path)}
      onCloseToast={() => setToastMsg("")}
      onMilestoneCta={async () => {
        setCelebratingMilestone(null);
        await mutateOnce("milestones-seen", "/pandit/milestones/seen", { method: "POST" });
      }}
      voiceSlot={
        <VoiceActionListener
          commands={voiceCommands}
          narratingText={welcomeSpeakText}
          promptText={welcomeSpeakText}
        />
      }
      tipSlot={<FirstUseTip tipId="homeGoOnline" targetRef={toggleRef} />}
      renderNarrate={(text) => <Narrate text={text} />}
    />
  );
}
