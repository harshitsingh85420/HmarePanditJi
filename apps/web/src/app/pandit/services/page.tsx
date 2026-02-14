"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ServicesPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8f6f6] dark:bg-[#221610] text-slate-900 dark:text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#18181b] border-r border-slate-200 dark:border-zinc-800 flex flex-col hidden md:flex">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-[#ec5b13] p-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-white">temple_hindu</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">HmarePanditJi</h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">Pandit Dashboard</p>
                    </div>
                </div>
                <nav className="flex-1 px-3 space-y-1">
                    <Link
                        href="/pandit/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span className="text-sm font-medium">Overview</span>
                    </Link>
                    <Link
                        href="/pandit/services"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#ec5b13]/10 border-l-4 border-[#ec5b13] text-[#ec5b13] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                        <span className="text-sm font-medium">My Packages</span>
                    </Link>
                    <Link
                        href="/pandit/analytics"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            notifications_active
                        </span>
                        <span className="text-sm font-medium">Price Alerts</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">public</span>
                        <span className="text-sm font-medium">Regional Settings</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        <span className="text-sm font-medium">Support</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#ec5b13] text-white rounded-xl font-semibold text-sm hover:bg-[#ec5b13]/90 shadow-lg shadow-[#ec5b13]/20 transition-all">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Add New Package
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#f8f6f6] dark:bg-[#221610]">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-8 py-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-1">
                            <span>My Packages</span>
                            <span className="material-symbols-outlined text-[14px]">
                                chevron_right
                            </span>
                            <span className="text-[#ec5b13] font-medium">Wedding - Premium</span>
                        </div>
                        <h2 className="text-2xl font-bold">Wedding - Premium</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                search
                            </span>
                            <input
                                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#ec5b13]/50 w-64 text-slate-900 dark:text-white"
                                placeholder="Search samagri..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-zinc-800">
                            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-[#ec5b13]/20 flex items-center justify-center text-[#ec5b13] font-bold overflow-hidden">
                                <div
                                    className="w-full h-full bg-cover"
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCSS7Jre5Ox9TpMW9hdNmVw7TgjZ63ETSI4SpA90rvIQkmevLOZBn4MNEYg8wn5xqChU_NvVTQo-ZvXUfsoWYUYAQzSpONhtwZbETN0cFbSnq9Wml-44ERyQxkXRBBOnuzX763NG26AZrUxUJ_gCtotDSofPkzF88IfkK58OVaAdoUitWko54oj-v6XgFay1C92OMDLQ0J4uzTv4m5jqFYdyv-SEZd9sK5BrFyjuxDA3VUjIJLCaxgx40xaOBObuXGozGK1b_8Cu6E")',
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                    {/* Metrics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                                    Fixed Package Price
                                </p>
                                <span className="bg-[#ec5b13]/10 text-[#ec5b13] p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-[20px]">
                                        payments
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-end gap-3">
                                <h3 className="text-3xl font-black">₹8,000</h3>
                                <span className="text-emerald-500 text-sm font-bold flex items-center mb-1">
                                    <span className="material-symbols-outlined text-[16px]">
                                        trending_up
                                    </span>
                                    5% last month
                                </span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                                    Total Samagri Items
                                </p>
                                <span className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-[20px]">
                                        list_alt
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-end gap-3">
                                <h3 className="text-3xl font-black">42 Items</h3>
                                <span className="text-blue-500 text-sm font-medium flex items-center mb-1">
                                    +3 recently added
                                </span>
                            </div>
                        </div>
                        <div className="bg-[#ec5b13]/5 dark:bg-[#ec5b13]/10 p-6 rounded-2xl border border-[#ec5b13]/20 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <p className="text-sm font-bold text-[#ec5b13]">
                                    Inventory Alert
                                </p>
                                <span className="material-symbols-outlined text-[#ec5b13] text-[24px] animate-pulse">
                                    warning
                                </span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-slate-700 dark:text-zinc-200 text-lg font-bold">
                                    Ghee prices up 15%
                                </p>
                                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 italic">
                                    Market trend in Delhi NCR region
                                </p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <span className="material-symbols-outlined text-[100px] text-[#ec5b13]">
                                    trending_up
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Samagri List Section */}
                    <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold">Itemized Samagri List</h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">
                                    Manage items and regional specific inclusions
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 border border-[#ec5b13] text-[#ec5b13] rounded-xl font-semibold text-sm hover:bg-[#ec5b13] hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-[18px]">
                                        mic
                                    </span>
                                    Add Item (Voice)
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#ec5b13] text-white rounded-xl font-semibold text-sm hover:bg-[#ec5b13]/90 transition-all">
                                    <span className="material-symbols-outlined text-[18px]">
                                        add
                                    </span>
                                    Add New Item
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-zinc-800/50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Samagri Item
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Regional Rule
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Price Impact
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                    {/* Row 1 */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                                    <span className="material-symbols-outlined text-[20px]">spa</span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    Pure Desi Ghee
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">2 kg</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                                                Universal
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#ec5b13] font-bold">
                                                ₹1,450
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-[#ec5b13] transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        edit
                                                    </span>
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        delete
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Row 2 */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        gesture
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    Moly Thread
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">5 Units</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/20 text-[#ec5b13] rounded-lg text-xs font-bold border border-[#ec5b13]/20">
                                                North India Only
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-zinc-500 font-bold">₹150</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-[#ec5b13] transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        edit
                                                    </span>
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        delete
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Row 3 */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        water_drop
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    Ganga Jal (Purified)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">500 ml</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                                                Universal
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-zinc-500 font-bold">₹80</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-[#ec5b13] transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        edit
                                                    </span>
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        delete
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Row 4 */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        nutrition
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    Saffron (Kesar)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">2 grams</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/20 text-[#ec5b13] rounded-lg text-xs font-bold border border-[#ec5b13]/20">
                                                Elite Packages Only
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#ec5b13] font-bold">₹950</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-[#ec5b13] transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        edit
                                                    </span>
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        delete
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/30 border-t border-slate-200 dark:border-zinc-800 text-center">
                            <button className="text-[#ec5b13] font-bold text-sm hover:underline underline-offset-4">
                                Load 38 more items
                            </button>
                        </div>
                    </div>

                    {/* Manual Entry Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-24">
                        <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#ec5b13]">
                                    keyboard
                                </span>
                                Manual Quick Add
                            </h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                                            Item Name
                                        </label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#ec5b13]/50 text-sm text-slate-900 dark:text-white"
                                            placeholder="e.g. Incense Sticks"
                                            type="text"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                                            Quantity
                                        </label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#ec5b13]/50 text-sm text-slate-900 dark:text-white"
                                            placeholder="e.g. 2 Packets"
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-zinc-900 dark:bg-zinc-700 text-white font-bold rounded-xl hover:bg-black dark:hover:bg-zinc-600 transition-colors">
                                    Update Samagri List
                                </button>
                            </div>
                        </div>
                        <div className="bg-[#ec5b13]/5 dark:bg-[#ec5b13]/10 p-6 rounded-2xl border border-dashed border-[#ec5b13]/40 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-[#ec5b13] text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#ec5b13]/30">
                                <span className="material-symbols-outlined text-[32px]">mic</span>
                            </div>
                            <h4 className="font-bold text-[#ec5b13] text-lg">
                                Voice Smart Input
                            </h4>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-[280px] mt-1">
                                "Add 5 liters of Desi Ghee for North India rituals"
                            </p>
                            <div className="flex gap-1 mt-4">
                                <div className="w-1 h-4 bg-[#ec5b13] rounded-full animate-bounce"></div>
                                <div
                                    className="w-1 h-8 bg-[#ec5b13] rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                    className="w-1 h-6 bg-[#ec5b13] rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                ></div>
                                <div
                                    className="w-1 h-8 bg-[#ec5b13] rounded-full animate-bounce"
                                    style={{ animationDelay: "0.3s" }}
                                ></div>
                                <div
                                    className="w-1 h-4 bg-[#ec5b13] rounded-full animate-bounce"
                                    style={{ animationDelay: "0.4s" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="sticky bottom-0 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">
                            check_circle
                        </span>
                        <span className="text-sm font-medium">
                            All changes auto-saved to Draft
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                            Discard Changes
                        </button>
                        <button className="px-8 py-2.5 bg-[#ec5b13] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ec5b13]/30 hover:bg-[#ec5b13]/90 transition-all">
                            Publish Updated Package
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
