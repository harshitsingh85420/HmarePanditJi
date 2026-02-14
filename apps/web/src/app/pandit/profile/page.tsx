"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] dark:bg-[#221a10] text-[#181511] dark:text-[#f5f3f0] font-sans">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f49d25]/10 bg-white dark:bg-[#221a10] px-10 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <Link href="/pandit/dashboard" className="flex items-center gap-4 text-[#f49d25]">
                        <div className="size-6">
                            <span className="material-symbols-outlined text-4xl">temple_hindu</span>
                        </div>
                        <h2 className="text-[#181511] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                            HmarePanditJi
                        </h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-9">
                        <Link href="/pandit/dashboard" className="text-sm font-medium hover:text-[#f49d25] transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/pandit/bookings" className="text-sm font-medium hover:text-[#f49d25] transition-colors">
                            Bookings
                        </Link>
                        <Link href="/pandit/profile" className="text-sm font-medium text-[#f49d25] transition-colors">
                            Profile
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <div className="hidden lg:flex items-center bg-[#f49d25]/5 rounded-lg h-10 px-4 w-64 text-[#8a7960]">
                        <span className="material-symbols-outlined mr-2">search</span>
                        <input
                            type="text"
                            placeholder="Search settings..."
                            className="bg-transparent border-none outline-none text-base w-full placeholder:text-[#8a7960] text-[#181511]"
                        />
                    </div>
                    <button className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#f49d25] text-white text-sm font-bold tracking-[0.015em] hover:bg-[#f49d25]/90 transition-all">
                        <span>Logout</span>
                    </button>
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#f49d25]"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCNu3SH90jgVaepDm06CTi_DCGhnZ8B3f2AUpGv9LgsapxieZLg5B1j50sI8tUSKD7elbyCtVyQCRjsAZO8C5g_azx-GNH2tId2m9RnYOIoezZ3YvRDS9SGbWtcNVa4pVF7jsgj-wNM1rsd8uL7DWICQlufhDQtPC9ubNimNSNsTCxGAA6RCWHGIN7Q_Sx-tKcB7QuOJIfny9h6nMaQfrX1ow1awsGVx_GHjP9dpOdDJ6R9ekwjDYdnPRgk77-iPJbhkgbaLRfI0io")',
                        }}
                    ></div>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto w-full px-6 py-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 pb-6">
                    <Link href="/pandit/dashboard" className="text-[#8a7960] text-sm font-medium hover:text-[#f49d25] transition-colors">
                        Dashboard
                    </Link>
                    <span className="text-[#8a7960] text-sm font-medium">/</span>
                    <span className="text-[#181511] dark:text-white text-sm font-bold">
                        Pandit Sharma Ji Profile
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Section: Profile Content */}
                    <div className="flex-1 space-y-8">
                        {/* Hero Component */}
                        <section className="bg-white dark:bg-[#1c1917] rounded-xl p-6 shadow-sm border border-[#f49d25]/10">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl min-h-[160px] w-[160px] border-4 border-[#f49d25]/20 shadow-lg"
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCNu3SH90jgVaepDm06CTi_DCGhnZ8B3f2AUpGv9LgsapxieZLg5B1j50sI8tUSKD7elbyCtVyQCRjsAZO8C5g_azx-GNH2tId2m9RnYOIoezZ3YvRDS9SGbWtcNVa4pVF7jsgj-wNM1rsd8uL7DWICQlufhDQtPC9ubNimNSNsTCxGAA6RCWHGIN7Q_Sx-tKcB7QuOJIfny9h6nMaQfrX1ow1awsGVx_GHjP9dpOdDJ6R9ekwjDYdnPRgk77-iPJbhkgbaLRfI0io")',
                                    }}
                                ></div>
                                <div className="flex flex-col flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-[#181511] dark:text-white text-3xl font-bold leading-tight">
                                                Pandit Sharma Ji
                                            </h1>
                                            <p className="text-[#f49d25] font-semibold text-lg">
                                                Expert in Vedic Rituals &amp; Vivah Sanskar
                                            </p>
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f49d25]/10 text-[#f49d25] border border-[#f49d25]/20 hover:bg-[#f49d25]/20 transition-all">
                                            <span className="material-symbols-outlined">
                                                edit
                                            </span>
                                            <span className="font-bold text-sm">Edit Profile</span>
                                        </button>
                                    </div>
                                    <p className="text-[#8a7960] dark:text-[#b0a08a] mt-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">
                                            location_on
                                        </span>
                                        Varanasi, UP | 15+ Years Experience | 500+ Ceremonies
                                    </p>
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1 text-[#f49d25]">
                                                <span className="material-symbols-outlined text-lg fill-1">
                                                    star
                                                </span>
                                                <span className="text-xl font-bold">4.9</span>
                                            </div>
                                            <span className="text-[#8a7960] text-xs">
                                                128 Reviews
                                            </span>
                                        </div>
                                        <div className="h-8 w-px bg-[#f49d25]/20"></div>
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold text-[#181511] dark:text-white">
                                                500+
                                            </span>
                                            <span className="text-[#8a7960] text-xs">
                                                Ceremonies
                                            </span>
                                        </div>
                                        <div className="h-8 w-px bg-[#f49d25]/20"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-green-600">
                                                verified
                                            </span>
                                            <span className="text-[#8a7960] text-xs">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tabs Menu */}
                        <div className="border-b border-[#f49d25]/10">
                            <div className="flex gap-8 overflow-x-auto no-scrollbar">
                                <button className="border-b-2 border-[#f49d25] text-[#f49d25] pb-3 font-bold whitespace-nowrap">
                                    Bio &amp; Experience
                                </button>
                                <button className="border-b-2 border-transparent text-[#8a7960] hover:text-[#f49d25] pb-3 font-medium whitespace-nowrap">
                                    Gallery of Ceremonies
                                </button>
                                <button className="border-b-2 border-transparent text-[#8a7960] hover:text-[#f49d25] pb-3 font-medium whitespace-nowrap">
                                    Verified Certificates
                                </button>
                                <button className="border-b-2 border-transparent text-[#8a7960] hover:text-[#f49d25] pb-3 font-medium whitespace-nowrap">
                                    Reviews
                                </button>
                            </div>
                        </div>

                        {/* Bio Section Placehodler */}
                        <section className="bg-white dark:bg-[#1c1917] rounded-xl p-6 shadow-sm border border-[#f49d25]/10 space-y-4">
                            <h3 className="text-xl font-bold text-[#181511] dark:text-white">About Pandit Ji</h3>
                            <p className="text-[#8a7960]">
                                Namaste! I am Pandit Sharma, a dedicated Vedic scholar with over 15 years of experience in performing sacred Hindu rituals. My journey began in the holy city of Varanasi, where I studied the Vedas and Upanishads under the guidance of revered Gurus. I specialize in Vivah Sanskar (Weddings), Griha Pravesh (House Warming), and Satyanarayan Puja. My mission is to bring the authentic spiritual essence of our traditions to your doorstep, performed with devotion and strict adherence to Vedic vidhi.
                            </p>
                            <h4 className="font-bold text-[#181511] dark:text-white mt-4">Languages Spoken</h4>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-[#f49d25]/10 text-[#f49d25] rounded-full text-sm font-medium">Hindi</span>
                                <span className="px-3 py-1 bg-[#f49d25]/10 text-[#f49d25] rounded-full text-sm font-medium">Sanskrit</span>
                                <span className="px-3 py-1 bg-[#f49d25]/10 text-[#f49d25] rounded-full text-sm font-medium">English</span>
                                <span className="px-3 py-1 bg-[#f49d25]/10 text-[#f49d25] rounded-full text-sm font-medium">Bhojpuri</span>
                            </div>
                        </section>

                    </div>

                    {/* Right Section: Quick Stats/Actions */}
                    <aside className="w-full lg:w-[380px] space-y-6">
                        <div className="bg-white dark:bg-[#1c1917] rounded-2xl shadow-xl border border-[#f49d25]/20 overflow-hidden p-6">
                            <h3 className="font-bold text-lg mb-4 text-[#181511] dark:text-white">Profile Strength</h3>
                            <div className="w-full bg-[#f8f7f5] dark:bg-white/10 rounded-full h-4 mb-2">
                                <div className="bg-[#f49d25] h-4 rounded-full" style={{ width: "85%" }}></div>
                            </div>
                            <p className="text-sm text-[#8a7960] mb-6">Your profile is <strong>85% complete</strong>. Add more gallery photos to reach 100%.</p>

                            <button className="w-full bg-[#f49d25] hover:bg-[#f49d25]/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#f49d25]/20 transition-all mb-3">
                                Upload New Photos
                            </button>
                            <button className="w-full bg-white dark:bg-[#221a10] border border-[#f49d25] text-[#f49d25] font-bold py-3 rounded-xl hover:bg-[#f49d25]/5 transition-all">
                                Update Availability
                            </button>
                        </div>

                        <div className="bg-[#f49d25]/5 border border-[#f49d25]/10 rounded-xl p-4 flex gap-4 items-center">
                            <span className="material-symbols-outlined text-[#f49d25] text-3xl">
                                verified_user
                            </span>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">Identity Verified</span>
                                <span className="text-xs text-[#8a7960]">
                                    Aadhar & Pan Card verified on Jan 2024.
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="bg-white dark:bg-[#1c1917] mt-12 border-t border-[#f49d25]/10 py-12 px-10">
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between gap-8">
                    <p className="text-[#8a7960] text-sm text-center w-full">
                        © 2024 HmarePanditJi Spiritual Services Pvt Ltd. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
