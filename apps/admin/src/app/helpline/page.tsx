"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function HelplineDashboard() {
    const [activeTab, setActiveTab] = useState("communication");

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] text-slate-800 dark:text-slate-100 font-sans">

            {/* ── Left Panel: Queue ──────────────────────────────────────────────── */}
            <aside className="w-80 bg-white dark:bg-[#1a2234] border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 z-10">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[#0f49bd]">headset_mic</span>
                        Active Queue
                    </h2>
                    <span className="bg-[#0f49bd]/10 text-[#0f49bd] px-2 py-0.5 rounded text-xs font-bold">12 Live</span>
                </div>

                {/* Filters */}
                <div className="px-4 py-3 flex gap-2 border-b border-slate-100 dark:border-slate-800">
                    <button className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-medium py-1.5 rounded transition-colors text-slate-600 dark:text-slate-300">All</button>
                    <button className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-xs font-medium py-1.5 rounded transition-colors text-red-600 dark:text-red-400 border border-transparent hover:border-red-200">Urgent</button>
                    <button className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-medium py-1.5 rounded transition-colors text-slate-600 dark:text-slate-300">Logistic</button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {/* Active Item */}
                    <div className="bg-[#0f49bd]/5 dark:bg-[#0f49bd]/10 border border-[#0f49bd]/30 rounded-lg p-3 cursor-pointer relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0f49bd] rounded-l-lg"></div>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">#LOG-4092</span>
                            <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">High Urgency</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">Pandit Delayed - Mumbai</h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            Ganesh Puja • Andheri West
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#0f49bd]/10">
                            <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                                <span className="material-symbols-outlined text-[14px]">timer</span>
                                +15m Late
                            </div>
                            <span className="text-[10px] text-slate-400">Updated: Just now</span>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg p-3 cursor-pointer transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">#SUP-3921</span>
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Medium</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-0.5">Samagri Kit Incomplete</h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                            Satyanarayan • Delhi
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg p-3 cursor-pointer transition-all opacity-70">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">#GEN-1102</span>
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Low</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-0.5">Booking Modification</h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                            <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                            Griha Pravesh • Pune
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Center Panel: Operational View ─────────────────────────────────── */}
            <section className="flex-1 flex flex-col min-w-0 bg-[#f6f6f8] dark:bg-[#101622] relative">
                {/* Ticket Header */}
                <div className="bg-white dark:bg-[#1a2234] border-b border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pandit Delayed - Mumbai</h1>
                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded border border-red-200 dark:border-red-800 uppercase">Critical Delay</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">event</span> 14 Oct, 2023</span>
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">schedule</span> Puja Time: 10:00 AM</span>
                                <span className="flex items-center gap-1 text-[#0f49bd] dark:text-blue-400 font-medium"><span className="material-symbols-outlined text-base">person</span> Cust: Mr. Rahul Kapoor</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold text-slate-800 dark:text-white tabular-nums">09:45 AM</div>
                            <div className="text-xs text-red-500 font-medium mt-1">15 mins to Puja Start</div>
                        </div>
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-200 dark:bg-slate-900 overflow-hidden">
                    {/* Map Background Placeholder */}
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 opacity-60">
                        {/* Abstract pattern fallback */}
                        <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                    </div>
                    <img
                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-overlay opacity-30 dark:opacity-40 grayscale"
                        alt="Stylized map of Mumbai city streets"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLwNY028QG3E7cdJn5nfYwO_BQes3gAqeTTPof_rjTqrez4yUHOg_iAQNTRjrGlBt-h1QP4N6gsszeoR6K7Ug66PSb-NWKhElPUkwjMAgROZlqjOzaJ0kVdFuxQsWxdHCtAI-lFuPgCtlwaCJd1b0SWg5TBDGln1_23XBvpvklLpH48dQFQ7WRg4mjLjMnvQN8zD4ulVIsI4ZJ3W1H4fnEJZ4xMfQpZigUf7VIYWt_KEDqd72YCU-7Cq1CJyWrZw8S2yNZRQz2U50"
                    />

                    {/* Map UI Elements Overlay */}
                    <div className="absolute inset-0 p-6 pointer-events-none">
                        {/* Pandit Marker (Delayed) */}
                        <div className="absolute top-[40%] left-[35%] pointer-events-auto group">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 animate-ping absolute inset-0"></div>
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg p-1 border-2 border-red-500 flex items-center justify-center relative z-10 transform transition hover:scale-110">
                                    <img className="w-full h-full rounded-full object-cover" alt="Portrait of Pandit Sharma" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeuRFjcZeIwwYs7HWxkDRjaessPx3cQJhDNitRFPlyh4IDxPK9d0JLwzACozNoeieUp2mSlokGz_X8yPxGK0-fzYSQbn3Jga3P-EPcr0mI39DHwBXgjsHTClKw1CkXiNIT3kiB_X5CkHXR7O_9bGwZB5A05pHdNDEc_48Xa4R85opTQWWqYzRSgiTYGFaL6mviWwmyKAhsaj2rfDiRRpjZSo40HAaibBanYUi93HgiW30OAoMoY4fCRuBdL_2zBwTO-CfTBMy23XM" />
                                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-800">
                                        <span className="material-symbols-outlined text-[10px] block">warning</span>
                                    </div>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded shadow-xl whitespace-nowrap border border-slate-200 dark:border-slate-700">
                                    <p className="font-bold">Pandit Sharma (Assigned)</p>
                                    <p className="text-red-500">Stuck in traffic • 15km away</p>
                                    <p className="text-slate-400">ETA: 45 mins</p>
                                </div>
                            </div>
                        </div>

                        {/* Backup Pandit Marker */}
                        <div className="absolute top-[55%] left-[55%] pointer-events-auto group">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg p-1 border-2 border-green-500 flex items-center justify-center transform transition hover:scale-110">
                                    <img className="w-full h-full rounded-full object-cover" alt="Portrait of Pandit Verma" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI2yUWvSvXPKZ5ufTS4tmnGB7yDYrCLz0p0YpVdnKm_P1wUdDld1YbYG1z38yheetMuL9qdM1SLa0H_x5robTmHbXqW0To9evYo_aFoN_UcqH7Xo54sMZV2VJ_m6jr-u0QkD6RgkeaCwW9GwYevAHsx1kL_fNP_C2oQ9WQCd_ULn05_kkQZk71AWGCqO-ZCCHu408Cutm15ot9Hd6z1a-PQnhAuFuj88Sq9cb0WUsDQRO1CxgMP9EZB_Mg162Ct3rH8Yek9d-3gJI" />
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                                        <span className="material-symbols-outlined text-[10px] block">check</span>
                                    </div>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 rounded shadow-xl whitespace-nowrap border border-slate-200 dark:border-slate-700 opacity-90">
                                    <p className="font-bold">Pandit Verma (Backup)</p>
                                    <p className="text-green-600">Available • 3km away</p>
                                    <p className="text-slate-400">ETA: 10 mins</p>
                                </div>
                            </div>
                        </div>

                        {/* Destination Marker */}
                        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                            <div className="flex flex-col items-center">
                                <div className="bg-[#0f49bd] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg mb-1 whitespace-nowrap">
                                    Customer Location
                                </div>
                                <span className="material-symbols-outlined text-4xl text-[#0f49bd] drop-shadow-lg">location_on</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Logistics Card */}
                    <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 bg-white/95 dark:bg-[#1a2234]/95 backdrop-blur shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl p-4 pointer-events-auto">
                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Live Logistics Data</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Traffic Delay</span>
                                </div>
                                <span className="text-sm font-bold text-red-600">+25 min surge</span>
                            </div>
                            <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center">
                                    <div className="text-[10px] text-slate-500 mb-0.5">Assigned ETA</div>
                                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">10:45</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center border border-green-100 dark:border-green-800/30">
                                    <div className="text-[10px] text-green-700 dark:text-green-400 mb-0.5">Backup ETA</div>
                                    <div className="text-lg font-bold text-green-700 dark:text-green-400">10:10</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Right Panel: Communication & Actions ───────────────────────────── */}
            <aside className="w-96 bg-white dark:bg-[#1a2234] border-l border-slate-200 dark:border-slate-700 flex flex-col shrink-0 z-10">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab("communication")}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === "communication" ? "text-[#0f49bd] border-b-2 border-[#0f49bd] bg-[#0f49bd]/5 dark:bg-[#0f49bd]/10" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                    >
                        Communication
                    </button>
                    <button
                        onClick={() => setActiveTab("timeline")}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === "timeline" ? "text-[#0f49bd] border-b-2 border-[#0f49bd] bg-[#0f49bd]/5 dark:bg-[#0f49bd]/10" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                    >
                        Timeline &amp; Notes
                    </button>
                </div>

                {/* Comm Context */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex gap-2 mb-3">
                        <button className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 flex items-center justify-center gap-2 shadow-sm hover:border-[#0f49bd] transition-colors text-slate-700 dark:text-slate-200">
                            <span className="material-symbols-outlined text-sm text-blue-500">sms</span>
                            <span className="text-xs font-bold">Pandit (SMS)</span>
                        </button>
                        <button className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 flex items-center justify-center gap-2 shadow-sm text-green-800 dark:text-green-400">
                            <span className="material-symbols-outlined text-sm">chat</span>
                            <span className="text-xs font-bold">Customer (WA)</span>
                        </button>
                    </div>
                    <div className="text-xs text-center text-slate-500">Currently viewing: <span className="font-bold">Customer Chat</span></div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#1a2234]">
                    {/* Message received */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">RK</div>
                        <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[85%]">
                            <p className="text-sm text-slate-700 dark:text-slate-200">Is the Pandit ji coming? It is almost 10 AM.</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">09:52 AM</span>
                        </div>
                    </div>

                    {/* Message Sent */}
                    <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-[#0f49bd]/20 flex items-center justify-center text-[#0f49bd] font-bold text-xs shrink-0">You</div>
                        <div className="bg-[#0f49bd] text-white rounded-2xl rounded-tr-none p-3 shadow-md max-w-[85%]">
                            <p className="text-sm">Namaste Mr. Kapoor. We are tracking the Pandit's location. He is stuck in heavy traffic. We are arranging a backup.</p>
                            <span className="text-[10px] text-blue-100 mt-1 block">09:54 AM</span>
                        </div>
                    </div>

                    {/* System Notice */}
                    <div className="flex justify-center">
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-1 rounded-full">System: Location request sent to Pandit Sharma</span>
                    </div>
                </div>

                {/* Quick Actions & Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2234]">
                    {/* Quick Chips */}
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                        <button className="whitespace-nowrap px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-colors">Confirm Location</button>
                        <button className="whitespace-nowrap px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-colors">Apology &amp; Delay</button>
                        <button className="whitespace-nowrap px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-colors">Send Backup Details</button>
                    </div>

                    {/* Input */}
                    <div className="relative mb-4">
                        <input
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-[#0f49bd] focus:border-transparent text-slate-700 dark:text-slate-200"
                            placeholder="Type message..."
                            type="text"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#0f49bd] text-white rounded hover:bg-blue-700 transition-colors">
                            <span className="material-symbols-outlined text-sm block">send</span>
                        </button>
                    </div>

                    {/* Critical Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 mb-1 group-hover:text-[#0f49bd]">alt_route</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Manual Override</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group">
                            <span className="material-symbols-outlined text-red-500 mb-1 animate-pulse">sos</span>
                            <span className="text-xs font-bold text-red-700 dark:text-red-400">Emergency SOS</span>
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
