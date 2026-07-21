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

export interface HomeStats {
  rating: number | null;
  reviewCount: number;
  completedBookings: number;
  completionPct: number | null;
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
  /** TODAY has MuhuratDate rows (container-fed) — gates the शुभ-मुहूर्त chip. */
  shubhMuhurat?: boolean;
  /** Real aggregates from GET /pandit/stats; the row hides without data. */
  stats?: HomeStats | null;
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
  shubhMuhurat = false,
  stats = null,
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

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* CANON frame 8 header — a PLAIN greeting row on the cream field. Canon's
          home does NOT carry the shared saffron banner or the toran strand
          (those are the entry screens); it is just the floating 🪔 greeting in
          22/900 temple-ink and a #FFFDF8 settings circle. padding 6px 18px. */}
      <div className="shrink-0 flex items-center justify-between px-[18px] py-1.5">
        <span className="flex items-center gap-[7px] text-[22px] font-black font-display text-temple-700 leading-none">
          <span className="animate-diya-sm inline-block" role="img" aria-hidden="true">🪔</span>
          {`नमस्ते, ${firstName} जी`}
        </span>
        <button
          onClick={() => onNavigate("/settings")}
          /* canon: 44px #FFFDF8 circle, 0 2px 8px rgba(90,46,32,.12) shadow, a
             24px material `settings` glyph in #7A250E. LAW > CANON on the box:
             canon draws 44px, the 52px tap-target floor wins. */
          className="w-[52px] h-[52px] min-h-[52px] min-w-[52px] rounded-full bg-card shadow-card hover:bg-saffron-50 active:scale-90 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[24px] leading-none text-saffron-700" aria-hidden="true">
            settings
          </span>
        </button>
      </div>

      {/* Voice commands listener (container slot) */}
      {voiceSlot}

