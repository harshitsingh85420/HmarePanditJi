"use client";

import React from "react";
import Link from "next/link";

export default function PanditHomeDashboard() {
  return (
    <div className="bg-[#f8f7f6] dark:bg-[#221910] font-display text-[#181411] dark:text-[#f8f7f6]">
      <div className="max-w-[960px] mx-auto w-full px-4 pb-20">

        {/* Hero Dashboard Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 pb-4">
          <h1 className="text-[#181411] dark:text-white tracking-light text-[32px] font-bold leading-tight px-4">Pandit Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 mt-2">
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-[#f09942]/10 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Monthly Earnings</p>
              <span className="material-symbols-outlined text-[#f09942]">payments</span>
            </div>
            <p className="text-[#181411] dark:text-white tracking-light text-2xl font-bold leading-tight">₹52,000</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-green-600">trending_up</span>
              <p className="text-green-600 text-sm font-bold">+12% vs last month</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-[#f09942]/10 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Average Rating</p>
              <span className="material-symbols-outlined text-[#f09942]">star</span>
            </div>
            <p className="text-[#181411] dark:text-white tracking-light text-2xl font-bold leading-tight">4.9/5</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-green-600">verified</span>
              <p className="text-green-600 text-sm font-bold">Top Professional</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-[#f09942]/10 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Travel Distance</p>
              <span className="material-symbols-outlined text-[#f09942]">distance</span>
            </div>
            <p className="text-[#181411] dark:text-white tracking-light text-2xl font-bold leading-tight">1,200 km</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#f09942]">route</span>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">8 trips completed</p>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#181411] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Today&apos;s Schedule</h2>
            <Link href="/calendar" className="text-[#f09942] text-sm font-bold flex items-center gap-1 hover:underline">
              View Calendar <span className="material-symbols-outlined text-sm">calendar_month</span>
            </Link>
          </div>

          <div className="space-y-4">
            {/* Event 1 (Upcoming) */}
            <div className="bg-white dark:bg-gray-800 border-l-4 border-[#f09942] rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md">
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center min-w-[60px] h-full py-1 bg-[#f09942]/5 rounded-lg border border-[#f09942]/10">
                  <span className="text-[#f09942] font-bold text-lg leading-tight">10:00</span>
                  <span className="text-xs font-medium text-gray-500">AM</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#181411] dark:text-white">Vivaha Puja (Wedding)</h3>
                  <div className="flex items-center gap-4 mt-1">
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
                <button className="flex-1 md:flex-none px-4 py-2 bg-[#f09942] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#dc6803] transition-colors">
                  <span className="material-symbols-outlined text-sm">directions</span> Directions
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[#181411] dark:text-white text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  Details
                </button>
              </div>
            </div>

            {/* Event 2 (Later) */}
            <div className="bg-white dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md">
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center min-w-[60px] h-full py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300 font-bold text-lg leading-tight">04:00</span>
                  <span className="text-xs font-medium text-gray-500">PM</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#181411] dark:text-white">Griha Pravesh</h3>
                  <div className="flex items-center gap-4 mt-1">
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
                <button className="flex-1 md:flex-none px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">schedule</span> Wait
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[#181411] dark:text-white text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Insight Map Preview Placeholder */}
        <div className="p-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#f09942]/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-base font-bold text-[#181411] dark:text-white">Travel Insight</p>
                <p className="text-sm text-gray-500 mt-1">You are saving 15% travel time today with optimized routing</p>
              </div>
              <span className="material-symbols-outlined text-[#f09942] text-2xl">map</span>
            </div>
            <div className="h-40 bg-gray-100 dark:bg-gray-900 relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxcuzjnSOjS4750BM-hmC5vBd4UiSzGki7WnmwjquP07PjfEBTqpXvCRyZon_Rgrppbut58NgqZWgM2LdCMKjHu3a2iC4_3mGVMv8Dn-ZHZzm6-D9DAMbIMSjcXgFIay0PlymmSqoliFpBOjc8IPwuyQSGWmPLIRV0RUUCaoPJPSOg37FLacQw_h3q1EPM3537XcD1HdSxUqUzwTWavdFww5TJ1LISdAbXO9LvuJCAJpt5jesvaWqxydkwpQE7dw9c8e7taEsWzpE')" }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link href="/travel" className="bg-white/95 dark:bg-gray-800/95 backdrop-blur px-6 py-2.5 rounded-full text-[#f09942] font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-sm">navigation</span> Open Travel View
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
