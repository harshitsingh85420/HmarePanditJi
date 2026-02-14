"use client";

import React from "react";
import Image from "next/image";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8f7f5] dark:bg-[#181511]">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#221a10]/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#f49d25]">analytics</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Operations Overview</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-64 pl-10 pr-4 py-1.5 bg-slate-100 dark:bg-white/5 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#f49d25]/50 outline-none text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="Search Pandit or Service ID..."
              type="text"
            />
          </div>
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#fa3f38] rounded-full border-2 border-white dark:border-[#181511]"></span>
          </button>
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">
            <span className="material-symbols-outlined">dark_mode</span>
          </button>
        </div>
      </header>

      {/* ── Main Scrollable Content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Bookings</p>
              <span className="material-symbols-outlined text-[#f49d25]">calendar_month</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">1,245</p>
              <p className="text-[#0bda19] text-sm font-medium mb-1">+12%</p>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Pandits</p>
              <span className="material-symbols-outlined text-[#f49d25]">groups</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">512</p>
              <p className="text-[#0bda19] text-sm font-medium mb-1">+5%</p>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Travels</p>
              <span className="material-symbols-outlined text-[#f49d25]">commute</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">42</p>
              <p className="text-[#fa3f38] text-sm font-medium mb-1">-2%</p>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue</p>
              <span className="material-symbols-outlined text-[#f49d25]">payments</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">₹82.4L</p>
              <p className="text-[#0bda19] text-sm font-medium mb-1">+18%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Live Map Section */}
          <div className="xl:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Pandit Journeys (Central India)</h3>
                <div className="flex gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0bda19]"></span> On Time</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f49d25]"></span> Minor Delay</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#fa3f38]"></span> Critical</span>
                </div>
              </div>
              <div className="flex-1 bg-slate-200 dark:bg-[#181511] rounded-lg relative overflow-hidden group">
                {/* Map Image Placeholder - In real app, use an Interactive Map Component */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuArYc-NYBn0ZSmRgE81MgTYrqJJqmIsoeJtOzaCY4hjIlJzW9uwMlW5wsdeZUlfuVp1Ltak3RlElDkmhZZRcnDm5zkMZLMpb4RQy1gHG9E8F155ebog-TZK7AXtykBw4UkWPAebiWunudSRZKqnSm7txLVqIiP9AoeVQaD5HzUm-jLGLPGHmIM0xxkNRg4ji429cZ-YRNg-VLPPD_E7Z4HQBVJz8Id8nLFXvHMm9YNkzWAnXy092mYA3Xhnd2YV5WaIOZwLKiVZgrQ"
                  className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale dark:invert"
                  alt="Map of Central India showing movement of service providers"
                />

                {/* Interactive Elements Simulation */}
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-[#0bda19] rounded-full ring-4 ring-[#0bda19]/20 animate-pulse cursor-pointer hover:scale-125 transition-transform" title="Pandit Sharma - On Time"></div>
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-[#f49d25] rounded-full ring-4 ring-[#f49d25]/20 animate-pulse cursor-pointer hover:scale-125 transition-transform" title="Pandit Verma - 10m Delay"></div>
                <div className="absolute top-2/3 left-1/4 w-4 h-4 bg-[#fa3f38] rounded-full ring-4 ring-[#fa3f38]/20 animate-pulse cursor-pointer hover:scale-125 transition-transform" title="Pandit Singh - Critical Delay"></div>
                <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-[#0bda19] rounded-full ring-4 ring-[#0bda19]/20 animate-pulse cursor-pointer hover:scale-125 transition-transform" title="Pandit Gupta - On Time"></div>
              </div>
            </div>
          </div>

          {/* Red Alert Section */}
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#fa3f38]/5 border-2 border-[#fa3f38]/20 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6 text-[#fa3f38]">
                <span className="material-symbols-outlined">warning</span>
                <h3 className="text-lg font-black uppercase tracking-tighter">Red Alert Monitor</h3>
              </div>
              <div className="space-y-4 flex-1">
                {/* Delayed Item 1 */}
                <div className="p-4 rounded-lg bg-white dark:bg-[#221a10] border border-[#fa3f38]/30 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pandit Sharma Ji</h4>
                    <span className="px-2 py-0.5 rounded bg-[#fa3f38] text-white text-[10px] font-bold">45m DELAY</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Route: Indore -&gt; Ujjain (Mahakal Puja)</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#f49d25] uppercase">Backup Status:</span>
                      <span className="px-2 py-0.5 rounded bg-[#0bda19]/20 text-[#0bda19] text-[10px] font-bold">READY</span>
                    </div>
                    <button className="bg-[#f49d25] hover:bg-[#f49d25]/90 text-white text-xs font-bold px-3 py-1 rounded transition-colors">REASSIGN</button>
                  </div>
                </div>
                {/* Delayed Item 2 */}
                <div className="p-4 rounded-lg bg-white dark:bg-[#221a10] border border-[#fa3f38]/30 shadow-sm opacity-90">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pandit Dubey Ji</h4>
                    <span className="px-2 py-0.5 rounded bg-[#fa3f38] text-white text-[10px] font-bold">20m DELAY</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Route: Bhopal -&gt; Vidisha (Havan)</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#f49d25] uppercase">Backup Status:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-500 text-[10px] font-bold">PENDING</span>
                    </div>
                    <button className="bg-[#f49d25] hover:bg-[#f49d25]/90 text-white text-xs font-bold px-3 py-1 rounded transition-colors">CONTACT</button>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-[#fa3f38] text-white rounded-lg font-bold text-sm hover:bg-[#fa3f38]/90 transition-colors shadow-sm">
                VIEW ALL CRITICAL ALERTS (4)
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Travel Operations Log</h3>
            <button className="text-sm font-semibold text-[#f49d25] hover:underline">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-slate-200 dark:border-white/10">
                <tr className="text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Pandit ID</th>
                  <th className="px-4 py-3 font-medium">Service Type</th>
                  <th className="px-4 py-3 font-medium">Current Location</th>
                  <th className="px-4 py-3 font-medium">ETA to Destination</th>
                  <th className="px-4 py-3 font-medium">Risk Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                <tr className="text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">#PJ-4512</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">Griha Pravesh Puja</td>
                  <td className="px-4 py-4 text-slate-500">Dewas Bypass</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">12 mins</td>
                  <td className="px-4 py-4"><span className="px-2 py-1 rounded-full bg-[#0bda19]/10 text-[#0bda19] text-[10px] font-bold">LOW</span></td>
                  <td className="px-4 py-4"><button className="text-slate-400 hover:text-[#f49d25]"><span className="material-symbols-outlined text-xl">visibility</span></button></td>
                </tr>
                <tr className="text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">#PJ-9821</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">Satyanarayan Katha</td>
                  <td className="px-4 py-4 text-slate-500">Raisen Road</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">34 mins</td>
                  <td className="px-4 py-4"><span className="px-2 py-1 rounded-full bg-[#f49d25]/10 text-[#f49d25] text-[10px] font-bold">MEDIUM</span></td>
                  <td className="px-4 py-4"><button className="text-slate-400 hover:text-[#f49d25]"><span className="material-symbols-outlined text-xl">visibility</span></button></td>
                </tr>
                <tr className="text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">#PJ-1102</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">Vastu Shanti</td>
                  <td className="px-4 py-4 text-slate-500">MP Nagar Ph-II</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">5 mins</td>
                  <td className="px-4 py-4"><span className="px-2 py-1 rounded-full bg-[#0bda19]/10 text-[#0bda19] text-[10px] font-bold">LOW</span></td>
                  <td className="px-4 py-4"><button className="text-slate-400 hover:text-[#f49d25]"><span className="material-symbols-outlined text-xl">visibility</span></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
