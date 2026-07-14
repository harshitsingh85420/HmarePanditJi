"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import { DashboardVoiceNav } from "@/components/voice/DashboardVoiceNav";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { mutateOnce } from "@/lib/mutate";
import { api } from "@/lib/api";

// UI Components
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";
import { Toast } from "@/components/ui/Toast";
import { FirstUseTip } from "@/components/moments/FirstUseTip";
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { useVoice } from "@/hooks/useVoice";

interface BookingItem {
  id: string;
  eventDate: string;
  status: string;
}

interface BlockedDateItem {
  id: string;
  date: string;
}

const MONTHS_HINDI = [
  "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
];

const WEEKDAYS = ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"];

export default function CalendarPage() {
  const router = useRouter();
  const { speak } = useVoice();

  const [loading, setLoading] = useState(true);
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data states
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]); // Array of "YYYY-MM-DD" keys

  // UI state
  const [toastMsg, setToastMsg] = useState("");

  const fetchCalendarData = async () => {
    const [bookingsRes, blockedRes] = await Promise.all([
      api("/pandit/bookings"),
      api("/pandit/blocked-dates"),
    ]);

    if (bookingsRes.success && bookingsRes.data) {
      setBookings(bookingsRes.data);
    }

    if (blockedRes.success && blockedRes.data) {
      // Map UTC strings back to date keys in local/standard format "YYYY-MM-DD"
      const dateKeys = (blockedRes.data as BlockedDateItem[]).map((item) => {
        const d = new Date(item.date);
        const y = d.getUTCFullYear();
        const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
        const day = d.getUTCDate().toString().padStart(2, "0");
        return `${y}-${m}-${day}`;
      });
      setBlockedDates(dateKeys);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCalendarData();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return <DiyaLoader />;
  }

  // Pre-process collections for quick cell evaluations
  const activeBookingsSet = new Set<string>();
  bookings.forEach((b) => {
    if (b.status === "ACCEPTED" || b.status === "IN_PROGRESS" || b.status === "PUJA_IN_PROGRESS") {
      const d = new Date(b.eventDate);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      activeBookingsSet.add(`${y}-${m}-${day}`);
    }
  });

  const blockedSet = new Set(blockedDates);

  // Plain date maths helper
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthHasBookings = bookings.some((b) => {
    const d = new Date(b.eventDate);
    return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === month;
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday etc.
  const paddingOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const totalDays = new Date(year, month + 1, 0).getDate();

  const gridCells: { dayNum: number | null; dateKey: string | null }[] = [];

  // 1. Previous month blank cells
  for (let i = 0; i < paddingOffset; i++) {
    gridCells.push({ dayNum: null, dateKey: null });
  }

  // 2. Current month cells
  for (let d = 1; d <= totalDays; d++) {
    const mStr = (month + 1).toString().padStart(2, "0");
    const dStr = d.toString().padStart(2, "0");
    gridCells.push({
      dayNum: d,
      dateKey: `${year}-${mStr}-${dStr}`,
    });
  }

  // 3. Post padding cells to make rows perfect multiple of 7
  while (gridCells.length % 7 !== 0) {
    gridCells.push({ dayNum: null, dateKey: null });
  }

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const handleDayClick = async (dateKey: string, dayVal: number) => {
    const cellDate = new Date(year, month, dayVal);
    cellDate.setHours(0, 0, 0, 0);

    // Past date check
    if (cellDate.getTime() < todayMidnight.getTime()) {
      return;
    }

    // Booked date check
    if (activeBookingsSet.has(dateKey)) {
      setToastMsg("इस दिन बुकिंग है");
      speak("इस दिन बुकिंग है");
      return;
    }

    const wasBlocked = blockedSet.has(dateKey);

    // Optimistic UI state toggle
    const updatedBlocked = [...blockedDates];
    if (wasBlocked) {
      const idx = updatedBlocked.indexOf(dateKey);
      if (idx > -1) updatedBlocked.splice(idx, 1);
    } else {
      updatedBlocked.push(dateKey);
    }
    setBlockedDates(updatedBlocked);

    let success = false;
    if (wasBlocked) {
      const res = await mutateOnce(`unblock-date:${dateKey}`, `/pandit/blocked-dates/${dateKey}`, {
        method: "DELETE",
      });
      success = res.success;
    } else {
      const res = await mutateOnce(`block-date:${dateKey}`, "/pandit/blocked-dates", {
        method: "POST",
        body: JSON.stringify({ date: dateKey }),
      });
      success = res.success;
    }

    if (!success) {
      // Rollback
      setBlockedDates(blockedDates);
      setToastMsg(t("common.error"));
      speak(t("common.error"));
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header title={t("calendar.title")} showBack onBack={() => router.push("/home")} />

      {/* BLOCK VOICE NARRATION ON MOUNT */}
      <Narrate text={t("calendar.blockVoice")} />
      <DashboardVoiceNav helpLine={t("help.calendar")} />

      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 flex flex-col gap-3 page-enter">
        {/* MONTH SELECTOR BANNER */}
        <div className="flex items-center justify-between bg-white p-3 rounded-card border border-saffron-100 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="w-14 h-14 bg-white border border-saffron-200 text-saffron-700 rounded-btn flex items-center justify-center font-bold text-[24px] active:scale-90 transition-transform"
            style={{ minHeight: "56px" }}
          >
            ‹
          </button>
          <h2 className="text-[22px] font-bold text-temple-700 font-hindi">
            {MONTHS_HINDI[month]} {year}
          </h2>
          <button
            onClick={handleNextMonth}
            className="w-14 h-14 bg-white border border-saffron-200 text-saffron-700 rounded-btn flex items-center justify-center font-bold text-[24px] active:scale-90 transition-transform"
            style={{ minHeight: "56px" }}
          >
            ›
          </button>
        </div>

        {/* EMPTY MONTH — gentle note above the grid */}
        {!monthHasBookings && (
          <div className="flex items-center justify-center gap-2 bg-white rounded-card border border-saffron-100 px-4 py-3">
            <span className="text-[24px]" role="img" aria-hidden="true">📅</span>
            <span className="t-hint text-softgrey font-hindi">{t("empty.calendarEmptyTitle")}</span>
          </div>
        )}

        {/* CUSTOM MONTH GRID CARD */}
        <FirstUseTip tipId="calendarBlock" targetRef={gridRef} />
        <div ref={gridRef}>
        <Card className="p-4 bg-white border border-saffron-100 shadow-sm flex flex-col gap-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center border-b border-saffron-100 pb-2">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[16px] font-bold text-softgrey font-hindi">
                {w}
              </span>
            ))}
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-y-3 gap-x-1">
            {gridCells.map((cell, idx) => {
              if (!cell.dayNum || !cell.dateKey) {
                return <div key={`empty-${idx}`} className="w-12 h-12" style={{ minHeight: "48px" }} />;
              }

              const cellDate = new Date(year, month, cell.dayNum);
              cellDate.setHours(0, 0, 0, 0);
              const isPast = cellDate.getTime() < todayMidnight.getTime();

              const hasBooking = activeBookingsSet.has(cell.dateKey);
              const isBlocked = blockedSet.has(cell.dateKey);

              return (
                <button
                  key={cell.dateKey}
                  onClick={() => cell.dateKey && handleDayClick(cell.dateKey, cell.dayNum || 0)}
                  disabled={isPast}
                  className={`w-12 h-12 rounded-btn flex flex-col items-center justify-center relative select-none font-bold text-[18px] transition-all active:scale-90 ${
                    isPast
                      ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                      : hasBooking
                      ? "bg-saffron-50 text-saffron-800 border-2 border-saffron-400"
                      : isBlocked
                      ? "bg-slate-200 text-slate-500 border border-slate-300"
                      : "bg-white text-ink border border-saffron-100 hover:bg-saffron-50/50"
                  }`}
                  style={{ minHeight: "48px", minWidth: "48px" }}
                >
                  <span>{cell.dayNum}</span>

                  {/* Booking dot */}
                  {hasBooking && !isPast && (
                    <span className="absolute bottom-1 w-2.5 h-2.5 bg-saffron-500 rounded-full" />
                  )}

                  {/* Block indicator */}
                  {isBlocked && !isPast && (
                    <span className="absolute text-[14px] top-0 right-1 text-slate-500">✖</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
        </div>

        {/* LEGEND SECTION */}
        <div className="flex justify-center items-center gap-4 text-[16px] text-softgrey font-hindi py-1 bg-white border border-saffron-100 rounded-btn">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px]">🟠</span>
            <span>{t("calendar.booking")}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[16px]">✖</span>
            <span>{t("calendar.blocked")}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] border border-saffron-100 w-4 h-4 bg-white rounded flex items-center justify-center" />
            <span>{t("calendar.available")}</span>
          </div>
        </div>
      </main>

      {/* BOTTOM NAV */}
      <BottomNav activeTab={3} onChange={(idx) => {
        if (idx === 0) router.push("/home");
        else if (idx === 1) router.push("/bookings");
        else if (idx === 2) router.push("/earnings");
      }} />

      {/* Toast Notification */}
      {toastMsg && <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}
