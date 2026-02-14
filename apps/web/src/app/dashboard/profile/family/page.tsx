"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FamilyGotraSetupPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f6] dark:bg-[#221910] text-[#332c26] dark:text-gray-200">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#221910]/90 border-b border-[#ee8c2b]/10 dark:border-[#ee8c2b]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#ee8c2b] text-3xl">temple_hindu</span>
                            <span className="text-2xl font-bold text-[#ee8c2b] tracking-wide">
                                HmarePanditJi
                            </span>
                        </div>
                        <div className="flex items-center space-x-8 text-sm font-medium text-[#756c64] dark:text-gray-400">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 hover:text-[#ee8c2b] transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Layout */}
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Decorative Side Elements (Abstract Motifs) */}
                <div className="absolute left-0 top-1/4 w-64 h-64 bg-[#ee8c2b]/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute right-0 bottom-1/4 w-96 h-96 bg-[#ee8c2b]/5 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Sidebar: Context & Visuals */}
                    <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 hidden lg:block">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                Rooted in <span className="text-[#ee8c2b] italic">Tradition</span>
                                ,<br />
                                Powered by Faith.
                            </h2>
                            <p className="text-lg text-[#756c64] dark:text-gray-400">
                                We connect you with Vedic scholars who understand the nuances of
                                your specific lineage, ensuring every Sankalp is precise.
                            </p>
                        </div>
                        {/* Trust Card */}
                        <div className="relative overflow-hidden rounded-2xl aspect-[4/3] shadow-xl group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                            <div
                                className="w-full h-full bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuChTSkZ-cVl7fLpT5uhqA1qIbpc4T628iXIaiCrJ3OVs6vLx1pcpLEMwffpld5MhcfkJHmxanMjtdaTk0ZF8RyW6SSWcVIOfOXudwHeaQO-uS4SJknObGx9uyinGEwvmZOB6cPJ4tjwIzyZQ96LREid1yC7iw9q8wbiz70O5yrUgpWUiUcoSiHObrX7i-fJ8xkcc_lB4R5P9S-7GJ7nnKV8mc-fQ7vqvJSMY5Z-zWAhjTzqhMhMbyb_XoJrKHv_Gtb5O2SlzF9IYP0')",
                                }}
                            ></div>
                            <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                                <div className="flex items-center gap-2 mb-2 text-[#fff5eb]">
                                    <span className="material-symbols-outlined text-sm">
                                        verified
                                    </span>
                                    <span className="text-xs uppercase tracking-wider font-semibold">
                                        Verified Pandits
                                    </span>
                                </div>
                                <p className="font-medium text-sm text-gray-200">
                                    "The purity of the ritual begins with the correct
                                    identification of the self through Gotra."
                                </p>
                            </div>
                        </div>
                        {/* Step Indicator */}
                        <div className="flex items-center gap-4 text-sm font-medium text-[#756c64] dark:text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#ee8c2b]"></div>
                                <span>Basic Info</span>
                            </div>
                            <div className="h-px w-8 bg-[#ee8c2b]"></div>
                            <div className="flex items-center gap-2 text-[#ee8c2b] font-bold">
                                <div className="w-2 h-2 rounded-full bg-[#ee8c2b] ring-4 ring-[#ee8c2b]/20"></div>
                                <span>Lineage</span>
                            </div>
                            <div className="h-px w-8 bg-gray-300 dark:bg-gray-700"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                <span>Preferences</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Section */}
                    <div className="lg:col-span-7">
                        {/* Mobile Progress Header (Visible only on small screens) */}
                        <div className="lg:hidden mb-8">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-[#ee8c2b] font-bold">Step 2 of 4</span>
                                <span className="text-[#756c64]">Lineage</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ee8c2b] w-1/2 rounded-full"></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-10 relative overflow-hidden">
                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ee8c2b] to-orange-300"></div>

                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Honoring Your Lineage
                                </h1>
                                <p className="text-[#756c64] dark:text-gray-400">
                                    Please provide your ancestral details. This ensures the Pandit
                                    performs rituals according to your specific family traditions
                                    (Kulachar).
                                </p>
                            </div>

                            {/* Informational Banner */}
                            <div className="mb-8 bg-[#ee8c2b]/5 dark:bg-[#ee8c2b]/10 border border-[#ee8c2b]/20 rounded-lg p-4 flex items-start gap-3">
                                <span className="material-symbols-outlined text-[#ee8c2b] mt-0.5">
                                    info
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                        Why do we ask this?
                                    </h4>
                                    <p className="text-sm text-[#756c64] dark:text-gray-300 leading-relaxed">
                                        Knowing your Gotra and Veda ensures the correct
                                        pronunciation of the 'Sankalp'—the solemn vow taken before
                                        any ritual. It connects the offering directly to your
                                        ancestors.
                                    </p>
                                </div>
                            </div>

                            <form className="space-y-6">
                                {/* Gotra Field */}
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                                        htmlFor="gotra"
                                    >
                                        Your Gotra <span className="text-[#ee8c2b]">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-400 text-lg">
                                                history_edu
                                            </span>
                                        </div>
                                        <input
                                            className="block w-full pl-10 pr-4 py-3 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-[#ee8c2b] focus:border-[#ee8c2b] dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-colors"
                                            id="gotra"
                                            placeholder="e.g., Kashyapa, Bharadwaja, Vashistha"
                                            type="text"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                                                Autofill
                                            </span>
                                        </div>
                                    </div>
                                    <p className="mt-1.5 text-xs text-[#756c64] dark:text-gray-500">
                                        Start typing to select from our database of Vedic Rishis.
                                    </p>
                                </div>

                                {/* Veda & Shakha */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                                            htmlFor="veda"
                                        >
                                            Veda
                                        </label>
                                        <select
                                            className="block w-full py-3 px-4 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-[#ee8c2b] focus:border-[#ee8c2b] dark:bg-gray-700 dark:text-white"
                                            id="veda"
                                            defaultValue=""
                                        >
                                            <option disabled value="">
                                                Select Veda
                                            </option>
                                            <option value="rigveda">Rigveda</option>
                                            <option value="yajurveda_shukla">
                                                Yajurveda (Shukla)
                                            </option>
                                            <option value="yajurveda_krishna">
                                                Yajurveda (Krishna)
                                            </option>
                                            <option value="samaveda">Samaveda</option>
                                            <option value="atharvaveda">Atharvaveda</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                                            htmlFor="shakha"
                                        >
                                            Shakha / Sutra{" "}
                                            <span className="text-xs font-normal text-gray-500">
                                                (Optional)
                                            </span>
                                        </label>
                                        <input
                                            className="block w-full py-3 px-4 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-[#ee8c2b] focus:border-[#ee8c2b] dark:bg-gray-700 dark:text-white placeholder-gray-400"
                                            id="shakha"
                                            placeholder="e.g., Madhyandina"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                {/* I don't know toggle */}
                                <div className="flex items-center gap-2">
                                    <input
                                        className="h-4 w-4 text-[#ee8c2b] focus:ring-[#ee8c2b] border-gray-300 rounded"
                                        id="unknown_veda"
                                        type="checkbox"
                                    />
                                    <label
                                        className="text-sm text-[#756c64] dark:text-gray-400 select-none cursor-pointer"
                                        htmlFor="unknown_veda"
                                    >
                                        I don't know my Veda/Shakha details
                                    </label>
                                </div>

                                <hr className="border-gray-200 dark:border-gray-700" />

                                {/* Kula Devta */}
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                                        htmlFor="kuladevta"
                                    >
                                        Kula-Devta / Devi (Family Deity)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-400 text-lg">
                                                spa
                                            </span>
                                        </div>
                                        <input
                                            className="block w-full pl-10 pr-4 py-3 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-[#ee8c2b] focus:border-[#ee8c2b] dark:bg-gray-700 dark:text-white placeholder-gray-400"
                                            id="kuladevta"
                                            placeholder="e.g., Tirupati Balaji, Renuka Mata"
                                            type="text"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-[#756c64] dark:text-gray-500">
                                        This helps match you with Pandits familiar with your deity's
                                        specific worship style.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/dashboard/profile')}
                                        className="text-sm font-semibold text-gray-500 hover:text-[#ee8c2b] transition-colors"
                                    >
                                        Skip for now
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/dashboard/profile')}
                                        className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#ee8c2b] hover:bg-[#d97b1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ee8c2b] transition-all duration-200 transform hover:-translate-y-0.5 shadow-[#ee8c2b]/30"
                                    >
                                        Save &amp; Continue
                                        <span className="material-symbols-outlined ml-2 text-lg">
                                            arrow_forward
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Trust signals below form */}
                        <div className="mt-6 flex justify-center items-center gap-6 text-xs text-[#756c64] dark:text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-green-600">
                                    lock
                                </span>
                                <span>Private &amp; Secure</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-[#ee8c2b]">
                                    diversity_3
                                </span>
                                <span>Used for matching only</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
