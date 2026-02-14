"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LiveTrackingPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    return (
        <div className="flex flex-1 relative overflow-hidden h-screen bg-[#e5e7eb] dark:bg-[#1c2127]">
            {/* Full Screen Map Background */}
            <div className="absolute inset-0 z-0">
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeaLCohXycqVnLLQCTXApvQRdXJYpA30yRcbha2X7bxeVG-JsEMqhdy3HKZMdmD-eok8AxQtRnuxu6KUNXgBGsTX1ooHAPzMntMBlLlzIfT0xR-iKfQZGWfRZR_bGGdB_sR_e8byDQun_HJ2x7fRZZ4zT7pJjVpsp_ndC9Fc3LLVhQR9ipEIaYoyBrMfumZaXp47unp6GQW5vn17qji73OFGOfkzwb2TKOnDjQ-A1BgVZrDE-Rk9LnPsOIUEcyL0735fsYp6Ngfiw')",
                    }}
                ></div>

                {/* Map UI Elements */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
                    <button
                        onClick={() => router.back()}
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-3 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-[#137fec] flex items-center justify-center transition-colors"
                        title="Back to Booking"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                </div>

                <div className="absolute top-6 left-20 z-10 flex flex-col gap-3">
                    <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-xl p-1 border border-slate-200 dark:border-slate-800">
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-64 text-slate-900 dark:text-white placeholder:text-slate-400"
                            placeholder="Search route..."
                            type="text"
                        />
                        <button className="p-2 text-slate-500">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-10 right-[380px] z-10 hidden md:flex flex-col gap-2">
                    <button className="size-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-lg text-slate-600 dark:text-slate-300 hover:text-[#137fec] transition-colors">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <button className="size-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-lg text-slate-600 dark:text-slate-300 hover:text-[#137fec] transition-colors">
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                    <button className="size-10 flex items-center justify-center bg-[#137fec] text-white rounded-lg shadow-lg mt-2">
                        <span className="material-symbols-outlined">my_location</span>
                    </button>
                </div>

                {/* Live Route Overlay (Simulated) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-1/2 h-1/2">
                        {/* Route Line */}
                        <div className="absolute top-1/2 left-1/4 w-[60%] h-1 bg-[#137fec]/40 rounded-full rotate-[-15deg]"></div>
                        {/* Current Position Marker */}
                        <div className="absolute top-[48%] left-[60%] flex flex-col items-center">
                            <div className="bg-[#137fec] text-white p-2 rounded-full shadow-xl animate-pulse">
                                <span className="material-symbols-outlined">directions_car</span>
                            </div>
                            <div className="mt-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-lg text-xs font-bold border border-[#137fec] text-slate-900 dark:text-white">
                                Vishnu Shastri
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Status Card (Left Bottom) */}
            <div className="absolute bottom-10 left-10 z-20 max-w-md w-full">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Pandit Vishnu Shastri is near Agra
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                                        Current Status: On Time
                                    </p>
                                </div>
                            </div>
                            <div className="bg-[#137fec]/10 p-3 rounded-xl">
                                <span className="material-symbols-outlined text-[#137fec]">
                                    schedule
                                </span>
                            </div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl mb-6">
                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">
                                Estimated Arrival
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                4h 20m{" "}
                                <span className="text-slate-400 text-base font-normal">
                                    at 02:20 AM
                                </span>
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 bg-[#137fec] text-white font-bold py-3 rounded-xl hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/25">
                                    <span className="material-symbols-outlined text-sm">call</span>
                                    Call Pandit
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
                                    <span className="material-symbols-outlined text-sm">chat</span>
                                    Message
                                </button>
                            </div>
                            <button className="flex items-center justify-center gap-2 text-slate-500 hover:text-[#137fec] text-sm font-medium py-2 transition-colors">
                                <span className="material-symbols-outlined text-sm">
                                    contact_support
                                </span>
                                Contact Backup Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Timeline */}
            <aside className="fixed right-0 top-16 bottom-0 w-96 bg-white dark:bg-[#101922] border-l border-slate-200 dark:border-slate-800 z-30 hidden lg:flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Journey Timeline
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Varanasi → Delhi Route
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="relative space-y-8">
                        {/* Vertical Connector Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

                        {/* Timeline Item 1 */}
                        <div className="relative flex gap-4">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-[#101922]">
                                <span className="material-symbols-outlined text-[16px] font-bold">
                                    check
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold text-slate-900 dark:text-white">
                                    Journey Started
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Varanasi HQ
                                </p>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                                    4:00 PM ✓
                                </p>
                            </div>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative flex gap-4">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-[#101922]">
                                <span className="material-symbols-outlined text-[16px] font-bold">
                                    check
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold text-slate-900 dark:text-white">
                                    Crossed Kanpur
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Highway Checkpoint 4
                                </p>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                                    8:45 PM ✓
                                </p>
                            </div>
                        </div>

                        {/* Timeline Item 3 (Current) */}
                        <div className="relative flex gap-4">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-900/30">
                                <span className="material-symbols-outlined text-[16px] font-bold">
                                    more_horiz
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                                    Approaching Agra
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Distance: 42km left
                                </p>
                                <p className="text-sm font-bold text-amber-500 mt-1">
                                    10:00 PM 🟡 (In Transit)
                                </p>
                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                                            "Traffic reported near Yamuna Expressway. Minor delay
                                            possible."
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Item 4 (Future) */}
                        <div className="relative flex gap-4 opacity-50">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-[#101922]">
                                <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold dark:text-white">Mathura Transit</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Scheduled Stop</p>
                                <p className="text-sm font-medium mt-1">Est. 12:15 AM</p>
                            </div>
                        </div>

                        {/* Timeline Item 5 (Destination) */}
                        <div className="relative flex gap-4 opacity-50">
                            <div className="mt-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-[#101922]">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold dark:text-white">Delhi (Destination)</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Pooja Venue</p>
                                <p className="text-sm font-medium mt-1">Est. 02:20 AM</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Pandit Profile Quick View */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 mt-auto">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-full bg-cover bg-center border-2 border-[#137fec]" style={{
                            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAEUtM09s-N5bHLZysoWYXWb71PECzwY2w2XLAEy6G1ervi7mHW55IcM5AuwAEdrrOIsGCm9p1i2el9so4Ek1CJelwor8ScWsawZ7z0Nc3fB9WB0sSbT985R4RlDwR7Elv_rtdL2DX1hxnrCKbezH_HTS1RcpV8PLaVR9hc73s_PGWIgsXj6zQZToKcrclzpKmaKOirus6tHXCavhL_eifJf0UBdmqQiwCMSbzSPb56LRkKZmF_7Uspi6M3pxc20t9gmqm2ykIsfKU")'
                        }}></div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white">Vishnu Shastri</p>
                            <div className="flex items-center text-amber-500 text-xs gap-1">
                                <div className="flex">
                                    <span className="material-symbols-outlined text-xs fill-1">star</span>
                                    <span className="material-symbols-outlined text-xs fill-1">star</span>
                                    <span className="material-symbols-outlined text-xs fill-1">star</span>
                                    <span className="material-symbols-outlined text-xs fill-1">star</span>
                                    <span className="material-symbols-outlined text-xs fill-1">star_half</span>
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">4.8 (120 reviews)</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Expert in Satyanarayan Pooja
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
