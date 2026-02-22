"use client";

import { useState, useEffect } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface MuhuratDate {
  id: string;
  date: string;
  pujaType: string;
  timeWindow: string;
  significance?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export function MuhuratExplorer() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [muhurats, setMuhurats] = useState<MuhuratDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchMuhurats = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/muhurat/dates?month=${month + 1}&year=${year}`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const json = await res.json();
          const raw = json.data?.dates ?? json.data ?? [];
          setMuhurats(Array.isArray(raw) ? raw : []);
        }
      } catch {
        // API not available — show empty calendar
      } finally {
        setLoading(false);
      }
    };
    fetchMuhurats();
    return () => controller.abort();
  }, [month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getMuhuratInfo = (day: number) => {
    const matches = muhurats.filter((m) => {
      const d = new Date(m.date);
      return (
        d.getUTCDate() === day &&
        d.getUTCMonth() === month &&
        d.getUTCFullYear() === year
      );
    });
    return matches;
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 max-w-md mx-auto lg:mx-0">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-500">chevron_left</span>
        </button>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-500">chevron_right</span>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-slate-400 uppercase py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const matches = getMuhuratInfo(day);
          const count = matches.length;
          const todayMark = isToday(day);
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const tooltip = count > 0 ? matches.map((m) => m.pujaType).join(", ") : undefined;

          const Cell = count > 0 ? "a" : "span";
          return (
            <Cell
              key={day}
              {...(count > 0 ? { href: `/muhurat?date=${dateStr}` } : {})}
              title={tooltip}
              className={[
                "relative flex flex-col items-center justify-center h-10 rounded-lg text-sm transition-colors",
                todayMark
                  ? "border-2 border-primary font-bold text-primary"
                  : count > 0
                    ? "hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer font-medium text-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500",
              ].join(" ")}
            >
              {day}
              {count > 0 && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Cell>
          );
        })}
      </div>

      {loading && (
        <p className="text-xs text-slate-400 text-center mt-3 animate-pulse">
          Loading muhurat dates...
        </p>
      )}

      {/* Legend + link */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Auspicious date
        </div>
        <a
          href="/muhurat"
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-0.5"
        >
          View Full Calendar
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