      <AnimatePresence>
        {newRequestBooking && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-saffron px-4 py-3 text-center sticky top-0 z-40 shadow-md"
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

      {/* CANON frame 12 scroll body: padding 4px 16px 16px, 13px stack gap */}
      <main className="flex-1 overflow-y-auto px-4 pt-1 pb-24 flex flex-col gap-[13px] page-enter">
        {/* PANCHANG STRIP */}
        <PanchangStrip shubh={shubhMuhurat} />

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
                  <span className="text-[18px] text-red-700 font-hindi mt-1 leading-snug">
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
        {/* CANON frame 12: the hero is NOT a flat fill — it is the 140deg
            card gradient (#FFFDF8 → #FFF0DC) on a 2px sand border, 22px
            radius, lifted by the 6px/16px surface shadow. Label and amount
            are centred; the आना-बाकी foot sits under a 1.5px dashed rule. */}
        <div className="rounded-surface border-2 border-sand bg-cardsurface shadow-surface p-[18px] flex flex-col">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[20px] leading-none" role="img" aria-hidden="true">🪔</span>
            <span className="text-[18px] font-extrabold text-softgrey font-hindi">
              {t("home.monthEarnings")}
            </span>
          </div>
          {/* CANON frame 12 hero amount is 46px: the earnings figure is a
              <dc-import name="CountUp" size="46" color="#155C34" hint-size="220px,64px">.
              The 24px "largest type" the RUN-1 census reported is canon's next
              largest INLINE font-size (the ₹5,600 pill); CountUp's size is an
              attribute the font-size regex never saw, so 46px IS canon and
              shrinking it would drift AWAY from the artboard. Colour #155C34 =
              leaf-700. Kept at 46px (well above the 18px floor). */}
          <MoneyCount target={earnings.month || 0} durationMs={1500} className="block text-center mt-2 text-[46px] font-black text-leaf-700 leading-tight" />
          <div className="border-t-[1.5px] border-dashed border-sand-200 mt-[14px] pt-3 flex justify-between items-center">
            <span className="text-[18px] font-bold text-softgrey font-hindi">
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
                /* CANON: online = leaf + breathing glow OVER a permanent
                   grounding shadow; offline keeps the lift (online-rest) so
                   the control does not flatten the instant it is switched
                   off. Disabled stays flat — it is not a live control. */
                className={`w-full h-[84px] rounded-card flex items-center justify-center gap-3 font-extrabold text-[23px] text-white transition-all active:scale-[0.98] ${
                  !isApproved
                    ? "bg-slate-300 cursor-not-allowed"
                    : isOnline
                      ? "bg-leaf-500 online-glow"
                      : "bg-softgrey online-rest"
                }`}
                style={{ minHeight: "84px" }}
              >
                {isApproved && (
                  /* CANON: the dot breathes while online (go-dot) — a static
                     dot read as a printed decal, not a live indicator. */
                  <span
                    className={`w-4 h-4 rounded-full ${isOnline ? "online-dot" : ""}`}
                    style={{ background: isOnline ? "#B6F0C8" : "#E4D6C7", boxShadow: isOnline ? "0 0 8px #B6F0C8" : "none" }}
                  />
                )}
                {/* u-flag: [🟢🔴] as a bare char-class splits the surrogate pair,
                    leaving a visible � and a hydration mismatch */}
                {(isOnline ? t("home.goOffline") : t("home.goOnline")).replace(/^[\u{1F7E2}\u{1F534}]\s*/u, "")}
              </button>
              {isApproved && (
                <span className={`text-[15px] font-semibold font-hindi ${isOnline ? "text-leaf-700" : "text-softgrey"}`}>
                  {isOnline ? "परिवार अब आपको बुला सकते हैं ✓" : "काम शुरू करने के लिए दबाइए"}
                </span>
              )}
            </div>
          </>
        ) : (
          <Card
            clickable
            onClick={() => onNavigate("/readiness/hub")}
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
            /* CANON frame 12: a #FFFDF8 card on a 2px #F4B096 border, 22px
               radius, clipped, carrying the 6px/16px surface shadow — with a
               #FDEEE7 header BAR (9px/16px) holding the label, and a 15px/16px
               body at a 9px gap. Not a flat saffron-50 block. */
            <button
              onClick={() => onNavigate(nb.status === "REQUESTED" ? `/bookings/${nb.id}/request` : `/bookings/${nb.id}`)}
              className="w-full text-left rounded-surface border-2 border-saffron-200 bg-card shadow-surface overflow-hidden flex flex-col active:scale-[0.99] transition-transform"
            >
              <div className="bg-saffron-50 px-4 py-[9px] flex items-center gap-2">
                <span className="text-[20px] leading-none" role="img" aria-hidden="true">🔔</span>
                <span className="text-[18px] font-hindi font-extrabold text-saffron-700">अगली बुकिंग</span>
              </div>
              <div className="px-4 py-[15px] flex flex-col gap-[9px]">
                <span className="text-[22px] font-hindi font-black text-ink leading-snug">{nb.pujaType || nb.eventType}</span>
                <div className="flex items-center gap-2 text-[18px] font-semibold font-hindi text-temple-600">
                  <span className="text-[20px] leading-none" aria-hidden="true">📅</span>
                  <span>{when} · {formatTimeHindi(nb.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-[18px] font-semibold font-hindi text-temple-600">
                  <span className="text-[20px] leading-none" aria-hidden="true">📍</span>
                  <span className="truncate">{nb.venueAddress?.split(",")[0]}</span>
                </div>
                {/* CANON pairs the amount with this pill; the home booking row
                    carries no amount, so only the truthful half is drawn. */}
                <span className="self-end mt-1 text-[18px] font-hindi font-extrabold text-saffron-500 bg-saffron-50 border-[1.5px] border-saffron-200 rounded-chip px-[14px] py-[7px]">
                  विवरण देखिए ›
                </span>
              </div>
            </button>
          );
        })()}

        {/* 3-STAT ROW — mockup screen 8: रेटिंग / पूर्णता / बुकिंग. Fed by
            GET /pandit/stats; renders ONLY the stats that truly exist (a new
            pandit sees no row — never a fake 0★). */}
        {stats && (stats.completedBookings > 0 || stats.rating !== null) && (
          <div className="flex gap-[10px]">
            {stats.rating !== null && (
              <div className="flex-1 bg-card border-[1.5px] border-sand rounded-field px-2 py-[13px] flex flex-col items-center gap-0.5">
                <span className="text-[22px] font-black text-brassdark leading-tight">{stats.rating}★</span>
                <span className="text-[18px] font-bold text-softgrey font-hindi">रेटिंग</span>
              </div>
            )}
            {stats.completionPct !== null && (
              <div className="flex-1 bg-card border-[1.5px] border-sand rounded-field px-2 py-[13px] flex flex-col items-center gap-0.5">
                <span className="text-[22px] font-black text-leaf-700 leading-tight">{stats.completionPct}%</span>
                <span className="text-[18px] font-bold text-softgrey font-hindi">पूर्णता</span>
              </div>
            )}
            {stats.completedBookings > 0 && (
              <div className="flex-1 bg-card border-[1.5px] border-sand rounded-field px-2 py-[13px] flex flex-col items-center gap-0.5">
                <span className="text-[22px] font-black text-saffron-700 leading-tight">{stats.completedBookings}</span>
                <span className="text-[18px] font-bold text-softgrey font-hindi">बुकिंग</span>
              </div>
            )}
          </div>
        )}

        {/* TODAY'S BOOKINGS SECTION */}
        {/* CANON frame 12 has NO pure white — #FFFDF8 is its dominant surface
            (6×). bg-card (#FFFDF8) replaces bg-white so this app-extension
            section reads as the same warm surface as the canon tiles. */}
        <Card className="p-4 bg-card border border-saffron-100 flex flex-col gap-3">
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
                    <span className="text-[18px] text-softgrey font-hindi truncate max-w-[240px]">
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
          <Card className="p-4 bg-card border border-saffron-100 flex flex-col gap-3">
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
                    <span className="text-[18px] text-softgrey font-hindi truncate max-w-[240px]">
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
          className="p-4 bg-card border border-saffron-100 cursor-pointer min-h-[56px] flex items-center justify-center text-center"
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
