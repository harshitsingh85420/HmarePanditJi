"use client";

import React from "react";
import Link from "next/link";

export default function GrowthPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] dark:bg-[#221810] text-[#181411] dark:text-white font-sans">
            {/* Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e1dc] dark:border-[#3d2c1e] px-4 md:px-10 py-4 bg-white dark:bg-[#2d1f14] sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <Link href="/pandit/dashboard" className="flex items-center gap-4">
                        <div className="size-6 text-[#f48525]">
                            <span className="material-symbols-outlined text-3xl">temple_hindu</span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#181411] dark:text-white">
                            HmarePanditJi
                        </h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-9">
                        <Link href="/pandit/dashboard" className="text-sm font-medium hover:text-[#f48525] transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/pandit/bookings" className="text-sm font-medium hover:text-[#f48525] transition-colors">
                            Bookings
                        </Link>
                        <Link href="/pandit/travel" className="text-sm font-medium hover:text-[#f48525] transition-colors">
                            Travel History
                        </Link>
                        <Link href="/pandit/growth" className="text-sm font-medium text-[#f48525] border-b-2 border-[#f48525] pb-1">
                            Badges
                        </Link>
                        <Link href="/pandit/profile" className="text-sm font-medium hover:text-[#f48525] transition-colors">
                            Profile
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <div className="hidden lg:flex items-center bg-[#f8f7f5] dark:bg-white/10 rounded-lg h-10 px-4 w-64">
                        <span className="material-symbols-outlined text-[#8a7460] mr-2">search</span>
                        <input
                            type="text"
                            placeholder="Search milestones..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#8a7460] dark:text-white"
                        />
                    </div>
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#f48525]"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAdtPFISFxAAbwvnwCB-HOBRb6AaSYQMlkIhxctoLO9qEttV_JYoJOSo-bRxGv0F5bLtNQrQiUuNQdKAqApcjPZCMHU7c3dNts-smbCaZmg_B-gOkMQDNRxp8EfwrjiKiD3zVA6HV5SraG4WLvU_fxTph1Yjv9K48Rl7XvycIhdY5I2aniSdmdZGhM32Jva4n0S14AIlHOGoRYnv-X26pTCiNqMrst8gaWG_I3dpAjXbC5S3Try7Gjke_C0XQBXqpvnYPhzYsnoo7w")',
                        }}
                    ></div>
                </div>
            </header>

            <main className="flex flex-1 justify-center py-8 px-4 md:px-10">
                <div className="flex flex-col max-w-[960px] flex-1">
                    {/* Profile Header */}
                    <div className="flex w-full flex-col gap-6 md:flex-row md:items-center p-6 bg-white dark:bg-[#2d1f14] rounded-xl shadow-sm border border-[#e5e1dc] dark:border-[#3d2c1e]">
                        <div className="relative mx-auto md:mx-0">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 md:size-32 border-4 border-[#f48525]/20"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBdCtmrixC35kzXgtjsn6ls079YPXtFMyUD39IaJoc9zCc5J7_TIpwGyYoxtoPeWUkfvuxIzTXx27JgPSJ5AZOENXBs0umB8giQByu_Vj1R9SSMNaF1niesXktZG3K3LMLChPn08ZZlzDVRT8P3Wqn3qWNYRdWDtnVv8BvJjrbcbinTHTU33ONYkihMMgKOFJwoj_hJgQx4q12qSOfoQWgiHWbKcXOBz6Q6SG_-oWoBM9AZkLSrjllSBTUlR2jYKiLUrUMvqGmE05s")',
                                }}
                            ></div>
                            <div className="absolute bottom-0 right-0 bg-[#f48525] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                                Level 5
                            </div>
                        </div>
                        <div className="flex flex-col text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#181411] dark:text-white">
                                Pandit Vishnu Shastri
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                                <span className="bg-[#f48525]/10 text-[#f48525] px-3 py-1 rounded-full text-sm font-semibold">
                                    Vedic Expert
                                </span>
                                <span className="text-[#8a7460] dark:text-[#c4b5a6] flex items-center gap-1 text-sm">
                                    <span className="material-symbols-outlined text-lg">
                                        location_on
                                    </span>{" "}
                                    Varanasi, India
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Milestones Progress */}
                    <div className="mt-10 p-6 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e5e1dc] dark:border-[#3d2c1e]">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-[#8a7460] dark:text-[#c4b5a6]">
                                    Next Milestone Progress
                                </h3>
                                <h2 className="text-xl font-bold mt-1 text-[#181411] dark:text-white">
                                    National Expert
                                </h2>
                            </div>
                            <p className="text-[#f48525] font-bold">3/5 Journeys Complete</p>
                        </div>
                        <div className="w-full bg-[#f5f2f0] dark:bg-white/10 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-[#f48525] h-4 rounded-full transition-all duration-500"
                                style={{ width: "60%" }}
                            ></div>
                        </div>
                        <p className="mt-4 text-sm text-[#8a7460] dark:text-[#c4b5a6]">
                            Complete 2 more inter-state journeys to earn your National Expert
                            certification badge.
                        </p>
                    </div>

                    {/* Professional Badges */}
                    <h2 className="text-2xl font-bold px-1 pb-4 pt-10 text-[#181411] dark:text-white">
                        Professional Badges
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col items-center gap-4 p-5 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e5e1dc] dark:border-[#3d2c1e] text-center hover:border-[#f48525] transition-colors cursor-default">
                            <div className="size-20 rounded-full bg-[#f48525]/10 flex items-center justify-center text-[#f48525]">
                                <span className="material-symbols-outlined text-4xl">
                                    travel_explore
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-[#181411] dark:text-white">
                                    All India Traveler
                                </p>
                                <p className="text-sm text-[#8a7460] dark:text-[#c4b5a6]">
                                    Traveler
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-4 p-5 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e5e1dc] dark:border-[#3d2c1e] text-center hover:border-[#f48525] transition-colors cursor-default">
                            <div className="size-20 rounded-full bg-[#f48525]/10 flex items-center justify-center text-[#f48525]">
                                <span className="material-symbols-outlined text-4xl">
                                    celebration
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-[#181411] dark:text-white">
                                    Wedding Specialist
                                </p>
                                <p className="text-sm text-[#8a7460] dark:text-[#c4b5a6]">
                                    Expert
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-4 p-5 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e5e1dc] dark:border-[#3d2c1e] text-center hover:border-[#f48525] transition-colors cursor-default">
                            <div className="size-20 rounded-full bg-[#f48525]/10 flex items-center justify-center text-[#f48525]">
                                <span className="material-symbols-outlined text-4xl">grade</span>
                            </div>
                            <div>
                                <p className="font-bold text-[#181411] dark:text-white">
                                    5.0★ Host Favorite
                                </p>
                                <p className="text-sm text-[#8a7460] dark:text-[#c4b5a6]">
                                    Top Rated
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-4 p-5 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e5e1dc] dark:border-[#3d2c1e] text-center hover:border-[#f48525] transition-colors cursor-default">
                            <div className="size-20 rounded-full bg-[#f48525]/10 flex items-center justify-center text-[#f48525]">
                                <span className="material-symbols-outlined text-4xl">devices</span>
                            </div>
                            <div>
                                <p className="font-bold text-[#181411] dark:text-white">
                                    Tech Savvy
                                </p>
                                <p className="text-sm text-[#8a7460] dark:text-[#c4b5a6]">
                                    Modern Scholar
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Travel History Section */}
                    <div className="mt-10 mb-20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-[#181411] dark:text-white">
                                Travel History
                            </h2>
                            <div className="flex items-center gap-3 bg-[#f48525] text-white px-4 py-2 rounded-lg w-fit">
                                <span className="material-symbols-outlined">route</span>
                                <span className="font-bold text-lg">
                                    Total 5,000+ KM Traveled
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e5e1dc] dark:border-[#3d2c1e]">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#f8f7f5] dark:bg-white/5 flex items-center justify-center text-[#f48525]">
                                        <span className="material-symbols-outlined">distance</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-[#181411] dark:text-white">
                                            Varanasi to Delhi
                                        </p>
                                        <p className="text-sm text-[#8a7460] dark:text-[#c4b5a6]">
                                            Maha Shivratri Celebration • Feb 2024
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-[#181411] dark:text-white">
                                        1,200 km
                                    </p>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                        Completed
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-5 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e5e1dc] dark:border-[#3d2c1e]">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#f8f7f5] dark:bg-white/5 flex items-center justify-center text-[#f48525]">
                                        <span className="material-symbols-outlined">distance</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-[#181411] dark:text-white">
                                            Ujjain to Mumbai
                                        </p>
                                        <p className="text-sm text-[#8a7460] dark:text-[#c4b5a6]">
                                            Vaastu Shanti Puja • Jan 2024
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-[#181411] dark:text-white">
                                        650 km
                                    </p>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                        Completed
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-5 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e5e1dc] dark:border-[#3d2c1e]">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#f8f7f5] dark:bg-white/5 flex items-center justify-center text-[#f48525]">
                                        <span className="material-symbols-outlined">distance</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-[#181411] dark:text-white">
                                            Haridwar to Rishikesh
                                        </p>
                                        <p className="text-sm text-[#8a7460] dark:text-[#c4b5a6]">
                                            Ganga Aarti Guidance • Dec 2023
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-[#181411] dark:text-white">
                                        30 km
                                    </p>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                        Completed
                                    </span>
                                </div>
                            </div>
                            <button className="w-full py-4 text-[#f48525] font-bold text-sm border-2 border-dashed border-[#f48525]/20 rounded-xl hover:bg-[#f48525]/5 transition-colors">
                                VIEW ALL TRAVEL LOGS
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
