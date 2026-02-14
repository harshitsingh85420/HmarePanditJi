"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LiveTrackingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#101622] text-[#111318] dark:text-white font-sans overflow-hidden">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f0f2f4] dark:border-gray-800 bg-white dark:bg-[#101622] px-6 md:px-10 py-3 sticky top-0 z-50 h-16">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-[#135bec]">
                        <span className="material-symbols-outlined text-3xl">
                            auto_awesome
                        </span>
                        <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                            HmarePanditJi
                        </h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-9">
                        <Link
                            href="/pandit/dashboard"
                            className="text-[#111318] dark:text-gray-300 text-sm font-medium leading-normal hover:text-[#135bec] transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={`/pandit/bookings/${params.id}`}
                            className="text-[#111318] dark:text-gray-300 text-sm font-medium leading-normal hover:text-[#135bec] transition-colors"
                        >
                            Booking
                        </Link>
                        <span className="text-[#135bec] text-sm font-bold leading-normal">
                            Live Track
                        </span>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#135bec]/20"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCwKpkp4gHuJeJXQfTvgH1tsYam6cZUnF6hcitmo9_wFronC8LkzDH6sdBiyqzA7ZkleW_IbxWB9ivyvNgs2wTrYXi8V3c824CGj5jQw9Dmo38zgS9RT3bgL8y4t9pJvyMVaIgQWQpgbja7Y5UOo60ixQWgto8PVcE1mp9_tGrN63hewI7UXd9yyEho9eaW0KENK0Ddb78UQTfuM3IHf_9-xftG9tPImx03oHANmlFsb-xDjB2vY3FVMy2WSIR6HdLncjt43gl60gI")' }}
                    ></div>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden relative">
                {/* Map View (Left/Main Area) */}
                <div className="relative flex-1 bg-gray-200 dark:bg-gray-900 w-full h-full">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1jGNCv9hBLyaDVBU_9dtz76kcX7Hz5yWPCNAk1SdXQZ2Y3L9KlnwoYiZmPsqiQNV3sfwXRocPtm4R5tY2wdE6kQbrI7Vlik3wcRcOqDC1BQ-MaqUNJqzeSChP40U5TkuBftI39e6ixF_Q_OhIF6pTrJrmgir5E0y5uOJnksJgpKxIOPSUmIgXuYRDj4K-HgKb3Zigzk1i_I8hLwtyRO6BAwRAVF59ZnmLhttgdLJb7ZiTQB74Lf0mh6Rs36cKcEQhfv-BTMkutl0")',
                        }}
                    >
                        {/* Map Overlay UI */}
                        <div className="absolute inset-0 bg-[#135bec]/5"></div>
                        {/* Route Path (SVG Overlay Simulation) */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox="0 0 800 600"
                        >
                            <path
                                className="opacity-60"
                                d="M600,500 Q400,450 300,300 T100,100"
                                fill="none"
                                stroke="#135bec"
                                strokeDasharray="10 10"
                                strokeLinecap="round"
                                strokeWidth="6"
                            ></path>
                            {/* Pandit Location Icon - Simulated Position */}
                            <g transform="translate(280, 280)">
                                <circle
                                    className="animate-ping opacity-20"
                                    fill="#135bec"
                                    r="24"
                                ></circle>
                                <circle className="shadow-lg" fill="white" r="16"></circle>
                                <text
                                    className="material-symbols-outlined text-[#135bec] text-xl"
                                    x="-10"
                                    y="8"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    directions_car
                                </text>
                            </g>
                        </svg>

                        {/* Zoom Controls */}
                        <div className="absolute right-6 top-6 flex flex-col gap-2 z-10">
                            <button className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                            <button className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                            <button className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl text-[#135bec] mt-2">
                                <span className="material-symbols-outlined">my_location</span>
                            </button>
                        </div>

                        {/* Breadcrumbs / Back */}
                        <div className="absolute left-6 top-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-xl shadow-md flex items-center gap-2 z-10">
                            <button
                                onClick={() => router.back()}
                                className="text-gray-500 hover:text-[#135bec] transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                <span className="text-sm font-medium">Itinerary</span>
                            </button>
                            <span className="material-symbols-outlined text-xs text-gray-400">
                                chevron_right
                            </span>
                            <span className="text-sm font-bold">Live Journey Tracking</span>
                        </div>

                        {/* Toggle Sidebar Button (Mobile) */}
                        <button
                            className="md:hidden absolute bottom-6 right-6 bg-[#135bec] text-white p-3 rounded-full shadow-lg z-20"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <span className="material-symbols-outlined">{isSidebarOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Sidebar / Tracking Info */}
                <aside className={`${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 transition-transform duration-300 absolute md:relative right-0 top-0 bottom-0 w-full md:w-[400px] bg-white dark:bg-[#101622] border-l border-[#f0f2f4] dark:border-gray-800 overflow-y-auto flex flex-col p-6 shadow-2xl z-20 h-full`}>
                    {/* Trip Summary Card */}
                    <div className="bg-[#135bec] text-white rounded-xl p-6 mb-6 shadow-lg shadow-[#135bec]/20">
                        <p className="text-blue-100 text-xs font-bold tracking-widest uppercase opacity-80 mb-1">
                            Live Journey Status
                        </p>
                        <h3 className="text-2xl font-bold mb-4">En Route to Delhi</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-sm">
                                        schedule
                                    </span>
                                    <span className="text-xs font-medium uppercase opacity-70">
                                        ETA
                                    </span>
                                </div>
                                <p className="text-xl font-bold tracking-tight">4h 20m</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-sm">
                                        location_on
                                    </span>
                                    <span className="text-xs font-medium uppercase opacity-70">
                                        Next Stop
                                    </span>
                                </div>
                                <p className="text-xl font-bold tracking-tight">Agra</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Tracking */}
                    <div className="flex-1 mb-8">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">
                            Journey Timeline
                        </h4>
                        <div className="relative pl-8">
                            {/* Line */}
                            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-100 dark:bg-gray-800"></div>
                            <div
                                className="absolute left-[15px] top-2 h-[60%] w-[2px] bg-[#135bec]"
                            ></div>
                            {/* Milestone 1 */}
                            <div className="relative mb-8">
                                <div className="absolute -left-[25px] top-0 bg-[#135bec] text-white size-6 rounded-full flex items-center justify-center border-4 border-white dark:border-[#101622]">
                                    <span className="material-symbols-outlined text-xs font-bold">
                                        check
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-[#111318] dark:text-white">
                                        Departed Varanasi
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        6:00 AM • Started on time
                                    </p>
                                </div>
                            </div>
                            {/* Milestone 2 */}
                            <div className="relative mb-8">
                                <div className="absolute -left-[25px] top-0 bg-[#135bec] text-white size-6 rounded-full flex items-center justify-center border-4 border-white dark:border-[#101622]">
                                    <span className="material-symbols-outlined text-xs font-bold">
                                        check
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-[#111318] dark:text-white">
                                        Passed Kanpur
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        9:30 AM • Ahead of schedule
                                    </p>
                                </div>
                            </div>
                            {/* Milestone 3 (Active) */}
                            <div className="relative">
                                <div className="absolute -left-[25px] top-0 bg-white dark:bg-gray-800 text-[#135bec] size-6 rounded-full flex items-center justify-center border-4 border-[#135bec]">
                                    <div className="size-2 bg-[#135bec] rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#135bec]">Approaching Agra</p>
                                    <p className="text-sm text-gray-500">
                                        In Transit • Current Location
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                        <button className="flex items-center justify-center gap-2 bg-[#fef2f2] text-[#ef4444] font-bold py-3 rounded-xl border border-[#fee2e2] hover:bg-red-100 transition-colors">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                sos
                            </span>
                            SOS
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-[#f0f4ff] text-[#135bec] font-bold py-3 rounded-xl border border-[#e0e7ff] hover:bg-blue-100 transition-colors">
                            <span className="material-symbols-outlined">support_agent</span>
                            Support
                        </button>
                        <button className="col-span-2 flex items-center justify-center gap-2 bg-[#135bec] text-white font-bold py-4 rounded-xl hover:bg-[#135bec]/90 transition-all shadow-lg shadow-[#135bec]/20">
                            <span className="material-symbols-outlined">share</span>
                            Share Live Tracking
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}
