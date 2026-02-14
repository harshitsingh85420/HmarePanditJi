"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();


    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] dark:bg-[#181511]">
            <div className="flex-1 flex max-w-7xl mx-auto w-full py-8 px-6 gap-8 flex-col lg:flex-row">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
                    <div>
                        <h3 className="text-[#baaf9c] text-xs font-bold uppercase tracking-wider mb-4 px-3">
                            Account Settings
                        </h3>
                        <nav className="flex flex-col gap-1">
                            <Link
                                href="/dashboard/profile"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white font-medium bg-[#393328] border-l-4 border-[#f29e0d]"
                            >
                                <span className="material-symbols-outlined text-[#f29e0d]">
                                    person
                                </span>
                                My Profile
                            </Link>
                            <Link
                                href="/dashboard/profile/family"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#baaf9c] hover:bg-[#393328] hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined">group</span>
                                My Family
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#baaf9c] hover:bg-[#393328] hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined">location_on</span>
                                Saved Addresses
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#baaf9c] hover:bg-[#393328] hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined">payments</span>
                                Payment Methods
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-[#baaf9c] text-xs font-bold uppercase tracking-wider mb-4 px-3">
                            Preferences
                        </h3>
                        <div className="flex flex-col gap-4 px-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white">
                                    Booking Notifications
                                </span>
                                <button className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full bg-[#f29e0d] transition-colors focus:outline-none">
                                    <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white">Travel Updates</span>
                                <button className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full bg-[#393328] transition-colors focus:outline-none">
                                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-8 pb-12">
                    {/* Section: My Profile */}
                    <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    My Profile
                                </h2>
                                <p className="text-[#baaf9c] text-sm">
                                    Personal details and religious identifiers
                                </p>
                            </div>
                            <button className="text-[#f29e0d] border border-[#f29e0d]/30 hover:bg-[#f29e0d]/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                                Edit Details
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#baaf9c]">
                                    Full Name
                                </label>
                                <div className="bg-[#393328]/50 p-3 rounded-lg border border-[#393328] text-white">
                                    Aditya Sharma
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#baaf9c]">
                                    Gotra
                                </label>
                                <div className="bg-[#393328]/50 p-3 rounded-lg border border-[#393328] text-white">
                                    Vatsa
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#baaf9c]">
                                    Preferred Language
                                </label>
                                <div className="bg-[#393328]/50 p-3 rounded-lg border border-[#393328] text-white">
                                    Hindi &amp; English
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: My Family */}
                    <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    My Family
                                </h2>
                                <p className="text-[#baaf9c] text-sm">
                                    Add family members for personalized rituals
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/profile/family')}
                                className="flex items-center gap-2 bg-[#f29e0d]/20 text-[#f29e0d] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#f29e0d]/30 transition-all"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                Add Member
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#393328] bg-[#181511]/30">
                                <div className="size-12 rounded-full bg-[#f29e0d]/10 flex items-center justify-center text-[#f29e0d]">
                                    <span className="material-symbols-outlined">woman</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold">Priya Sharma</h4>
                                    <p className="text-[#baaf9c] text-xs">
                                        Spouse • Gotra: Bharadwaj
                                    </p>
                                </div>
                                <button className="text-[#baaf9c] hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-xl">
                                        edit
                                    </span>
                                </button>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#393328] bg-[#181511]/30">
                                <div className="size-12 rounded-full bg-[#f29e0d]/10 flex items-center justify-center text-[#f29e0d]">
                                    <span className="material-symbols-outlined">child_care</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold">Aryan Sharma</h4>
                                    <p className="text-[#baaf9c] text-xs">
                                        Son • Gotra: Vatsa
                                    </p>
                                </div>
                                <button className="text-[#baaf9c] hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-xl">
                                        edit
                                    </span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Section: Saved Addresses */}
                        <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    Saved Addresses
                                </h2>
                                <button className="text-[#f29e0d] text-sm font-semibold hover:underline">
                                    Manage All
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-3 items-start p-4 rounded-lg bg-[#181511]/30 border border-[#393328]">
                                    <span className="material-symbols-outlined text-[#f29e0d] mt-1">
                                        home
                                    </span>
                                    <div>
                                        <h4 className="text-white font-medium">Home (Gurugram)</h4>
                                        <p className="text-[#baaf9c] text-xs leading-relaxed mt-1">
                                            402, Lotus Towers, Sector 45, Gurugram, Haryana - 122003
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section: Payment Methods */}
                        <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    Payment Methods
                                </h2>
                                <button className="text-[#f29e0d] text-sm font-semibold hover:underline">
                                    Add New
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-[#181511]/30 border border-[#393328]">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#f29e0d]">
                                            credit_card
                                        </span>
                                        <div>
                                            <h4 className="text-white font-medium">
                                                HDFC Bank Debit Card
                                            </h4>
                                            <p className="text-[#baaf9c] text-xs mt-1">
                                                **** **** 4589
                                            </p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-[#baaf9c] text-base cursor-pointer">
                                        more_vert
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Section: My Pandits (Kul Purohits) */}
                    <section className="bg-[#27231b] rounded-xl p-8 border border-[#393328] shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    My Pandits
                                </h2>
                                <p className="text-[#baaf9c] text-sm">
                                    Trusted family Pandits and Kul Purohits
                                </p>
                            </div>
                            <button className="text-[#f29e0d] text-sm font-semibold border border-[#f29e0d]/20 px-4 py-2 rounded-lg hover:bg-[#f29e0d]/5 transition-all">
                                Find New Pandit
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-5 p-5 rounded-xl bg-[#181511]/30 border border-[#393328] group hover:border-[#f29e0d]/40 transition-all cursor-pointer">
                                <div
                                    className="size-16 rounded-lg bg-cover bg-center overflow-hidden border border-[#393328] shadow-lg"
                                    style={{
                                        backgroundImage:
                                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaQw9eLFxkrK0zCrkzrMVI1atLucVyult8bidWO3rWEbeI5DpJQA3TFBjhL-Xf4ZCWfXh1nHn1__sOfuPy9igOrV3aNj2_ME_NYD1VHT3hAoLcDaN0TwAuem-Biq3gUVEKxFo0Onx_iwtmyqdWPF9sDy8BInOQRJtoJbwPfHTuop5ct9VsPuKbt8-cxqGnhdfvGBpRCcqQAuWGh6Xpo3vXW40CMoxoMflkOBrfViIgDSuCXOHn7ysoITNKe2z2o9dobq8qrZ0-hT4')",
                                    }}
                                ></div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-white font-bold text-lg">
                                            Pandit Rajeshwar Jha
                                        </h4>
                                        <span className="bg-[#f29e0d]/20 text-[#f29e0d] text-[10px] font-bold px-1.5 py-0.5 rounded">
                                            Kul Purohit
                                        </span>
                                    </div>
                                    <p className="text-[#baaf9c] text-sm mt-0.5">
                                        Specialist: Satyanarayan Katha, Griha Pravesh
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 text-[#f29e0d] text-xs font-semibold">
                                            <span className="material-symbols-outlined text-sm">
                                                star
                                            </span>
                                            4.9 (120+)
                                        </div>
                                        <div className="flex items-center gap-1 text-[#baaf9c] text-xs">
                                            <span className="material-symbols-outlined text-sm">
                                                schedule
                                            </span>
                                            Available Tomorrow
                                        </div>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-[#baaf9c] group-hover:text-[#f29e0d] transition-colors">
                                    chevron_right
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
