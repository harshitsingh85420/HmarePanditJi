"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

interface MuhuratEntry {
  id: string;
  date: string;
  pujaType: string;
  timeWindow: string;
  significance?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HINDI_DAYS: Record<number, string> = {
  0: "Ravivaar (Sunday)",
  1: "Somvaar (Monday)",
  2: "Mangalvaar (Tuesday)",
  3: "Budhvaar (Wednesday)",
  4: "Guruvaar (Thursday)",
  5: "Shukravaar (Friday)",
  6: "Shanivaar (Saturday)",
};

const PUJA_FILTERS = [
  "All Pujas",
  "Vivah",
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Mundan",
  "Havan",
  "Ganesh Puja",
  "Other",
];

const KNOWN_PUJAS = new Set(PUJA_FILTERS.slice(1, -1));

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDateHindi(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDate();
  const month = MONTH_NAMES[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const dayName = HINDI_DAYS[d.getUTCDay()] ?? "";
  return `${day} ${month} ${year}, ${dayName}`;
}

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function isPast(y: number, m: number, d: number): boolean {
  const today = new Date();
  const cell = new Date(y, m, d);
  today.setHours(0, 0, 0, 0);
  return cell < today;
}

function isTodayCheck(y: number, m: number, d: number): boolean {
  const t = new Date();
  return d === t.getDate() && m === t.getMonth() && y === t.getFullYear();
}

// ── Component ────────────────────────────────────────────────────────────────

export function MuhuratPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailRef = useRef<HTMLDivElement>(null);

  // Parse URL params
  const urlDate = searchParams.get("date");
  const urlPuja = searchParams.get("pujaType");

  const today = new Date();
  const initialMonth = urlDate ? new Date(urlDate).getUTCMonth() : today.getMonth();
  const initialYear = urlDate ? new Date(urlDate).getUTCFullYear() : today.getFullYear();

  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [activePuja, setActivePuja] = useState(urlPuja || "All Pujas");
  const [muhurats, setMuhurats] = useState<MuhuratEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(urlDate || null);
  const [selectedPujas, setSelectedPujas] = useState<MuhuratEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [upcoming, setUpcoming] = useState<MuhuratEntry[]>([]);

  // ── Fetch month data ─────────────────────────────────────────────────────

  useEffect(() => {
    const controller = new AbortController();
    const fetchMonth = async () => {
      setLoading(true);
      try {
        const pujaParam =
          activePuja !== "All Pujas" && activePuja !== "Other"
            ? `&pujaType=${encodeURIComponent(activePuja)}`
            : "";
        const res = await fetch(
          `${API_URL}/muhurat/dates?month=${month + 1}&year=${year}${pujaParam}`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const json = await res.json();
          let raw: MuhuratEntry[] = json.data?.dates ?? json.data ?? [];
          if (!Array.isArray(raw)) raw = [];

          // Client-side "Other" filter
          if (activePuja === "Other") {
            raw = raw.filter((m) => !KNOWN_PUJAS.has(m.pujaType));
          }

          setMuhurats(raw);
        }
      } catch {
        // API unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchMonth();
    return () => controller.abort();
  }, [month, year, activePuja]);

  // ── Fetch upcoming dates ─────────────────────────────────────────────────

  useEffect(() => {
    const controller = new AbortController();
    const fetchUpcoming = async () => {
      try {
        const todayStr = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
        const futureDate = new Date(today);
        futureDate.setMonth(futureDate.getMonth() + 6);
        const futureStr = dateKey(
          futureDate.getFullYear(),
          futureDate.getMonth(),
          futureDate.getDate(),
        );
        const res = await fetch(
          `${API_URL}/muhurat/dates?from=${todayStr}&to=${futureStr}`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const json = await res.json();
          let raw: MuhuratEntry[] = json.data?.dates ?? json.data ?? [];
          if (!Array.isArray(raw)) raw = [];
          // Deduplicate by date — pick unique dates and show first puja per date
          const seen = new Set<string>();
          const deduped: MuhuratEntry[] = [];
          for (const m of raw) {
            const dk = m.date.slice(0, 10);
            if (!seen.has(dk)) {
              seen.add(dk);
              deduped.push(m);
            }
            if (deduped.length >= 10) break;
          }
          setUpcoming(deduped);
        }
      } catch {
        // ignore
      }
    };
    fetchUpcoming();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch pujas for selected date ────────────────────────────────────────

  const fetchPujasForDate = useCallback(
    async (dateStr: string) => {
      setDetailLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/muhurat/pujas-for-date?date=${dateStr}`,
        );
        if (res.ok) {
          const json = await res.json();
          let pujas: MuhuratEntry[] = json.data?.pujas ?? json.data ?? [];
          if (!Array.isArray(pujas)) pujas = [];
          setSelectedPujas(pujas);
        }
      } catch {
        setSelectedPujas([]);
      } finally {
        setDetailLoading(false);
      }
    },
    [],
  );

  // If URL has a date, fetch its detail on mount
  useEffect(() => {
    if (urlDate) {
      fetchPujasForDate(urlDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Calendar helpers ─────────────────────────────────────────────────────

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getMuhuratCount = (day: number): number => {
    return muhurats.filter((m) => {
      const d = new Date(m.date);
      return d.getUTCDate() === day && d.getUTCMonth() === month && d.getUTCFullYear() === year;
    }).length;
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDate(null);
    setSelectedPujas([]);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDate(null);
    setSelectedPujas([]);
  };

  const handleDateClick = (day: number) => {
    const dk = dateKey(year, month, day);
    setSelectedDate(dk);
    fetchPujasForDate(dk);
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dk);
    router.replace(`/muhurat?${params.toString()}`, { scroll: false });
    // Scroll to detail
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleUpcomingClick = (entry: MuhuratEntry) => {
    const d = new Date(entry.date);
    const m = d.getUTCMonth();
    const y = d.getUTCFullYear();
    const day = d.getUTCDate();
    setMonth(m);
    setYear(y);
    const dk = dateKey(y, m, day);
    setSelectedDate(dk);
    fetchPujasForDate(dk);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dk);
    router.replace(`/muhurat?${params.toString()}`, { scroll: false });
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleFilterChange = (puja: string) => {
    setActivePuja(puja);
    const params = new URLSearchParams(searchParams.toString());
    if (puja !== "All Pujas") {
      params.set("pujaType", puja);
    } else {
      params.delete("pujaType");
    }
    router.replace(`/muhurat?${params.toString()}`, { scroll: false });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span
            className="material-symbols-outlined text-3xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            calendar_month
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100">
            Muhurat Explorer
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Find auspicious dates for your puja. Select a date to see available
          ceremonies and book verified Pandits.
        </p>
      </div>

      {/* ── Puja Type Filter ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PUJA_FILTERS.map((puja) => (
          <button
            key={puja}
            onClick={() => handleFilterChange(puja)}
            className={[
              "px-4 py-2 text-sm font-semibold rounded-full border transition-all",
              activePuja === puja
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary",
            ].join(" ")}
          >
            {puja}
          </button>
        ))}
      </div>

      {/* ── Main Layout: Calendar + Sidebar ─────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* ── Calendar ──────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">
                chevron_left
              </span>
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">
                chevron_right
              </span>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const count = getMuhuratCount(day);
              const past = isPast(year, month, day);
              const isToday = isTodayCheck(year, month, day);
              const dk = dateKey(year, month, day);
              const isSelected = selectedDate === dk;

              const hasAuspicious = count > 0 && !past;

              return (
                <button
                  key={day}
                  disabled={past && count === 0}
                  onClick={() => {
                    if (count > 0) handleDateClick(day);
                  }}
                  className={[
                    "relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all",
                    // Selected
                    isSelected
                      ? "bg-primary text-white font-bold shadow-lg shadow-primary/30 ring-2 ring-primary/40"
                      : // Today
                        isToday
                        ? "ring-2 ring-primary font-bold text-primary"
                        : // Auspicious
                          hasAuspicious
                          ? "bg-amber-50 dark:bg-amber-900/15 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer font-medium text-slate-800 dark:text-slate-200"
                          : // Past
                            past
                            ? "text-slate-300 dark:text-slate-600 cursor-default"
                            : // Normal
                              "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                  ].join(" ")}
                >
                  <span className="leading-none">{day}</span>
                  {count > 0 && !isSelected && (
                    <span className="text-[9px] mt-0.5 leading-none text-primary font-bold">
                      {count === 1 ? "1 puja" : `${count} pujas`}
                    </span>
                  )}
                  {count > 0 && isSelected && (
                    <span className="text-[9px] mt-0.5 leading-none text-white/80 font-medium">
                      {count === 1 ? "1 puja" : `${count} pujas`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {loading && (
            <p className="text-xs text-slate-400 text-center mt-4 animate-pulse">
              Loading muhurat dates...
            </p>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-3 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700" />
              Auspicious date
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-3 rounded ring-2 ring-primary" />
              Today
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-3 rounded bg-primary" />
              Selected
            </div>
          </div>
        </div>

        {/* ── Upcoming Auspicious Dates (sidebar) ───────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 h-fit">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-lg text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              event_upcoming
            </span>
            Upcoming Auspicious Dates
          </h3>

          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-400">
              No upcoming muhurat dates found.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {upcoming.map((entry, idx) => {
                const d = new Date(entry.date);
                const dayNum = d.getUTCDate();
                const mon = MONTH_NAMES[d.getUTCMonth()].slice(0, 3);
                return (
                  <button
                    key={`${entry.id}-${idx}`}
                    onClick={() => handleUpcomingClick(entry)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary leading-none">
                        {dayNum}
                      </span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 uppercase font-semibold leading-none mt-0.5">
                        {mon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {entry.pujaType}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {entry.timeWindow}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-sm text-slate-300 group-hover:text-primary transition-colors">
                      arrow_forward
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Selected Date Detail Panel ──────────────────────────────────── */}
      <div ref={detailRef}>
        {selectedDate && (
          <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-8 animate-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              Auspicious Pujas for {formatDateHindi(selectedDate)}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Click &ldquo;Find Pandits&rdquo; to book a verified Pandit for your
              chosen ceremony.
            </p>

            {detailLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : selectedPujas.length === 0 ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                  event_busy
                </span>
                <p className="text-sm text-slate-400 mt-3">
                  No auspicious muhurats found for this date. Try another date or
                  puja type.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {selectedPujas.map((puja) => (
                  <div
                    key={puja.id}
                    className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {puja.pujaType} Muhurat
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-primary font-semibold">
                          <span className="material-symbols-outlined text-sm">
                            schedule
                          </span>
                          {puja.timeWindow}
                        </div>
                      </div>
                      <span
                        className="material-symbols-outlined text-2xl text-amber-400"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    </div>

                    {puja.significance && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                        {puja.significance}
                      </p>
                    )}

                    <a
                      href={`/search?ritual=${encodeURIComponent(puja.pujaType)}&date=${selectedDate}&muhurat=${encodeURIComponent(puja.timeWindow)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Find Pandits for This
                      <span className="material-symbols-outlined text-base">
                        arrow_forward
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
