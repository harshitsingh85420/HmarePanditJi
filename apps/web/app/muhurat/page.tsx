"use client";

/* FABRICATED-NOT-EMPTY — F-J4-1, ruled by Isj 2026-08-01, part one.
   ────────────────────────────────────────────────────────────────
   What was here: a calendar hardcoded to `new Date("2024-12-01")`, a
   fixed `pujas` map (3,6,11,16,18,25) invented out of nothing, a
   "Puja List for Dec 16" of four made-up ceremonies with made-up time
   windows, each with a "Search Pandits" CTA, and the line
   "Today's Tithi: Shukla Paksha Dashami. Nakshatra: Revati."
   presented as TODAY'S panchang. The page made ZERO API calls — an
   instrumented fetch during render showed only Next RSC prefetches.

   The muhurat API is real and has always been (services/api/src/
   controllers/muhurat.controller.ts, backed by prisma.muhuratDate).
   The fabricated rows were deleted from production FOR BEING
   FABRICATED; this page never noticed BECAUSE IT NEVER ASKED.

   The class, and why Phase 0 misfiled this as EMPTY-NOT-BROKEN: the
   API was measured, the RENDERED SURFACE was not. An inventory that
   reads the server can miss what the client INVENTS.

   Two laws are load-bearing below and must survive edits:
     · ERROR ≠ EMPTY. A failed fetch must never render as "no
       auspicious dates" — that is a religious claim made out of a
       network timeout. Same shape as NO SESSION ≠ NO DATA
       (dashboard/bookings/page.tsx).
     · No CTA hangs off data this app invented. Every "Search Pandits"
       button below is rendered from an API row's own pujaType, or it
       is not rendered at all. */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    ChevronLeft, ChevronRight, Search, Bell, Calendar as CalendarIcon,
    Clock, Sun
} from "lucide-react";
import { resolveApiBase } from "@hmarepanditji/utils";

const API_URL = resolveApiBase(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NODE_ENV === "development",
).base;

type LoadState = "loading" | "ok" | "error";

/** GET /muhurat/dates → { dates: [{ date, count, pujaTypes }] } */
interface MuhuratDateGroup {
    date: string;
    count: number;
    pujaTypes: string[];
}

/** GET /muhurat/pujas-for-date → { muhurats: [{ pujaType, timeWindow, significance, source }] } */
interface MuhuratEntry {
    pujaType: string | null;
    timeWindow: string | null;
    significance: string | null;
    source: string | null;
}

