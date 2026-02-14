"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ItineraryPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622] font-sans text-slate-900 dark:text-white">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#151c2c]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3 text-[#0f49bd]">
                            <div className="w-8 h-8 rounded-lg bg-[#0f49bd] flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-lg">temple_hindu</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
                                HmarePanditJi
                            </span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a className="text-[#0f49bd] font-medium" href="#">
                                My Itinerary
                            </a>
                            <a className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" href="#">
                                Expenses
                            </a>
                            <a className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" href="#">
                                Support
                            </a>
                            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                                <div
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[#0f49bd]/20 bg-cover bg-center"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDJLqVuq7woky_3uNPYwubgxaqt5SavlzXPUiAfeT4lVXQMAdFvOVKdqOgRiuS4b-3uCx8VuCbEVTJUm_l84rkaCJk3FEwdZ4rwD2UxF6heDgayFwKcXERtgu3G0pT1J7bxDDI1_JhSxR37ETtopJ-TUAg_jUC4KvFZDZ5HPQuAdzQu90B8Ps04Qm82fjuU0cHRv5Gvq0rZDq-l31iL-4If9kwIw0W4fB_EdrJN9H_2uzTAI31JfiQoSCFmzzJLIChDeOkE3Nwt03Y")' }}
                                ></div>
                                <span className="text-sm font-medium">Pt. Sharma</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Layout */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Header + Timeline */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Trip Header Card */}
                        <div className="bg-white dark:bg-[#151c2c] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f49bd]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-[#0f49bd]/10 text-[#0f49bd] text-xs font-bold uppercase tracking-wide">
                                            Upcoming Assignment
                                        </span>
                                        <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                                            • Oct 24, 2024
                                        </span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                        Maha Shivratri Puja
                                    </h1>
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
                                        <span>Bangalore (BLR)</span>
                                        <span className="material-symbols-outlined text-[#0f49bd] text-base">
                                            arrow_forward
                                        </span>
                                        <span>Delhi (DEL)</span>
                                    </div>
                                </div>
                                {/* Food Allowance Widget */}
                                <div className="bg-[#eef4ff]/50 dark:bg-[#0f49bd]/10 rounded-xl p-4 min-w-[240px] border border-[#0f49bd]/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-[#0f49bd] dark:text-blue-300">
                                            Food Allowance
                                        </span>
                                        <span className="text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 shadow-sm">
                                            Daily
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-1 mb-2">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                            ₹1,000
                                        </span>
                                        <span className="text-xs text-slate-500 mb-1">/ day</span>
                                    </div>
                                    <div className="w-full bg-white dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-[#0f49bd] h-full rounded-full"
                                            style={{ width: "100%" }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                                        <span>Available</span>
                                        <span>₹1,000 left</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-4 md:pl-8 space-y-12 before:absolute before:left-4 md:before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 before:-ml-px">
                            {/* Segment 1: Cab Pickup */}
                            <div className="relative pl-8 md:pl-12">
                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-0 -ml-3 md:-ml-[1.15rem] w-6 h-6 md:w-10 md:h-10 rounded-full bg-white dark:bg-[#151c2c] border-2 md:border-4 border-[#0f49bd] flex items-center justify-center z-10 shadow-sm">
                                    <span className="material-symbols-outlined text-[#0f49bd] text-xs md:text-base">
                                        local_taxi
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-[#0f49bd]/30 transition-colors">
                                    <div className="p-5 md:p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Cab to Airport
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                    08:00 AM • Uber Premier
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                                                Confirmed
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            {/* Driver Info */}
                                            <div className="flex items-center gap-4 bg-[#f6f6f8] dark:bg-background-dark p-3 rounded-lg">
                                                <div
                                                    className="w-12 h-12 rounded-full object-cover bg-cover bg-center"
                                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCVD9-2SPEWstIFaQ86t2JJH-lFnNOCpd-XCEJ7zulK8e7DRnKmShRQZ_R_osCSgaPp_vZblFGoDNulzJs5xsyi9i6uEBg5picHspO26m00excqd5B8h2ZwPuhuG1oD_rko0B7uuiF1s594b3omGZeEE4BFF4FputCRy6B7dG5Pp46qgsnC3HiEodb5jIM87GYtUhkcmXb7wvjHciWU6BhLk5jJ_q0yusY3HCGbNkbwSRuGEHDRCsWvd8QG0WDBbG1IidXku40fvF0")' }}
                                                ></div>
                                                <div>
                                                    <p className="font-semibold text-sm">Rajesh Kumar</p>
                                                    <p className="text-xs text-slate-500">
                                                        Maruti Swift • KA 01 MJ 2023
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1 text-[#0f49bd] text-xs font-medium cursor-pointer hover:underline">
                                                        <span className="material-symbols-outlined text-sm">
                                                            call
                                                        </span>{" "}
                                                        Call Driver
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Location Info */}
                                            <div className="space-y-3">
                                                <div className="flex gap-3">
                                                    <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">
                                                        radio_button_checked
                                                    </span>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">
                                                            Pickup
                                                        </p>
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                            Home, Indiranagar 12th Main
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">
                                                        location_on
                                                    </span>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">
                                                            Drop
                                                        </p>
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                            Kempegowda Int'l Airport (BLR)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                onClick={() => router.push(`/pandit/bookings/${params.id}/live`)}
                                                className="flex-1 bg-[#0f49bd] hover:bg-[#0f49bd]/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    check_circle
                                                </span>
                                                I'm Here
                                            </button>
                                            <button
                                                onClick={() => router.push(`/pandit/bookings/${params.id}/live`)}
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    map
                                                </span>
                                                Track on Map
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Segment 2: Flight */}
                            <div className="relative pl-8 md:pl-12">
                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-0 -ml-3 md:-ml-[1.15rem] w-6 h-6 md:w-10 md:h-10 rounded-full bg-white dark:bg-[#151c2c] border-2 md:border-4 border-slate-300 dark:border-slate-600 flex items-center justify-center z-10">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-xs md:text-base">
                                        flight
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-[#0f49bd]/30 transition-colors">
                                    {/* Airline Stripe */}
                                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-[#0f49bd]"></div>
                                    <div className="p-5 md:p-6">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center p-2">
                                                    <span className="material-symbols-outlined">airlines</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bangalore to Delhi</h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">Indigo 6E-453</span>
                                                        <span>•</span>
                                                        <span>2h 45m</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-slate-500 uppercase font-semibold">PNR Number</p>
                                                <p className="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-wider select-all">H6T9P</p>
                                            </div>
                                        </div>
                                        {/* Flight Timings */}
                                        <div className="flex items-center justify-between mb-8 relative">
                                            {/* Flight Path Line */}
                                            <div className="absolute top-1/2 left-16 right-16 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
                                            <div className="absolute top-1/2 left-[45%] md:left-1/2 -translate-y-1/2 bg-white dark:bg-[#151c2c] p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400">
                                                <span className="material-symbols-outlined text-sm rotate-90 block">flight</span>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">11:30</p>
                                                <p className="text-sm font-medium text-slate-500">BLR</p>
                                                <p className="text-xs text-slate-400 mt-1">Terminal 1</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">14:15</p>
                                                <p className="text-sm font-medium text-slate-500">DEL</p>
                                                <p className="text-xs text-slate-400 mt-1">Terminal 3</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-sm">
                                                    qr_code
                                                </span>
                                                View Boarding Pass
                                            </button>
                                            <button className="flex-1 bg-[#0f49bd] hover:bg-[#0f49bd]/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-sm">
                                                    flight_takeoff
                                                </span>
                                                I've Boarded
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Segment 3: Cab Drop */}
                            <div className="relative pl-8 md:pl-12 pb-4">
                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-0 -ml-3 md:-ml-[1.15rem] w-6 h-6 md:w-10 md:h-10 rounded-full bg-white dark:bg-[#151c2c] border-2 md:border-4 border-slate-300 dark:border-slate-600 flex items-center justify-center z-10">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-xs md:text-base">directions_car</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Map & Quick Actions */}
                    <div className="hidden lg:block lg:col-span-4 space-y-6">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        Live Tracking
                                    </h3>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                </div>
                                <div className="h-80 w-full relative bg-slate-200 dark:bg-slate-800 group">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-60 transition-opacity"
                                        style={{
                                            backgroundImage:
                                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBiV_wsF0ORixlKuWLqjFzJ6WIphfLd2Xsa971yoFtGcUsoQctB6bzjyRB-ZajCdtlsyW71HkjmMnY9wkjpC5hEYTmBj-koz57Ii4b7KtstteT4nKf8GedGO330_sw1BMoUwjj-x34F47H0amJwyJmq-NaJ878qQ2UEaar8iJ3nmjRpaRxbIlz9wWVNRDhhBnKxJiuLp_6xLF8i_OxoTP_oOHLQd0hdVGNURa3Uv5SVenArQ_B6ElW25qqB7O8zuGNkJ4-h0r0o8bA")',
                                        }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => router.push(`/pandit/bookings/${params.id}/live`)}
                                            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-[#0f49bd] text-sm">
                                                open_in_new
                                            </span>
                                            Open Full Map
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 bg-[#f6f6f8] dark:bg-background-dark">
                                    <p className="text-xs text-slate-500 mb-1">Current Status</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        En route to Airport
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Est. Arrival: 09:15 AM
                                    </p>
                                </div>
                            </div>
                            {/* Emergency Contact */}
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/20">
                                <div className="flex items-start gap-3">
                                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                                        <span className="material-symbols-outlined">emergency</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900 dark:text-red-300 text-sm">
                                            Need Help?
                                        </h4>
                                        <p className="text-xs text-red-700 dark:text-red-400 mt-1 mb-2">
                                            Support is available 24/7 for travelers.
                                        </p>
                                        <button className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">
                                            Contact Support Team
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Mobile Sticky Footer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#151c2c] border-t border-slate-200 dark:border-slate-800 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Next Action</p>
                        <p className="font-semibold text-slate-900 dark:text-white">Reach Airport by 09:30 AM</p>
                    </div>
                    <button
                        onClick={() => router.push(`/pandit/bookings/${params.id}/live`)}
                        className="bg-[#0f49bd] text-white rounded-lg p-3 shadow-lg shadow-[#0f49bd]/30"
                    >
                        <span className="material-symbols-outlined">navigation</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
