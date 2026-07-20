"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { mutateOnce } from "@/lib/mutate";
import { vibrateConfirm } from "@/lib/sounds";
import { useOnline } from "@/components/ui/OfflineBanner";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Header } from "@/components/ui/Header";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { useVoice } from "@/hooks/useVoice";
import { VoiceActionListener } from "@/components/voice/VoiceActionListener";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { MoneyCount } from "@/components/moments/MoneyCount";
import { CelebrationOverlay } from "@/components/moments/CelebrationOverlay";

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
  earnings: {
    platformFee: number;
    dakshinaNet: number;
    totalToPandit: number;
  };
}

export default function BookingRequestPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { speak } = useVoice();
  // rules-of-hooks: must run on EVERY render — it used to sit below the
  // loading/error early-returns, so the hook order changed between renders.
  const online = useOnline();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm dialog state for Reject action
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  // Canon frame 26 उत्सव — shown after a successful accept
  const [showAccepted, setShowAccepted] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      const res = await api(`/pandit/bookings/${id}`);
      setLoading(false);

      if (res.success && res.data?.booking) {
        // Already accepted/declined? The request screen is stale — go to the
        // live booking view instead of re-offering Accept/Reject.
        if (res.data.booking.status && res.data.booking.status !== "REQUESTED" && res.data.booking.status !== "PANDIT_REQUESTED") {
          router.replace(`/bookings/${res.data.booking.id}`);
          return;
        }
        setBooking(res.data.booking);
      } else {
        setErrorMsg(t("common.error"));
        speak(t("common.error"));
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return <DiyaLoader />;
  }

  if (!booking) {
    return (
      <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
        <Header title={t("booking.requestTitle")} showBack onBack={() => router.push("/bookings")} />
        <div className="flex-grow flex items-center justify-center p-6 text-center">
          <p className="text-danger text-[20px] font-bold">{errorMsg || "Booking not found."}</p>
        </div>
      </div>
    );
  }

  // Localized date and time formatting
  const formatHindiDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("hi-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAccept = async () => {
    if (!online) {
      setErrorMsg(t("offline.actionBlocked"));
      speak(t("offline.actionBlocked"));
      return;
    }
    setActionLoading(true);
    setErrorMsg("");

    // L1: exactly-once — single in-flight + Idempotency-Key. A double-tap,
    // a voice "स्वीकार" racing a tap, or a retry after a lost response all
    // resolve to ONE accept (server transition is idempotent).
    const res = await mutateOnce(`accept:${booking.id}`, `/pandit/bookings/${booking.id}/accept`, {
      method: "POST",
    });

    setActionLoading(false);

    if (!res.success) {
      setErrorMsg(t("common.error"));
      speak(t("common.error"));
      return;
    }

    // Success announcements
    vibrateConfirm();
    speak(t("booking.acceptedVoice"));
    // Canon frame 26 उत्सव: the accept gets its moment BEFORE the detail
    // screen. The overlay owns the navigation when it finishes/is tapped.
    setShowAccepted(true);
  };

  const handleReject = async () => {
    setShowRejectConfirm(false);
    setActionLoading(true);
    setErrorMsg("");

    const res = await mutateOnce(`reject:${booking.id}`, `/pandit/bookings/${booking.id}/reject`, {
      method: "POST",
    });

    setActionLoading(false);

    if (!res.success) {
      setErrorMsg(t("common.error"));
      speak(t("common.error"));
      return;
    }

    router.push("/bookings");
  };

  const cName = booking.customer?.name || booking.customerName || "यजमान";
  const pujaTitle = booking.pujaType || booking.eventType;
  const total = booking.earnings?.totalToPandit || 0;

  // Speak mount voice composed sentence
  const voiceIntroText = `नई बुकिंग। ${pujaTitle} की बुकिंग। कुल कमाई ${total} रुपये।`;

  const commands = [
    {
      keywords: ["स्वीकार", "sweekar", "accept", "हाँ करो", "haan karo"],
      action: handleAccept,
      confirmText: "आप बुकिंग स्वीकार कर रहे हैं. पक्का?",
    },
    {
      keywords: ["अस्वीकार", "reject", "मना", "mana", "naa karo"],
      action: handleReject,
      confirmText: "आप बुकिंग अस्वीकार कर रहे हैं. पक्का?",
    },
  ];

  // Canon frame 26 उत्सव — the accept moment. Money named here is the
  // pandit's REAL server-computed take, never a mockup figure.
  if (showAccepted) {
    return (
      <CelebrationOverlay
        badge="✓"
        title="बुकिंग स्वीकार! 🎉"
        subtitle={`${cName} की पूजा अब आपकी है`}
        amount={booking.earnings?.totalToPandit || 0}
        tone="leaf"
        onDone={() => router.replace(`/bookings/${booking.id}`)}
      />
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* CANON FRAME 9 BANNER — this screen's header IS the sindoor gradient
          bar, not the neutral Header rail:
            background: linear-gradient(135deg,#B23A1A,#7A250E)
            padding: 16px 18px · gap 12px · 🔔 30px swinging
            title  20px/900 #FFF6E9 · sub 14px/600 #FFD9BE
          The back affordance canon omits is kept (real navigation) at the
          52px tap-target floor. */}
      <header className="shrink-0 bg-sindoor-dg px-[18px] py-4 flex items-center gap-3">
        <button
          onClick={() => router.push("/bookings")}
          aria-label={t("common.back")}
          className="w-[52px] h-[52px] -ml-3 shrink-0 rounded-full flex items-center justify-center text-chandan text-[28px] leading-none active:scale-95 transition-transform"
        >
          ←
        </button>
        {/* pa-bell-swing is transform-only + covered by the reduced-motion
            kill-switch in globals. */}
        <span className="pa-bell-swing text-[30px] leading-none select-none" aria-hidden="true">🔔</span>
        <div className="flex flex-col min-w-0">
          <span className="text-[20px] font-black text-chandan font-hindi leading-tight">नई बुकिंग विनती!</span>
          <span className="text-[18px] font-semibold text-[#FFD9BE] font-hindi leading-tight">अभी जवाब दें</span>
        </div>
      </header>

      {/* Voice actions listener — L7: accept/reject a paid booking is a
          money flow, so the agent may answer but never act here. */}
      <VoiceActionListener commands={commands} narratingText={voiceIntroText} promptText={voiceIntroText} critical />

      <main className="flex-1 overflow-y-auto px-[18px] pt-[14px] pb-4 flex flex-col gap-[13px] page-enter">
        {/* YAJMAN CARD — canon: 1.5px #F0DFC4 hairline, 18px radius,
            13px/15px padding, 52px #FDEEE7 initial disc. */}
        <div className="flex items-center gap-[13px] bg-card border-[1.5px] border-sand rounded-tile px-[15px] py-[13px]">
          <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-saffron-50 flex items-center justify-center text-[24px] font-black text-saffron-500 font-hindi leading-none">
            {cName.trim().charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-black text-temple-700 font-hindi truncate">{cName}</div>
            {/* canon's second line is a ⭐-rating we have no data for —
                TRUTHFUL-STATE keeps the booking number instead. */}
            <div className="text-[18px] font-semibold text-softgrey font-mono">{booking.bookingNumber}</div>
          </div>
        </div>

        {/* PUJA CARD — canon: title 23px/900 #7A250E, meta rows 16px/600
            #47241A with #8A6F5C leading glyphs. */}
        <div className="bg-card border-[1.5px] border-sand rounded-tile p-[15px] flex flex-col gap-[10px]">
          <span className="text-[23px] font-black text-saffron-700 font-hindi leading-snug">{pujaTitle}</span>
          <div className="flex items-center gap-2 text-[18px] font-semibold text-temple-600 font-hindi">
            <span className="text-[20px] leading-none shrink-0" aria-hidden="true">📅</span>
            {formatHindiDate(booking.eventDate)}
          </div>
          <div className="flex items-start gap-2 text-[18px] font-semibold text-temple-600 font-hindi">
            <span className="text-[20px] leading-none shrink-0" aria-hidden="true">📍</span>
            <span>{booking.venueAddress}, {booking.venueCity}</span>
          </div>
        </div>

        {/* SAMAGRI BADGE */}
        {booking.samagriPackageId && booking.samagriAmount > 0 && (
          <div className="bg-saffron-50 border-[1.5px] border-saffron-200 rounded-tile p-[15px] text-center">
            <span className="text-[18px] font-semibold text-saffron-700 font-hindi leading-snug">
              यजमान ने आपका सामग्री पैकेज चुना है (फिक्स ₹{booking.samagriAmount.toLocaleString("en-IN")})
            </span>
          </div>
        )}

        {/* EARNINGS — canon makes this a TULSI panel, not a white card:
            #E4F3E9 fill, 2px #BFE3CC border, 18px radius, 15px padding,
            every figure in #155C34, total split by a 2px dashed rule. */}
        <div className="bg-leaf-100 border-2 border-leafpale rounded-tile p-[15px]">
          <h4 className="sr-only">{t("booking.earningsTitle")}</h4>

          {/* Dakshina row */}
          {booking.dakshinaAmount > 0 && (
            <div className="flex justify-between gap-3 text-[18px] font-semibold text-leaf-700 font-hindi mb-[6px]">
              <span>{t("booking.dakshina")}</span>
              <span>₹{booking.dakshinaAmount.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Platform Fee deduction */}
          {booking.earnings?.platformFee > 0 && (
            <div className="flex justify-between gap-3 text-[18px] font-semibold text-danger font-hindi mb-[6px]">
              <span>{t("booking.platformFee")}</span>
              <span>−₹{booking.earnings.platformFee.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Net Dakshina */}
          {booking.earnings?.dakshinaNet > 0 && (
            <div className="flex justify-between gap-3 text-[18px] font-semibold text-leaf-700 font-hindi mb-[6px]">
              <span>{t("booking.youGet")}</span>
              <span>₹{booking.earnings.dakshinaNet.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Travel Allowance */}
          {booking.travelAmount > 0 && (
            <div className="flex justify-between gap-3 text-[18px] font-semibold text-leaf-700 font-hindi mb-[6px]">
              <span>{t("booking.travel")}</span>
              <span>+₹{booking.travelAmount.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Food Allowance */}
          {booking.foodAllowance > 0 && (
            <div className="flex justify-between gap-3 text-[18px] font-semibold text-leaf-700 font-hindi mb-[6px]">
              <span>{t("booking.food")}</span>
              <span>+₹{booking.foodAllowance.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Samagri earnings */}
          {booking.samagriAmount > 0 && (
            <div className="flex justify-between gap-3 text-[18px] font-semibold text-leaf-700 font-hindi mb-[6px]">
              <span>{t("booking.samagri")}</span>
              <span>+₹{booking.samagriAmount.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Total Row */}
          <div className="flex justify-between items-center gap-3 border-t-2 border-dashed border-leafpale pt-[10px] mt-[2px]">
            <span className="text-[19px] font-black text-leaf-700 font-hindi">{t("booking.total")}</span>
            <MoneyCount target={total} className="text-[28px] font-black text-leaf-700" />
          </div>
        </div>

        {/* Global error screen */}
        {errorMsg && (
          <div className="px-4 py-3 bg-saffron-50 rounded-tile border-[1.5px] border-danger/30">
            <p className="text-danger text-[20px] font-semibold text-center leading-normal">
              {errorMsg}
            </p>
          </div>
        )}

      </main>

      {/* ACCEPT / REJECT — canon stacks them, स्वीकार on top carrying the
          money-green lift (0 8px 20px rgba(30,122,70,.35)); the decline is a
          quiet #E7C9C2-outlined ghost. */}
      <footer className="shrink-0 px-[18px] pt-3 pb-2 bg-cream/95 backdrop-blur border-t border-sand flex flex-col gap-[10px]">
        <button
          onClick={handleAccept}
          className="w-full min-h-[66px] rounded-cta bg-leaf-500 text-white font-black text-[23px] font-hindi shadow-btn-leaf flex items-center justify-center gap-[11px] active:scale-[0.98] transition-transform disabled:opacity-60"
          disabled={actionLoading}
        >
          <span className="text-[28px] leading-none" aria-hidden="true">✓</span>
          {t("booking.accept")}
        </button>
        <button
          onClick={() => setShowRejectConfirm(true)}
          className="w-full min-h-[58px] rounded-cta bg-white border-2 border-[#E7C9C2] text-danger font-extrabold text-[19px] font-hindi active:scale-[0.98] transition-transform disabled:opacity-60"
          disabled={actionLoading}
        >
          {/* canon frame 9: the decline is soft — "अभी नहीं" (the confirm
              dialog still asks the explicit अस्वीकार question) */}
          अभी नहीं
        </button>
      </footer>

      {/* शिष्य in his canon seat: a centred #FFF9EE strip below the CTAs. */}
      <div className="shrink-0 flex justify-center pt-1 pb-3 bg-[#FFF9EE]">
        <ShishyaOrb />
      </div>

      {/* REJECT CONFIRM DIALOG MODAL */}
      <AnimatePresence>
        {showRejectConfirm && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cardsurface rounded-surface shadow-lift max-w-[360px] w-full p-5 flex flex-col gap-6 text-center border-2 border-sand"
            >
              <h3 className="text-[22px] font-black text-temple-700 font-hindi leading-snug">
                क्या आप वाकई अस्वीकार करना चाहते हैं?
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={handleReject}
                  className="flex-grow min-h-[58px] bg-danger text-white font-extrabold text-[19px] font-hindi rounded-cta shadow-chip active:scale-[0.98] transition-transform"
                >
                  {t("common.yes")}
                </button>
                <button
                  onClick={() => setShowRejectConfirm(false)}
                  className="flex-grow min-h-[58px] bg-white border-2 border-[#E7C9C2] text-saffron-700 font-extrabold text-[19px] font-hindi rounded-cta active:scale-[0.98] transition-transform"
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