const MONTH_LABELS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const isoDay = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function MuhuratExplorerPage() {
    // The displayed month starts at the REAL current month, not a frozen
    // literal. Prev/Next were decorative buttons; they now move this cursor.
    const [cursor, setCursor] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const [dates, setDates] = useState<MuhuratDateGroup[]>([]);
    const [datesState, setDatesState] = useState<LoadState>("loading");

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [entries, setEntries] = useState<MuhuratEntry[]>([]);
    const [entriesState, setEntriesState] = useState<LoadState>("ok");

    const year = cursor.getFullYear();
    const month = cursor.getMonth(); // 0-indexed

    const fetchDates = useCallback(async (y: number, m: number) => {
        setDatesState("loading");
        try {
            const res = await fetch(`${API_URL}/muhurat/dates?month=${m + 1}&year=${y}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body = await res.json();
            if (!body?.success) throw new Error("unsuccessful response");
            setDates(Array.isArray(body.data?.dates) ? body.data.dates : []);
            setDatesState("ok");
        } catch (err) {
            console.error("muhurat/dates", err);
            setDates([]);
            setDatesState("error");
        }
    }, []);

    useEffect(() => {
        setSelectedDate(null);
        setEntries([]);
        fetchDates(year, month);
    }, [year, month, fetchDates]);

    const openDate = useCallback(async (dayIso: string) => {
        setSelectedDate(dayIso);
        setEntriesState("loading");
        try {
            const res = await fetch(`${API_URL}/muhurat/pujas-for-date?date=${dayIso}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body = await res.json();
            if (!body?.success) throw new Error("unsuccessful response");
            setEntries(Array.isArray(body.data?.muhurats) ? body.data.muhurats : []);
            setEntriesState("ok");
        } catch (err) {
            console.error("muhurat/pujas-for-date", err);
            setEntries([]);
            setEntriesState("error");
        }
    }, []);

    // ── the grid, computed from the real month ──────────────────────
    // The replaced version carried a dead `if (i < 0)` branch and an
    // unused `startingDayOfWeek = 0`, so December 2024 was rendered on a
    // grid that started on the wrong weekday too.
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
    const cells: Array<{ day: number; iso: string } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, iso: isoDay(new Date(year, month, d)) });
    while (cells.length % 7 !== 0) cells.push(null);

    const byDate = new Map(dates.map((d) => [d.date, d]));
    const todayIso = isoDay(new Date());

    const monthLabel = `${MONTH_LABELS[month]} ${year}`;
    const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#221b10] text-slate-900 dark:text-white min-h-screen font-sans flex flex-col">
            <div className="relative flex flex-col w-full min-h-screen overflow-x-hidden">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-white/10 px-6 py-4 lg:px-20 bg-[#f8f7f5] dark:bg-[#221b10] sticky top-0 z-50">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 text-[#f29e0d]">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star_rate</span>
                            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] font-display text-slate-900 dark:text-white" style={{ fontFamily: '"Noto Serif", serif' }}>HmarePanditJi</h2>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f29e0d] transition-colors" href="/muhurat">Muhurat</Link>
                            <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f29e0d] transition-colors" href="/search">Pujas</Link>
                            <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f29e0d] transition-colors" href="/search">Pandits</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="hidden lg:flex items-center relative group">
                            <Search className="absolute left-3 text-slate-400 group-focus-within:text-[#f29e0d] transition-colors" size={20} />
                            <input
                                className="w-64 h-10 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-white/5 border-none focus:ring-1 focus:ring-[#f29e0d] text-sm placeholder:text-slate-500"
                                placeholder="Search for Pujas or Pandits"
                            />
                        </label>
                        <button className="p-2 text-slate-600 dark:text-slate-300"><Bell size={24} /></button>
                        <Link href="/dashboard" className="bg-[#f29e0d] text-[#221b10] px-6 py-2 rounded-lg font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
                            Profile
                        </Link>
                    </div>
                </header>

                <main className="flex flex-1 flex-col lg:flex-row p-4 lg:p-8 gap-6 max-w-[1600px] mx-auto w-full">
                    {/* Left Sidebar */}
                    <aside className="w-full lg:w-72 flex flex-col gap-6">
                        <div className="flex flex-col gap-2 p-2">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: '"Noto Serif", serif' }}>Muhurat Explorer</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Find auspicious timings for your sacred events.</p>
                        </div>
                        <nav className="flex flex-col gap-1">
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f29e0d]/10 text-[#f29e0d] border border-[#f29e0d]/20" href="/muhurat">
                                <CalendarIcon size={20} />
                                <span className="font-medium">Calendar</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/dashboard/bookings">
                                <span className="material-symbols-outlined text-xl">book_online</span>
                                <span className="font-medium">My Bookings</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/search">
                                <span className="material-symbols-outlined text-xl">person_search</span>
                                <span className="font-medium">Pandit Search</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/dashboard/profile">
                                <span className="material-symbols-outlined text-xl">settings</span>
                                <span className="font-medium">Settings</span>
                            </Link>
                        </nav>
                    </aside>

                    {/* Center Calendar Section */}
                    <section className="flex-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold" style={{ fontFamily: '"Noto Serif", serif' }}>{monthLabel}</h2>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => shiftMonth(-1)}
                                            aria-label="Previous month"
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={() => shiftMonth(1)}
                                            aria-label="Next month"
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {datesState === "loading" && (
                                <div className="py-16 text-center text-slate-500 animate-pulse">
                                    मुहूर्त तिथियाँ लोड हो रही हैं…
                                </div>
                            )}

                            {/* ERROR ≠ EMPTY. A network failure is not a statement
                                about which days are auspicious. */}
                            {datesState === "error" && (
                                <div className="py-16 px-4 text-center flex flex-col items-center">
                                    <div className="text-4xl mb-3">⚠️</div>
                                    <h3 className="text-lg font-bold mb-2">मुहूर्त तिथियाँ अभी लोड नहीं हो पाईं</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                                        यह कनेक्शन की समस्या है — इसका मतलब यह नहीं कि इस महीने कोई शुभ तिथि नहीं है।
                                    </p>
                                    <button
                                        onClick={() => fetchDates(year, month)}
                                        className="mt-5 px-6 py-2.5 rounded-lg border border-[#f29e0d] text-[#f29e0d] font-bold text-sm hover:bg-[#f29e0d] hover:text-[#221b10] transition-all"
                                    >
                                        फिर कोशिश कीजिए
                                    </button>
                                </div>
                            )}

                            {datesState === "ok" && dates.length === 0 && (
                                <div className="py-16 px-4 text-center flex flex-col items-center">
                                    <CalendarIcon size={40} className="text-slate-300 dark:text-white/20 mb-3" />
                                    <h3 className="text-lg font-bold mb-2">मुहूर्त तिथियाँ अभी उपलब्ध नहीं हैं</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                                        {monthLabel} के लिए कोई सत्यापित मुहूर्त दर्ज नहीं है। दूसरा महीना देखिए, या हमारे पंडित जी से सीधे पूछिए।
                                    </p>
                                    <Link
                                        href="/search"
                                        className="mt-5 px-6 py-2.5 rounded-lg border border-[#f29e0d] text-[#f29e0d] font-bold text-sm hover:bg-[#f29e0d] hover:text-[#221b10] transition-all"
                                    >
                                        पंडित जी खोजिए
                                    </Link>
                                </div>
                            )}

                            {datesState === "ok" && dates.length > 0 && (
                                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                        <div key={day} className="bg-slate-50 dark:bg-[#221b10]/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                            {day}
                                        </div>
                                    ))}

                                    {cells.map((cell, idx) => {
                                        if (!cell) {
                                            return <div key={idx} className="bg-white dark:bg-[#221b10] min-h-[100px] p-2"></div>;
                                        }

                                        const group = byDate.get(cell.iso);
                                        const isToday = cell.iso === todayIso;
                                        const isSelected = cell.iso === selectedDate;

                                        if (!group) {
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`bg-white dark:bg-[#221b10] min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5 ${isToday ? "ring-1 ring-inset ring-slate-300 dark:ring-white/20" : ""}`}
                                                >
                                                    <span className="text-slate-400">{cell.day}</span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => openDate(cell.iso)}
                                                className={`text-left bg-white dark:bg-[#221b10] min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isSelected ? "bg-[#f29e0d]/10 dark:bg-[#f29e0d]/20 border-2 border-[#f29e0d] relative z-10" : ""}`}
                                            >
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${isToday ? "bg-[#f29e0d] text-[#221b10]" : "bg-[#f29e0d]/20 text-[#f29e0d]"}`}>
                                                    {cell.day}
                                                </span>
                                                <div className="mt-2 flex flex-col gap-1">
                                                    <div className="bg-[#f29e0d]/10 text-[10px] px-1.5 py-0.5 rounded text-[#f29e0d] font-medium w-max">
                                                        {group.count} {group.count === 1 ? "Puja" : "Pujas"}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Sidebar — the day panel. Renders ONLY what the API
                        returned for the day the reader actually picked. */}
                    <aside className="w-full lg:w-96 flex flex-col gap-6">
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-6 shadow-sm text-left">
                            {!selectedDate ? (
                                <div className="py-8 text-center">
                                    <h3 className="text-lg font-bold mb-2" style={{ fontFamily: '"Noto Serif", serif' }}>तिथि चुनिए</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        कैलेंडर में कोई तारीख़ चुनिए — उस दिन के मुहूर्त यहाँ दिखेंगे।
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold" style={{ fontFamily: '"Noto Serif", serif' }}>
                                            {selectedDate}
                                        </h3>
                                    </div>

                                    {entriesState === "loading" && (
                                        <div className="py-8 text-center text-slate-500 animate-pulse text-sm">लोड हो रहा है…</div>
                                    )}

                                    {entriesState === "error" && (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                इस तिथि के मुहूर्त लोड नहीं हो पाए — यह कनेक्शन की समस्या है।
                                            </p>
                                        </div>
                                    )}

                                    {entriesState === "ok" && entries.length === 0 && (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                इस तिथि के लिए कोई मुहूर्त दर्ज नहीं है।
                                            </p>
                                        </div>
                                    )}

                                    {entriesState === "ok" && entries.length > 0 && (
                                        <div className="space-y-4">
                                            {entries.map((item, i) => (
                                                <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-[#f29e0d]/50 transition-colors bg-slate-50/50 dark:bg-white/5 group relative overflow-hidden text-left">
                                                    <div className="flex items-start justify-between gap-4 mb-3">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 rounded-lg bg-[#f29e0d]/20 flex items-center justify-center shrink-0">
                                                                <Sun size={22} className="text-[#f29e0d]" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-lg">{item.pujaType ?? "—"}</p>
                                                                {/* timeWindow is nullable in the schema. A missing
                                                                    window renders as absent, never as a made-up slot. */}
                                                                {item.timeWindow && (
                                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                                                        <Clock size={16} />
                                                                        <span>{item.timeWindow}</span>
                                                                    </div>
                                                                )}
                                                                {item.significance && (
                                                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{item.significance}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* The CTA hangs off an API row's own pujaType — never off
                                                        a date this app invented. */}
                                                    {item.pujaType && (
                                                        <Link href={`/search?pujaType=${encodeURIComponent(item.pujaType)}`} className="w-full py-2.5 rounded-lg border border-[#f29e0d] text-[#f29e0d] font-bold text-sm hover:bg-[#f29e0d] hover:text-[#221b10] transition-all flex items-center justify-center">
                                                            Search Pandits
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* The Panchang card kept its frame and lost its claim.
                            There is no panchang endpoint — "Today's Tithi: Shukla
                            Paksha Dashami. Nakshatra: Revati." was a literal, and
                            the "Detailed View" button under it went nowhere.
                            Part two (source real panchang, or drop the surface)
                            is Isj's, funded-day. */}
                        <div className="bg-gradient-to-br from-[#f29e0d]/30 to-[#f29e0d]/5 rounded-2xl p-6 border border-[#f29e0d]/20 relative overflow-hidden group text-left">
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2" style={{ fontFamily: '"Noto Serif", serif' }}>पंचांग</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    तिथि और नक्षत्र की जानकारी अभी उपलब्ध नहीं है। सत्यापित पंचांग जुड़ते ही यहाँ दिखेगी।
                                </p>
                            </div>
                            <Sun size={120} className="absolute -right-4 -bottom-4 text-[#f29e0d]/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
}
