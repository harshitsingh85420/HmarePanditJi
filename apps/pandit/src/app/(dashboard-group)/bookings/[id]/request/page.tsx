"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { SpeakOnMount } from "@/components/VoiceBar";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { useVoice } from "@/hooks/useVoice";

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

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm dialog state for Reject action
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      const res = await api(`/pandit/bookings/${id}`);
      setLoading(false);

      if (res.success && res.data?.booking) {
        setBooking(res.data.booking);
      } else {
        setErrorMsg(hi.common.error);
        speak(hi.common.error);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return <DiyaLoader />;
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream text-ink flex flex-col">
        <Header title={hi.booking.requestTitle} showBack />
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
    setActionLoading(true);
    setErrorMsg("");

    const res = await api(`/pandit/bookings/${booking.id}/accept`, {
      method: "POST",
    });

    setActionLoading(false);

    if (!res.success) {
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
      return;
    }

    // Success announcements
    speak(hi.booking.acceptedVoice);
    router.push(`/bookings/${booking.id}`);
  };

  const handleReject = async () => {
    setShowRejectConfirm(false);
    setActionLoading(true);
    setErrorMsg("");

    const res = await api(`/pandit/bookings/${booking.id}/reject`, {
      method: "POST",
    });

    setActionLoading(false);

    if (!res.success) {
      setErrorMsg(hi.common.error);
      speak(hi.common.error);
      return;
    }

    router.push("/bookings");
  };

  const cName = booking.customer?.name || booking.customerName || "यजमान";
  const pujaTitle = booking.pujaType || booking.eventType;
  const total = booking.earnings?.totalToPandit || 0;

  // Speak mount voice composed sentence
  const voiceIntroText = `नई बुकिंग। ${pujaTitle} की बुकिंग। कुल कमाई ${total} रुपये।`;

  return (
    <div className="min-h-screen bg-cream text-ink pb-24">
      <Header title={hi.booking.requestTitle} showBack onBack={() => router.push("/bookings")} />

      {/* Composed speak sentence on mount */}
      <SpeakOnMount text={voiceIntroText} />

      <main className="max-w-[430px] mx-auto px-4 pt-4 flex flex-col gap-5">
        {/* CUSTOMER CARD */}
        <Card className="p-5 border-l-4 border-l-saffron-500 bg-white flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[20px] font-bold text-temple-700 font-hindi">
              {pujaTitle}
            </h3>
            <span className="t-hint text-softgrey font-mono text-[14px]">
              {booking.bookingNumber}
            </span>
          </div>

          <div className="flex flex-col gap-2 text-[18px] border-t border-saffron-100/50 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">👤</span>
              <span className="font-bold text-ink font-hindi">{cName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[18px]">📅</span>
              <span className="font-hindi text-temple-600 font-medium">
                {formatHindiDate(booking.eventDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[18px]">📍</span>
              <span className="font-hindi text-ink leading-normal">{booking.venueAddress}, {booking.venueCity}</span>
            </div>
          </div>
        </Card>

        {/* SAMAGRI BADGE */}
        {booking.samagriPackageId && booking.samagriAmount > 0 && (
          <div className="bg-saffron-50 border-2 border-saffron-300 rounded-card p-4 text-center">
            <span className="text-[18px] font-bold text-saffron-700 font-hindi leading-snug">
              यजमान ने आपका सामग्री पैकेज चुना है (फिक्स ₹{booking.samagriAmount.toLocaleString("en-IN")})
            </span>
          </div>
        )}

        {/* EARNINGS TABLE */}
        <Card className="p-5 bg-white border border-saffron-100 flex flex-col gap-3">
          <h4 className="text-[18px] font-bold text-softgrey font-hindi border-b border-saffron-100 pb-2">
            {hi.booking.earningsTitle}
          </h4>

          <div className="flex flex-col gap-2.5">
            {/* Dakshina row */}
            {booking.dakshinaAmount > 0 && (
              <div className="flex justify-between text-[20px] font-hindi">
                <span className="text-softgrey">{hi.booking.dakshina}</span>
                <span className="font-bold text-ink">₹{booking.dakshinaAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Platform Fee deduction */}
            {booking.earnings?.platformFee > 0 && (
              <div className="flex justify-between text-[20px] font-hindi">
                <span className="text-softgrey">{hi.booking.platformFee}</span>
                <span className="font-bold text-danger">−₹{booking.earnings.platformFee.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Net Dakshina */}
            {booking.earnings?.dakshinaNet > 0 && (
              <div className="flex justify-between text-[20px] font-hindi border-t border-dashed border-saffron-200 pt-2">
                <span className="text-softgrey">{hi.booking.youGet}</span>
                <span className="font-bold text-ink">₹{booking.earnings.dakshinaNet.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Travel Allowance */}
            {booking.travelAmount > 0 && (
              <div className="flex justify-between text-[20px] font-hindi">
                <span className="text-softgrey">{hi.booking.travel}</span>
                <span className="font-bold text-leaf-700">+₹{booking.travelAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Food Allowance */}
            {booking.foodAllowance > 0 && (
              <div className="flex justify-between text-[20px] font-hindi">
                <span className="text-softgrey">{hi.booking.food}</span>
                <span className="font-bold text-leaf-700">+₹{booking.foodAllowance.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Samagri earnings */}
            {booking.samagriAmount > 0 && (
              <div className="flex justify-between text-[20px] font-hindi">
                <span className="text-softgrey">{hi.booking.samagri}</span>
                <span className="font-bold text-leaf-700">+₹{booking.samagriAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Total Row */}
            <div className="flex justify-between items-center border-t-2 border-double border-saffron-300 pt-3 mt-1">
              <span className="text-[22px] font-bold text-ink font-hindi">{hi.booking.total}</span>
              <span className="text-[28px] font-bold text-leaf-700">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </Card>

        {/* Global error screen */}
        {errorMsg && (
          <div className="px-4 py-2 bg-red-50 rounded-card border border-danger/20">
            <p className="text-danger text-[20px] font-semibold text-center leading-normal">
              {errorMsg}
            </p>
          </div>
        )}

        {/* ACCEPT / REJECT BUTTONS */}
        <div className="flex gap-4 mt-2">
          <button
            onClick={() => setShowRejectConfirm(true)}
            className="flex-1 h-[72px] bg-white border-2 border-danger text-danger font-bold text-[20px] rounded-btn shadow-sm active:scale-95 transition-transform"
            style={{ minHeight: "72px", fontSize: "20px" }}
            disabled={actionLoading}
          >
            {hi.booking.reject}
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 h-[72px] bg-leaf-700 text-white font-bold text-[20px] rounded-btn shadow-md active:scale-95 transition-transform hover:bg-leaf-800"
            style={{ minHeight: "72px", fontSize: "20px" }}
            disabled={actionLoading}
          >
            {hi.booking.accept}
          </button>
        </div>
      </main>

      {/* REJECT CONFIRM DIALOG MODAL */}
      <AnimatePresence>
        {showRejectConfirm && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-card shadow-lg max-w-[360px] w-full p-5 flex flex-col gap-6 text-center border-2 border-saffron-300"
            >
              <h3 className="text-[22px] font-bold text-temple-700 font-hindi leading-snug">
                क्या आप वाकई अस्वीकार करना चाहते हैं?
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={handleReject}
                  className="flex-grow h-[56px] bg-danger text-white font-bold text-[18px] rounded-btn shadow-md active:scale-95 transition-transform"
                  style={{ minHeight: "56px", fontSize: "18px" }}
                >
                  {hi.common.yes}
                </button>
                <button
                  onClick={() => setShowRejectConfirm(false)}
                  className="flex-grow h-[56px] bg-white border-2 border-saffron-300 text-saffron-700 font-bold text-[18px] rounded-btn shadow-sm active:scale-95 transition-transform"
                  style={{ minHeight: "56px", fontSize: "18px" }}
                >
                  {hi.common.no}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
