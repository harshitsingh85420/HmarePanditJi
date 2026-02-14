"use client";

import React from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#f8f7f5] dark:bg-[#181511] text-slate-900 dark:text-white font-sans transition-colors duration-200">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#221a10] flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-[#f49d25] rounded-lg p-1.5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">temple_hindu</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-tight">HmarePanditJi</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Admin Control Center
                        </p>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f49d25]/10 text-[#f49d25]"
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        <p className="text-sm font-semibold">Metrics</p>
                    </Link>
                    <Link
                        href="/admin/travel"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined">map</span>
                        <p className="text-sm font-medium">Travel Ops</p>
                    </Link>
                    <Link
                        href="/admin/verifications"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined">verified_user</span>
                        <p className="text-sm font-medium">Verification Queue</p>
                    </Link>
                    <Link
                        href="/admin/finance"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined">payments</span>
                        <p className="text-sm font-medium">Finance</p>
                    </Link>
                    <Link
                        href="/admin/support"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined">support_agent</span>
                        <p className="text-sm font-medium">Support</p>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined">settings</span>
                        <p className="text-sm font-medium">Settings</p>
                    </Link>
                </nav>
                <div className="p-4 mt-auto border-t border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div
                            className="size-10 rounded-full bg-slate-300 dark:bg-slate-700 bg-cover"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkJeM4bp7-b69T0WKHdObPjzrK26BUsn3jUHt3NAOv7VTJ5kVCxT9OsfC4LYr9tnpdFmv33ijoHxNFYL0L3cjQfWc5wgfeJKYeXbiRQgRLoS_JJJ5GWB0ciJPiFYNPLUM7JrNxYoC16Dwg7k5-vVpxddRuVIcReKAANPgbSBDkpELbW3FVACpE-nemMj5IumaD5L6y_XKLIr6-MXAWBv2bjjQdlpRRjcszBg9jj8aAgV10_AaHjSjJLQBo3mlJpfow4PORavGTpE4')",
                            }}
                        ></div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">Rajesh Kumar</p>
                            <p className="text-xs text-slate-500">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#181511]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#f49d25]">
                            analytics
                        </span>
                        <h2 className="text-xl font-bold">Operations Overview</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                search
                            </span>
                            <input
                                className="w-64 pl-10 pr-4 py-1.5 bg-slate-100 dark:bg-white/5 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#f49d25]/50"
                                placeholder="Search Pandit or Service ID..."
                                type="text"
                            />
                        </div>
                        <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-[#fa3f38] rounded-full border-2 border-white dark:border-[#181511]"></span>
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Total Bookings
                                </p>
                                <span className="material-symbols-outlined text-[#f49d25]">
                                    calendar_month
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-bold">1,245</p>
                                <p className="text-[#0bda19] text-sm font-medium mb-1">
                                    +12%
                                </p>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Active Pandits
                                </p>
                                <span className="material-symbols-outlined text-[#f49d25]">
                                    groups
                                </span >
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-bold">512</p>
                                <p className="text-[#0bda19] text-sm font-medium mb-1">
                                    +5%
                                </p>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Live Travels
                                </p>
                                <span className="material-symbols-outlined text-[#f49d25]">
                                    commute
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-bold">42</p>
                                <p className="text-[#fa3f38] text-sm font-medium mb-1">
                                    -2%
                                </p>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Revenue
                                </p>
                                <span className="material-symbols-outlined text-[#f49d25]">
                                    payments
                                </span >
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-bold">₹82.4L</p>
                                <p className="text-[#0bda19] text-sm font-medium mb-1">
                                    +18%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Live Map Section */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col h-[500px]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">
                                        Live Pandit Journeys (Central India)
                                    </h3>
                                    <div className="flex gap-2 text-xs font-medium">
                                        <span className="flex items-center gap-1">
                                            <span className="size-2 rounded-full bg-[#0bda19]"></span>{" "}
                                            On Time
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="size-2 rounded-full bg-[#f49d25]"></span>{" "}
                                            Minor Delay
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="size-2 rounded-full bg-[#fa3f38]"></span>{" "}
                                            Critical
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-200 dark:bg-[#181511] rounded-lg relative overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-70 grayscale dark:invert"
                                        style={{
                                            backgroundImage:
                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuArYc-NYBn0ZSmRgE81MgTYrqJJqmIsoeJtOzaCY4hjIlJzW9uwMlW5wsdeZUlfuVp1Ltak3RlElDkmhZZRcnDm5zkMZLMpb4RQy1gHG9E8F155ebog-TZK7AXtykBw4UkWPAebiWunudSRZKqnSm7txLVqIiP9AoeVQaD5HzUm-jLGLPGHmIM0xxkNRg4ji429cZ-YRNg-VLPPD_E7Z4HQBVJz8Id8nLFXvHMm9YNkzWAnXy092mYA3Xhnd2YV5WaIOZwLKiVZgrQ')",
                                        }}
                                    ></div>
                                    {/* Interactive Elements Simulation */}
                                    <div className="absolute top-1/4 left-1/3 size-4 bg-[#0bda19] rounded-full ring-4 ring-[#0bda19]/20 animate-pulse"></div>
                                    <div className="absolute top-1/2 left-1/2 size-4 bg-[#f49d25] rounded-full ring-4 ring-[#f49d25]/20 animate-pulse"></div>
                                    <div className="absolute top-2/3 left-1/4 size-4 bg-[#fa3f38] rounded-full ring-4 ring-[#fa3f38]/20 animate-pulse"></div>
                                    <div className="absolute top-1/3 right-1/4 size-4 bg-[#0bda19] rounded-full ring-4 ring-[#0bda19]/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Red Alert Section */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-[#fa3f38]/5 border-2 border-[#fa3f38]/20 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-6 text-[#fa3f38]">
                                    <span className="material-symbols-outlined">warning</span>
                                    <h3 className="text-lg font-black uppercase tracking-tighter">
                                        Red Alert Monitor
                                    </h3>
                                </div>
                                <div className="space-y-4 flex-1">
                                    {/* Delayed Item 1 */}
                                    <div className="p-4 rounded-lg bg-white dark:bg-[#221a10] border border-[#fa3f38]/30 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm">
                                                Pandit Sharma Ji
                                            </h4>
                                            <span className="px-2 py-0.5 rounded bg-[#fa3f38] text-white text-[10px] font-bold">
                                                45m DELAY
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                            Route: Indore -&gt; Ujjain (Mahakal Puja)
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-[#f49d25] uppercase">
                                                    Backup Status:
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-[#0bda19]/20 text-[#0bda19] text-[10px] font-bold">
                                                    READY
                                                </span>
                                            </div>
                                            <button className="bg-[#f49d25] text-white text-xs font-bold px-3 py-1 rounded">
                                                REASSIGN
                                            </button>
                                        </div>
                                    </div>
                                    {/* Delayed Item 2 */}
                                    <div className="p-4 rounded-lg bg-white dark:bg-[#221a10] border border-[#fa3f38]/30 shadow-sm opacity-90">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm">
                                                Pandit Dubey Ji
                                            </h4>
                                            <span className="px-2 py-0.5 rounded bg-[#fa3f38] text-white text-[10px] font-bold">
                                                20m DELAY
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                            Route: Bhopal -&gt; Vidisha (Havan)
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-[#f49d25] uppercase">
                                                    Backup Status:
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-500 text-[10px] font-bold">
                                                    PENDING
                                                </span>
                                            </div>
                                            <button className="bg-[#f49d25] text-white text-xs font-bold px-3 py-1 rounded">
                                                CONTACT
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-3 bg-[#fa3f38] text-white rounded-lg font-bold text-sm hover:bg-[#fa3f38]/90 transition-colors">
                                    VIEW ALL CRITICAL ALERTS (4)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="p-6 rounded-xl bg-white dark:bg-[#221a10] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Live Travel Operations Log</h3>
                            <button className="text-sm font-semibold text-[#f49d25]">
                                Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 dark:border-white/10">
                                    <tr className="text-xs text-slate-500 uppercase tracking-wider">
                                        <th className="px-4 py-3 font-medium">Pandit ID</th>
                                        <th className="px-4 py-3 font-medium">Service Type</th>
                                        <th className="px-4 py-3 font-medium">
                                            Current Location
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            ETA to Destination
                                        </th>
                                        <th className="px-4 py-3 font-medium">Risk Status</th>
                                        <th className="px-4 py-3 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                    <tr className="text-sm">
                                        <td className="px-4 py-4 font-medium">#PJ-4512</td>
                                        <td className="px-4 py-4">Griha Pravesh Puja</td>
                                        <td className="px-4 py-4 text-slate-500">
                                            Dewas Bypass
                                        </td>
                                        <td className="px-4 py-4">12 mins</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-1 rounded-full bg-[#0bda19]/10 text-[#0bda19] text-[10px] font-bold">
                                                LOW
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button className="text-slate-400 hover:text-[#f49d25]">
                                                <span className="material-symbols-outlined">
                                                    visibility
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="text-sm">
                                        <td className="px-4 py-4 font-medium">#PJ-9821</td>
                                        <td className="px-4 py-4">Satyanarayan Katha</td>
                                        <td className="px-4 py-4 text-slate-500">
                                            Raisen Road
                                        </td>
                                        <td className="px-4 py-4">34 mins</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-1 rounded-full bg-[#f49d25]/10 text-[#f49d25] text-[10px] font-bold">
                                                MEDIUM
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button className="text-slate-400 hover:text-[#f49d25]">
                                                <span className="material-symbols-outlined">
                                                    visibility
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="text-sm">
                                        <td className="px-4 py-4 font-medium">#PJ-1102</td>
                                        <td className="px-4 py-4">Vastu Shanti</td>
                                        <td className="px-4 py-4 text-slate-500">
                                            MP Nagar Ph-II
                                        </td>
                                        <td className="px-4 py-4">5 mins</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-1 rounded-full bg-[#0bda19]/10 text-[#0bda19] text-[10px] font-bold">
                                                LOW
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button className="text-slate-400 hover:text-[#f49d25]">
                                                <span className="material-symbols-outlined">
                                                    visibility
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
