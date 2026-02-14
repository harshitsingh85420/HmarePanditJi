"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PanditCalendarPage() {
    const router = useRouter();

    // Simulated state for days
    // 1-31 days for current month view
    // We'll just hardcode visual state based on HTML

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] dark:bg-[#221b10] text-slate-900 dark:text-slate-100 font-sans">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-[#221b10] px-6 md:px-10 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100">
                    <div className="size-6 text-[#f29e0d]">
                        <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
                        HmarePanditJi
                    </h2>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <div className="hidden md:flex items-center gap-9">
                        <Link href="/pandit/dashboard" className="text-sm font-medium leading-normal hover:text-[#f29e0d] transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/pandit/calendar" className="text-sm font-bold leading-normal text-[#f29e0d]">
                            Calendar
                        </Link>
                        <Link href="/pandit/bookings" className="text-sm font-medium leading-normal hover:text-[#f29e0d] transition-colors">
                            Bookings
                        </Link>
                        <Link href="/pandit/earnings" className="text-sm font-medium leading-normal hover:text-[#f29e0d] transition-colors">
                            Earnings
                        </Link>
                    </div>
                    <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f29e0d] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-orange-600 transition-all">
                        <span className="truncate">Sync Google Calendar</span>
                    </button>
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#f29e0d]/20"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMJo8f3Y4in17nkMYAoQ9KdIIMIWGSjc9463nIZgQHzXW_8q5tTsKH5bb0tvM8pY8EJLe0HzaTSQBAA8iU8WWqOFItla6a7JhymuMLlSNs3OX3FEI_0Pp74-WMDz_ymw0vVXT_kfsA0Dsoyn5oLRZZ6Dc3isR95rJuOXc32rRcNT5kOm7xVZw4F48u1QxL3jpdIWlKzcKNSEgFKwjWjovYRtKwnmam-FfGPAVqu3fwFjx6iwFIgKKhQgqy6Z7Ax-881cfEkvAO-qs")',
                        }}
                    ></div>
                </div>
            </header>

            <main className="flex-1 max-w-[1200px] mx-auto w-full p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar: Controls & Stats */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h1 className="text-xl font-bold mb-1">Work Calendar</h1>
                            <p className="text-slate-500 text-sm mb-6">
                                High-stakes schedule management
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={() => router.push('/pandit/calendar/leaves')}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#f29e0d]/10 text-[#f29e0d] font-semibold hover:bg-[#f29e0d]/20 transition-all"
                                >
                                    <span className="material-symbols-outlined">event_busy</span>
                                    <span className="text-sm">Block Festival Period</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <span className="material-symbols-outlined">repeat_on</span>
                                    <span className="text-sm">Set Repeat Off</span>
                                </button>
                            </div>
                        </div>
                        {/* Notification Card */}
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-[#f29e0d]/20">
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-[#f29e0d]">
                                    info
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
                                        Travel Days Auto-blocked
                                    </p>
                                    <p className="text-xs text-orange-800/80 dark:text-orange-300/80 mt-1">
                                        Calendar intelligently blocks buffer time for venue travel
                                        based on location distance.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="px-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                Legend
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-3 h-3 rounded-full bg-[#f29e0d]"></span>
                                    <span>Wedding / Muhurat</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                                    <span>Travel Buffer</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Calendar View */}
                    <div className="lg:col-span-5">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-lg font-bold">December 2024</h2>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                        <span className="material-symbols-outlined">
                                            chevron_right
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-7 mb-2">
                                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                                        (day) => (
                                            <div
                                                key={day}
                                                className="text-center text-xs font-bold text-slate-400 py-2"
                                            >
                                                {day}
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Empty cells */}
                                    {[24, 25, 26, 27, 28, 29, 30].map((d) => (
                                        <div
                                            key={d}
                                            className="aspect-square flex flex-col items-center justify-center text-sm text-slate-300"
                                        >
                                            {d}
                                        </div>
                                    ))}
                                    {/* Days 1-31 */}
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                                        const isToday = day === 16;
                                        const hasBooking = [3, 10, 25].includes(day);
                                        const hasMultipleBookings = day === 10;
                                        const hasTravel = day === 24;

                                        return (
                                            <button
                                                key={day}
                                                className={`aspect-square flex flex-col items-center justify-center text-sm relative rounded-lg ${isToday
                                                        ? "bg-[#f29e0d] text-white font-bold shadow-md ring-4 ring-[#f29e0d]/20"
                                                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                                    }`}
                                            >
                                                {day}
                                                <div className="flex gap-1 mt-1">
                                                    {isToday && (
                                                        <>
                                                            <div className="w-1 h-1 bg-white rounded-full"></div>
                                                            <div className="w-1 h-1 bg-white rounded-full"></div>
                                                        </>
                                                    )}
                                                    {hasBooking && !isToday && (
                                                        <div className="w-1 h-1 bg-[#f29e0d] rounded-full"></div>
                                                    )}
                                                    {hasMultipleBookings && (
                                                        <div className="w-1 h-1 bg-[#f29e0d] rounded-full"></div>
                                                    )}
                                                    {hasTravel && (
                                                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Selected Day Details */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold">Monday, Dec 16</h3>
                                <p className="text-sm text-slate-500">3 events scheduled</p>
                            </div>
                            <div className="flex-1 p-6 space-y-6">
                                {/* Timeline Entry */}
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-3 h-3 bg-slate-400 rounded-full border-2 border-white dark:border-slate-900 z-10"></div>
                                    <div className="absolute left-[5px] top-4 w-[2px] h-[calc(100%+24px)] bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase">
                                            8:00 AM
                                        </span>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Travel to Venue
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Destination: Grand Heritage Resort, Jaipur
                                        </span>
                                    </div>
                                </div>
                                {/* Timeline Entry */}
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-3 h-3 bg-[#f29e0d] rounded-full border-2 border-white dark:border-slate-900 z-10"></div>
                                    <div className="absolute left-[5px] top-4 w-[2px] h-[calc(100%+24px)] bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="flex flex-col bg-[#f29e0d]/5 p-3 rounded-lg border border-[#f29e0d]/10">
                                        <span className="text-xs font-bold text-[#f29e0d] uppercase">
                                            10:00 AM
                                        </span>
                                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                            Wedding Muhurat
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            Client: Sharma-Mehta Wedding
                                        </span>
                                        <div className="mt-2 flex gap-2">
                                            <button className="px-2 py-1 text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                                                View Details
                                            </button>
                                            <button className="px-2 py-1 text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                                                Contact Host
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Timeline Entry */}
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-3 h-3 bg-[#f29e0d] rounded-full border-2 border-white dark:border-slate-900 z-10"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase">
                                            2:00 PM
                                        </span>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Post-ceremony rituals
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Estimated duration: 1.5 hours
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 mt-auto rounded-b-xl">
                                <button className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:shadow-sm transition-all">
                                    Add Custom Event
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#221b10] border-t border-slate-200 dark:border-slate-800 p-6 text-center mt-auto">
                <p className="text-sm text-slate-500">
                    © 2024 HmarePanditJi Pandit App • Professional Management Suite
                </p>
            </footer>
        </div>
    );
}
