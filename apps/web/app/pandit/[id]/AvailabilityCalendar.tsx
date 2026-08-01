"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../../../src/context/auth-context";

/* F-J4-6 · RULED 2026-08-01 (Isj) — fourth application of ERROR != EMPTY.
   ────────────────────────────────────────────────────────────────────
   This called fetch(`/api/pandits/${id}/availability`) — SAME-ORIGIN, and
   apps/web serves no such handler. It 404'd on every load since the
   un-prefixed forgiveness shim was deleted. A Next 404 returns a response
   rather than throwing, so `res.ok` was false, the else branch ran
   setDates([]), and the catch was empty-bodied — nothing logged, nothing
   shown. Every public profile displayed an empty calendar forever, and a
   customer could not tell "this pandit has published no availability" from
   "the app never asked".

   The PARSE was already correct: measured 2026-08-01, this endpoint returns
   { success, data: [ { date, status } ], message } — data IS the array. Only
   the URL was wrong, so the fix is the base and the three honest states.
   (The real data was there the whole time: the one verified pandit is
   available every day of September 2026 and no visitor has ever seen it.) */

type CalState = "loading" | "ok" | "error";

export function AvailabilityCalendar({ panditId }: { panditId: string }) {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [dates, setDates] = useState<any[]>([]);
    const [state, setState] = useState<CalState>("loading");
    /* The retry button's first draft was onClick={() => setYear(y => y)} —
       same value, so React bails out, the effect never re-runs, and the
       button is a DEAD CONTROL. Caught before shipping while fixing dead
       controls. A monotonic key is the thing that actually re-fires. */
    const [reloadKey, setReloadKey] = useState(0);

    const router = useRouter();

    useEffect(() => {
        let cancelled = false;
        async function fetchCalendar() {
            setState("loading");
            try {
                const res = await fetch(`${API_BASE}/pandits/${panditId}/availability?month=${month}&year=${year}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const list = json?.data;
                if (!Array.isArray(list)) throw new Error("unexpected envelope");
                if (cancelled) return;
                setDates(list);
                setState("ok");
            } catch (err) {
                // A failure is a fact about the request, not about the
                // pandit's calendar. It is logged and rendered as itself.
                console.warn("pandit availability", err);
                if (cancelled) return;
                setDates([]);
                setState("error");
            }
        }
        fetchCalendar();
        return () => { cancelled = true; };
    }, [panditId, month, year, reloadKey]);

    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(y => y - 1);
        } else {
            setMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(y => y + 1);
        } else {
            setMonth(m => m + 1);
        }
    };

    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1);

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">Availability Calendar</h3>

            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm mb-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <button
                        onClick={handlePrevMonth}
                        disabled={isPastMonth}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        ←
                    </button>
                    <h4 className="text-xl font-black text-gray-900">{monthName} <span className="text-orange-600 ml-1">{year}</span></h4>
                    <button
                        onClick={handleNextMonth}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 hover:bg-orange-50 hover:text-orange-600 shadow-sm transition"
                    >
                        →
                    </button>
                </div>

                {state === "loading" ? (
                    <div className="animate-pulse grid grid-cols-7 gap-3 mt-4">
                        {Array.from({ length: 31 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                ) : state === "error" ? (
                    /* THE TWO SENTENCES THAT USED TO BE ONE BLANK GRID. */
                    <div className="py-10 px-4 text-center flex flex-col items-center">
                        <div className="text-3xl mb-3">⚠️</div>
                        <h4 className="font-bold text-gray-900 mb-1">उपलब्धता अभी लोड नहीं हो पाई</h4>
                        <p className="text-sm text-gray-500 max-w-xs">
                            यह कनेक्शन की समस्या है — इसका मतलब यह नहीं कि पंडित जी उपलब्ध नहीं हैं।
                        </p>
                        <button
                            onClick={() => setReloadKey((k) => k + 1)}
                            className="mt-5 px-6 py-2.5 rounded-lg border border-orange-600 text-orange-600 font-bold text-sm hover:bg-orange-50 transition"
                        >
                            फिर कोशिश कीजिए
                        </button>
                    </div>
                ) : dates.length === 0 ? (
                    <div className="py-10 px-4 text-center flex flex-col items-center">
                        <div className="text-3xl mb-3 opacity-50">🗓️</div>
                        <h4 className="font-bold text-gray-900 mb-1">इस महीने की उपलब्धता दर्ज नहीं है</h4>
                        <p className="text-sm text-gray-500 max-w-xs">
                            पंडित जी ने {monthName} {year} के लिए अपनी तारीख़ें अभी नहीं भरी हैं। दूसरा महीना देखिए।
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-3">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="text-center text-xs font-bold uppercase text-gray-400 pb-2">{d}</div>
                        ))}

                        {/* Pad start days if needed */}
                        {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="opacity-0" />
                        ))}

                        {dates.map((dObj) => {
                            const dayNum = parseInt(dObj.date.split('-')[2], 10);
                            const { status, reason } = dObj;

                            let bgClass = "bg-gray-50 text-gray-400 border border-gray-100";
                            let ringClass = "";

                            if (status === "available") {
                                bgClass = "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer border border-green-200 font-bold shadow-sm";
                                ringClass = "hover:ring-2 hover:ring-green-400 hover:ring-offset-2";
                            } else if (status === "booked") {
                                bgClass = "bg-orange-100 text-orange-800 border-none opacity-80 cursor-not-allowed";
                                ringClass = "border border-orange-200";
                            } else if (status === "blocked") {
                                bgClass = "bg-red-50 text-red-800 border-none opacity-80 cursor-not-allowed text-xs flex flex-col items-center justify-center p-0 line-through decoration-red-300";
                            } else if (status === "past") {
                                bgClass = "bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed opacity-50";
                            }

                            return (
                                <div
                                    key={dObj.date}
                                    title={status === "available" ? "Available" : status === "booked" ? "1 booking" : reason || status}
                                    onClick={() => {
                                        if (status === "available") {
                                            router.push(`/booking/new?panditId=${panditId}&date=${dObj.date}`);
                                        }
                                    }}
                                    className={`aspect-square flex items-center justify-center rounded-2xl transition transform active:scale-95 ${bgClass} ${ringClass}`}
                                >
                                    {dayNum}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-4 border-t border-gray-100 text-sm font-medium">
                    <div className="flex items-center gap-2 text-gray-700"><span className="w-4 h-4 rounded-full bg-green-50 border border-green-200 inline-block shadow-sm" /> Available</div>
                    <div className="flex items-center gap-2 text-gray-700"><span className="w-4 h-4 rounded-full bg-orange-100 inline-block shadow-sm border border-orange-200 opacity-80" /> Booked</div>
                    <div className="flex items-center gap-2 text-gray-700"><span className="w-4 h-4 rounded-full bg-red-50 inline-block shadow-sm border border-red-100 opacity-80" /> Blocked</div>
                </div>
            </div>
        </div>
    );
}
