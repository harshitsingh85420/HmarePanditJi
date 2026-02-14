"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SamagriComparisonPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("custom");

    return (
        <main className="max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-8 bg-[#f8f6f6] dark:bg-[#221610] min-h-screen">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    Custom List Comparison
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Compare your ritual essentials and ensure you get the best value for
                    your puja.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Content */}
                <div className="flex-1 space-y-6">
                    {/* Tabbed Switcher */}
                    <div className="bg-white dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 inline-flex">
                        <button
                            onClick={() => setActiveTab("fixed")}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "fixed"
                                    ? "bg-[#ec5b13] text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                        >
                            Pandit Fixed Packages
                        </button>
                        <button
                            onClick={() => setActiveTab("custom")}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "custom"
                                    ? "bg-[#ec5b13] text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                        >
                            Build Custom List
                        </button>
                    </div>

                    {/* Price Comparison Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Puja Item
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Market Avg
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#ec5b13] uppercase tracking-wider">
                                            HmarePanditJi Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-5 font-medium text-slate-900 dark:text-white">Pure Cow Ghee (500g)</td>
                                        <td className="px-6 py-5 text-slate-400 dark:text-slate-500 line-through">
                                            ₹450
                                        </td>
                                        <td className="px-6 py-5 font-bold text-[#ec5b13]">₹399</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-5 font-medium text-slate-900 dark:text-white">Ganga Jal (500ml)</td>
                                        <td className="px-6 py-5 text-slate-400 dark:text-slate-500 line-through">
                                            ₹120
                                        </td>
                                        <td className="px-6 py-5 font-bold text-[#ec5b13]">₹85</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-5 font-medium text-slate-900 dark:text-white">
                                            Premium Incense Sticks (100pcs)
                                        </td>
                                        <td className="px-6 py-5 text-slate-400 dark:text-slate-500 line-through">
                                            ₹180
                                        </td>
                                        <td className="px-6 py-5 font-bold text-[#ec5b13]">₹145</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-5 font-medium text-slate-900 dark:text-white">Havan Samagri Mix (1kg)</td>
                                        <td className="px-6 py-5 text-slate-400 dark:text-slate-500 line-through">
                                            ₹550
                                        </td>
                                        <td className="px-6 py-5 font-bold text-[#ec5b13]">₹480</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-5 font-medium text-slate-900 dark:text-white">Kumkum & Chandan Set</td>
                                        <td className="px-6 py-5 text-slate-400 dark:text-slate-500 line-through">
                                            ₹95
                                        </td>
                                        <td className="px-6 py-5 font-bold text-[#ec5b13]">₹60</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-5 font-medium text-slate-900 dark:text-white">
                                            Cotton Wicks (Round & Long)
                                        </td>
                                        <td className="px-6 py-5 text-slate-400 dark:text-slate-500 line-through">
                                            ₹60
                                        </td>
                                        <td className="px-6 py-5 font-bold text-[#ec5b13]">₹45</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* Add Item Search */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <div className="relative max-w-sm">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                    search
                                </span>
                                <input
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-[#ec5b13] focus:border-[#ec5b13] transition-all text-slate-900 dark:text-white"
                                    placeholder="Add more items to list..."
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                        <div className="flex items-start gap-3 p-4 bg-[#ec5b13]/5 dark:bg-[#ec5b13]/10 rounded-xl border border-[#ec5b13]/10">
                            <span className="material-symbols-outlined text-[#ec5b13]">
                                verified_user
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-[#ec5b13]">
                                    Reliability
                                </p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    100% Refund if Pandit doesn't arrive
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <span className="material-symbols-outlined text-emerald-600">
                                high_quality
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                    Quality
                                </p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    ISO Certified Samagri Quality Check
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <span className="material-symbols-outlined text-blue-600">
                                groups
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                                    Vetting
                                </p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Background Verified Vedic Pandits
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Sidebar Summary */}
                <aside className="w-full lg:w-96 h-fit shrink-0">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-[#ec5b13]">
                                    receipt_long
                                </span>
                                Order Summary
                            </h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                    <span className="text-sm font-medium">
                                        Market Average Total
                                    </span>
                                    <span className="text-sm font-bold line-through">₹1,455</span>
                                </div>
                                <div className="flex justify-between items-center text-[#ec5b13]">
                                    <span className="text-sm font-bold">HmarePanditJi Total</span>
                                    <span className="text-xl font-black">₹1,214</span>
                                </div>
                                <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                            <span className="material-symbols-outlined text-sm">
                                                savings
                                            </span>
                                            <span className="text-sm font-bold">
                                                Your Total Savings
                                            </span>
                                        </div>
                                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                                            ₹241
                                        </span>
                                    </div>
                                    <div className="mt-2 w-full bg-emerald-200 dark:bg-emerald-900 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[18%]"></div>
                                    </div>
                                    <p className="mt-2 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-500 tracking-wider">
                                        Bundle discount applied (18.5%)
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/booking/new')}
                                    className="w-full py-4 bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white rounded-xl font-bold shadow-lg shadow-[#ec5b13]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
                                >
                                    Proceed to Booking
                                    <span className="material-symbols-outlined">
                                        arrow_forward
                                    </span>
                                </button>
                                <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 px-4 leading-relaxed">
                                    By clicking proceed, you agree to our terms of service and
                                    samagri delivery policy.
                                </p>
                            </div>
                        </div>
                        {/* Help Card */}
                        <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-8xl text-white">
                                    support_agent
                                </span>
                            </div>
                            <h3 className="text-white font-bold mb-2">Need Help?</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                Our spiritual consultants are available 24/7 to help you curate
                                the perfect puja list.
                            </p>
                            <button className="flex items-center gap-2 text-[#ec5b13] font-bold text-sm hover:underline">
                                Chat with us
                                <span className="material-symbols-outlined text-sm">chat</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Mobile CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[#221610]/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 z-50">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Grand Total</p>
                        <p className="text-xl font-black text-[#ec5b13]">₹1,214</p>
                    </div>
                    <button
                        onClick={() => router.push('/booking/new')}
                        className="flex-1 py-3 bg-[#ec5b13] text-white rounded-xl font-bold shadow-lg shadow-[#ec5b13]/30 flex items-center justify-center gap-2"
                    >
                        Proceed
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
        </main>
    );
}
