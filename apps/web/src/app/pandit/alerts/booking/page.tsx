"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingAlertPage() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return { mins: mins.toString().padStart(2, '0'), secs: secs.toString().padStart(2, '0') };
    };

    const { mins, secs } = formatTime(timeLeft);

    return (
        <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#101622] text-[#111318] dark:text-white font-sans transition-colors duration-200">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#f0f2f4] dark:border-gray-800 bg-white dark:bg-[#101622] px-10 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="text-[#135bec] size-6">
                        <span className="material-symbols-outlined">temple_hindu</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight">
                        HmarePanditJi
                    </h2>
                </div>
            </header>

            <main className="flex-1 justify-center py-8">
                <div className="flex flex-col max-w-[1000px] mx-auto flex-1 px-4">
                    {/* Urgent Banner */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-6 mb-8 text-center animate-pulse-subtle">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-red-600 animate-pulse">
                                emergency
                            </span>
                            <h1 className="text-red-600 dark:text-red-400 tracking-tight text-2xl md:text-3xl font-extrabold uppercase">
                                New Booking Request
                            </h1>
                        </div>
                        <p className="text-xl font-bold mb-4">Delhi Grand Wedding Ceremony</p>
                        <div className="flex justify-center gap-4">
                            <div className="flex flex-col items-center">
                                <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-red-100 dark:border-red-900/30">
                                    <p className="text-2xl font-black text-red-600">{mins}</p>
                                </div>
                                <p className="text-xs font-semibold mt-2 uppercase tracking-widest text-red-500">
                                    Minutes
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-red-100 dark:border-red-900/30">
                                    <p className="text-2xl font-black text-red-600">{secs}</p>
                                </div>
                                <p className="text-xs font-semibold mt-2 uppercase tracking-widest text-red-500">
                                    Seconds
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Details Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                                <div
                                    className="relative h-64 w-full bg-gray-200"
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCxcuzjnSOjS4750BM-hmC5vBd4UiSzGki7WnmwjquP07PjfEBTqpXvCRyZon_Rgrppbut58NgqZWgM2LdCMKjHu3a2iC4_3mGVMv8Dn-ZHZzm6-D9DAMbIMSjcXgFIay0PlymmSqoliFpBOjc8IPwuyQSGWmPLIRV0RUUCaoPJPSOg37FLacQw_h3q1EPM3537XcD1HdSxUqUzwTWavdFww5TJ1LISdAbXO9LvuJCAJpt5jesvaWqxydkwpQE7dw9c8e7taEsWzpE")',
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                >
                                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#135bec]">
                                            distance
                                        </span>
                                        <span className="font-bold text-sm text-[#135bec]">
                                            1,200 km away
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-1">Dec 15 - Dec 17</h2>
                                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-base">
                                                    location_on
                                                </span>{" "}
                                                New Delhi, NCR Region
                                            </p>
                                        </div>
                                        <span className="bg-[#135bec]/10 text-[#135bec] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            High Stakes
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-[#f6f6f8] dark:bg-gray-800 rounded-lg flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#135bec]">
                                                directions_car
                                            </span>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">
                                                    Travel Type
                                                </p>
                                                <p className="font-semibold">Self-Drive (Your Car)</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-[#f6f6f8] dark:bg-gray-800 rounded-lg flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[#135bec]">
                                                inventory_2
                                            </span>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">
                                                    Samagri
                                                </p>
                                                <p className="font-semibold">Premium Package</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#135bec]">
                                        receipt_long
                                    </span>{" "}
                                    Earnings Breakdown
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Dakshina (Service Fee)
                                        </span>
                                        <span className="font-bold">₹29,750</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Travel Allowance
                                        </span>
                                        <span className="font-bold">₹12,000</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Food &amp; Stay Allowance
                                        </span>
                                        <span className="font-bold">₹3,000</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Samagri Reimbursement
                                        </span>
                                        <span className="font-bold">₹8,000</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 text-xl">
                                        <span className="font-extrabold text-[#135bec]">
                                            Guaranteed Total
                                        </span>
                                        <span className="font-black text-[#135bec]">₹52,750</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Column */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl border border-[#135bec]/20 sticky top-24">
                                <h3 className="font-bold text-lg mb-6 text-center">
                                    Action Required
                                </h3>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => router.push('/pandit/bookings/123/itinerary')} // Assuming accept goes to itinerary prep
                                        className="w-full bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#135bec]/20 transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-outlined">
                                            check_circle
                                        </span>
                                        ACCEPT BOOKING
                                    </button>
                                    <button
                                        onClick={() => router.back()}
                                        className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            close
                                        </span>
                                        REJECT REQUEST
                                    </button>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-tighter font-bold">
                                        Note: Accepting this booking requires availability for all 3
                                        days. Penalty applies for cancellations within 48h of start
                                        time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
