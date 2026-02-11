"use client";

import { useState } from "react";

export default function PanditDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="py-8 space-y-6">

      {/* ── 1. Title Row ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Page title */}
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 leading-tight">
            Pandit Dashboard
          </h1>
          <p className="mt-1 text-base text-slate-500">
            Aaj ka schedule aur updates
          </p>
        </div>

        {/* Right: Online / Offline Toggle card */}
        <div className="flex-shrink-0 bg-white border border-primary/10 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 min-w-[160px]">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOnline ? (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              )}
              <span
                className={`text-sm font-bold ${
                  isOnline ? "text-green-600" : "text-slate-500"
                }`}
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            role="switch"
            aria-checked={isOnline}
            onClick={() => setIsOnline((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              isOnline ? "bg-primary" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                isOnline ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── 2. Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Monthly Earnings */}
        <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">
              payments
            </span>
            <span className="text-sm font-medium text-slate-500">
              Monthly Earnings
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹52,000</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-green-600 text-base leading-none">
              trending_up
            </span>
            <span className="text-sm text-green-600 font-medium">
              +12% vs last month
            </span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-primary text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-sm font-medium text-slate-500">
              Average Rating
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">4.9/5</p>
          <div className="flex items-center gap-1 mt-2">
            <span
              className="material-symbols-outlined text-green-600 text-base leading-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-sm text-green-600 font-medium">
              Top Professional
            </span>
          </div>
        </div>

        {/* Travel Distance */}
        <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">
              distance
            </span>
            <span className="text-sm font-medium text-slate-500">
              Travel Distance
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">1,200 km</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-slate-500 text-base leading-none">
              route
            </span>
            <span className="text-sm text-slate-500 font-medium">
              8 trips completed
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Today's Schedule ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Today's Schedule
          </h2>
          <a
            href="/bookings"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span className="material-symbols-outlined text-base leading-none">
              calendar_month
            </span>
            View Calendar
          </a>
        </div>

        <div className="p-4 space-y-4">

          {/* ACTIVE EVENT — border-l-4 border-primary */}
          <div className="border-l-4 border-primary bg-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Time block */}
              <div className="min-w-[60px] flex flex-col items-center justify-center bg-primary/5 border border-primary/10 rounded-lg py-2 px-1 text-center">
                <span className="text-base font-bold text-slate-900 leading-none">
                  10:00
                </span>
                <span className="text-xs font-semibold text-primary uppercase leading-none mt-0.5">
                  AM
                </span>
              </div>
              {/* Event details */}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-slate-900 leading-tight">
                  Satyanarayan Puja
                </p>
                <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-base leading-none">
                    location_on
                  </span>
                  <span className="truncate">Sector 62, Noida — 201301</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-base leading-none">
                    person
                  </span>
                  <span>Rajesh Kumar Ji</span>
                </div>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg px-4 py-2.5 min-h-[44px] transition-colors shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined text-base leading-none">
                  directions
                </span>
                Directions
              </button>
              <button className="flex items-center gap-1.5 border border-slate-200 hover:border-primary/30 text-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 min-h-[44px] transition-colors">
                Details
              </button>
            </div>
          </div>

          {/* UPCOMING EVENT — border-l-4 border-gray-300 */}
          <div className="border-l-4 border-gray-300 bg-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Grayed time block */}
              <div className="min-w-[60px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg py-2 px-1 text-center">
                <span className="text-base font-bold text-slate-400 leading-none">
                  03:00
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase leading-none mt-0.5">
                  PM
                </span>
              </div>
              {/* Event details */}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-slate-700 leading-tight">
                  Griha Pravesh
                </p>
                <div className="flex items-center gap-1 mt-1 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-base leading-none">
                    location_on
                  </span>
                  <span className="truncate">Indirapuram, Ghaziabad</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-base leading-none">
                    person
                  </span>
                  <span>Sunita Sharma Ji</span>
                </div>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="flex items-center gap-1.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg px-4 py-2.5 min-h-[44px] transition-colors cursor-default">
                <span className="material-symbols-outlined text-base leading-none">
                  schedule
                </span>
                Wait
              </button>
              <button className="flex items-center gap-1.5 border border-slate-200 hover:border-primary/30 text-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 min-h-[44px] transition-colors">
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Travel Insight Card ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                map
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                Travel Insight
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Saving 15% travel time with optimized routing
            </p>
          </div>
        </div>

        {/* Map preview area */}
        <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          {/* Subtle map grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Open Travel View button */}
          <button className="relative z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-5 py-2.5 text-primary font-bold text-sm shadow-md hover:bg-white transition-colors">
            <span className="material-symbols-outlined text-base leading-none">
              open_in_new
            </span>
            Open Travel View
          </button>
        </div>
      </div>

    </div>
  );
}
