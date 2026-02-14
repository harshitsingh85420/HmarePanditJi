"use client";

import { useState } from "react";

export default function PanditDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="py-8 space-y-6">

      {/* ── 1. Title Row & Status Toggle ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-[#181411] tracking-tight text-[32px] font-bold leading-tight">
          Pandit Dashboard
        </h1>

        {/* Large Status Toggle */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-primary/20 shadow-sm self-start md:self-auto">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOnline && <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>}
              <span className={`text-sm font-bold ${isOnline ? "text-green-600" : "text-gray-400"}`}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>
          <label className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-colors ${isOnline ? "bg-primary justify-end" : "bg-gray-200 justify-start"}`}>
            <div className="h-full w-[27px] rounded-full bg-white shadow-md"></div>
            <input
              type="checkbox"
              checked={isOnline}
              onChange={() => setIsOnline(!isOnline)}
              className="invisible absolute"
            />
          </label>
        </div>
      </div>

      {/* ── 2. Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Monthly Earnings */}
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-primary/10 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm font-medium leading-normal">Monthly Earnings</p>
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
          <p className="text-[#181411] tracking-tight text-2xl font-bold leading-tight">₹52,000</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-green-600">trending_up</span>
            <p className="text-green-600 text-sm font-bold">+12% vs last month</p>
          </div>
        </div>

        {/* Average Rating */}
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-primary/10 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm font-medium leading-normal">Average Rating</p>
            <span className="material-symbols-outlined text-primary">star</span>
          </div>
          <p className="text-[#181411] tracking-tight text-2xl font-bold leading-tight">4.9/5</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-green-600">verified</span>
            <p className="text-green-600 text-sm font-bold">Top Professional</p>
          </div>
        </div>

        {/* Travel Distance */}
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-primary/10 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm font-medium leading-normal">Travel Distance</p>
            <span className="material-symbols-outlined text-primary">distance</span>
          </div>
          <p className="text-[#181411] tracking-tight text-2xl font-bold leading-tight">1,200 km</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-primary">route</span>
            <p className="text-gray-500 text-sm font-medium">8 trips completed</p>
          </div>
        </div>

      </div>

      {/* ── 3. Schedule Section ───────────────────────────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em]">Today&apos;s Schedule</h2>
          <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            View Calendar <span className="material-symbols-outlined text-sm">calendar_month</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Event 1 */}
          <div className="bg-white border-l-4 border-primary rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center justify-center min-w-[60px] h-full py-1 bg-primary/5 rounded-lg border border-primary/10">
                <span className="text-primary font-bold text-lg">10:00</span>
                <span className="text-xs font-medium text-gray-500">AM</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#181411]">Vivaha Puja (Wedding)</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span> Delhi (South)
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span> Mr. Sharma&apos;s Family
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 bg-primary hover:bg-[#e08e1f] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-sm">directions</span> Directions
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#181411] text-sm font-bold rounded-lg transition-colors">
                Details
              </button>
            </div>
          </div>

          {/* Event 2 */}
          <div className="bg-white border-l-4 border-gray-300 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center justify-center min-w-[60px] h-full py-1 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-700 font-bold text-lg">04:00</span>
                <span className="text-xs font-medium text-gray-500">PM</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#181411]">Griha Pravesh</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span> Local (2km away)
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span> Mrs. Verma
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed opacity-70">
                <span className="material-symbols-outlined text-sm">schedule</span> Wait
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#181411] text-sm font-bold rounded-lg transition-colors">
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Travel Insight Map Preview ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm mt-6">
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <div>
            <p className="text-base font-bold text-[#181411]">Travel Insight</p>
            <p className="text-sm text-gray-500">You are saving 15% travel time today with optimized routing</p>
          </div>
          <span className="material-symbols-outlined text-primary">map</span>
        </div>
        <div className="h-40 bg-gray-100 relative group cursor-pointer overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-80"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxcuzjnSOjS4750BM-hmC5vBd4UiSzGki7WnmwjquP07PjfEBTqpXvCRyZon_Rgrppbut58NgqZWgM2LdCMKjHu3a2iC4_3mGVMv8Dn-ZHZzm6-D9DAMbIMSjcXgFIay0PlymmSqoliFpBOjc8IPwuyQSGWmPLIRV0RUUCaoPJPSOg37FLacQw_h3q1EPM3537XcD1HdSxUqUzwTWavdFww5TJ1LISdAbXO9LvuJCAJpt5jesvaWqxydkwpQE7dw9c8e7taEsWzpE')" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
            <button className="bg-white/90 backdrop-blur px-6 py-2 rounded-full text-primary font-bold shadow-lg flex items-center gap-2 hover:bg-white transition-all transform hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-sm">navigation</span> Open Travel View
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
