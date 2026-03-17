"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Bell, AlertTriangle, TrendingUp, Package, MapPin,
    Download, Plus, ArrowRight
} from "lucide-react";

export default function InventoryAndSurgePage() {
    return (
        <div className="bg-[#f8f7f6] dark:bg-[#221910] min-h-screen font-display text-gray-800 dark:text-gray-100 flex flex-col pb-20">
            {/* Navbar (Handled by layout mostly, we just add the page specific header here) */}
            <nav className="bg-white dark:bg-[#2a2018] border-b border-[#ec7f13]/10 dark:border-[#ec7f13]/20 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#ec7f13] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>temple_hindu</span>
                                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">HmarePanditJi</span>
                            </div>
                            <div className="hidden md:flex ml-8 space-x-8">
                                <a className="inline-flex items-center px-1 pt-1 border-b-2 border-[#ec7f13] text-sm font-medium text-gray-900 dark:text-white" href="#">Market Watch</a>
                                <a className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">My Inventory</a>
                                <a className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Bookings</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center px-3 py-1 bg-[#f8f7f6] dark:bg-[#221910] rounded-full border border-gray-200 dark:border-gray-700 text-sm">
                                <MapPin size={16} className="text-gray-400 mr-2" />
                                <span className="font-medium">Region: Patna, BR</span>
                                <span className="material-symbols-outlined text-gray-400 text-lg ml-1">expand_more</span>
                            </div>
                            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 relative">
                                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-[#ec7f13] ring-2 ring-white dark:ring-[#2a2018]"></span>
                                <Bell size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
                {/* Header Section */}
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                            Market Intelligence Dashboard
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Real-time Samagri prices and inventory alerts for your upcoming rituals.
                        </p>
                    </div>
                    <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
                        <button className="inline-flex items-center rounded-md bg-white dark:bg-[#2a2018] px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" type="button">
                            <Download size={16} className="mr-2" />
                            Export Report
                        </button>
                        <button className="inline-flex items-center rounded-md bg-[#ec7f13] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#d47010] transition-colors" type="button">
                            <Plus size={16} className="mr-2" />
                            New Purchase Log
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Alerts Feed (Takes up 2/3 space on large screens) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Critical Alerts Card */}
                        <div className="bg-white dark:bg-[#2a2018] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden text-left">
                            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-[#ec7f13]/5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <AlertTriangle className="text-[#ec7f13]" size={20} fill="currentColor" />
                                    Urgent Market Alerts
                                </h3>
                                <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10">3 New</span>
                            </div>

                            <ul className="divide-y divide-gray-100 dark:divide-gray-800" role="list">
                                {/* Alert 1 */}
                                <li className="relative flex gap-x-6 py-5 px-6 hover:bg-gray-50 dark:hover:bg-[#322820] transition-colors cursor-pointer">
                                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 ring-1 ring-red-600/20">
                                        <TrendingUp className="text-red-600 dark:text-red-400" size={24} />
                                    </div>
                                    <div className="flex-auto">
                                        <div className="flex items-baseline justify-between gap-x-4">
                                            <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Ghee Price Surge (Patna)</p>
                                            <p className="flex-none text-xs text-gray-500 dark:text-gray-400">1h ago</p>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            Prices have surged by <span className="font-bold text-red-600 dark:text-red-400">+15%</span> due to local festival demand. Consider stocking up now or adjusting package rates.
                                        </p>
                                    </div>
                                </li>
                                {/* Alert 2 */}
                                <li className="relative flex gap-x-6 py-5 px-6 hover:bg-gray-50 dark:hover:bg-[#322820] transition-colors cursor-pointer">
                                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 ring-1 ring-green-600/20">
                                        <Package className="text-green-600 dark:text-green-400" size={24} />
                                    </div>
                                    <div className="flex-auto">
                                        <div className="flex items-baseline justify-between gap-x-4">
                                            <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Marigold Availability High</p>
                                            <p className="flex-none text-xs text-gray-500 dark:text-gray-400">3h ago</p>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            Market supply is high. Prices dropping by <span className="font-bold text-green-600 dark:text-green-400">-5%</span>. Good time for bulk purchase for decoration contracts.
                                        </p>
                                    </div>
                                </li>
                                {/* Alert 3 */}
                                <li className="relative flex gap-x-6 py-5 px-6 hover:bg-gray-50 dark:hover:bg-[#322820] transition-colors cursor-pointer">
                                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-600/20">
                                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">local_shipping</span>
                                    </div>
                                    <div className="flex-auto">
                                        <div className="flex items-baseline justify-between gap-x-4">
                                            <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Rice Supply Delay (Delhi Route)</p>
                                            <p className="flex-none text-xs text-gray-500 dark:text-gray-400">5h ago</p>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            Transport strike affecting supply chain. Expect 2-3 day delays for premium Basmati stocks.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Price Trends */}
                        <div className="bg-white dark:bg-[#2a2018] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-left">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Samagri Price Trends (30 Days)</h3>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10 cursor-pointer">Ghee</span>
                                    <span className="inline-flex items-center rounded-md bg-white dark:bg-[#2a2018] px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 cursor-pointer">Rice</span>
                                    <span className="inline-flex items-center rounded-md bg-white dark:bg-[#2a2018] px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 cursor-pointer">Flowers</span>
                                </div>
                            </div>

                            <div className="relative h-64 w-full bg-gradient-to-b from-[#ec7f13]/5 to-transparent rounded-lg border border-[#ec7f13]/10 p-4 flex items-end justify-between gap-2 overflow-hidden">
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 opacity-30">
                                    <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
                                    <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
                                    <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
                                    <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
                                </div>

                                <div className="absolute inset-0 flex items-end px-4 pb-4">
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="gradientPrimary" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#ec7f13', stopOpacity: 0.5 }} />
                                                <stop offset="100%" style={{ stopColor: '#ec7f13', stopOpacity: 0 }} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,200 C50,180 100,210 150,150 C200,90 250,120 300,100 C350,80 400,40 450,60 C500,80 550,30 600,20 L600,250 L0,250 Z" fill="url(#gradientPrimary)" className="opacity-40" />
                                        <path d="M0,200 C50,180 100,210 150,150 C200,90 250,120 300,100 C350,80 400,40 450,60 C500,80 550,30 600,20" fill="none" stroke="#ec7f13" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                                        <circle cx="450" cy="60" r="4" fill="white" stroke="#ec7f13" strokeWidth="2" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 px-2">
                                <span>1 Nov</span>
                                <span>8 Nov</span>
                                <span>15 Nov</span>
                                <span>22 Nov</span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & Quick Status */}
                    <div className="space-y-8">

                        <div className="bg-gradient-to-br from-[#ec7f13] to-orange-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden text-left">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
                            <h3 className="text-xl font-bold mb-2">Margins impacted!</h3>
                            <p className="text-orange-100 text-sm mb-6">Recent price surges in Ghee and Camphor might reduce your puja package margin by <span className="font-bold text-white">₹250</span> per booking.</p>

                            <button className="w-full bg-white text-[#ec7f13] font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-orange-50 transition flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>currency_rupee</span>
                                Update Package Prices
                            </button>
                            <div className="mt-4 text-xs text-orange-200 text-center">
                                Last updated: 14 days ago
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#2a2018] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-left">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Package className="text-gray-400" size={20} />
                                My Stock Watch
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf4EbEKPRCi3o1iYHD5saXQRIohhhLF-v0J31lmiRpDkW01egJm7fBzPn9A7wArHB-uosCEzF5O4uF4j1jRRvbQVFXNbCD8x9VDQbkTqmur6BzWyRxbF7L8IqaZkVkIh5bvzMy0LM0nlf-7L_H4aWJ2SfX8e7hzrABfVEIv3Lw7XFIj9hZgWEfZfe4ZokatlhWDijHV9BPYUd1QygyLgdGgaCmLhHmjEdT2Mv2kMQsC2fP3RcMGfItuUImk9MTnyAsAYHEjct5Nrs" className="h-full w-full object-cover rounded-md" alt="Ghee" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Pure Ghee</p>
                                            <p className="text-xs text-gray-500">2 kg in stock</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400">Low</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcmv5N7b3sxp8C-GnwOzHA2T5llgJaIwCS7HtGdssZhKghdCyWzc40llzp6A84KGOxudTHaJz-bVY77UBowQJTyOSk4BNYUQcd_cnHQIJfcuBa922isPjFKkoM3QkoHvdZ-WOuiFkmE9K3zvA6CwMsKJ33020ORuftxKQfnc_w3MYh-gwbBsAuqVIhrgflNFGb9A2NlMQItFn6mGjB_6XnbSjGWZiHUleQaG-9DBmxSQ_IBH-X4SG2s_lXevzpKT-MrQXvEsBTu4A" className="h-full w-full object-cover rounded-md" alt="Rice" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Basmati Rice</p>
                                            <p className="text-xs text-gray-500">15 kg in stock</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">Good</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvRl8maMc7xS2CJEb7rCkvSdPmCoK1IbJ5H11QJrykp1PLkYaBlZ7wqmcz-dbhHbUwq8Z0LcEIH4cw5cP9LAi2Ar9is5v8Cpwa9XDbM2SJbDgWBZd6IF_V0fC0dL5DYNRGTXj9WHVZm9wksv_lHG_u9PM6z5JMi3kaK5uxUe4cV53bYW_sUFhULcYA4ozV9quRJ9wQqlJuCN96Cz5FKG5bBkdPnJEdZ3ZXc5GriI7J8bMCdPLdJm3QoMgSWT9iJeXQSuYatPJWHto" className="h-full w-full object-cover rounded-md" alt="Agarbatti" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Agarbatti</p>
                                            <p className="text-xs text-gray-500">5 pkts in stock</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center rounded-full bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">Medium</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-6 text-[#ec7f13] text-sm font-medium hover:text-[#d47010] flex items-center justify-center gap-1 transition-colors">
                                View Full Inventory
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="bg-white dark:bg-[#2a2018] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-left">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Supply Hub Status</h3>
                            <div className="aspect-video w-full rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBo2MUSpqd6WhrNVIQovRfSn2FK2DivZWg1XMetiXKtrYifNgpuuIMUptnKm5U0bOtThmmtHI_i-0SaxX9ZRV8DgeCMnh_mfa6mtpbxC1EsGcHlCmQnIF4sVY4UbpmEmp_96TnGJN6xRxTfF1fony2MtRku8D2Dsuj_VfVoIvMyHbwAX2Xufd4ZfI3t5lplbsBcKaSd6Hehj51i_CRSZ8_sLZF4L1isd2sxUP8dp6_vaZrzK4sf1zHF97UXjOuWH0fX0JHOLDCCHQ" className="w-full h-full object-cover opacity-80" alt="Supply Map" />

                                <div className="absolute top-1/4 left-1/3 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" title="High Demand"></div>
                                <div className="absolute bottom-1/3 right-1/4 h-3 w-3 bg-green-500 rounded-full border-2 border-white" title="Stable Supply"></div>

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                    <p className="text-xs text-white font-medium">Patna Region: <span className="text-red-300">High Demand</span></p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
