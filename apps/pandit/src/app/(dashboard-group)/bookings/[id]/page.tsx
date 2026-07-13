"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { mutateOnce } from "@/lib/mutate";
import { playBell, vibrateConfirm } from "@/lib/sounds";
import { FirstUseTip } from "@/components/moments/FirstUseTip";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card } from "@/components/ui/Card";
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

    setShowSuccessScreen(true);
  };

  // Status header config
  const getStatusConfig = (statusStr: string) => {
    if (statusStr === "ACCEPTED") {
      return { label: t("booking.statusAccepted"), bg: "bg-[#E8F0FE] text-[#1A56DB]" };
    }
    if (statusStr === "COMPLETED") {
      return { label: t("booking.statusCompleted"), bg: "bg-leaf-100 text-leaf-700" };
    }
    // Default / IN_PROGRESS / PUJA_IN_PROGRESS
    return { label: t("booking.statusEnRoute"), bg: "bg-[#FEF3C7] text-[#92400E]" };
  };

  const statusCfg = getStatusConfig(booking.status);
  const customerPhone = booking.customer?.phone || booking.customerPhone;
  const customerName = booking.customer?.name || booking.customerName || t("booking.yajman");
  const pujaTitle = booking.pujaType || booking.eventType;
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
        <Narrate text={t("booking.completeVoice")} />
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
          <span className="text-[120px] select-none leading-none">🙏</span>
          <h1 className="text-[36px] font-bold text-temple-700 font-hindi">
            {t("booking.pujaFinishedTitle")}
          </h1>
          <p className="text-[22px] font-bold text-leaf-700 font-hindi leading-snug">
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
      <Header title={pujaTitle} showBack onBack={() => router.push("/bookings")} />

      {/* Voice commands listener */}
      <VoiceActionListener
        commands={voiceCommands}
        narratingText={screenVoiceText}
        promptText={screenVoiceText}
      />

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 flex flex-col gap-3 page-enter">
        {/* 1. STATUS HEADER */}
        <div className="flex justify-between items-center bg-white p-4 rounded-card border border-saffron-100 shadow-sm">
          <span className="text-[18px] font-bold text-softgrey font-hindi">{t("booking.bookingStatus")}</span>
          <div className={`inline-flex items-center justify-center h-10 px-5 rounded-full text-[18px] font-bold font-hindi select-none ${statusCfg.bg}`}>
            {statusCfg.label}
          </div>
        </div>

        {/* 2. CUSTOMER CONTACT */}
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] text-softgrey font-hindi">{t("booking.customerNameLabel")}</span>
            <span className="text-[22px] font-bold text-ink font-hindi">{customerName}</span>
          </div>

          <a
            href={`tel:${customerPhone}`}
            className="w-full h-16 bg-white border-2 border-saffron-500 hover:bg-saffron-50 text-saffron-700 font-bold text-[18px] rounded-btn shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ minHeight: "64px", fontSize: "18px" }}
          >
            {t("booking.callCustomer")}
          </a>

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
            className="w-full h-16 bg-white border-2 border-saffron-500 hover:bg-saffron-50 text-saffron-700 font-bold text-[18px] rounded-btn shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ minHeight: "64px", fontSize: "18px" }}
          >
            {t("bookingDetailExtra.showRoute")}
          </button>
        </Card>

        {/* 3. JOURNEY STEPS VERTICAL TIMELINE */}
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-6">
          <h4 className="text-[18px] font-bold text-softgrey font-hindi border-b border-saffron-100 pb-2">
            {t("booking.pujaJourney")}
          </h4>

          <div className="flex flex-col gap-6 relative pl-4 border-l-2 border-saffron-100">
            {timelineSteps.map((s) => {
              const isCompleted = booking.journeyStep >= s.step;
              const isCurrent = booking.journeyStep === s.step - 1;
              const timestamp = booking.journeyTimestamps?.[s.step];

              return (
                <div key={s.step} className="relative flex flex-col gap-3">
                  {/* Timeline point indicator */}
                  <div
                    className={`absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 ${
                      isCompleted ? "bg-leaf-700 border-leaf-700" : isCurrent ? "bg-saffron-500 border-saffron-500" : "bg-white border-saffron-200"
                    }`}
                  />

                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-[18px] font-bold font-hindi ${
                        isCompleted ? "text-leaf-700" : isCurrent ? "text-saffron-700" : "text-softgrey"
                      }`}
                    >
                      {s.title}
                    </span>

                    {/* ✅ Completed step detail */}
                    {isCompleted && (
                      <span className="text-[16px] text-leaf-700 font-bold font-hindi flex items-center gap-1">
                        ✅ {timestamp ? formatHindiTime(timestamp) : t("booking.completed")}
                      </span>
                    )}
                  </div>

                  {/* 🚀 Active step action trigger button */}
                  {isCurrent && booking.status !== "COMPLETED" && (
                    <button
                      onClick={handleJourneyNext}
                      disabled={actionLoading}
                      className="w-full h-16 bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-[18px] rounded-btn shadow-md active:scale-[0.98] transition-transform"
                      style={{ minHeight: "64px", fontSize: "18px" }}
                    >
                      {s.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 4. FINAL COMPLETION ACTION */}
        {booking.journeyStep === 3 && booking.status !== "COMPLETED" && (
          <button
            onClick={() => setShowCompleteConfirm(true)}
            disabled={actionLoading}
            className="w-full h-20 bg-leaf-700 hover:bg-leaf-800 text-white font-bold text-[22px] rounded-btn shadow-lg active:scale-95 transition-all font-hindi"
            style={{ minHeight: "80px", fontSize: "22px" }}
          >
            {t("booking.pujaComplete")}
          </button>
        )}

        {/* Global error screen */}
        {errorMsg && (
          <div className="px-4 py-2 bg-red-50 rounded-card border border-danger/20">
            <p className="text-danger text-[20px] font-semibold text-center leading-normal">
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
              className="bg-white rounded-card shadow-lg max-w-[360px] w-full p-5 flex flex-col gap-6 text-center border-2 border-saffron-300"
            >
              <h3 className="text-[22px] font-bold text-temple-700 font-hindi leading-snug">
                {t("booking.confirmCompleteTitle")}
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={handleComplete}
                  className="flex-grow h-[56px] bg-danger text-white font-bold text-[18px] rounded-btn shadow-md active:scale-95 transition-transform"
                  style={{ minHeight: "56px", fontSize: "18px" }}
                >
                  {t("common.yes")}
                </button>
                <button
                  onClick={() => setShowCompleteConfirm(false)}
                  className="flex-grow h-[56px] bg-white border-2 border-saffron-300 text-saffron-700 font-bold text-[18px] rounded-btn shadow-sm active:scale-95 transition-transform"
                  style={{ minHeight: "56px", fontSize: "18px" }}
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
