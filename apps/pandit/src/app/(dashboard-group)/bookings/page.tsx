"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import { DashboardVoiceNav } from "@/components/voice/DashboardVoiceNav";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

// UI Components
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { BottomNav } from "@/components/ui/BottomNav";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { VoiceActionListener } from "@/components/voice/VoiceActionListener";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShishyaOrb } from "@/components/ui/ShishyaOrb";
import { FirstUseTip } from "@/components/moments/FirstUseTip";

interface BookingItem {
  id: string;
  bookingNumber: string;
  pujaType: string;
  eventType: string;
  eventDate: string;
  venueAddress: string;
  venueCity: string;
  grandTotal: number;
  status: string;
}

// CANON frame 11 (बुकिंग सूची · List) is NOT a tab screen: it is one scroll
// carrying three status SECTIONS, each headed by a 10px status dot + a bold
// label with its live count. Section wording is canon's.
const sectionLabels = {
  new: "नई विनती",
  upcoming: "चालू",
  completed: "पूरी हुई",
  noBookings: "कोई बुकिंग नहीं है",
};

export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  // FLOW D: the empty state carries the same तैयारी CTA as home
  const [isBookingReady, setIsBookingReady] = useState(true);
  const [readinessStep, setReadinessStep] = useState(0);
  const listRef = useRef<HTMLElement | null>(null);
  const newRef = useRef<HTMLDivElement | null>(null);
  const upcomingRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef<HTMLDivElement | null>(null);

  // Fetch all bookings for this pandit
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const [res, meRes] = await Promise.all([api("/pandit/bookings"), api("/auth/me")]);
      setLoading(false);

      if (res.success && res.data) {
        setBookings(res.data);
      }
      if (meRes.success) {
        setIsBookingReady(meRes.data?.user?.panditProfile?.isBookingReady === true);
        setReadinessStep(meRes.data?.user?.panditProfile?.readinessStep || 0);
      }
    };
    fetchBookings();
  }, []);

  // Voice nav used to switch tabs; with canon's single scroll it moves the
  // viewport to the matching section instead. Reduced-motion safe.
  const goTo = (ref: React.RefObject<HTMLDivElement | null>) => () => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  if (loading) {
    return <DiyaLoader />;
  }

  const newItems = bookings.filter((b) => b.status === "REQUESTED");
  const upcomingItems = bookings.filter(
    (b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS" || b.status === "PUJA_IN_PROGRESS",
  );
  const completedItems = bookings.filter((b) => b.status === "COMPLETED");

  const countsNarration =
    newItems.length === 0
      ? `${t("bookingsList.intro")} ${t("bookingsSummary.none")}`
      : `${t("bookingsList.intro")} ${t("bookingsSummary.counts").replace("{count}", String(newItems.length))}`;

  const handleCardClick = (b: BookingItem) => {
    if (b.status === "REQUESTED") {
      router.push(`/bookings/${b.id}/request`);
    } else {
      router.push(`/bookings/${b.id}`);
    }
  };

  // Canon row meta line: "18 जुलाई · <where>" — short Hindi date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("hi-IN", { day: "numeric", month: "long" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const metaLine = (b: BookingItem) =>
    `${formatDate(b.eventDate)} · ${formatTime(b.eventDate)} · ${b.venueCity || b.venueAddress}`;

  // CANON left rail colour per status. Canon draws a 6px sindoor rail on a new
  // request, leaf on an accepted one, pital on one already in flight, and no
  // rail at all on a finished row.
  const railFor = (status: string) =>
    status === "REQUESTED"
      ? "#B23A1A"
      : status === "ACCEPTED"
        ? "#1E7A46"
        : "#E7B54A";

  // CANON row shell. Live rows: #FFFDF8 on a 1.5px warm hairline + 6px rail,
  // 16px radius, 13px/15px padding. The whole row is one horizontal band —
  // title+meta left, money/affordance right. No shadow: canon's list rows are
  // flat, the depth on this screen comes from the rail and the hairline.
  const Row = ({
    b,
    tone,
    right,
  }: {
    b: BookingItem;
    tone: "live" | "done";
    right: React.ReactNode;
  }) => (
    <motion.div
      key={b.id}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleCardClick(b)}
      // H1: a tappable row IS a button for the barge-in listener and the
      // keyboard (Enter/Space activate like a tap)
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(b);
        }
      }}
      className="cursor-pointer focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none rounded-field"
      style={
        tone === "live"
          ? {
              background: "#FFFDF8",
              border: `1.5px solid ${b.status === "REQUESTED" ? "#F4B096" : "#F0DFC4"}`,
              borderLeft: `6px solid ${railFor(b.status)}`,
              borderRadius: "16px",
              padding: "13px 15px",
            }
          : {
              background: "#FBF7EF",
              border: "1.5px solid #EADFCE",
              borderRadius: "16px",
              padding: "13px 15px",
              opacity: 0.9,
            }
      }
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="font-hindi leading-snug truncate"
            style={{
              fontSize: "18px",
              fontWeight: b.status === "REQUESTED" ? 900 : 800,
              color: tone === "live" ? "#341A13" : "#47241A",
            }}
          >
            {b.pujaType || b.eventType}
          </div>
          {/* LAW: canon sets this meta line at 14px; held at the 18sp floor. */}
          <div className="font-hindi truncate" style={{ fontSize: "18px", color: "#8A6F5C" }}>
            {metaLine(b)}
          </div>
        </div>
        {right}
      </div>
    </motion.div>
  );

  // CANON section head: 10px status dot + 15px/800 label in the status ink.
  const SectionHead = ({ dot, ink, text }: { dot: string; ink: string; text: string }) => (
    <div className="flex items-center gap-2" style={{ marginBottom: "9px" }}>
      <span
        aria-hidden="true"
        className="shrink-0"
        style={{ width: "10px", height: "10px", borderRadius: "50%", background: dot }}
      />
      {/* LAW: canon sets section labels at 15px; held at the 18sp floor. */}
      <h2 className="font-hindi" style={{ fontSize: "18px", fontWeight: 800, color: ink }}>
        {text}
      </h2>
    </div>
  );

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Narrate text={countsNarration} />
      <DashboardVoiceNav helpLine={t("help.bookings")} />
      <VoiceActionListener
        commands={[
          { keywords: ["नई", "नयी", "new"], action: goTo(newRef) },
          { keywords: ["आने वाली", "aane wali", "upcoming"], action: goTo(upcomingRef) },
          { keywords: ["पूरी", "पुरानी", "completed"], action: goTo(completedRef) },
          { keywords: ["होम", "home"], action: () => router.push("/home") },
        ]}
        promptText={t("help.bookings")}
      />

      {/* CANON title row — this frame carries no sindoor header band, just the
          24px/900 screen name over the cream. */}
      <div style={{ padding: "8px 18px 6px" }}>
        <h1
          className="font-hindi"
          style={{ fontSize: "24px", fontWeight: 900, color: "#341A13" }}
        >
          📿 {t("bookingsList.title")}
        </h1>
      </div>

      <FirstUseTip tipId="bookingsTabs" targetRef={listRef} />
      <main
        ref={listRef}
        className="flex-1 overflow-y-auto min-h-0 flex flex-col page-enter"
        style={{ padding: "6px 16px 96px", gap: "16px" }}
      >
        {bookings.length === 0 ? (
          <>
            {/* canon frame 27a: शिष्य himself (awake, size 96, no label) is
                the empty-state ornament — not an emoji medallion */}
            <EmptyState
              ornament={<ShishyaOrb size={96} showLabel={false} demoState="awake" />}
              title={t("empty.noBookingsYetTitle")}
              hint={t("empty.noBookingsYetHint")}
            />
            {/* FLOW D: not booking-ready yet → same तैयारी hero CTA as home */}
            {!isBookingReady && (
              <Card
                clickable
                onClick={() => router.push("/readiness/hub")}
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
                <span className="text-softgrey text-[18px] font-hindi">{t("coach.tryIt")}</span>
              </Card>
            )}
          </>
        ) : newItems.length + upcomingItems.length + completedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
            <span className="text-[64px]">🌤️</span>
            <span className="text-[20px] font-bold text-softgrey font-hindi">
              {sectionLabels.noBookings}
            </span>
          </div>
        ) : (
          <>
            {newItems.length > 0 && (
              <div ref={newRef}>
                <SectionHead
                  dot="#B23A1A"
                  ink="#7A250E"
                  text={`${sectionLabels.new} · ${newItems.length}`}
                />
                <div className="flex flex-col" style={{ gap: "10px" }}>
                  {newItems.map((b) => (
                    <Row
                      key={b.id}
                      b={b}
                      tone="live"
                      right={
                        <div className="text-right shrink-0">
                          <div style={{ fontSize: "18px", fontWeight: 900, color: "#155C34" }}>
                            ₹{b.grandTotal ? b.grandTotal.toLocaleString("en-IN") : "0"}
                          </div>
                          {/* LAW: canon sets this affordance at 12px; raised to 16px. */}
                          <div
                            className="font-hindi"
                            style={{ fontSize: "16px", fontWeight: 800, color: "#B23A1A" }}
                          >
                            जवाब दीजिए ›
                          </div>
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {upcomingItems.length > 0 && (
              <div ref={upcomingRef}>
                <SectionHead
                  dot="#1E7A46"
                  ink="#155C34"
                  text={`${sectionLabels.upcoming} · ${upcomingItems.length}`}
                />
                <div className="flex flex-col" style={{ gap: "10px" }}>
                  {upcomingItems.map((b) => (
                    <Row key={b.id} b={b} tone="live" right={<StatusChip status={b.status} />} />
                  ))}
                </div>
              </div>
            )}

            {completedItems.length > 0 && (
              <div ref={completedRef}>
                <SectionHead dot="#8A6F5C" ink="#8A6F5C" text={sectionLabels.completed} />
                <div className="flex flex-col" style={{ gap: "10px" }}>
                  {completedItems.map((b) => (
                    <Row
                      key={b.id}
                      b={b}
                      tone="done"
                      right={
                        <span
                          className="shrink-0"
                          style={{ fontSize: "18px", fontWeight: 900, color: "#155C34" }}
                        >
                          ₹{b.grandTotal ? b.grandTotal.toLocaleString("en-IN") : "0"}
                        </span>
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={1} onChange={(idx) => {
        if (idx === 0) router.push("/home");
        else if (idx === 2) router.push("/earnings");
        else if (idx === 3) router.push("/calendar");
      }} />
    </div>
  );
}
