"use client";
import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import ActivityFeed from "../components/ActivityFeed";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || "";

    Promise.all([
      fetch("http://localhost:3001/api/admin/dashboard-stats", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:3001/api/admin/alerts", { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([statsRes, alertsRes]) => {
        const statsData = await statsRes.json();
        const alertsData = await alertsRes.json();
        if (statsData.success) setStats(statsData.data);
        if (alertsData.success) setAlerts(alertsData.data);
      })
      .catch();
  }, []);

  if (!stats) return <div className="p-8 text-slate-500 font-medium">Loading dashboard...</div>;

  const urgentQueueUrl = stats.pendingActions.travel > 0 ? "/travel-desk"
    : stats.pendingActions.verification > 0 ? "/pandits"
      : stats.pendingActions.payouts > 0 ? "/payouts"
        : "/cancellations";

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case "HIGH": return "border-red-200 bg-red-50 text-red-800";
      case "MEDIUM": return "border-amber-200 bg-amber-50 text-amber-800";
      default: return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  const getAlertBtnStyle = (severity: string) => {
    switch (severity) {
      case "HIGH": return "bg-red-600 hover:bg-red-700 text-white shadow-red-200 shadow-sm";
      case "MEDIUM": return "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 shadow-sm";
      default: return "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 shadow-sm";
    }
  };

  const alertIcons: Record<string, string> = {
    HIGH: "🚨", MEDIUM: "⚠️", LOW: "ℹ️"
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* SECTION A: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Bookings"
          value={stats.todaysBookings.total}
          subtitle={`${stats.todaysBookings.confirmed} confirmed, ${stats.todaysBookings.inProgress} active`}
          colorPreset="green"
        />
        <MetricCard
          title="Pending Actions"
          value={stats.pendingActions.travel + stats.pendingActions.verification + stats.pendingActions.payouts}
          subtitle={`Travel: ${stats.pendingActions.travel} | Verify: ${stats.pendingActions.verification} | Payouts: ${stats.pendingActions.payouts}`}
          colorPreset="amber"
          onClick={() => router.push(urgentQueueUrl)}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.current.toLocaleString()}`}
          subtitle={`${stats.monthlyRevenue.percentChange >= 0 ? '+' : ''}${stats.monthlyRevenue.percentChange}% vs last month`}
          colorPreset="blue"
        />
        <MetricCard
          title="Active Pandits"
          value={stats.activePandits.verified}
          subtitle={`${stats.activePandits.online} online now`}
          colorPreset="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">

        {/* SECTION B & D: Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-8 h-full">

          {/* Action Required Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 shrink-0">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">assignment_late</span>
              Action Required
            </h2>

            {alerts.length === 0 ? (
              <div className="py-8 bg-slate-50 text-slate-500 rounded-xl text-center border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task_alt</span>
                <p className="font-medium">All caught up! No pending alerts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((a, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${getAlertStyle(a.severity)}`}>
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl leading-none mt-1">{alertIcons[a.severity]}</div>
                      <p className="text-[15px] font-semibold flex-1 mt-0.5">{a.message}</p>
                    </div>
                    <Link
                      href={a.actionUrl}
                      className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${getAlertBtnStyle(a.severity)}`}
                    >
                      {a.type === 'TRAVEL' ? 'Fix Travel' : a.type === 'VERIFICATION' ? 'Review Now' : 'Resolve'}
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-slate-800 mb-6 font-display">Activity Volume (14 Days)</h2>
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex h-48 items-end gap-2 px-4 border-b border-slate-100 pb-2">
                {[12, 18, 15, 22, 10, 8, 25, 28, 32, 14, 19, 21, 25, 16].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative">
                    <div
                      className="w-full bg-[#137fec] rounded-t-sm group-hover:bg-blue-700 transition-colors"
                      style={{ height: `${h * 3}px` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                      {h} bookings
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 mt-3 text-xs text-slate-400 font-medium">
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION C: Activity Feed */}
        <div className="h-full">
          <ActivityFeed />
        </div>
      </div>

    </div>
  );
}
