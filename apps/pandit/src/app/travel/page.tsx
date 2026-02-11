"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface TravelLog {
  id: string;
  from: string;
  to: string;
  event: string;
  date: string;
  distanceKm: number;
  status: "COMPLETED" | "ONGOING";
}

const MOCK_TRAVEL_LOGS: TravelLog[] = [
  {
    id: "t1",
    from: "Varanasi",
    to: "Delhi",
    event: "Maha Shivratri Celebration",
    date: "Feb 2024",
    distanceKm: 820,
    status: "COMPLETED",
  },
  {
    id: "t2",
    from: "Noida",
    to: "Jaipur",
    event: "Vivah Puja — Sharma Family",
    date: "Jan 2024",
    distanceKm: 535,
    status: "COMPLETED",
  },
  {
    id: "t3",
    from: "Delhi",
    to: "Haridwar",
    event: "Griha Pravesh — Verma Residence",
    date: "Dec 2023",
    distanceKm: 220,
    status: "COMPLETED",
  },
  {
    id: "t4",
    from: "Varanasi",
    to: "Mumbai",
    event: "Satyanarayan Katha — Gupta Ji",
    date: "Nov 2023",
    distanceKm: 1240,
    status: "COMPLETED",
  },
  {
    id: "t5",
    from: "Lucknow",
    to: "Agra",
    event: "Navgraha Puja — Singh Residence",
    date: "Oct 2023",
    distanceKm: 335,
    status: "COMPLETED",
  },
  {
    id: "t6",
    from: "Prayagraj",
    to: "Kanpur",
    event: "Rudrabhishek — Pandey Ji",
    date: "Sep 2023",
    distanceKm: 200,
    status: "COMPLETED",
  },
];

const MOCK_TOTAL_KM = 5200;

export default function TravelPage() {
  const [logs, setLogs] = useState<TravelLog[]>([]);
  const [totalKm, setTotalKm] = useState(MOCK_TOTAL_KM);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/travel`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.data?.logs ?? MOCK_TRAVEL_LOGS);
          if (data.data?.totalKm) setTotalKm(data.data.totalKm);
        } else {
          setLogs(MOCK_TRAVEL_LOGS);
        }
      } catch {
        setLogs(MOCK_TRAVEL_LOGS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayed = showAll ? logs : logs.slice(0, 4);

  return (
    <div className="py-8 space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 leading-tight">Travel History</h1>
          <p className="mt-1 text-base text-slate-500">Aapki pura bharat yatra ka hisaab</p>
        </div>

        {/* Total distance badge */}
        <div className="flex-shrink-0 bg-primary text-white rounded-lg px-5 py-3 flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[22px] leading-none">route</span>
          <span className="font-bold text-base">
            Total {totalKm.toLocaleString("en-IN")}+ KM Traveled
          </span>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: "map",
            label: "States Visited",
            value: "12",
            sub: "All India",
          },
          {
            icon: "local_activity",
            label: "Total Trips",
            value: String(logs.length || MOCK_TRAVEL_LOGS.length),
            sub: "Completed",
          },
          {
            icon: "flight_takeoff",
            label: "Longest Trip",
            value: "1,240 km",
            sub: "Varanasi → Mumbai",
          },
          {
            icon: "avg_pace",
            label: "Avg Per Trip",
            value: `${Math.round(totalKm / (logs.length || MOCK_TRAVEL_LOGS.length)).toLocaleString("en-IN")} km`,
            sub: "This year",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-primary/10 shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-[22px] leading-none">
              {stat.icon}
            </span>
            <p className="text-xl font-bold text-slate-900 mt-2">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Travel Log Cards ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Travel Log</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {displayed.map((log) => (
              <div
                key={log.id}
                className="flex justify-between items-start p-5 bg-white rounded-xl border border-slate-100 hover:border-primary/20 transition-colors"
              >
                {/* Left */}
                <div className="flex items-start gap-4">
                  {/* Icon box */}
                  <div className="rounded-lg bg-background-light p-3 flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[22px] leading-none">
                      distance
                    </span>
                  </div>

                  {/* Route + Event */}
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {log.from} → {log.to}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {log.event}
                      <span className="mx-1.5 text-slate-300">•</span>
                      {log.date}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                  <span className="text-xl font-bold text-slate-900">
                    {log.distanceKm.toLocaleString("en-IN")} km
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      log.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {log.status === "COMPLETED" ? "Completed" : "Ongoing"}
                  </span>
                </div>
              </div>
            ))}

            {/* View All button */}
            {logs.length > 4 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="w-full border-2 border-dashed border-primary/30 hover:border-primary/60 text-primary font-semibold rounded-xl py-3.5 mt-2 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base leading-none">
                  {showAll ? "expand_less" : "expand_more"}
                </span>
                {showAll
                  ? "SHOW LESS"
                  : `VIEW ALL TRAVEL LOGS (${logs.length - 4} more)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
