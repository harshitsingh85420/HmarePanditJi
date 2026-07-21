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
      {/* canon frame 19: plain title block "💰 कमाई". No back — BottomNav is
          the escape. */}
      <Header variant="title" title={`💰 ${t("earnings.title")}`} />

      {/* INTRO VOICE NARRATOR ON MOUNT */}
      <Narrate text={t("earnings.introVoice")} />
      <DashboardVoiceNav helpLine={t("help.earnings")} />

      {/* CANON frame 19 scroll field: padding 8px 16px 16px, column gap 14px.
          pb stays 24 for BottomNav clearance (canon's nav is a sibling row). */}
      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-24 flex flex-col gap-[14px] page-enter">
        {/* THE PAYOUT MOMENT — one-time banner when money just arrived */}
        {freshlyPaidAmount !== null && (
          /* `text-leaf-800` was dead: the leaf ramp is 100/500/700 only, so the
             class emitted nothing and both lines fell back to inherited ink.
             leaf-700 (#155C34) is canon's money-text colour. font-mono is gone
             throughout — canon sets no monospace anywhere in frame 19. */
          <Card accent="leaf" className="p-4 bg-leaf-100 bg-none flex items-center gap-3">
            <span className="text-[32px] leading-none" role="img" aria-hidden="true">🙏</span>
            <div className="flex items-baseline gap-1 flex-wrap">
              <MoneyCount target={freshlyPaidAmount} className="text-[26px] font-black text-leaf-700" />
              <span className="text-[19px] font-extrabold text-leaf-700 font-hindi">
                {t("earnings.paidBanner")}
              </span>
            </div>
          </Card>
        )}

        {/* CANON frame 19 HERO, verbatim:
              background: linear-gradient(150deg,#1E7A46,#155C34)   (NOT 135deg)
              border-radius: 22px · padding: 20px · text-align: center
              box-shadow: 0 8px 20px rgba(21,92,52,.28)
            The app had a 135deg two-token gradient and NO shadow at all, so the
            money card sat flat on the page where canon lifts it highest of any
            surface in the artboard set. Both are arbitrary-value classes rather
            than tokens: `shadow-btn-leaf` is a DIFFERENT shadow (rgba(30,122,70,
            .35)), and no 150deg gradient token exists. Card takes no style prop,
            so arbitrary values are the only way in without editing shared UI. */}
        <Card className="relative overflow-hidden p-5 border-0 rounded-surface text-center flex flex-col items-center bg-[linear-gradient(150deg,#1E7A46,#155C34)] shadow-[0_8px_20px_rgba(21,92,52,.28)]">
          {/* CANON g-coin, verbatim: the coins FALL through the hero
              (-90px → +64px with a 200deg roll and an opacity fade at both
              ends), left 20px on 2s/-.3s, right 16px on 2.2s/-1.1s. The app
              had them on a gentle ±8px bob canon never draws. Scoped here
              (not globals.css) so no other screen inherits it; under
              prefers-reduced-motion the coin rests at its natural spot,
              fully visible — the artboard's still frame. */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes pa-coin {
              0%   { transform: translateY(-90px) rotate(0deg); opacity: 0; }
              15%  { opacity: 1; }
              70%  { opacity: 1; }
              100% { transform: translateY(64px) rotate(200deg); opacity: 0; }
            }
            .pa-coin { animation-name: pa-coin; animation-timing-function: ease-in; animation-iteration-count: infinite; }
            @media (prefers-reduced-motion: reduce) {
              .pa-coin { animation: none !important; }
            }
          `,
            }}
          />
          <span
            aria-hidden
            className="pa-coin absolute top-3 left-4 text-[20px] select-none"
            style={{ animationDuration: "2s", animationDelay: "-0.3s" }}
          >
            🪙
          </span>
          <span
            aria-hidden
            className="pa-coin absolute top-3 right-[22px] text-[16px] select-none"
            style={{ animationDuration: "2.2s", animationDelay: "-1.1s" }}
          >
            🪙
          </span>
          {/* Canon label is 15/800 — legal at the 15px LABEL floor, so it is
              canon-exact (the earlier 19px lift was over-floored). COLOUR
              stays the lawConflict override: canon's #BEEBCE only reaches
              4.05:1 on the gradient's light end — leaf-100 (#E4F3E9) is the
              nearest lighter neighbour that clears 4.6:1. */}
          <span className="text-[15px] font-extrabold text-leaf-100 font-hindi">{t("home.monthEarnings")}</span>
          <MoneyCount target={summary.month} className="mt-1.5 text-[46px] font-extrabold text-white" />
        </Card>

        {/* आज / इस हफ़्ते (month lives in the hero now) */}
        {/* NOT IN CANON — canon frame 19 goes hero → मिल गया → आना बाकी with no
            आज/इस हफ़्ते tiles. Kept because they render real summary data the
            pandit would otherwise lose; restyled onto canon's row shape
            (#FFFDF8 / 1.5px #F0DFC4 / r14 / no shadow) so they read as part of
            the same surface family. Reported as an unresolved delta. */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="px-3.5 py-3 flex flex-col items-center justify-center text-center gap-1 rounded-[14px] bg-card bg-none border-[1.5px] border-sand shadow-none">
            <span className="text-[18px] font-bold text-softgrey font-hindi">{t("earnings.today")}</span>
            <MoneyCount target={summary.today} className="text-[20px] font-black text-leaf-700" />
          </Card>
          <Card className="px-3.5 py-3 flex flex-col items-center justify-center text-center gap-1 rounded-[14px] bg-card bg-none border-[1.5px] border-sand shadow-none">
            <span className="text-[18px] font-bold text-softgrey font-hindi">{t("earnings.thisWeek")}</span>
            <MoneyCount target={summary.week} className="text-[20px] font-black text-leaf-700" />
          </Card>
        </div>

        {/* मिल गया — received money first (mockup order) */}
        <div>
          {/* CANON heading: Material Symbol `account_balance_wallet` FILLED,
              20px #1E7A46 + 8px gap + label 15/800 #155C34, 9px below (15px is
              the LABEL floor, so canon's size stands exactly). The app used a
              💰 emoji, which canon never does in a section heading. */}
          <h3 className="flex items-center gap-2 mb-[9px]">
            <span className="material-symbols-outlined material-symbols-filled text-[20px] text-leaf-500" aria-hidden="true">
              account_balance_wallet
            </span>
            <span className="text-[15px] font-extrabold text-leaf-700 font-hindi">{t("earnings.paid")}</span>
          </h3>

          {pendingPayouts.length === 0 && paidPayouts.length === 0 ? (
            <EmptyState emoji="🪙" title={t("empty.noPayoutsTitle")} hint={t("empty.noPayoutsHint")} />
          ) : paidPayouts.length === 0 ? (
            <p className="text-[18px] text-softgrey font-hindi text-center py-4">{t("earnings.noPaid")}</p>
          ) : (
            <div className="flex flex-col gap-[9px]">
              {paidPayouts.map((p) => {
                const title = p.booking?.pujaType || p.booking?.eventType || "पूजा";
                return (
                  /* CANON row: #FFFDF8 flat fill, 1.5px #F0DFC4, r14, 12px/14px
                     padding, NO shadow. Card's defaults (cardsurface gradient,
                     2px border, r22, 18px, shadow-surface) are all overridden —
                     canon's list rows are deliberately the un-lit surface, and
                     the app had been lifting them like standalone cards. */
                  <Card key={p.id} className="px-3.5 py-3 rounded-[14px] bg-card bg-none border-[1.5px] border-sand shadow-none flex items-center gap-2">
                    {/* CANON row type: title 16/800 → BODY floor 18 · meta
                        13px → LABEL floor 15 · amount 18/900 is at the floor
                        already, so canon-exact. */}
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <span className="text-[18px] font-extrabold text-temple-700 font-hindi truncate">{title}</span>
                      {p.paidAt && (
                        <span className="text-[15px] text-softgrey font-hindi">{formatHindiDate(p.paidAt)}</span>
                      )}
                    </div>
                    <span className="text-[18px] font-black text-leaf-700 shrink-0">₹{p.amount.toLocaleString("en-IN")}</span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* आना बाकी — gold-tinted rows, brass amounts (money not yet received) */}
        <FirstUseTip tipId="earningsPending" targetRef={pendingRef} />
        <div ref={pendingRef}>
          {/* CANON heading: Material Symbol `schedule` (unfilled) 20px #B8860B,
              8px gap, single "आना बाकी · ₹8,200" run at 15/800 #B8860B (LABEL
              floor = canon-exact), 9px below. CONSERVATION BY CONSTRUCTION:
              canon's heading figure IS the sum of the pending rows under it
              (₹8,200 = 5,600 + 2,600), so the heading derives from the SAME
              rows the pandit sees — not from the parallel /earnings/summary
              request, which could skew for a moment between the two fetches. */}
          <h3 className="flex items-center gap-2 mb-[9px]">
            <span className="material-symbols-outlined text-[20px] text-brassdark" aria-hidden="true">
              schedule
            </span>
            <span className="text-[15px] font-extrabold text-brassdark font-hindi">
              {t("earnings.pendingPayout")} ·
            </span>
            <MoneyCount
              target={pendingPayouts.reduce((sum, p) => sum + p.amount, 0)}
              className="text-[15px] font-extrabold text-brassdark"
            />
          </h3>

          {pendingPayouts.length === 0 ? (
            paidPayouts.length > 0 ? (
              <p className="text-[18px] text-softgrey font-hindi text-center py-4">{t("earnings.noPending")}</p>
            ) : null
          ) : (
            <div className="flex flex-col gap-[9px]">
              {pendingPayouts.map((p) => {
                const title = p.booking?.pujaType || p.booking?.eventType || "पूजा";
                const dateVal = p.booking?.eventDate || p.createdAt;
                return (
                  /* CANON pending row: #FBF7EF (parchment) / 1.5px #EBCF86 /
                     r14 / 12px 14px / no shadow — the gold-tinted twin of the
                     paid row above. */
                  <Card key={p.id} className="px-3.5 py-3 rounded-[14px] bg-parchment bg-none border-[1.5px] border-[#EBCF86] shadow-none flex items-center gap-2">
                    {/* same canon row type as मिल गया: 18 / 15 / 18 */}
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <span className="text-[18px] font-extrabold text-temple-700 font-hindi truncate">{title}</span>
                      <span className="text-[15px] text-softgrey font-hindi">{formatHindiDate(dateVal)}</span>
                    </div>
                    <span className="text-[18px] font-black text-brassdark shrink-0">₹{p.amount.toLocaleString("en-IN")}</span>
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
