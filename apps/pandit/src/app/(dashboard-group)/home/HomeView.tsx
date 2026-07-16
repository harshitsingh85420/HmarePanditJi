"use client";

// ─────────────────────────────────────────────────────────────
// HomeView — the home screen's PURE PRESENTATION, lifted verbatim out of
// page.tsx (mockup-match campaign harness refactor). No data fetching, no
// voiceController, no getUserMedia: the container passes state + handlers,
// and the voice-mounting components (VoiceActionListener / FirstUseTip /
// Narrate) arrive as SLOTS so the real container renders EXACTLY the tree
// it always did, while /design/harness/home renders the same view with
// mock props and no voice at all. Behavior-frozen: this file is layout.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { t } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatusChip } from "@/components/ui/StatusChip";
import { Toast } from "@/components/ui/Toast";
import { PanchangStrip } from "@/components/moments/PanchangStrip";
import { FestivalBanner } from "@/components/moments/FestivalBanner";
import { PragatiCard } from "@/components/moments/PragatiCard";
import { MoneyCount } from "@/components/moments/MoneyCount";
import { CelebrationScreen } from "@/components/moments/CelebrationScreen";
import { milestoneLabel, milestoneEmoji } from "@/components/moments/PragatiCard";
import { EmptyState } from "@/components/ui/EmptyState";

export interface HomeBooking {
  id: string;
  bookingNumber: string;
  pujaType: string;
  eventType: string;
  eventDate: string;
  venueAddress: string;
  venueCity: string;
  status: string;
}

export interface HomeEarnings {
  today: number;
  month: number;
  pendingPayout: number;
}

export interface HomeViewProps {
  firstName: string;
  festivalDay: boolean;
  isPending: boolean;
  isRejected: boolean;
  rejectionReason: string | null;
  isApproved: boolean;
  isBookingReady: boolean;
  readinessStep: number;
  isOnline: boolean;
  todayBookings: HomeBooking[];
  tomorrowBookings: HomeBooking[];
  earnings: HomeEarnings;
  milestoneKinds: string[];
  newRequestBooking: HomeBooking | null;
  celebratingMilestone: string | null;
  errorMsg: string;
  toastMsg: string;
  /** GoOnline pill ref (FirstUseTip target) — container-owned. */
  toggleRef?: React.Ref<HTMLButtonElement>;
  onToggleStatus: () => void;
  onNavigate: (path: string) => void;
  onCloseToast: () => void;
  onMilestoneCta: () => void;
  /** Voice wiring slots — the CONTAINER mounts these; the harness passes none. */
  voiceSlot?: React.ReactNode;
  tipSlot?: React.ReactNode;
  renderNarrate?: (text: string) => React.ReactNode;
}

