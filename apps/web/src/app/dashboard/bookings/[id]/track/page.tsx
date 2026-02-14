"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LiveTrackingPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f6f7f8] dark:bg-[#101922]">

            {/* ── Header ── */}
            <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101922] px-6 py-3 z-50">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 text-[#137fec]">
                        <span className="material-symbols-outlined text-3xl font-bold">flare</span>
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight hidden sm:block">HmarePanditJi</h2>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#137fec] transition-colors">Dashboard</Link>
                        <Link href="/dashboard/bookings" className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#137fec] transition-colors">Bookings</Link>
                        <span className="text-[#137fec] text-sm font-bold border-b-2 border-[#137fec] py-5">Live Tracking</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Back to Booking
                    </button>
                </div>
            </header>

            {/* ── Main Dashboard Area ── */}
            <main className="flex flex-1 relative overflow-hidden">

                {/* Full Screen Map Simulation */}
                <div className="absolute inset-0 z-0 bg-[#e5e7eb] dark:bg-[#1c2127]">
                    {/* Using a placeholder map image as per design */}
                    <div
                        className="w-full h-full bg-cover bg-center opacity-80 dark:opacity-60"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeaLCohXycqVnLLQCTXApvQRdXJYpA30yRcbha2X7bxeVG-JsEMqhdy3HKZMdmD-eok8AxQtRnuxu6KUNXgBGsTX1ooHAPzMntMBlLlzIfT0xR-iKfQZGWfRZR_bGGdB_sR_e8byDQun_HJ2x7fRZZ4zT7pJjVpsp_ndC9Fc3LLVhQR9ipEIaYoyBrMfumZaXp47unp6GQW5vn17qji73OFGOfkzwb2TKOnDjQ-A1BgVZrDE-Rk9LnPsOIUEcyL0735fsYp6Ngfiw')" }}
                    ></div>

                    {/* Map Overlay Controls */}
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
                        <div className="flex bg-white dark:bg-[#101922] rounded-xl shadow-xl p-1 border border-slate-200 dark:border-slate-800 w-full max-w-xs">
                            <input
                                className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white placeholder:text-slate-400 pl-3"
                                placeholder="Search route..."
                                type="text"
                            />
                            <button className="p-2 text-slate-500 hover:text-[#137fec]"><span className="material-symbols-outlined">search</span></button>
                        </div>
                    </div>

                    <div className="absolute bottom-10 right-[400px] z-10 hidden lg:flex flex-col gap-2">
                        <button className="h-10 w-10 flex items-center justify-center bg-white dark:bg-[#101922] rounded-lg shadow-lg text-slate-600 dark:text-slate-300 hover:text-[#137fec] transition-colors"><span className="material-symbols-outlined">add</span></button>
                        <button className="h-10 w-10 flex items-center justify-center bg-white dark:bg-[#101922] rounded-lg shadow-lg text-slate-600 dark:text-slate-300 hover:text-[#137fec] transition-colors"><span className="material-symbols-outlined">remove</span></button>
                        <button className="h-10 w-10 flex items-center justify-center bg-[#137fec] text-white rounded-lg shadow-lg mt-2"><span className="material-symbols-outlined">my_location</span></button>
                    </div>

                    {/* Simulated Route Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-1/2 h-1/2">
                            {/* Route Line */}
                            <div className="absolute top-1/2 left-1/4 w-[60%] h-1 bg-[#137fec]/60 rounded-full rotate-[-15deg]"></div>

                            {/* Current Position Marker */}
                            <div className="absolute top-[48%] left-[60%] flex flex-col items-center animate-bounce duration-[2000ms]">
                                <div className="bg-[#137fec] text-white p-2 rounded-full shadow-xl ring-4 ring-white dark:ring-[#101922]">
                                    <span className="material-symbols-outlined">directions_car</span>
                                </div>
                                <div className="mt-2 bg-white dark:bg-[#101922] px-3 py-1 rounded-full shadow-lg text-xs font-bold border border-[#137fec]/30 text-slate-900 dark:text-white">
                                    Pandit En Route
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Status Card (Left Bottom) */}
                    <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-96 z-20">
                        <div className="bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Near Agra Highway</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">On Time</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#137fec]/10 p-2 rounded-xl text-[#137fec]">
                                        <span className="material-symbols-outlined">schedule</span>
                                    </div>
                                </div>

                                <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl mb-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">ETA</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">4h 20m</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Arrival</p>
                                        <p className="text-xl font-medium text-slate-700 dark:text-slate-300">02:20 AM</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <button className="flex items-center justify-center gap-2 bg-[#137fec] text-white font-bold py-3 rounded-xl hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/20 text-sm">
                                        <span className="material-symbols-outlined text-sm">call</span> Call
                                    </button>
                                    <button className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all text-sm">
                                        <span className="material-symbols-outlined text-sm">chat</span> Message
                                    </button>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-[#137fec] text-xs font-medium py-2 transition-colors">
                                    <span className="material-symbols-outlined text-sm">support_agent</span> Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Sidebar: Timeline ── */}
                <aside className="hidden lg:flex w-96 bg-white dark:bg-[#101922] border-l border-slate-200 dark:border-slate-800 z-30 flex-col h-full shadow-2xl">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Journey Timeline</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">更新 live every 30s</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="relative space-y-8">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

                            {/* Completed Steps */}
                            <div className="relative flex gap-4">
                                <div className="mt-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-[#101922]">
                                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Journey Started</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Varanasi HQ</p>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">4:00 PM</p>
                                </div>
                            </div>

                            <div className="relative flex gap-4">
                                <div className="mt-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-[#101922]">
                                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Crossed Kanpur</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Highway Checkpoint</p>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">8:45 PM</p>
                                </div>
                            </div>

                            {/* Current Step */}
                            <div className="relative flex gap-4">
                                <div className="mt-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-900/30 animate-pulse">
                                    <span className="material-symbols-outlined text-[14px] font-bold">more_horiz</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Approaching Agra</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">42 km remaining to checkpoint</p>
                                    <p className="text-xs font-bold text-amber-500 mt-1">Status: In Transit</p>

                                    <div className="mt-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 flex gap-3 items-center">
                                        <span className="material-symbols-outlined text-amber-500">traffic</span>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-tight">"Moderate traffic reported near Yamuna Expressway."</p>
                                    </div>
                                </div>
                            </div>

                            {/* Future Steps */}
                            <div className="relative flex gap-4 opacity-50">
                                <div className="mt-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 ring-4 ring-white dark:ring-[#101922]">
                                    <span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Mathura Transit</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scheduled Stop</p>
                                    <p className="text-xs font-medium text-slate-400 mt-1">Est. 12:15 AM</p>
                                </div>
                            </div>

                            <div className="relative flex gap-4 opacity-50">
                                <div className="mt-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 ring-4 ring-white dark:ring-[#101922]">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Delhi (Venue)</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Final Destination</p>
                                    <p className="text-xs font-medium text-slate-400 mt-1">Est. 02:20 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pandit Mini Profile */}
                    <div className="p-5 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden border-2 border-[#137fec]">
                                <div className="w-full h-full flex items-center justify-center bg-[#137fec]/10 text-[#137fec]">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">Pandit Vishnu Shastri</p>
                                <div className="flex items-center text-amber-500 text-xs">
                                    <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                                    <span className="ml-1 font-bold">4.8</span>
                                    <span className="ml-1 text-slate-400 font-normal">(120 reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
