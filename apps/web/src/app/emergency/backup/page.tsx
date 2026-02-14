"use client";

import React from "react";

export default function EmergencyBackupPage() {
    return (
        <div className="bg-[#fff1f2] dark:bg-[#2a1215] text-[#881337] dark:text-[#fecdd3] min-h-screen font-sans flex flex-col">
            {/* Urgent Header */}
            <header className="bg-[#e11d48] text-white px-6 py-4 shadow-lg sticky top-0 z-50 animate-pulse-slow">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full animate-bounce">
                            <span className="material-icons text-3xl">
                                warning_amber
                            </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-wider">
                                Emergency Protocol Active
                            </h1>
                            <p className="text-xs font-medium text-white/90">
                                Pandit Delay Detected • Backup Search In Progress
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-xs font-bold uppercase opacity-80">
                            Reference ID
                        </p>
                        <p className="font-mono text-lg font-bold">SOS-2023-892</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-8 space-y-6">
                {/* Status Card */}
                <div className="bg-white dark:bg-[#4c0519] rounded-2xl shadow-xl border-l-8 border-[#e11d48] overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Triggering Zero-Miss Guarantee™
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Primary Pandit (Pt. Rajesh Sharma) is unresponsive /
                                    delayed beyond safe buffer.
                                </p>
                            </div>
                            <div className="bg-[#e11d48]/10 dark:bg-[#e11d48]/20 px-4 py-2 rounded-lg border border-[#e11d48]/20 flex items-center gap-2 text-[#e11d48] dark:text-[#fb7185] font-bold">
                                <span className="material-icons animate-spin">
                                    sync
                                </span>
                                Auto-Matching Backup...
                            </div>
                        </div>

                        {/* Map & Tracking Visualization */}
                        <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                            {/* Map Placeholder */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-60"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDUeFzEE5FeUu8xkg2hnNh4D5Q1MnO9XHnUcj4PBy3MIRwuuGfIciR5Lg1CuqFTYZF4oYwiyH2LjlO1ENhJw4uuP_lqskuqQX6xNBZ0xseWU9ht-c75yCPr7GppMUdlrAJWapUb--i5seYJuTctFDEgq9dKdTbtQJYvAMqBe1ggJuRL80gMIsxjnEFRW1ljJX6zNmqM4BO8FKlh9BhlFAZMPntZ6uX2a-C6-8hTjUu15_-z5T-yWNHIhm5D-aldM8AoPfg_GKkC2Es')",
                                }}
                            ></div>
                            {/* Overlay Elements */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Radius Circle */}
                                <div className="w-48 h-48 rounded-full border-2 border-[#e11d48] bg-[#e11d48]/10 animate-ping absolute"></div>
                                <div className="w-48 h-48 rounded-full border-2 border-[#e11d48] bg-[#e11d48]/5 absolute"></div>
                                {/* Center (User Location) */}
                                <div className="z-10 bg-blue-600 border-4 border-white dark:border-gray-800 w-6 h-6 rounded-full shadow-lg"></div>
                            </div>
                            {/* Nearby Pandit Markers (Mock) */}
                            <div className="absolute top-1/4 left-1/3 z-10">
                                <span className="material-icons text-[#e11d48] text-3xl drop-shadow-md animate-bounce">
                                    place
                                </span>
                            </div>
                            <div className="absolute bottom-1/3 right-1/4 z-10">
                                <span className="material-icons text-gray-400 text-3xl drop-shadow-md">
                                    place
                                </span>
                            </div>
                        </div>

                        {/* Countdown / Estimated Arrival */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#fff1f2] dark:bg-[#881337]/20 p-4 rounded-xl border border-[#ffe4e6] dark:border-[#881337]/40 text-center">
                                <p className="text-xs font-bold text-[#881337] dark:text-[#fecdd3] uppercase mb-1">
                                    New ETA
                                </p>
                                <p className="text-3xl font-black text-[#e11d48]">
                                    15 <span className="text-sm font-medium">min</span>
                                </p>
                            </div>
                            <div className="bg-[#fff1f2] dark:bg-[#881337]/20 p-4 rounded-xl border border-[#ffe4e6] dark:border-[#881337]/40 text-center">
                                <p className="text-xs font-bold text-[#881337] dark:text-[#fecdd3] uppercase mb-1">
                                    Backup Pandit
                                </p>
                                <p className="text-lg font-bold text-[#e11d48] truncate">
                                    Pt. K. Mishra (Rating 4.9)
                                </p>
                            </div>
                            <div className="bg-[#fff1f2] dark:bg-[#881337]/20 p-4 rounded-xl border border-[#ffe4e6] dark:border-[#881337]/40 text-center">
                                <p className="text-xs font-bold text-[#881337] dark:text-[#fecdd3] uppercase mb-1">
                                    Cost Adjustment
                                </p>
                                <p className="text-lg font-bold text-[#e11d48]">
                                    Fully Covered by HPJ
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-gray-50 dark:bg-[#881337]/10 px-6 py-4 border-t border-gray-100 dark:border-[#881337]/20 flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">
                            System is automatically contacting 3 nearby premium Pandits...
                        </p>
                        <button className="text-sm font-bold text-[#e11d48] hover:underline flex items-center gap-1">
                            <span className="material-icons text-sm">phone</span>
                            Call Support Override
                        </button>
                    </div>
                </div>

                {/* Reassurance Block */}
                <div className="text-center space-y-2 opacity-80">
                    <p className="font-bold text-[#881337] dark:text-[#fecdd3]">
                        Don't Panic. We have this under control.
                    </p>
                    <p className="text-sm text-[#881337]/80 dark:text-[#fecdd3]/80">
                        Our 24/7 Ops team has been alerted and is manually monitoring this
                        situation.
                    </p>
                </div>
            </main>
        </div>
    );
}
