"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PanditDashboardPage() {
    const router = useRouter();
    const [isOnline, setIsOnline] = useState(true);

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f6] dark:bg-[#221910] text-[#181411] dark:text-[#f8f7f6] font-sans">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#f09942]/20 bg-white dark:bg-[#221910]/50 px-6 py-3 md:px-40 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4 text-[#f09942]">
                    <div className="size-6">
                        <span className="material-symbols-outlined text-3xl">temple_hindu</span>
                    </div>
                    <h2 className="text-[#181411] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        HmarePanditJi
                    </h2>
                </div>
                <div className="flex flex-1 justify-end gap-8 items-center">
                    <nav className="hidden md:flex items-center gap-9">
                        <Link
                            href="/pandit/dashboard"
                            className="text-[#f09942] text-sm font-bold leading-normal border-b-2 border-[#f09942] pb-1"
                        >
                            Home
                        </Link>
                        <Link
                            href="/pandit/bookings"
                            className="text-[#181411] dark:text-white/80 text-sm font-medium leading-normal hover:text-[#f09942] transition-colors"
                        >
                            Bookings
                        </Link>
                        <Link
                            href="/pandit/travel"
                            className="text-[#181411] dark:text-white/80 text-sm font-medium leading-normal hover:text-[#f09942] transition-colors"
                        >
                            Travel
                        </Link>
                        <Link
                            href="/pandit/earnings"
                            className="text-[#181411] dark:text-white/80 text-sm font-medium leading-normal hover:text-[#f09942] transition-colors"
                        >
                            Earnings
                        </Link>
                        <Link
                            href="/pandit/profile"
                            className="text-[#181411] dark:text-white/80 text-sm font-medium leading-normal hover:text-[#f09942] transition-colors"
                        >
                            Profile
                        </Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f09942]/10 text-[#181411] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#f09942]/20 transition-colors">
                            <span className="truncate">Namaste, Pandit Shastri</span>
                        </button>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#f09942]"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCDEy7eFlMpTU_m8vQtAhMBrP8B2fyV36yKgcdZJI2XyaSDK76Y2OekenHgQls2FJrlHOzRIe1sD-wwIZFO79kcw-6psGZiefiqHJecxrvQuMy1BsSNgQNbAMyWshPV2Wn5op7g4J3u7_r5K4ODRBb189nPvLgCW91zHjnDA6FJpAhIj3Ylync7F9L2tjPgy3PyU6rtM-HA7wKzwi4xLihz2vTEvkegIhnZFQDE7-uxcj5TLNBfHlCxLeD0bIhSGpcQMbAI0yGhKkY")',
                            }}
                        ></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[960px] mx-auto w-full px-4 pb-20 pt-8">
                {/* Hero Dashboard Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4">
                    <h1 className="text-[#181411] dark:text-white tracking-light text-[32px] font-bold leading-tight">
                        Pandit Dashboard
                    </h1>
                    {/* Large Status Toggle */}
                    <div className="flex items-center gap-4 bg-white dark:bg-[#221910] p-3 rounded-xl border border-[#f09942]/20 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                                Status
                            </span>
                            <span className={`font-bold text-sm flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                                <span className={`size-2 rounded-full ${isOnline ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></span>
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-gray-200 dark:bg-gray-700 p-0.5 transition-all">
                            <input
                                type="checkbox"
                                checked={isOnline}
                                onChange={() => setIsOnline(!isOnline)}
                                className="sr-only peer"
                            />
                            <div className="w-full h-full rounded-full peer-checked:bg-[#f09942] transition-colors absolute inset-0"></div>
                            <div className="h-[27px] w-[27px] rounded-full bg-white shadow-md transform peer-checked:translate-x-5 transition-transform relative z-10"></div>
                        </label>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 mb-8">
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-[#f09942]/10 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">
                                Monthly Earnings
                            </p>
                            <span className="material-symbols-outlined text-[#f09942]">
                                payments
                            </span>
                        </div>
                        <p className="text-[#181411] dark:text-white tracking-light text-2xl font-bold leading-tight">
                            ₹52,000
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-green-600">
                                trending_up
                            </span>
                            <p className="text-green-600 text-sm font-bold">
                                +12% vs last month
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-[#f09942]/10 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">
                                Average Rating
                            </p>
                            <span className="material-symbols-outlined text-[#f09942]">
                                star
                            </span>
                        </div>
                        <p className="text-[#181411] dark:text-white tracking-light text-2xl font-bold leading-tight">
                            4.9/5
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-green-600">
                                verified
                            </span>
                            <p className="text-green-600 text-sm font-bold">
                                Top Professional
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-[#f09942]/10 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">
                                Travel Distance
                            </p>
                            <span className="material-symbols-outlined text-[#f09942]">
                                distance
                            </span>
                        </div>
                        <p className="text-[#181411] dark:text-white tracking-light text-2xl font-bold leading-tight">
                            1,200 km
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-[#f09942]">
                                route
                            </span>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                8 trips completed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Schedule Section */}
                <div className="px-4 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[#181411] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                            Today's Schedule
                        </h2>
                        <button
                            onClick={() => router.push('/pandit/calendar')}
                            className="text-[#f09942] text-sm font-bold flex items-center gap-1 hover:underline"
                        >
                            View Calendar
                            <span className="material-symbols-outlined text-sm">
                                calendar_month
                            </span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        {/* Event 1 */}
                        <div className="bg-white dark:bg-gray-800 border-l-4 border-[#f09942] rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center justify-center min-w-[60px] h-full py-1 bg-[#f09942]/5 rounded-lg border border-[#f09942]/10">
                                    <span className="text-[#f09942] font-bold text-lg">
                                        10:00
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">AM</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#181411] dark:text-white">
                                        Vivaha Puja (Wedding)
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">
                                                location_on
                                            </span>{" "}
                                            Delhi (South)
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">
                                                person
                                            </span>{" "}
                                            Mr. Sharma's Family
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-4 py-2 bg-[#f09942] hover:bg-[#e08c14] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                                    <span className="material-symbols-outlined text-sm">
                                        directions
                                    </span>{" "}
                                    Directions
                                </button>
                                <button
                                    onClick={() => router.push('/pandit/bookings/123')}
                                    className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[#181411] dark:text-white text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                                >
                                    Details
                                </button>
                            </div>
                        </div>

                        {/* Event 2 */}
                        <div className="bg-white dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center justify-center min-w-[60px] h-full py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100">
                                    <span className="text-gray-700 dark:text-gray-300 font-bold text-lg">
                                        04:00
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">PM</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#181411] dark:text-white">
                                        Griha Pravesh
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">
                                                location_on
                                            </span>{" "}
                                            Local (2km away)
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">
                                                person
                                            </span>{" "}
                                            Mrs. Verma
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed opacity-70">
                                    <span className="material-symbols-outlined text-sm">
                                        schedule
                                    </span>{" "}
                                    Wait
                                </button>
                                <button className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[#181411] dark:text-white text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Travel Insight Map Preview */}
                <div className="px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#f09942]/10 overflow-hidden shadow-sm">
                        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <p className="text-base font-bold text-[#181411] dark:text-white">
                                    Travel Insight
                                </p>
                                <p className="text-sm text-gray-500">
                                    You are saving 15% travel time today with optimized routing
                                </p>
                            </div>
                            <span className="material-symbols-outlined text-[#f09942]">
                                map
                            </span>
                        </div>
                        <div className="h-40 bg-gray-100 dark:bg-gray-900 relative">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-70"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxcuzjnSOjS4750BM-hmC5vBd4UiSzGki7WnmwjquP07PjfEBTqpXvCRyZon_Rgrppbut58NgqZWgM2LdCMKjHu3a2iC4_3mGVMv8Dn-ZHZzm6-D9DAMbIMSjcXgFIay0PlymmSqoliFpBOjc8IPwuyQSGWmPLIRV0RUUCaoPJPSOg37FLacQw_h3q1EPM3537XcD1HdSxUqUzwTWavdFww5TJ1LISdAbXO9LvuJCAJpt5jesvaWqxydkwpQE7dw9c8e7taEsWzpE')",
                                }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-6 py-2 rounded-full text-[#f09942] font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-sm">
                                        navigation
                                    </span>{" "}
                                    Open Travel View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation (Mobile Friendly) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 flex justify-around py-3 px-2 z-50">
                <Link href="/pandit/dashboard" className="flex flex-col items-center text-[#f09942]">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[10px] font-bold">Home</span>
                </Link>
                <Link href="/pandit/bookings" className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined">event_note</span>
                    <span className="text-[10px] font-medium">Bookings</span>
                </Link>
                <Link href="/pandit/rituals" className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined">auto_stories</span>
                    <span className="text-[10px] font-medium">Rituals</span>
                </Link>
                <Link href="/pandit/earnings" className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined">wallet</span>
                    <span className="text-[10px] font-medium">Earnings</span>
                </Link>
                <Link href="/pandit/profile" className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </nav>
        </div>
    );
}
