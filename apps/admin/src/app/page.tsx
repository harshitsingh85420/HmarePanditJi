"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

const STATS = [
  {
    icon: "groups",
    value: "247",
    label: "Active Pandits",
    sub: "24 pending verification",
    change: "+12",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: "people",
    value: "1,842",
    label: "Total Customers",
    sub: "68 new this week",
    change: "+68",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: "event_note",
    value: "134",
    label: "Active Bookings",
    sub: "12 starting today",
    change: "+5",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: "currency_rupee",
    value: "₹8.4L",
    label: "Revenue (MTD)",
    sub: "₹12.1L projected",
    change: "+18%",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const BOOKINGS_WEEK = [
  { day: "Mon", count: 18 },
  { day: "Tue", count: 24 },
  { day: "Wed", count: 20 },
  { day: "Thu", count: 32 },
  { day: "Fri", count: 28 },
  { day: "Sat", count: 45 },
  { day: "Sun", count: 38 },
];

const CEREMONY_PIE = [
  { label: "Vivah Puja", pct: 34, color: "bg-primary" },
  { label: "Griha Pravesh", pct: 22, color: "bg-violet-500" },
  { label: "Satyanarayan", pct: 18, color: "bg-amber-500" },
  { label: "Mundan", pct: 14, color: "bg-emerald-500" },
  { label: "Others", pct: 12, color: "bg-slate-400" },
];

const ACTIVITY = [
  {
    icon: "verified_user",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Pandit Approved",
    desc: "Ramesh Sharma (APID-00234) approved by Admin",
    time: "2m ago",
  },
  {
    icon: "event_available",
    color: "text-primary",
    bg: "bg-primary/10",
    title: "New Booking",
    desc: "Booking #BK-8821 confirmed — Vivah Puja, Delhi",
    time: "8m ago",
  },
  {
    icon: "person_add",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "New Customer",
    desc: "Priya Mehta registered from Noida",
    time: "15m ago",
  },
  {
    icon: "warning",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "Travel Request",
    desc: "Booking #BK-8817 needs travel arrangement (Delhi → Jaipur)",
    time: "22m ago",
  },
  {
    icon: "cancel",
    color: "text-red-500",
    bg: "bg-red-500/10",
    title: "Booking Cancelled",
    desc: "Booking #BK-8815 cancelled — full refund initiated",
    time: "1h ago",
  },
  {
    icon: "star",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    title: "New Review",
    desc: "5★ review for Pandit Suresh Mishra from Aryan Gupta",
    time: "2h ago",
  },
];

const RATINGS = [
  { stars: 5, pct: 68 },
  { stars: 4, pct: 22 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 2 },
];

const maxCount = Math.max(...BOOKINGS_WEEK.map((d) => d.count));

export default function AdminDashboard() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">HmarePanditJi · Phase 1 · Delhi-NCR</p>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                period === p
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bookings/Week Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Bookings This Week</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daily booking volume</p>
            </div>
            <span className="text-2xl font-bold text-primary">205</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {BOOKINGS_WEEK.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">{d.count}</span>
                <div
                  className="w-full bg-primary/20 dark:bg-primary/30 rounded-t-md relative overflow-hidden"
                  style={{ height: `${(d.count / maxCount) * 120}px` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md"
                    style={{ height: "40%" }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ceremonies Pie + Rating */}
        <div className="space-y-4">
          {/* Ceremony breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Ceremony Types</h2>
            <div className="space-y-2">
              {CEREMONY_PIE.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{c.label}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating histogram */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Pandit Ratings</h2>
              <span className="text-lg font-black text-amber-500">4.7★</span>
            </div>
            <div className="space-y-1.5">
              {RATINGS.map((r) => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4">{r.stars}</span>
                  <span className="material-symbols-outlined text-amber-400 text-xs leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-7 text-right">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity Feed ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Recent Activity</h2>
            <span className="text-xs text-slate-400">Live</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`material-symbols-outlined text-base leading-none ${item.color}`}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "verified_user", label: "Review Verification Queue", sub: "24 pending", color: "text-primary", bg: "bg-primary/10", href: "/verification" },
              { icon: "local_shipping", label: "Travel Arrangements", sub: "8 need action", color: "text-amber-500", bg: "bg-amber-500/10", href: "/operations" },
              { icon: "event_note", label: "Active Bookings", sub: "134 bookings", color: "text-violet-500", bg: "bg-violet-500/10", href: "/bookings" },
              { icon: "campaign", label: "Send Broadcast SMS", sub: "All pandits", color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/settings" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-xl leading-none ${action.color}`}>{action.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{action.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{action.sub}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Revenue mini stats */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Avg Order Value", value: "₹6,250" },
              { label: "Commission (10%)", value: "₹84,000" },
              { label: "Refunds (MTD)", value: "₹8,500" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-base font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