export function HomeView({
  firstName,
  festivalDay,
  isPending,
  isRejected,
  rejectionReason,
  isApproved,
  isBookingReady,
  readinessStep,
  isOnline,
  todayBookings,
  tomorrowBookings,
  earnings,
  milestoneKinds,
  newRequestBooking,
  celebratingMilestone,
  errorMsg,
  toastMsg,
  toggleRef,
  onToggleStatus,
  onNavigate,
  onCloseToast,
  onMilestoneCta,
  voiceSlot,
  tipSlot,
  renderNarrate = () => null,
}: HomeViewProps) {
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Mockup time voice: "सुबह 9:00", not "09:00 AM" — pure display formatting.
  const formatTimeHindi = (dateStr: string) => {
    const d = new Date(dateStr);
    const h = d.getHours();
    const daypart = h < 4 ? "रात" : h < 12 ? "सुबह" : h < 16 ? "दोपहर" : h < 19 ? "शाम" : "रात";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${daypart} ${h12}:${mm}`;
  };

  const HomeHeaderRightSlot = () => (
    <button
      onClick={() => onNavigate("/settings")}
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
        title={<span className="font-display font-normal">{festivalDay ? <span className="animate-diya-sm mr-1" role="img" aria-hidden="true">🪔</span> : <span className="mr-1" role="img" aria-hidden="true">🌼</span>}{`नमस्ते, ${firstName} जी`}</span>}
        showBack={false}
        rightSlot={<HomeHeaderRightSlot />}
      />

      {/* Voice commands listener (container slot) */}
      {voiceSlot}

      <AnimatePresence>
        {newRequestBooking && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-saffron px-4 py-3 text-center sticky top-[56px] z-40 shadow-md"
          >
            <button
              onClick={() => onNavigate(`/bookings/${newRequestBooking.id}/request`)}
              className="text-white text-[18px] font-bold font-hindi flex items-center justify-center gap-2 mx-auto"
              style={{ minHeight: "56px" }}
            >
              {t("booking.viewNewBooking")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 flex flex-col gap-3 page-enter">
        {/* PANCHANG STRIP */}
        <PanchangStrip />

        {/* FESTIVAL BANNER (auto-hidden when no festival near) */}
        <FestivalBanner />

        {/* PENDING VERIFICATION BANNER */}
        {isPending && (
          <>
            {renderNarrate(t("home.pendingVerification"))}
            <div className="bg-yellow-50 border-2 border-amber-300 rounded-card p-4 flex items-center gap-3">
              <span className="text-[24px]">⚠️</span>
              <p className="text-[18px] font-bold text-amber-800 font-hindi leading-snug">
                {t("home.pendingVerification")}
              </p>
            </div>
          </>
        )}

        {/* REJECTED VERIFICATION BANNER */}
        {isRejected && (
          <>
            {renderNarrate(`${t("home.rejectedTitle")}。 ${rejectionReason || ""}`)}
            <div className="bg-red-50 border-2 border-red-300 rounded-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[24px]">❌</span>
                <div className="flex flex-col">
                  <span className="text-[18px] font-bold text-red-800 font-hindi">
                    {t("home.rejectedTitle")}
                  </span>
                  <span className="text-[16px] text-red-700 font-hindi mt-1 leading-snug">
                    {rejectionReason || "जानकारी में कुछ त्रुटि है।"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  // KYC fixes live in readiness R5 (the old 7-step wizard is gone)
                  onNavigate("/readiness?step=5");
                }}
                className="w-full min-h-[56px] text-[18px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-btn transition active:scale-[0.98] flex items-center justify-center"
                style={{ minHeight: "56px" }}
              >
                {t("home.resubmit")}
              </button>
            </div>
          </>
        )}

        {/* EARNINGS HERO — mockup screen 8: the month's कमाई leads the page.
            2px sand border on cream, 🪔 label, big leaf amount, dashed divider,
            आना-बाकी in pital brass. Same data as the old lower card (moved). */}
        <div className="rounded-[22px] border-2 border-sand p-[18px] flex flex-col">
          <span className="text-[16px] font-extrabold text-softgrey font-hindi">
            🪔 {t("home.monthEarnings")}
          </span>
          <MoneyCount target={earnings.month || 0} durationMs={1500} className="text-[34px] font-black text-leaf-700 leading-tight" />
          <div className="border-t border-dashed border-sand-200 mt-3 pt-3 flex justify-between items-center">
            <span className="text-[15px] font-bold text-softgrey font-hindi">
              {t("home.pendingLabel")}
            </span>
            <MoneyCount target={earnings.pendingPayout || 0} durationMs={1200} className="text-[20px] font-black text-brassdark" />
          </div>
        </div>

        {/* FLOW D: GO ONLINE only exists once booking-ready; until then a
            warm तैयारी hero card sits in its place */}
        {isBookingReady ? (
          <>
            {tipSlot}
            {/* GoOnline mockup: 84px pill, leaf-500 + glow + status dot when
                online, softgrey when off, with a warm sub-line below. Behavior
                frozen — same handler/disabled/ref. */}
            <div className="flex flex-col items-center gap-2">
              <button
                ref={toggleRef}
                onClick={onToggleStatus}
                disabled={!isApproved}
                className={`w-full h-[84px] rounded-card flex items-center justify-center gap-3 font-extrabold text-[23px] text-white transition-all active:scale-[0.98] ${
                  !isApproved ? "bg-slate-300 cursor-not-allowed" : isOnline ? "bg-leaf-500 online-glow" : "bg-softgrey"
                }`}
                style={{ minHeight: "84px" }}
              >
                {isApproved && (
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ background: isOnline ? "#B6F0C8" : "#E4D6C7", boxShadow: isOnline ? "0 0 8px #B6F0C8" : "none" }}
                  />
                )}
                {/* u-flag: [🟢🔴] as a bare char-class splits the surrogate pair,
                    leaving a visible � and a hydration mismatch */}
                {(isOnline ? t("home.goOffline") : t("home.goOnline")).replace(/^[\u{1F7E2}\u{1F534}]\s*/u, "")}
              </button>
              {isApproved && (
                <span className={`text-[15px] font-semibold font-hindi ${isOnline ? "text-leaf-700" : "text-softgrey"}`}>
                  {isOnline ? "परिवार अब आपको बुला सकते हैं ✓" : "काम शुरू करने के लिए दबाएँ"}
                </span>
              )}
            </div>
          </>
        ) : (
          <Card
            clickable
            onClick={() => onNavigate("/readiness")}
            accent="saffron"
            className="p-5 flex flex-col gap-2 text-left"
          >
            <span className="text-[20px] font-bold text-temple-700 font-hindi leading-snug">
              {t("home.readinessHero")}
            </span>
            {readinessStep > 0 && (
              <span className="self-start text-[16px] font-bold text-saffron-600 font-hindi px-3 py-1 bg-saffron-50 rounded-full">
                {t("home.readinessProgress").replace("{n}", String(Math.min(readinessStep, 5)))}
              </span>
            )}
            <span className="text-softgrey text-[18px] font-hindi">
              {t("coach.tryIt")}
            </span>
          </Card>
        )}

        {/* अगली बुकिंग — the emotional centre: the very next upcoming booking,
            shown as a warm hero above the lists. Display-only (existing data). */}
        {(() => {
          const todayNext = todayBookings.find((b) => b.status !== "COMPLETED" && b.status !== "CANCELLED");
          const nb = todayNext || tomorrowBookings[0];
          if (!nb) return null;
          const when = todayNext ? "आज" : "कल";
          return (
            <button
              onClick={() => onNavigate(nb.status === "REQUESTED" ? `/bookings/${nb.id}/request` : `/bookings/${nb.id}`)}
              className="w-full text-left rounded-card border-2 border-saffron-200 bg-saffron-50 p-5 flex flex-col gap-2 active:scale-[0.99] transition-transform"
            >
              <span className="text-[15px] font-hindi font-extrabold text-saffron-700">🔔 अगली बुकिंग</span>
              <span className="text-[22px] font-hindi font-black text-ink leading-snug">{nb.pujaType || nb.eventType}</span>
              <div className="flex items-center gap-1.5 text-[16px] font-semibold font-hindi text-temple-600">
                <span aria-hidden="true">📅</span>
                <span>{when} · {formatTimeHindi(nb.eventDate)}</span>
              </div>
              <span className="text-[15px] font-hindi text-softgrey truncate">📍 {nb.venueAddress?.split(",")[0]}</span>
            </button>
          );
        })()}

        {/* TODAY'S BOOKINGS SECTION */}
        <Card className="p-4 bg-white border border-saffron-100 flex flex-col gap-3">
          <h3 className="text-[18px] font-bold text-temple-600 font-hindi border-b border-saffron-100 pb-2">
            {t("home.todayBookings")}
          </h3>

          {todayBookings.length === 0 ? (
            <EmptyState
              emoji="🌤️"
              title={t("empty.todayNoBookingsTitle")}
              hint={t("empty.todayNoBookingsHint")}
              className="shadow-none py-8"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {todayBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() =>
                    onNavigate(b.status === "REQUESTED" ? `/bookings/${b.id}/request` : `/bookings/${b.id}`)
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
              {t("homeSummary.tomorrow")}
            </h3>
            <div className="flex flex-col gap-3">
              {tomorrowBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onNavigate(`/bookings/${b.id}`)}
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

        {/* PRAGATI (PROGRESS) CARD */}
        <PragatiCard earnedKinds={milestoneKinds} />

        {/* SAMAGRI PACKAGES LINK */}
        <Card
          className="p-4 bg-white border border-saffron-100 cursor-pointer min-h-[56px] flex items-center justify-center text-center"
          onClick={() => onNavigate("/samagri")}
        >
          <span className="text-[20px] font-bold text-ink font-hindi">
            {t("home.samagriLink")}
          </span>
        </Card>
      </main>

      {/* BOTTOM NAV */}
      <BottomNav activeTab={0} onChange={(idx) => {
        if (idx === 1) onNavigate("/bookings");
        else if (idx === 2) onNavigate("/earnings"); // redirect or fallback page
        else if (idx === 3) onNavigate("/calendar"); // redirect or fallback page
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
          title={t("milestones.title")}
          message={milestoneLabel(celebratingMilestone)}
          ctaLabel={t("common.next")}
          onCta={onMilestoneCta}
        />
      )}

      {/* Toast Notification */}
      {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={onCloseToast} />}
    </div>
  );
}

export default HomeView;
