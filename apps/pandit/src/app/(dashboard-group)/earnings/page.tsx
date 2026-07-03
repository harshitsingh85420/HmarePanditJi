"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hi } from "@/lib/strings";
import { api } from "@/lib/api";

// UI Components
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";
import { SpeakOnMount } from "@/components/VoiceBar";
import { DiyaLoader } from "@/components/moments/DiyaLoader";

interface PayoutItem {
  id: string;
  bookingId: string;
  amount: number;
  status: "PENDING" | "PAID";
  createdAt: string;
  paidAt: string | null;
  booking?: {
    pujaType: string;
    eventType: string;
    eventDate: string;
  } | null;
}

interface EarningsSummary {
  today: number;
  week: number;
  month: number;
  pendingPayout: number;
}

export default function EarningsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Stats data
  const [summary, setSummary] = useState<EarningsSummary>({
    today: 0,
    week: 0,
    month: 0,
    pendingPayout: 0,
  });

  // Payout lists data
  const [pendingPayouts, setPendingPayouts] = useState<PayoutItem[]>([]);
  const [paidPayouts, setPaidPayouts] = useState<PayoutItem[]>([]);

  useEffect(() => {
    const loadEarningsData = async () => {
      setLoading(true);

      const [summaryRes, pendingRes, paidRes] = await Promise.all([
        api("/pandit/earnings/summary"),
        api("/pandit/payouts?status=PENDING"),
        api("/pandit/payouts?status=PAID"),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (pendingRes.success && pendingRes.data) {
        setPendingPayouts(pendingRes.data);
      }
      if (paidRes.success && paidRes.data) {
        setPaidPayouts(paidRes.data);
      }

      setLoading(false);
    };

    loadEarningsData();
  }, []);

  if (loading) {
    return <DiyaLoader />;
  }

  const formatHindiDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("hi-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-cream text-ink pb-28">
      {/* HEADER */}
      <Header title={hi.earnings.title} showBack={false} />

      {/* INTRO VOICE NARRATOR ON MOUNT */}
      <SpeakOnMount text={hi.earnings.introVoice} />

      <main className="max-w-[430px] mx-auto px-4 pt-4 flex flex-col gap-5">
        {/* STATS CARDS GRID */}
        <div className="grid grid-cols-3 gap-2">
          {/* Today Card */}
          <Card className="p-3 bg-white border border-saffron-100 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[14px] font-bold text-softgrey font-hindi">{hi.earnings.today}</span>
            <span className="text-[18px] font-bold text-leaf-700 font-mono">₹{summary.today.toLocaleString("en-IN")}</span>
          </Card>
          {/* Week Card */}
          <Card className="p-3 bg-white border border-saffron-100 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[14px] font-bold text-softgrey font-hindi">{hi.earnings.thisWeek}</span>
            <span className="text-[18px] font-bold text-leaf-700 font-mono">₹{summary.week.toLocaleString("en-IN")}</span>
          </Card>
          {/* Month Card */}
          <Card className="p-3 bg-white border border-saffron-100 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[14px] font-bold text-softgrey font-hindi">{hi.earnings.thisMonth}</span>
            <span className="text-[18px] font-bold text-leaf-700 font-mono">₹{summary.month.toLocaleString("en-IN")}</span>
          </Card>
        </div>

        {/* PENDING PAYOUTS SECTION */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[18px] font-bold text-temple-600 font-hindi border-b border-saffron-100 pb-1.5 flex justify-between items-center">
            <span>{hi.earnings.pendingPayout}</span>
            <span className="text-[18px] font-bold text-leaf-700 font-mono">
              ₹{summary.pendingPayout.toLocaleString("en-IN")}
            </span>
          </h3>

          {pendingPayouts.length === 0 ? (
            <p className="text-[16px] text-softgrey font-hindi text-center py-4">No pending payouts</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingPayouts.map((p) => {
                const title = p.booking?.pujaType || p.booking?.eventType || "पूजा";
                const dateVal = p.booking?.eventDate || p.createdAt;
                return (
                  <Card key={p.id} className="p-4 bg-white border-l-4 border-l-amber-400 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-[18px] font-bold text-ink font-hindi">{title}</span>
                      <span className="text-[14px] text-softgrey font-hindi">{formatHindiDate(dateVal)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[18px] font-bold text-leaf-700 font-mono">₹{p.amount.toLocaleString("en-IN")}</span>
                      <span className="bg-amber-100 text-amber-800 text-[12px] font-bold px-2 py-0.5 rounded-full font-hindi">
                        {hi.earnings.processing}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* PAID PAYOUTS SECTION */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[18px] font-bold text-temple-600 font-hindi border-b border-saffron-100 pb-1.5">
            {hi.earnings.paid}
          </h3>

          {paidPayouts.length === 0 ? (
            <p className="text-[16px] text-softgrey font-hindi text-center py-4">No paid payouts yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {paidPayouts.map((p) => {
                const title = p.booking?.pujaType || p.booking?.eventType || "पूजा";
                return (
                  <Card key={p.id} className="p-4 bg-white border-l-4 border-l-leaf-600 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-[18px] font-bold text-ink font-hindi">{title}</span>
                      {p.paidAt && (
                        <span className="text-[14px] text-softgrey font-hindi">
                          {hi.earnings.paid}: {formatHindiDate(p.paidAt)}
                        </span>
                      )}
                    </div>
                    <span className="text-[18px] font-bold text-leaf-700 font-mono">₹{p.amount.toLocaleString("en-IN")}</span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM NAV */}
      <BottomNav activeTab={2} onChange={(idx) => {
        if (idx === 0) router.push("/home");
        else if (idx === 1) router.push("/bookings");
        else if (idx === 3) router.push("/calendar");
      }} />
    </div>
  );
}
