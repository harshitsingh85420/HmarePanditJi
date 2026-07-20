"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { mutateOnce } from "@/lib/mutate";
import { vibrateConfirm } from "@/lib/sounds";
import { celebrationLine, ringBellAfterSpeech } from "@/lib/celebration";
import { FirstUseTip } from "@/components/moments/FirstUseTip";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Header } from "@/components/ui/Header";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { useVoice } from "@/hooks/useVoice";
import { VoiceActionListener } from "@/components/voice/VoiceActionListener";

interface BookingDetail {
  id: string;
  bookingNumber: string;
  pujaType: string;
  eventType: string;
  eventDate: string;
  venueAddress: string;
  venueCity: string;
  customerName: string;
  customerPhone: string;
  customer?: {
    name: string;
    phone: string;
  };
  dakshinaAmount: number;
  travelAmount: number;
  foodAllowance: number;
  samagriAmount: number;
  samagriPackageId?: string | null;
  status: string;
  journeyStep: number;
  journeyTimestamps?: Record<number, string>;
  acceptedAt?: string | null;
  earnings: {
    platformFee: number;
    dakshinaNet: number;
    totalToPandit: number;
  };
}

export default function BookingDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { speak } = useVoice();

  const [loading, setLoading] = useState(true);
  const routeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // States for flows
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [completeLine, setCompleteLine] = useState("");

  // Boring-pass E: when the पूजा-संपन्न screen appears, ring the temple bell
  // as a blessing AFTER शिष्य's completion line (deferred while he speaks).
  useEffect(() => {
    if (showSuccessScreen) ringBellAfterSpeech();
  }, [showSuccessScreen]);

  const fetchBooking = async () => {
    if (!id) return;
    const res = await api(`/pandit/bookings/${id}`);
    if (res.success && res.data?.booking) {
      setBooking(res.data.booking);
    } else {
      setErrorMsg(t("common.error"));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchBooking();
      setLoading(false);
    };
    init();
  }, [id]);

  if (loading) {
    return <DiyaLoader />;
  }

  if (!booking) {
    return (
      <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
        <Header title={t("booking.detailsTitle")} showBack onBack={() => router.push("/bookings")} />
        <div className="flex-grow flex items-center justify-center p-6 text-center">
          <p className="text-danger text-[20px] font-bold">{errorMsg || "Booking not found."}</p>
        </div>
      </div>
    );
  }

  // Format timestamp to "दोपहर 2:30" or similar
  const formatHindiTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "दोपहर" : "सुबह";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${period} ${displayHours}:${mins}`;
  };

  // Journey POST handler
  const handleJourneyNext = async () => {
    setActionLoading(true);
    setErrorMsg("");

    // L-B: send the TARGET step so a retry-after-lost-response resends the SAME
    // target and the server advances idempotently (never a blind double +1).
    // Keyed on the current step so a rapid double-tap also collapses to one.
    const res = await mutateOnce(
      `journey:${booking.id}:${booking.journeyStep}`,
      `/pandit/bookings/${booking.id}/journey`,
      { method: "POST", body: JSON.stringify({ step: booking.journeyStep + 1 }) },
    );

    setActionLoading(false);

    if (!res.success) {
      setErrorMsg(t("common.error"));
      speak(t("common.error"));
      return;
    }

    // Voice feedback based on next step
    const nextStep = booking.journeyStep + 1;
    if (nextStep === 1) {
      speak(t("booking.journeyLeftVoice"));
    } else if (nextStep === 2) {
      speak(t("booking.journeyArrivedVoice"));
    } else if (nextStep === 3) {
      vibrateConfirm();
      speak(t("booking.journeyStartedVoice"));
    }

    await fetchBooking();
  };

  // Complete POST handler
  const handleComplete = async () => {
    setShowCompleteConfirm(false);
    setActionLoading(true);
    setErrorMsg("");

    // L1: complete is once-per-booking — the atomic server transition
    // makes a retry-after-lost-response return idempotent success.
    const res = await mutateOnce(`complete:${booking.id}`, `/pandit/bookings/${booking.id}/complete`, {
      method: "POST",
    });

    setActionLoading(false);

    if (!res.success) {
      setErrorMsg(t("common.error"));
      speak(t("common.error"));
      return;
    }

    setCompleteLine(celebrationLine());
    setShowSuccessScreen(true);
  };

  // Status header config — canon frame 14 draws this as a pill in the header
  // bar: `#155C34 on #E4F3E9, radius 999px, padding 6px 13px`, prefixed with
  // a ✓ tick. The app had #E8F0FE/#1A56DB and #FEF3C7/#92400E, neither of
  // which occurs anywhere in the canon; en-route now uses canon's goldpale
  // "awaiting" field with saffron-700 text.
  const getStatusConfig = (statusStr: string) => {
    if (statusStr === "ACCEPTED") {
      return { label: `✓ ${t("booking.statusAccepted")}`, bg: "bg-leaf-100 text-leaf-700" };
    }
    if (statusStr === "COMPLETED") {
      return { label: `✓ ${t("booking.statusCompleted")}`, bg: "bg-leaf-100 text-leaf-700" };
    }
    // Default / IN_PROGRESS / PUJA_IN_PROGRESS
    return { label: t("booking.statusEnRoute"), bg: "bg-goldpale text-saffron-700" };
  };

  const statusCfg = getStatusConfig(booking.status);
  const customerPhone = booking.customer?.phone || booking.customerPhone;
  const customerName = booking.customer?.name || booking.customerName || t("booking.yajman");
  const pujaTitle = booking.pujaType || booking.eventType;
  // Canon frame 14 draws a 50px saffron-50 disc holding the yajman's initial
  // (श्री अनिल गुप्ता -> "अ"): the honorific is skipped, not the given name.
  const avatarLetter = customerName.replace(/^श्री\s+/, "").trim().charAt(0) || "य";
  const journeyLabels = {
    left: t("booking.left"),
    started: t("booking.started"),
  };

  // Timeline config
  const timelineSteps = [
    { step: 1, title: t("booking.left"), label: journeyLabels.left },
    { step: 2, title: t("booking.arrived"), label: t("booking.imHere") },
    { step: 3, title: t("booking.started"), label: journeyLabels.started },
  ];

  const voiceCommands = [];
  if (booking.journeyStep < 3) {
    voiceCommands.push({
      keywords:
        booking.journeyStep === 0
          ? ["निकल", "nikal", "left", "चल दिए", "रवाना"]
          : booking.journeyStep === 1
          ? ["पहुँच गया", "pahunch", "पहुंच", "arrived", "im here"]
          : ["शुरू", "shuru", "started", "आरंभ"],
      action: handleJourneyNext,
    });
  } else if (booking.status !== "COMPLETED") {
    voiceCommands.push({
      keywords: ["पूजा संपन्न", "पूरी हो गई", "complete", "finished", "sampann"],
      action: handleComplete,
      confirmText: t("booking.confirmCompleteTitle"),
    });
  }

  const screenVoiceText = `बुकिंग विवरण। ${pujaTitle}।`;

  if (showSuccessScreen) {
    const payoutAmount = booking.earnings?.totalToPandit || 0;
    return (
      <div className="fixed inset-0 bg-cream text-ink flex flex-col justify-between p-6 z-50">
        <Narrate text={completeLine || t("booking.completeVoice")} />
        {/* Mockup frame 26 (पूजा संपन्न): 30/900 saffron-700 title, सेवा
            line, leaf ₹ — payout wording stays payoutSoon (truth: the
            money has NOT landed yet; mockup's "आपके खाते में" would lie) */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
          <span className="text-[120px] select-none leading-none">🙏</span>
          <h1 className="text-[30px] font-black text-saffron-700 font-hindi">
            {t("booking.pujaFinishedTitle")}
          </h1>
          <p className="text-[17px] font-semibold text-softgrey font-hindi">आपकी सेवा सफल रही</p>
          <p className="text-[19px] font-black text-leaf-700 font-hindi leading-snug">
            ₹{payoutAmount.toLocaleString("en-IN")} {t("booking.payoutSoon")}
          </p>
        </div>

        <button
          onClick={() => router.push("/home")}
          className="w-full h-20 bg-leaf-700 hover:bg-leaf-800 text-white font-bold text-[22px] rounded-btn shadow-lg active:scale-95 transition-transform"
          style={{ minHeight: "80px", fontSize: "22px" }}
        >
          {t("booking.goToHome")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-ink pb-24">
      {/* Canon frame 14 carries the status as a pill on the RIGHT of the header
          bar (not as its own body row) and titles the bar बुकिंग विवरण, with the
          puja name demoted to the yajman card's second line. Header exposes a
          rightSlot, so this needs no shared change. */}
      <Header
        title={t("booking.detailsTitle")}
        showBack
        onBack={() => router.push("/bookings")}
        rightSlot={
          <span
            className={`inline-flex items-center whitespace-nowrap px-[13px] py-1.5 rounded-chip text-[18px] font-extrabold font-hindi select-none ${statusCfg.bg}`}
          >
            {statusCfg.label}
          </span>
        }
      />

      {/* Voice commands listener */}
      <VoiceActionListener
        commands={voiceCommands}
        narratingText={screenVoiceText}
        promptText={screenVoiceText}
      />

      {/* canon: padding 6px 16px 16px, gap 13px */}
      <main className="flex-1 overflow-y-auto px-4 pt-1.5 pb-24 flex flex-col gap-[13px] page-enter">
        {/* 1. YAJMAN ROW — canon frame 14: flat #FFFDF8 surface, 1.5px #F0DFC4
            hairline, 18px radius, 13px/15px padding, a 50px saffron-50 initial
            disc, and the call action as a 52px leaf disc carrying canon's
            0 4px 12px rgba(30,122,70,.35) lift. This is the raised-Card
            component's flatter sibling, so it is a plain surface div rather
            than <Card> (which is fixed at 22px / 2px / gradient / 6px-16px). */}
        <div className="flex items-center gap-3 bg-card border-[1.5px] border-sand rounded-tile px-[15px] py-[13px]">
          <div
            className="w-[50px] h-[50px] shrink-0 rounded-full bg-saffron-50 flex items-center justify-center text-[22px] font-black text-saffron-500 font-hindi select-none"
            aria-hidden="true"
          >
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-black text-temple-700 font-hindi truncate">
              {customerName}
            </div>
            {/* canon 14/600 — raised to the 18sp body floor (lawConflicts) */}
            <div className="text-[18px] font-semibold text-softgrey font-hindi truncate">
              {pujaTitle}
            </div>
          </div>
          <a
            href={`tel:${customerPhone}`}
            aria-label={t("booking.callCustomer")}
            className="w-[52px] h-[52px] shrink-0 rounded-full bg-leaf-500 shadow-[0_4px_12px_rgba(30,122,70,0.35)] flex items-center justify-center active:scale-95 transition-transform"
          >
            {/* drawn ornament — canon's filled `call` glyph, 26px, white */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.58 3.6a1 1 0 0 1-.25 1l-2.23 2.2Z" />
            </svg>
          </a>
        </div>

        {/* 2. ROUTE — canon frame 14: full-width saffron-50 fill with a 2px
            #F4B096 (saffron-200) edge, 16px radius, 18/800 saffron-700 label
            and a sindoor `directions` glyph. Was a white/saffron-500 outline
            button squeezed into a half-width pair. */}
        <FirstUseTip tipId="detailRoute" targetRef={routeBtnRef} />
        <button
          ref={routeBtnRef}
          onClick={() => {
            const q = encodeURIComponent(booking.venueAddress || "");
            // geo: opens the native maps app on Android; browsers that
            // don't handle it fall through to Google Maps
            const geoUrl = `geo:0,0?q=${q}`;
            const webUrl = `https://maps.google.com/?q=${q}`;
            const w = window.open(geoUrl, "_self");
            setTimeout(() => {
              if (!document.hidden) window.open(webUrl, "_blank");
            }, 600);
            void w;
          }}
          className="w-full min-h-[56px] px-4 border-2 border-saffron-200 rounded-field bg-saffron-50 text-saffron-700 text-[18px] font-extrabold font-hindi flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
        >
          {t("bookingDetailExtra.showRoute")}
          {/* TRUTHFUL-STATE: the area suffix appears only when we have one */}
          {booking.venueCity ? ` · ${booking.venueCity}` : ""}
        </button>

        {/* 3. JOURNEY — canon frame 14 draws this as a LEFT RAIL, not as dots
            hung off a border: a 32px node disc per step with a 3px connector
            column running between them (leaf once passed, #E7DCC9 ahead), and
            the labels in a second column. Node states, verbatim from canon:
              done    #1E7A46 disc + white check
              current #B23A1A disc + 12px white pip + glow ring
              ahead   #F0E6D3 disc, 2px #E7DCC9 edge, empty
            Surface is canon's flat 18px/1.5px sheet, padding 16. */}
        <div className="bg-card border-[1.5px] border-sand rounded-tile p-4">
          {/* canon 15/800 — raised to the 18sp floor (lawConflicts) */}
          <div className="text-[18px] font-extrabold text-softgrey font-hindi mb-[14px]">
            {t("booking.pujaJourney")}
          </div>

          {(() => {
            // The स्वीकृत node is already done by definition — the journey
            // opens on it. Timestamp only when the server actually has one.
            const nodes = [
              {
                key: "accepted",
                title: t("booking.statusAccepted"),
                state: "done" as const,
                sub: booking.acceptedAt ? formatHindiTime(booking.acceptedAt) : t("booking.completed"),
                action: null as React.ReactNode,
              },
              ...timelineSteps.map((s) => {
                const isCompleted = booking.journeyStep >= s.step;
                const isCurrent = booking.journeyStep === s.step - 1;
                const timestamp = booking.journeyTimestamps?.[s.step];
                return {
                  key: `step-${s.step}`,
                  title: s.title,
                  state: isCompleted ? ("done" as const) : isCurrent ? ("current" as const) : ("ahead" as const),
                  sub: isCompleted ? (timestamp ? formatHindiTime(timestamp) : t("booking.completed")) : "",
                  action:
                    isCurrent && booking.status !== "COMPLETED" ? (
                      <button
                        onClick={handleJourneyNext}
                        disabled={actionLoading}
                        className="mt-3 w-full min-h-[56px] px-4 bg-sindoor text-chandan text-[19px] font-extrabold font-hindi rounded-cta shadow-btn active:scale-[0.98] transition-transform disabled:opacity-60"
                      >
                        {s.label}
                      </button>
                    ) : null,
                };
              }),
            ];

            return nodes.map((n, i) => {
              const isLast = i === nodes.length - 1;
              return (
                <div key={n.key} className="flex gap-[13px]">
                  {/* rail column */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative w-8 h-8">
                      {n.state === "current" && (
                        // canon animates this with a box-shadow ring; drawn
                        // here as a scaling/fading disc so the motion stays
                        // transform+opacity only, and stops under
                        // prefers-reduced-motion.
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-gold/50 animate-ping motion-reduce:hidden"
                        />
                      )}
                      <div
                        className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
                          n.state === "done"
                            ? "bg-leaf-500"
                            : n.state === "current"
                            ? "bg-saffron-500"
                            : "bg-[#F0E6D3] border-2 border-sand-200"
                        }`}
                      >
                        {n.state === "done" && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M5 12.5 10 17.5 19 7"
                              stroke="#fff"
                              strokeWidth="2.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {n.state === "current" && (
                          <span className="w-3 h-3 rounded-full bg-white" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                    {!isLast && (
                      <div
                        className={`w-[3px] flex-1 min-h-[20px] ${
                          n.state === "done" ? "bg-leaf-500" : "bg-sand-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* label column */}
                  <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-4"}`}>
                    {/* canon 17/800 — raised to the 18sp floor (lawConflicts) */}
                    <div
                      className={`text-[18px] font-hindi ${
                        n.state === "done"
                          ? "font-extrabold text-temple-700"
                          : n.state === "current"
                          ? "font-extrabold text-saffron-500"
                          : "font-bold text-softgrey"
                      }`}
                    >
                      {n.title}
                    </div>
                    {/* canon 13/400 softgrey — raised to the 18sp floor */}
                    {n.sub && (
                      <div className="text-[18px] text-softgrey font-hindi">{n.sub}</div>
                    )}
                    {n.action}
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* 4. FINAL COMPLETION ACTION — canon frame 14: min-height 64,
            18px radius, FLAT #1E7A46 (leaf-500, not the darker leaf-700),
            21/900, carrying canon's 0 8px 20px rgba(30,122,70,.35) lift. */}
        {booking.journeyStep === 3 && booking.status !== "COMPLETED" && (
          <button
            onClick={() => setShowCompleteConfirm(true)}
            disabled={actionLoading}
            className="w-full min-h-[64px] px-4 bg-leaf-500 text-white font-black text-[21px] rounded-cta shadow-btn-leaf flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform font-hindi disabled:opacity-60"
          >
            {t("booking.pujaComplete")}
          </button>
        )}

        {/* Global error screen */}
        {errorMsg && (
          <div className="px-4 py-3 bg-saffron-50 rounded-tile border-[1.5px] border-danger/30">
            <p className="text-danger text-[20px] font-semibold text-center leading-normal font-hindi">
              {errorMsg}
            </p>
          </div>
        )}
      </main>

      {/* शिष्य footer slot */}
      <footer className="shrink-0 px-4 py-2 bg-cream/95 backdrop-blur border-t border-saffron-100 flex justify-center">
        <ShishyaOrb />
      </footer>

      {/* CONFIRMATION COMPLETE MODAL DIALOG */}
      <AnimatePresence>
        {showCompleteConfirm && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cardsurface rounded-surface shadow-lift max-w-[360px] w-full p-5 flex flex-col gap-6 text-center border-2 border-sand"
            >
              <h3 className="text-[22px] font-black text-temple-700 font-hindi leading-snug">
                {t("booking.confirmCompleteTitle")}
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={handleComplete}
                  className="flex-grow min-h-[56px] bg-leaf-500 text-white font-extrabold text-[19px] rounded-cta shadow-btn-leaf active:scale-[0.98] transition-transform font-hindi"
                >
                  {t("common.yes")}
                </button>
                <button
                  onClick={() => setShowCompleteConfirm(false)}
                  className="flex-grow min-h-[56px] bg-card border-2 border-saffron-200 text-saffron-700 font-extrabold text-[19px] rounded-cta active:scale-[0.98] transition-transform font-hindi"
                >
                  {t("common.no")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
