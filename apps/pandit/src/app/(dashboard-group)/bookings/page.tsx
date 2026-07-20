"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import { DashboardVoiceNav } from "@/components/voice/DashboardVoiceNav";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

// UI Components
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { StatusChip } from "@/components/ui/StatusChip";
import { BottomNav } from "@/components/ui/BottomNav";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { VoiceActionListener } from "@/components/voice/VoiceActionListener";
import { EmptyState } from "@/components/ui/EmptyState";
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

// Mockup frame 11 wording: नई विनती / चालू / पूरी हुई (+ live counts on tabs)
const bookingLabels = {
  tabNew: "नई विनती",
  tabUpcoming: "चालू",
  tabCompleted: "पूरी हुई",
  noBookings: "कोई बुकिंग नहीं है",
};

export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  // FLOW D: the empty state carries the same तैयारी CTA as home
  const [isBookingReady, setIsBookingReady] = useState(true);
  const [readinessStep, setReadinessStep] = useState(0);
  const tabsRef = React.useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<"NEW" | "UPCOMING" | "COMPLETED">("NEW");

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

  if (loading) {
    return <DiyaLoader />;
  }

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "NEW") {
      return b.status === "REQUESTED";
    }
    if (activeTab === "UPCOMING") {
      return b.status === "ACCEPTED" || b.status === "IN_PROGRESS" || b.status === "PUJA_IN_PROGRESS";
    }
    if (activeTab === "COMPLETED") {
      return b.status === "COMPLETED";
    }
    return false;
  });

  // Date-group headers: आज / कल / इस हफ़्ते / बाद में
  const groupOf = (dateStr: string): string => {
    const d = new Date(dateStr);
    const now = new Date();
    const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(d) - day(now)) / 86400000);
    if (diff <= 0) return t("bookingsSummary.today");
    if (diff === 1) return t("bookingsSummary.tomorrowHdr");
    if (diff <= 7) return t("bookingsSummary.thisWeek");
    return t("bookingsSummary.later");
  };
  const grouped: Array<{ header: string; items: BookingItem[] }> = [];
  for (const b of filteredBookings) {
    const header = groupOf(b.eventDate);
    const last = grouped[grouped.length - 1];
    if (last && last.header === header) last.items.push(b);
    else grouped.push({ header, items: [b] });
  }

  const newCount = bookings.filter((b) => b.status === "REQUESTED").length;
  const upcomingCount = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS" || b.status === "PUJA_IN_PROGRESS").length;
  const countsNarration =
    newCount === 0
      ? `${t("bookingsList.intro")} ${t("bookingsSummary.none")}`
      : `${t("bookingsList.intro")} ${t("bookingsSummary.counts").replace("{count}", String(newCount))}`;

  const handleCardClick = (b: BookingItem) => {
    if (b.status === "REQUESTED") {
      router.push(`/bookings/${b.id}/request`);
    } else {
      router.push(`/bookings/${b.id}`);
    }
  };

  // Mockup frame 11 row line: "18 जुलाई · <where>" — short Hindi date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header title={t("bookingsList.title")} showBack onBack={() => router.push("/home")} />
      <Narrate text={countsNarration} />
      <DashboardVoiceNav helpLine={t("help.bookings")} />
      <VoiceActionListener
        commands={[
          { keywords: ["नई", "नयी", "new"], action: () => setActiveTab("NEW") },
          { keywords: ["आने वाली", "aane wali", "upcoming"], action: () => setActiveTab("UPCOMING") },
          { keywords: ["पूरी", "पुरानी", "completed"], action: () => setActiveTab("COMPLETED") },
          { keywords: ["होम", "home"], action: () => router.push("/home") },
        ]}
        promptText={t("help.bookings")}
      />

      {/* Tabs bar */}
      <FirstUseTip tipId="bookingsTabs" targetRef={tabsRef} />
      <div ref={tabsRef} className="flex bg-white border-b border-saffron-100 sticky top-[56px] z-20">
        <button
          onClick={() => setActiveTab("NEW")}
          className={`flex-1 text-center py-4 font-bold text-[18px] transition-all border-b-4 ${
            activeTab === "NEW" ? "border-saffron-500 text-saffron-700" : "border-transparent text-softgrey"
          }`}
          style={{ minHeight: "56px" }}
        >
          {bookingLabels.tabNew}{newCount > 0 ? ` · ${newCount}` : ""}
        </button>
        <button
          onClick={() => setActiveTab("UPCOMING")}
          className={`flex-1 text-center py-4 font-bold text-[18px] transition-all border-b-4 ${
            activeTab === "UPCOMING" ? "border-saffron-500 text-saffron-700" : "border-transparent text-softgrey"
          }`}
          style={{ minHeight: "56px" }}
        >
          {bookingLabels.tabUpcoming}{upcomingCount > 0 ? ` · ${upcomingCount}` : ""}
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`flex-1 text-center py-4 font-bold text-[18px] transition-all border-b-4 ${
            activeTab === "COMPLETED" ? "border-saffron-500 text-saffron-700" : "border-transparent text-softgrey"
          }`}
          style={{ minHeight: "56px" }}
        >
          {bookingLabels.tabCompleted}
        </button>
      </div>

      {/* Bookings List */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 flex flex-col gap-3 page-enter">
        {bookings.length === 0 ? (
          <>
            <EmptyState emoji="🙏" title={t("empty.noBookingsYetTitle")} hint={t("empty.noBookingsYetHint")} />
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
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
            <span className="text-[64px]">🌤️</span>
            <span className="text-[20px] font-bold text-softgrey font-hindi">
              {bookingLabels.noBookings}
            </span>
          </div>
        ) : (
          grouped.map((g) => (
            <React.Fragment key={g.header}>
              <h4 className="t-hint font-bold text-temple-600 font-hindi mt-1">{g.header}</h4>
              {g.items.map((b) => (
            <motion.div
              key={b.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(b)}
              // H1: a tappable row IS a button for the barge-in listener
              // and the keyboard (Enter/Space activate like a tap)
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(b);
                }
              }}
              className="cursor-pointer focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none rounded-card"
            >
              {/* Mockup frame 11 row: puja bold + ₹ right; compact
                  "18 जुलाई · time · place" line; NEW rows carry the
                  "जवाब दें ›" affordance, others their status chip. */}
              <Card className="p-4 flex flex-col gap-2.5 hover:shadow-md transition-all border-l-4 border-saffron-500">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-[20px] font-bold text-temple-700 font-hindi leading-snug">
                    {b.pujaType || b.eventType}
                  </h3>
                  <span className="text-[18px] font-bold text-leaf-700 shrink-0">
                    ₹{b.grandTotal ? b.grandTotal.toLocaleString("en-IN") : "0"}
                  </span>
                </div>

                <span className="text-[16px] text-softgrey font-hindi truncate">
                  {formatDate(b.eventDate)} · {formatTime(b.eventDate)} · {b.venueCity || b.venueAddress}
                </span>

                <div className="flex items-center justify-between border-t border-saffron-100/50 pt-2">
                  <span className="t-hint text-softgrey font-mono">{b.bookingNumber}</span>
                  {b.status === "REQUESTED" ? (
                    <span className="text-[16px] font-bold text-saffron-700 font-hindi">जवाब दें ›</span>
                  ) : (
                    <StatusChip status={b.status} />
                  )}
                </div>
              </Card>
            </motion.div>
              ))}
            </React.Fragment>
          ))
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
