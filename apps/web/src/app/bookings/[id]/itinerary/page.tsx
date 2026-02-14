"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TravelItineraryPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Day 1");

    return (
        <div className="flex flex-1 justify-center py-8 px-4 lg:px-40 bg-[#f8f7f5] dark:bg-[#221a10] min-h-screen">
            <div className="flex flex-col max-w-[960px] flex-1">
                {/* Header Section */}
                <div className="flex flex-wrap justify-between items-end gap-4 p-4 mb-4">
                    <div className="flex flex-col gap-2">
                        <span className="px-3 py-1 bg-[#f49d25]/20 text-[#f49d25] text-xs font-bold rounded-full w-max">
                            Active Journey
                        </span>
                        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                            Varanasi to Delhi Roadmap
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                            Oct 24 - Oct 26 • High-Stakes Wedding Ceremony
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/bookings/${id}/track`)}
                        className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-[#f49d25]/30 px-5 py-2.5 text-slate-700 dark:text-slate-200 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        <span className="material-symbols-outlined text-[#f49d25]">map</span>
                        View Route Map
                    </button>
                </div>

                {/* Tabs */}
                <div className="pb-6 px-4">
                    <div className="flex border-b border-slate-200 dark:border-slate-700 gap-8 overflow-x-auto no-scrollbar">
                        {["Day 1: Travel", "Day 2: Wedding Puja", "Day 3: Return"].map(
                            (day) => { // Extract "Day X" part for simple state matching
                                const tabKey = day.split(":")[0];
                                const isActive = activeTab === tabKey;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setActiveTab(tabKey)}
                                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 whitespace-nowrap transition-colors ${isActive
                                                ? "border-[#f49d25] text-[#f49d25]"
                                                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#f49d25]"
                                            }`}
                                    >
                                        <p className="text-sm font-bold tracking-[0.015em]">{day}</p>
                                    </button>
                                );
                            }
                        )}
                        <button className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500 dark:text-slate-400 pb-3 pt-2 whitespace-nowrap hover:text-[#f49d25] transition-colors">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">
                                    account_balance_wallet
                                </span>
                                <p className="text-sm font-bold tracking-[0.015em]">
                                    Digital Wallet
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Timeline Section */}
                {activeTab === "Day 1" && (
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-sm border border-[#f49d25]/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                                October 24: Varanasi Departure
                            </h2>
                            <button className="bg-[#f49d25] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#f49d25]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#f49d25]/20">
                                <span className="material-symbols-outlined text-sm">
                                    location_on
                                </span>
                                I'M HERE
                            </button>
                        </div>
                        <div className="grid grid-cols-[48px_1fr] gap-x-4">
                            {/* Timeline Point 1 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center size-10 rounded-full bg-[#f49d25]/10 text-[#f49d25]">
                                    <span className="material-symbols-outlined">
                                        directions_car
                                    </span>
                                </div>
                                <div className="w-0.5 bg-[#f49d25]/20 h-16 my-2"></div>
                            </div>
                            <div className="flex flex-col pb-8">
                                <p className="text-slate-900 dark:text-white text-lg font-bold">
                                    4:00 AM - Pick-up from Residence
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-base">
                                    Varanasi Home • Pre-assigned Taxi: DL-1C-9988
                                </p>
                            </div>

                            {/* Timeline Point 2 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center size-10 rounded-full bg-[#f49d25]/10 text-[#f49d25]">
                                    <span className="material-symbols-outlined">
                                        flight_takeoff
                                    </span>
                                </div>
                                <div className="w-0.5 bg-[#f49d25]/20 h-16 my-2"></div>
                            </div>
                            <div className="flex flex-col pb-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-900 dark:text-white text-lg font-bold">
                                            10:30 AM - Arrival at Delhi IGI
                                        </p>
                                        <p className="text-slate-500 dark:text-slate-400 text-base">
                                            Flight AI-402 • Terminal 3
                                        </p>
                                    </div>
                                    <div className="bg-[#f49d25]/5 p-3 rounded-lg border border-[#f49d25]/20">
                                        <p className="text-xs font-bold text-[#f49d25] uppercase">
                                            Gate
                                        </p>
                                        <p className="text-lg font-black text-[#f49d25]">A24</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Point 3 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center size-10 rounded-full bg-[#f49d25] text-white">
                                    <span className="material-symbols-outlined">hotel</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-slate-900 dark:text-white text-lg font-bold">
                                    12:00 PM - Hotel Check-in
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-base">
                                    Radisson Blu Plaza, Delhi Airport
                                </p>
                                <div className="mt-3 flex gap-3">
                                    <button className="text-[#f49d25] text-sm font-bold border border-[#f49d25]/30 px-4 py-1.5 rounded-lg hover:bg-[#f49d25]/10 transition-colors">
                                        View Voucher
                                    </button>
                                    <button className="text-slate-500 dark:text-slate-400 text-sm font-bold border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        Call Hotel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Digital Wallet Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-[#f49d25] to-orange-600 rounded-xl p-6 text-white shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                                    Ticket Voucher
                                </p>
                                <p className="text-xl font-bold">Air India AI-402</p>
                            </div>
                            <span className="material-symbols-outlined text-3xl">
                                qr_code_2
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-white/70">Seat</p>
                                <p className="text-lg font-bold">12A</p>
                            </div>
                            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold transition-all">
                                View All Tickets
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-[#f49d25]/10 flex flex-col justify-between">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-full bg-[#f49d25]/10 flex items-center justify-center text-[#f49d25]">
                                <span className="material-symbols-outlined">celebration</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#f49d25] uppercase">
                                    Upcoming Puja
                                </p>
                                <p className="text-slate-900 dark:text-white font-bold">
                                    Day 2: Wedding Event
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-[#f49d25] text-white text-xs font-bold py-3 rounded-lg opacity-50 cursor-not-allowed">
                                MARK PUJA START
                            </button>
                            <button className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-400 text-xs font-bold py-3 rounded-lg cursor-not-allowed">
                                MARK COMPLETE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
