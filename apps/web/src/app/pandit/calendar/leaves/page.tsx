"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LeavesManagementPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] dark:bg-[#221a10] text-gray-800 dark:text-gray-100 font-sans transition-colors duration-200">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white dark:bg-[#2d2418] border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.back()} className="text-gray-500 hover:text-[#f49d25]">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                                Manage Availability
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <span className="material-symbols-outlined text-[#f49d25] text-sm">
                                    sync
                                </span>
                                <span className="text-sm font-medium">Google Calendar Sync</span>
                                <div className="relative inline-flex items-center cursor-pointer ml-2">
                                    <input defaultChecked className="sr-only peer" type="checkbox" />
                                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-[#f49d25] transition-colors relative">
                                        <div className="absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-4 w-4 transition-all peer-checked:translate-x-full peer-checked:border-white"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Blackout &amp; Festival Dates
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Block dates for personal leave or manage festival availability.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#2d2418] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Reset Changes
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-[#f49d25] hover:bg-[#d68212] rounded-lg shadow-sm transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">save</span>
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Calendar & Status */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Status Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-[#2d2418] p-4 rounded-xl border border-[#f49d25]/20 shadow-sm relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-6xl text-[#f49d25]">
                                        event_busy
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Current Status
                                </p>
                                <h3 className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">
                                    Unavailable for{" "}
                                    <span className="text-[#f49d25] font-bold">4 days</span> in
                                    November
                                </h3>
                                <div className="mt-3 flex items-center gap-2 text-xs text-[#f49d25] bg-[#f49d25]/10 w-fit px-2 py-1 rounded-md">
                                    <span className="material-symbols-outlined text-sm">
                                        info
                                    </span>
                                    <span>Includes 2 festival days</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#2d2418] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 p-4 opacity-5">
                                    <span className="material-symbols-outlined text-6xl text-gray-500">
                                        event_available
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Next Confirmed Booking
                                </p>
                                <h3 className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">
                                    Griha Pravesh - Nov 18
                                </h3>
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="material-symbols-outlined text-sm">
                                        schedule
                                    </span>
                                    <span>10:00 AM - 02:00 PM</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Component (Simplified Visual) */}
                        <div className="bg-white dark:bg-[#2d2418] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#f49d25]">
                                        calendar_month
                                    </span>
                                    November 2024
                                </h2>
                                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    <button className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm transition-all text-gray-600 dark:text-gray-300">
                                        <span className="material-symbols-outlined">
                                            chevron_left
                                        </span>
                                    </button>
                                    <button className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm transition-all text-gray-600 dark:text-gray-300">
                                        <span className="material-symbols-outlined">
                                            chevron_right
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid would go here - keeping it simlified for prompt */}
                            <div className="w-full text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500">Interactive Calendar Grid</p>
                                <p className="text-xs text-gray-400 mt-1">(Select dates to toggle availability)</p>
                            </div>

                            {/* Legend */}
                            <div className="mt-6 flex flex-wrap gap-4 items-center justify-center border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#f49d25]"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Blocked (You)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Booked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#f49d25]/10 border border-[#f49d25]"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Festival</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Festival Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Festival Calendar Widget */}
                        <div className="bg-white dark:bg-[#2d2418] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Upcoming Festivals
                                </h3>
                                <span className="text-xs bg-[#f49d25]/10 text-[#f49d25] px-2 py-0.5 rounded-full font-medium">
                                    High Demand
                                </span>
                            </div>
                            <div className="p-4 space-y-5">
                                {/* Festival Item 1 */}
                                <div className="relative pl-4 border-l-2 border-[#f49d25]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                Diwali (Deepavali)
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                Nov 12, 2024
                                            </p>
                                        </div>
                                        <button className="text-xs font-medium text-[#f49d25] hover:text-[#d68212] underline">
                                            View
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 mb-3 leading-relaxed">
                                        Peak demand for Lakshmi Puja. Consider your availability
                                        carefully.
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-[#f49d25] hover:bg-[#d68212] rounded transition-colors">
                                            Block Day
                                        </button>
                                        <button className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors border border-transparent">
                                            Mark Available
                                        </button>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-100 dark:bg-gray-700 w-full"></div>

                                {/* Festival Item 2 */}
                                <div className="relative pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Govardhan Puja</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Nov 13, 2024</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 px-3 py-1.5 text-xs font-medium text-[#f49d25] bg-[#f49d25]/10 hover:bg-[#f49d25]/20 rounded transition-colors border border-[#f49d25]/20">
                                            Block Day
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bulk Action Footer */}
                            <div className="bg-[#f49d25]/5 p-4 border-t border-[#f49d25]/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[#f49d25] text-sm">
                                        auto_awesome
                                    </span>
                                    <span className="text-xs font-bold text-[#d68212] dark:text-[#f49d25]">
                                        Smart Suggestion
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                    You have 3 upcoming festival days unmarked. Most pandits mark
                                    these as 'Available' for higher earnings.
                                </p>
                                <button className="w-full py-2 text-xs font-bold text-[#f49d25] border border-[#f49d25] hover:bg-[#f49d25] hover:text-white rounded-lg transition-all">
                                    Review Suggestions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
