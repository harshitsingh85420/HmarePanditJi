"use client";

import React, { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface DayInfo {
  date: string;
  status: "available" | "booked" | "blocked";
  bookings?: { id: string; eventType: string }[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PanditCalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [days, setDays] = useState<DayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockMode, setBlockMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [blockReason, setBlockReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [panditId, setPanditId] = useState("");
  const [message, setMessage] = useState("");

  // Get pandit ID on mount
  useEffect(() => {
    async function fetchMe() {
      try {
        const token = localStorage.getItem("hpj_pandit_access_token");
        const res = await fetch(`${API_BASE}/pandits/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const json = await res.json();
          setPanditId(json.data?.id ?? "");
        }
      } catch { /* ignore */ }
    }
    fetchMe();
  }, []);

  // Fetch calendar data
  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("hpj_pandit_access_token");
      const pid = panditId || "me";
      const res = await fetch(
        `${API_BASE}/pandits/${pid}/availability?month=${month}&year=${year}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(5000),
        },
      );
      if (res.ok) {
        const json = await res.json();
        setDays(json.data?.dates ?? []);
      } else {
        // Generate mock calendar
        generateMockDays();
      }
    } catch {
      generateMockDays();
    } finally {
      setLoading(false);
    }
  }, [month, year, panditId]);

  function generateMockDays() {
    const daysInMonth = new Date(year, month, 0).getDate();
    const mock: DayInfo[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      // Random mock: 15% booked, 8% blocked
      const rand = Math.random();
      if (rand < 0.15) {
        mock.push({ date: dateStr, status: "booked", bookings: [{ id: `b${d}`, eventType: "Griha Pravesh" }] });
      } else if (rand < 0.23) {
        mock.push({ date: dateStr, status: "blocked" });
      } else {
        mock.push({ date: dateStr, status: "available" });
      }
    }
    setDays(mock);
  }

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const toggleDate = (dateStr: string) => {
    if (!blockMode) return;
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr],
    );
  };

  const handleBlockDates = async () => {
    if (selectedDates.length === 0) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("hpj_pandit_access_token");
      const res = await fetch(`${API_BASE}/pandits/me/block-dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dates: selectedDates,
          reason: blockReason || undefined,
        }),
      });
      if (res.ok) {
        setMessage(`${selectedDates.length} date(s) blocked successfully`);
        setBlockMode(false);
        setSelectedDates([]);
        setBlockReason("");
        fetchCalendar();
      }
    } catch {
      setMessage("Failed to block dates. Try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Build calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const dayMap: Record<string, DayInfo> = {};
  days.forEach((d) => { dayMap[d.date] = d; });

  // Stats
  const bookedCount = days.filter((d) => d.status === "booked").length;
  const blockedCount = days.filter((d) => d.status === "blocked").length;
  const availableCount = days.filter((d) => d.status === "available").length;

  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#1a1510]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Calendar</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your availability and blocked dates</p>
          </div>
          <button
            onClick={() => { setBlockMode(!blockMode); setSelectedDates([]); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              blockMode
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {blockMode ? "close" : "block"}
            </span>
            {blockMode ? "Cancel" : "Block Dates"}
          </button>
        </div>

        {/* Success message */}
        {message && (
          <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Available</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{bookedCount}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Booked</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{blockedCount}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Blocked</p>
          </div>
        </div>

        {/* Month navigator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-slate-500">chevron_left</span>
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {MONTHS[month - 1]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-slate-500">chevron_right</span>
            </button>
          </div>

          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-[10px] text-slate-400 uppercase tracking-wider font-bold py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const info = dayMap[dateStr];
                  const status = info?.status ?? "available";
                  const isToday = dateStr === todayStr;
                  const isPast = new Date(dateStr) < new Date(todayStr);
                  const isSelected = selectedDates.includes(dateStr);

                  let bgClass = "";
                  let textClass = "text-slate-700 dark:text-slate-300";

                  if (isSelected) {
                    bgClass = "bg-red-500 ring-2 ring-red-300";
                    textClass = "text-white";
                  } else if (status === "booked") {
                    bgClass = "bg-blue-100 dark:bg-blue-900/30";
                    textClass = "text-blue-700 dark:text-blue-400 font-bold";
                  } else if (status === "blocked") {
                    bgClass = "bg-red-100 dark:bg-red-900/30";
                    textClass = "text-red-600 dark:text-red-400";
                  } else if (isPast) {
                    bgClass = "bg-slate-50 dark:bg-slate-800/50";
                    textClass = "text-slate-300 dark:text-slate-600";
                  }

                  const canClick = blockMode && status === "available" && !isPast;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={!canClick && blockMode}
                      onClick={() => canClick && toggleDate(dateStr)}
                      className={[
                        "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                        bgClass,
                        textClass,
                        isToday ? "ring-2 ring-primary" : "",
                        canClick ? "cursor-pointer hover:bg-red-200 dark:hover:bg-red-800/30" : blockMode ? "opacity-50 cursor-not-allowed" : "cursor-default",
                      ].join(" ")}
                    >
                      <span className="text-sm font-medium">{dayNum}</span>
                      {status === "booked" && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute bottom-1" />
                      )}
                      {status === "blocked" && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-4">
          {[
            { color: "bg-green-400", label: "Available" },
            { color: "bg-blue-500", label: "Booked" },
            { color: "bg-red-400", label: "Blocked" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Block mode panel */}
        {blockMode && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800/30 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">block</span>
              <h3 className="font-bold text-red-700 dark:text-red-400">Block Selected Dates</h3>
            </div>

            <p className="text-sm text-red-600 dark:text-red-300">
              {selectedDates.length === 0
                ? "Tap on available dates above to select them for blocking."
                : `${selectedDates.length} date(s) selected`}
            </p>

            {selectedDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedDates.sort().map((d) => (
                  <span key={d} className="px-2 py-1 bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 text-xs rounded-lg font-semibold">
                    {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Reason (optional, e.g. Personal leave)"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            <button
              onClick={handleBlockDates}
              disabled={selectedDates.length === 0 || saving}
              className="w-full h-11 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">block</span>
                  Block {selectedDates.length} Date(s)
                </>
              )}
            </button>
          </div>
        )}

        {/* Upcoming booked dates list */}
        {!blockMode && days.filter((d) => d.status === "booked").length > 0 && (
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-base">event_available</span>
              Booked Dates This Month
            </h3>
            <div className="space-y-2.5">
              {days
                .filter((d) => d.status === "booked")
                .map((d) => (
                  <div key={d.date} className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-400">
                        {new Date(d.date).getDate()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {d.bookings?.[0]?.eventType ?? "Ceremony"}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full">
                      BOOKED
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
