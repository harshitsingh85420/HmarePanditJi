"use client";

import { Narrate } from "@/hooks/useScreenVoice";
import { DashboardVoiceNav } from "@/components/voice/DashboardVoiceNav";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { mutateOnce } from "@/lib/mutate";
import { api } from "@/lib/api";

// UI Components
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

// Mockup frame 20: single-letter weekday heads, week starts रविवार
const WEEKDAYS = ["र", "सो", "मं", "बु", "गु", "शु", "श"];

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
  // Sunday-start grid (mockup frame 20) — getDay() already is the offset
  const paddingOffset = startDayOfWeek;

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
      {/* canon frame 20: plain title block "📅 कैलेंडर" + the tap hint (canon
          14px → 15px label floor). No back — BottomNav is the escape. */}
      <Header variant="title" title={`📅 ${t("calendar.title")}`} sub="तारीख दबाकर छुट्टी लगाइए" />

      {/* BLOCK VOICE NARRATION ON MOUNT */}
      <Narrate text={t("calendar.blockVoice")} />
      <DashboardVoiceNav helpLine={t("help.calendar")} />

      <main className="flex-1 overflow-y-auto px-[18px] pt-2 pb-24 flex flex-col gap-3 page-enter">
        {/* CANON frame 28 title block: 8px 18px 2px, hint 700/#8A6F5C, LEFT aligned.
            Canon sizes it 14px; the 18sp body floor wins (lawConflicts). */}
        <p className="text-[18px] font-bold text-softgrey font-hindi">
          {t("calendar.hint")}
        </p>

        {/* MONTH SELECTOR — canon: plain row, arrows #8A6F5C weight 400,
            label 20px/800 #341A13. Targets stay 56px per the tap-target law. */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            aria-label="पिछला महीना"
            className="w-14 h-14 min-h-[56px] flex items-center justify-center text-softgrey font-normal text-[18px] active:scale-90 transition-transform motion-reduce:transition-none"
          >
            ◀
          </button>
          <h2 className="text-[20px] font-extrabold text-temple-700 font-hindi">
            {MONTHS_HINDI[month]} {year}
          </h2>
          <button
            onClick={handleNextMonth}
            aria-label="अगला महीना"
            className="w-14 h-14 min-h-[56px] flex items-center justify-center text-softgrey font-normal text-[18px] active:scale-90 transition-transform motion-reduce:transition-none"
          >
            ▶
          </button>
        </div>

        {/* EMPTY MONTH — truthful-state note (no canon equivalent); carries
            canon's #EADFCE 1.5px hairline so it reads as part of the screen. */}
        {!monthHasBookings && (
          <div className="flex items-center justify-center gap-2 bg-card rounded-[12px] border-[1.5px] border-sand-100 px-4 py-3">
            <span className="text-[24px]" role="img" aria-hidden="true">📅</span>
            {/* Canon empty-note is t-hint (16px/400/softgrey). t-hint lives in the
                shared globals.css layer; the 18sp body floor (Ruling #2) is inlined
                here instead of editing the shared class. Weight 400 + softgrey kept. */}
            <span className="text-[18px] font-normal text-softgrey font-hindi">{t("empty.calendarEmptyTitle")}</span>
          </div>
        )}

        {/* MONTH GRID — sits straight on cream (mockup frame 20, no card box) */}
        <FirstUseTip tipId="calendarBlock" targetRef={gridRef} />
        <div ref={gridRef} className="flex flex-col gap-1">
          {/* Weekday headers — canon 700/#8A6F5C, 4px grid gap, 2px bottom pad.
              Canon sizes them 12px; the 18sp floor wins (lawConflicts). */}
          <div className="grid grid-cols-7 gap-[4px] text-center pb-[2px]">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[18px] font-bold text-softgrey font-hindi">
                {w}
              </span>
            ))}
          </div>

          {/* Days cells — canon: uniform 4px gap, aspect-ratio 1 */}
          <div className="grid grid-cols-7 gap-[4px]">
            {gridCells.map((cell, idx) => {
              if (!cell.dayNum || !cell.dateKey) {
                return <div key={`empty-${idx}`} className="aspect-square min-h-[52px]" />;
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
                  className={`aspect-square min-h-[52px] rounded-[12px] border-[1.5px] flex flex-col items-center justify-center gap-[1px] select-none text-[18px] transition-transform duration-[180ms] motion-reduce:transition-none active:scale-[0.92] ${
                    isPast
                      ? "font-bold text-sand-400 bg-[#F4EFE6] border-[#F4EFE6] cursor-not-allowed"
                      : hasBooking
                      ? "bg-saffron-50 text-saffron-500 border-saffron-200 font-extrabold"
                      : isBlocked
                      ? "bg-[#E9E2D6] text-softgrey border-[#E9E2D6] font-semibold"
                      : "bg-card text-temple-700 border-sand-100 font-bold"
                  }`}
                >
                  <span className="leading-none">{cell.dayNum}</span>

                  {/* Canon: the badge slot is ALWAYS present at a fixed 9px
                      height, so toggling छुट्टी never shifts the grid. */}
                  <span
                    className="text-[9px] leading-none h-[9px] font-bold"
                    aria-hidden
                  >
                    {!isPast && hasBooking ? "●" : !isPast && isBlocked ? "✕" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LEGEND — canon: left-aligned wrapping row, 14px swatches @ radius 5,
            1.5px hairlines, छुट्टी swatch is a flat fill with no border.
            Canon labels are 13px; the 18sp floor wins (lawConflicts). */}
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-2 pt-[2px] text-[18px] font-semibold text-softgrey font-hindi">
          <span className="flex items-center gap-1.5">
            <span className="w-[14px] h-[14px] shrink-0 rounded-[5px] bg-card border-[1.5px] border-sand-100" aria-hidden />
            {t("calendar.available")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-[14px] h-[14px] shrink-0 rounded-[5px] bg-[#E9E2D6]" aria-hidden />
            {t("calendar.blocked")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-[14px] h-[14px] shrink-0 rounded-[5px] bg-saffron-50 border-[1.5px] border-saffron-200" aria-hidden />
            {t("calendar.booking")}
          </span>
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
