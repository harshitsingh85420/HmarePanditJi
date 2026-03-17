"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ChevronLeft, ChevronRight, Search, Bell, Calendar as CalendarIcon,
    MapPin, Clock, ArrowRight, Sun, User, Info
} from "lucide-react";

export default function MuhuratExplorerPage() {
    const [currentDate] = useState(new Date("2024-12-01"));

    // Create a 7x5 roughly mock grid for december 2024
    const daysInDec = 31;
    const startingDayOfWeek = 0; // Sun

    const calendarCells = [];
    let dayCounter = 1;
    const prevMonthDays = 30; // Nov

    for (let i = 0; i < 35; i++) {
        if (i < 0) {
            calendarCells.push({ day: prevMonthDays - (0 - i) + 1, isCurrentMonth: false });
        } else if (dayCounter <= daysInDec) {
            calendarCells.push({ day: dayCounter, isCurrentMonth: true });
            dayCounter++;
        } else {
            calendarCells.push({ day: dayCounter - daysInDec, isCurrentMonth: false });
            dayCounter++;
        }
    }

    // hardcoded highlights
    const pujas: Record<number, { count: number; isToday?: boolean }> = {
        3: { count: 4 },
        6: { count: 2 },
        11: { count: 5 },
        16: { count: 8, isToday: true },
        18: { count: 3 },
        25: { count: 6 },
    };

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#221b10] text-slate-900 dark:text-white min-h-screen font-sans flex flex-col">
            <div className="relative flex flex-col w-full min-h-screen overflow-x-hidden">
                {/* Mock Header (if separate from layout) - We just use inline here matching the design precisely */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-white/10 px-6 py-4 lg:px-20 bg-[#f8f7f5] dark:bg-[#221b10] sticky top-0 z-50">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 text-[#f29e0d]">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star_rate</span>
                            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] font-display text-slate-900 dark:text-white" style={{ fontFamily: '"Noto Serif", serif' }}>HmarePanditJi</h2>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f29e0d] transition-colors" href="/muhurat">Muhurat</Link>
                            <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f29e0d] transition-colors" href="/search">Pujas</Link>
                            <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f29e0d] transition-colors" href="/search">Pandits</Link>
                            <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f29e0d] transition-colors" href="#">Astrology</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="hidden lg:flex items-center relative group">
                            <Search className="absolute left-3 text-slate-400 group-focus-within:text-[#f29e0d] transition-colors" size={20} />
                            <input
                                className="w-64 h-10 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-white/5 border-none focus:ring-1 focus:ring-[#f29e0d] text-sm placeholder:text-slate-500"
                                placeholder="Search for Pujas or Pandits"
                            />
                        </label>
                        <button className="p-2 text-slate-600 dark:text-slate-300"><Bell size={24} /></button>
                        <Link href="/dashboard" className="bg-[#f29e0d] text-[#221b10] px-6 py-2 rounded-lg font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
                            Profile
                        </Link>
                    </div>
                </header>

                <main className="flex flex-1 flex-col lg:flex-row p-4 lg:p-8 gap-6 max-w-[1600px] mx-auto w-full">
                    {/* Left Sidebar */}
                    <aside className="w-full lg:w-72 flex flex-col gap-6">
                        <div className="flex flex-col gap-2 p-2">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: '"Noto Serif", serif' }}>Muhurat Explorer</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Find auspicious timings for your sacred events.</p>
                        </div>
                        <nav className="flex flex-col gap-1">
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f29e0d]/10 text-[#f29e0d] border border-[#f29e0d]/20" href="/muhurat">
                                <CalendarIcon size={20} />
                                <span className="font-medium">Calendar</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/dashboard/bookings">
                                <span className="material-symbols-outlined text-xl">book_online</span>
                                <span className="font-medium">My Bookings</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/search">
                                <span className="material-symbols-outlined text-xl">person_search</span>
                                <span className="font-medium">Pandit Search</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="#">
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                <span className="font-medium">Spiritual Guide</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/dashboard/profile">
                                <span className="material-symbols-outlined text-xl">settings</span>
                                <span className="font-medium">Settings</span>
                            </Link>
                        </nav>
                        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#f29e0d]/20 to-transparent border border-[#f29e0d]/20">
                            <p className="text-xs font-bold text-[#f29e0d] uppercase tracking-widest mb-2">Pro Tip</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Golden dates are highly auspicious (Sarvartha Siddhi Yoga).</p>
                        </div>
                    </aside>

                    {/* Center Calendar Section */}
                    <section className="flex-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold" style={{ fontFamily: '"Noto Serif", serif' }}>December 2024</h2>
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2 bg-slate-100 dark:bg-white/10 p-1 rounded-lg">
                                    <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-[#221b10] shadow-sm">Month</button>
                                    <button className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500">Week</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} className="bg-slate-50 dark:bg-[#221b10]/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {day}
                                    </div>
                                ))}

                                {calendarCells.map((cell, idx) => {
                                    const dayData = cell.isCurrentMonth ? pujas[cell.day as keyof typeof pujas] : null;

                                    if (!cell.isCurrentMonth) {
                                        return <div key={idx} className="bg-white dark:bg-[#221b10] min-h-[100px] p-2 text-slate-400"></div>;
                                    }

                                    if (dayData?.isToday) {
                                        return (
                                            <div key={idx} className="bg-[#f29e0d]/10 dark:bg-[#f29e0d]/20 min-h-[100px] p-2 border-2 border-[#f29e0d] ring-inset ring-[#f29e0d] shadow-[inset_0_0_20px_rgba(242,158,13,0.1)] transition-all relative z-10">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f29e0d] text-[#221b10] font-bold">
                                                    {cell.day}
                                                </span>
                                                <div className="mt-2 flex flex-col gap-1">
                                                    <div className="bg-[#f29e0d]/30 text-[10px] px-1.5 py-0.5 rounded text-[#221b10] dark:text-[#f29e0d] font-bold w-max">
                                                        {dayData.count} Pujas Today
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (dayData) {
                                        return (
                                            <div key={idx} className="bg-white dark:bg-[#221b10] min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f29e0d]/20 text-[#f29e0d] font-bold">
                                                    {cell.day}
                                                </span>
                                                <div className="mt-2 flex flex-col gap-1">
                                                    <div className="bg-[#f29e0d]/10 text-[10px] px-1.5 py-0.5 rounded text-[#f29e0d] font-medium w-max">
                                                        {dayData.count} Pujas
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={idx} className="bg-white dark:bg-[#221b10] min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            {cell.day}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Right Sidebar - Daily details */}
                    <aside className="w-full lg:w-96 flex flex-col gap-6">
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-6 shadow-sm text-left">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold" style={{ fontFamily: '"Noto Serif", serif' }}>Puja List for Dec 16</h3>
                                <span className="text-xs bg-[#f29e0d]/20 text-[#f29e0d] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Auspicious</span>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: "Wedding", time: "7:00 AM - 12:00 PM", icon: "favorite" },
                                    { title: "Griha Pravesh", time: "9:00 AM - 11:00 AM", icon: "house" },
                                    { title: "Namkaran Sanskar", time: "10:30 AM - 1:00 PM", icon: "child_care" },
                                    { title: "Vahan Puja", time: "3:00 PM - 5:00 PM", icon: "precision_manufacturing" }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-[#f29e0d]/50 transition-colors bg-slate-50/50 dark:bg-white/5 group relative overflow-hidden text-left">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-[#f29e0d]/20 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-[#f29e0d]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{item.title}</p>
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                                        <Clock size={16} />
                                                        <span>{item.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/search?pujaType=${encodeURIComponent(item.title)}`} className="w-full py-2.5 rounded-lg border border-[#f29e0d] text-[#f29e0d] font-bold text-sm hover:bg-[#f29e0d] hover:text-[#221b10] transition-all flex items-center justify-center">
                                            Search Pandits
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 bg-slate-100 dark:bg-white/10 rounded-xl text-slate-500 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                                View 4 more pujas
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-[#f29e0d]/30 to-[#f29e0d]/5 rounded-2xl p-6 border border-[#f29e0d]/20 relative overflow-hidden group text-left">
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2" style={{ fontFamily: '"Noto Serif", serif' }}>Panchang Insights</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Today&apos;s Tithi: Shukla Paksha Dashami. Nakshatra: Revati.</p>
                                <button className="text-sm font-bold text-[#f29e0d] flex items-center gap-1 hover:underline">
                                    Detailed View <ArrowRight size={16} />
                                </button>
                            </div>
                            <Sun size={120} className="absolute -right-4 -bottom-4 text-[#f29e0d]/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
}
