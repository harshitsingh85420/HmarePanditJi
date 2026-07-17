"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import { DashboardVoiceNav } from "@/components/voice/DashboardVoiceNav";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";

// UI Components
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { MoneyCount } from "@/components/moments/MoneyCount";
import { EmptyState } from "@/components/ui/EmptyState";
import { useVoice } from "@/hooks/useVoice";
import { playChime } from "@/lib/sounds";
import { FirstUseTip } from "@/components/moments/FirstUseTip";

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
  const { speak } = useVoice();
  const [loading, setLoading] = useState(true);
  const pendingRef = React.useRef<HTMLDivElement | null>(null);

  // THE PAYOUT MOMENT: a payout newly moved PENDING→PAID since last visit
  const [freshlyPaidAmount, setFreshlyPaidAmount] = useState<number | null>(null);

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

        // Detect payouts paid since the last visit (tracked locally)
        const lastSeen = Number(localStorage.getItem("lastSeenPaidAt") || 0);
        const fresh = (paidRes.data as PayoutItem[]).filter(
          (p) => p.paidAt && new Date(p.paidAt).getTime() > lastSeen,
        );
        if (fresh.length > 0) {
          const total = fresh.reduce((sum, p) => sum + p.amount, 0);
          setFreshlyPaidAmount(total);
          playChime();
          speak(t("earnings.paidVoice").replace("{amount}", total.toLocaleString("en-IN")));
        }
        const newestPaidAt = Math.max(
          lastSeen,
          ...(paidRes.data as PayoutItem[]).map((p) => (p.paidAt ? new Date(p.paidAt).getTime() : 0)),
        );
        if (newestPaidAt > 0) localStorage.setItem("lastSeenPaidAt", String(newestPaidAt));
      }

      setLoading(false);
    };

    loadEarningsData();
  }, []);

  if (loading) {
    return <DiyaLoader />;
  }

  // Mockup frame 19 row line: short "12 जुलाई" (no weekday/year clutter)
  const formatHindiDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {/* HEADER */}
      <Header title={t("earnings.title")} showBack onBack={() => router.push("/home")} />

      {/* INTRO VOICE NARRATOR ON MOUNT */}
      <Narrate text={t("earnings.introVoice")} />
      <DashboardVoiceNav helpLine={t("help.earnings")} />

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 flex flex-col gap-3 page-enter">
        {/* THE PAYOUT MOMENT — one-time banner when money just arrived */}
        {freshlyPaidAmount !== null && (
          <Card accent="leaf" className="p-4 bg-leaf-100 flex items-center gap-3">
            <span className="text-[32px] leading-none" role="img" aria-hidden="true">🙏</span>
            <div className="flex items-baseline gap-1 flex-wrap">
              <MoneyCount target={freshlyPaidAmount} className="text-[26px] font-bold text-leaf-800 font-mono" />
              <span className="text-[18px] font-bold text-leaf-800 font-hindi">
                {t("earnings.paidBanner")}
              </span>
            </div>
          </Card>
        )}

        {/* Mockup frame 19 HERO: dark leaf card, big white month total, 🪙 accents */}
        <Card className="relative overflow-hidden p-5 border-0 bg-gradient-to-br from-leaf-500 to-leaf-700 flex flex-col gap-1">
          <span aria-hidden className="absolute top-3 right-4 text-[20px] select-none">🪙</span>
          <span aria-hidden className="absolute bottom-4 right-12 text-[15px] select-none opacity-70">🪙</span>
          <span className="text-[15px] font-extrabold text-[#BEEBCE] font-hindi">{t("home.monthEarnings")}</span>
          <MoneyCount target={summary.month} className="text-[46px] leading-tight font-extrabold text-white font-mono" />
        </Card>

        {/* आज / इस हफ़्ते (month lives in the hero now) */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-3 flex flex-col items-center justify-center text-center gap-1 rounded-[14px] border-sand">
            <span className="text-[14px] font-bold text-softgrey font-hindi">{t("earnings.today")}</span>
            <MoneyCount target={summary.today} className="text-[18px] font-bold text-leaf-700 font-mono" />
          </Card>
          <Card className="p-3 flex flex-col items-center justify-center text-center gap-1 rounded-[14px] border-sand">
            <span className="text-[14px] font-bold text-softgrey font-hindi">{t("earnings.thisWeek")}</span>
            <MoneyCount target={summary.week} className="text-[18px] font-bold text-leaf-700 font-mono" />
          </Card>
        </div>

        {/* मिल गया — received money first (mockup order) */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[15px] font-extrabold text-leaf-700 font-hindi flex items-center gap-1.5">
            💰 {t("earnings.paid")}
          </h3>

          {pendingPayouts.length === 0 && paidPayouts.length === 0 ? (
            <EmptyState emoji="🪙" title={t("empty.noPayoutsTitle")} hint={t("empty.noPayoutsHint")} />
          ) : paidPayouts.length === 0 ? (
            <p className="text-[16px] text-softgrey font-hindi text-center py-4">{t("earnings.noPaid")}</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {paidPayouts.map((p) => {
                const title = p.booking?.pujaType || p.booking?.eventType || "पूजा";
                return (
                  <Card key={p.id} className="p-4 rounded-[14px] border-sand flex justify-between items-center gap-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[16px] font-extrabold text-ink font-hindi truncate">{title}</span>
                      {p.paidAt && (
                        <span className="text-[13px] text-softgrey font-hindi">{formatHindiDate(p.paidAt)}</span>
                      )}
                    </div>
                    <span className="text-[18px] font-black text-leaf-700 font-mono shrink-0">₹{p.amount.toLocaleString("en-IN")}</span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* आना बाकी — gold-tinted rows, brass amounts (money not yet received) */}
        <FirstUseTip tipId="earningsPending" targetRef={pendingRef} />
        <div ref={pendingRef} className="flex flex-col gap-3">
          <h3 className="text-[15px] font-extrabold text-brassdark font-hindi flex items-center gap-1.5">
            ⏳ {t("earnings.pendingPayout")} ·
            <MoneyCount target={summary.pendingPayout} className="text-[15px] font-extrabold text-brassdark font-mono" />
          </h3>

          {pendingPayouts.length === 0 ? (
            paidPayouts.length > 0 ? (
              <p className="text-[16px] text-softgrey font-hindi text-center py-4">{t("earnings.noPending")}</p>
            ) : null
          ) : (
            <div className="flex flex-col gap-2.5">
              {pendingPayouts.map((p) => {
                const title = p.booking?.pujaType || p.booking?.eventType || "पूजा";
                const dateVal = p.booking?.eventDate || p.createdAt;
                return (
                  <Card key={p.id} className="p-4 rounded-[14px] bg-[#FBF7EF] border-[#EBCF86] flex justify-between items-center gap-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[16px] font-extrabold text-ink font-hindi truncate">{title}</span>
                      <span className="text-[13px] text-softgrey font-hindi">{formatHindiDate(dateVal)}</span>
                    </div>
                    <span className="text-[18px] font-black text-brassdark font-mono shrink-0">₹{p.amount.toLocaleString("en-IN")}</span>
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
