"use client";

import React from "react";

export default function BulkBookingDashboardPage() {
    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] font-sans text-gray-800 dark:text-gray-100 min-h-screen flex flex-col">
            {/* Navbar */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#0f49bd] flex items-center justify-center text-white font-bold text-lg">
                                H
                            </div>
                            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                                HmarePanditJi{" "}
                                <span className="text-[#0f49bd] font-normal text-sm bg-[#0f49bd]/10 px-1.5 py-0.5 rounded ml-1">
                                    B2B
                                </span>
                            </span>
                        </div>
                        {/* Main Nav */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <a href="#" className="text-[#0f49bd] hover:text-[#0c3b9b]">
                                Dashboard
                            </a>
                            <a
                                href="#"
                                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                Bookings
                            </a>
                            <a
                                href="#"
                                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                Pandit Network
                            </a>
                            <a
                                href="#"
                                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                Finance
                            </a>
                        </nav>
                    </div>
                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Global Search */}
                        <div className="relative hidden lg:block">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-icons text-gray-400 text-lg">
                                    search
                                </span>
                            </span>
                            <input
                                type="text"
                                placeholder="Search client, booking ID..."
                                className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#0f49bd]/50 text-gray-900 dark:text-white placeholder-gray-500"
                            />
                        </div>
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <span className="material-icons">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff9933] rounded-full border border-white dark:border-gray-900"></span>
                        </button>
                        {/* Profile */}
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Arjun Wedding Logistics
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Premium Partner
                                </p>
                            </div>
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqClYMu5McPPEP4iTTY-3PWwuR1Qc01PT_LcYImM981l9P4cCgzKcjGdwIIzigiBTithhxHqvaTLd_M0f_9MROy0aBFyaBlTrhMP0s_CMSbQiiNeON8j3LRrEPO6nRy0QtXhdUcSJPy6Hp1TbuoaHUZ8h77HsNZV8GZ1rZElP-aynD8GTHq3eJMJrfs5lZ9ftvqsUpymdcI-DwMpEqIO2GuXxVZTyuPV9Ck4rmCEMjgJOIA0ZxZaJDrD-Gu3ILicfCuDFZUHoF14Y"
                                alt="Profile"
                                className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                        </div>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-hidden flex flex-col h-full">
                {/* Page Header & Metrics */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Active Bulk Bookings
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Managing real-time logistics for upcoming auspicious dates.
                            </p>
                        </div>
                        {/* Top Summary Cards (Mini) */}
                        <div className="flex gap-3">
                            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                                <div className="bg-[#0f49bd]/10 p-2 rounded-full text-[#0f49bd]">
                                    <span className="material-icons text-base">event</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">
                                        Active
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                        14
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                                <div className="bg-[#ff9933]/10 p-2 rounded-full text-[#ff9933]">
                                    <span className="material-icons text-base">commute</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">
                                        Traveling
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                        6
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 shadow-sm flex items-center gap-3">
                                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full text-red-600">
                                    <span className="material-icons text-base">warning</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">
                                        Alerts
                                    </p>
                                    <p className="text-lg font-bold text-red-600 leading-none">
                                        2
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Toolbar: Actions & Filters */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                        {/* Filters Group */}
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                            {/* Date Range */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400 text-sm">
                                        calendar_today
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value="Nov 24 - Nov 26"
                                    className="pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-[#0f49bd] focus:border-[#0f49bd] w-48 transition-shadow"
                                />
                                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400 text-sm">
                                        arrow_drop_down
                                    </span>
                                </div>
                            </div>
                            {/* Location Filter */}
                            <div className="relative">
                                <select className="pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-[#0f49bd] focus:border-[#0f49bd] appearance-none w-40">
                                    <option>All Locations</option>
                                    <option>Mumbai</option>
                                    <option>Delhi NCR</option>
                                    <option>Bangalore</option>
                                    <option>Udaipur</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400 text-sm">
                                        place
                                    </span>
                                </div>
                            </div>
                            {/* Status Filter */}
                            <div className="relative">
                                <select className="pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-[#0f49bd] focus:border-[#0f49bd] appearance-none w-40">
                                    <option>All Statuses</option>
                                    <option>Assigned</option>
                                    <option>Traveling</option>
                                    <option>At Venue</option>
                                    <option>Issue Reported</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400 text-sm">
                                        filter_list
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Primary Actions Group */}
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#0f49bd]/10 hover:bg-[#0f49bd]/20 text-[#0f49bd] rounded-lg text-sm font-medium transition-colors border border-[#0f49bd]/20">
                                <span className="material-icons text-sm">download</span>
                                Bulk Itineraries
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#ff9933]/10 hover:bg-[#ff9933]/20 text-[#a86521] dark:text-[#ff9933] rounded-lg text-sm font-medium transition-colors border border-[#ff9933]/20">
                                <span className="material-icons text-sm">calculate</span>
                                Samagri Costs
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#0f49bd] hover:bg-[#0c3b9b] text-white rounded-lg text-sm font-medium shadow-md shadow-[#0f49bd]/20 transition-all hover:shadow-lg hover:shadow-[#0f49bd]/30">
                                <span className="material-icons text-sm">send</span>
                                Message Pandits
                            </button>
                        </div>
                    </div>
                </div>
                {/* Data Table Container */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 w-12 border-b border-gray-200 dark:border-gray-700">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-gray-800"
                                        />
                                    </th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                        Client / ID
                                    </th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                        Date &amp; Time
                                    </th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                        Venue &amp; Location
                                    </th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                        Pandit Assigned
                                    </th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                        Backup Status
                                    </th>
                                    <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                {/* Row 1: Active / Traveling */}
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 align-middle">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-gray-800"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Sharma-Verma Wedding
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                                            BK-2023-892
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="text-gray-900 dark:text-gray-200">
                                            Nov 24, 2023
                                        </div>
                                        <div className="text-xs text-gray-500">10:00 AM</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-start gap-2">
                                            <div className="mt-0.5">
                                                <div className="font-medium text-gray-900 dark:text-gray-200">
                                                    Grand Hyatt
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Santacruz, Mumbai
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWNoP4y6NuDDIfCJuUSJAqnywhy3U2Yzr0OBO1v0kqLodpcJmWxln4PBHM-Dvc6LC7HQHvB6mhQOa7kGo9HOufvDtrlbG2PcCGCwjeuWojdNm3WURM25LbL-Fwws8c9tYSimLNFMWoBXfnb3Rf3UwEls6RNQ3PXjYngR-ETh7vmH_CBCUvvzMpaQk4lF7UOv94wGlPS8J7eNWKz9oBo2AGJIyIYDxmAIGKm7KbSD5bEKDPYGr8G_t8pOerl9hdnCp_06lWcRu3vl8"
                                                alt="Pandit Profile"
                                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    Pt. R. Sharma
                                                </div>
                                                <div className="text-xs text-[#0f49bd] cursor-pointer hover:underline">
                                                    View Profile
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff9933]/10 text-orange-700 dark:text-orange-400 border border-[#ff9933]/20">
                                            <span className="w-1.5 h-1.5 bg-[#ff9933] rounded-full mr-1.5 animate-pulse"></span>
                                            Traveling
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <span className="material-icons text-green-500 text-sm">
                                                check_circle
                                            </span>
                                            <span className="text-xs">Ready (Pt. J. Joshi)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons text-lg">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 2: At Venue */}
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 align-middle">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-gray-800"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Gupta Wedding
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                                            BK-2023-894
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="text-gray-900 dark:text-gray-200">
                                            Nov 24, 2023
                                        </div>
                                        <div className="text-xs text-gray-500">06:00 PM</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                                ITC Gardenia
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Residency Rd, Bangalore
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo-YocNSAhVG9Z_OIv6YSemFYhrjN_ZfmSe24jx9Zysf9cIUKip7b0vWlyPaAps2VW17pw8JEBuOKh7dutMfJZ0HOSEUVt2gPzdeCrALHWDKuxwSLyjx8j7mBjpVvhUaihafpVj2KMNjxgkh2ojIGfQG_rxEU6cb3zYpnJabCoBJLFud5eWzAYVSiEbIGZKNHxdZcPErB9x5Ld24P5yFsb72CtC3vsakHzLyDYK0WgE4X2LIqvSdfim5Zrro6QXNH0RFnZsfXY_Js"
                                                alt="Pandit Profile"
                                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    Pt. A. Mishra
                                                </div>
                                                <div className="text-xs text-[#0f49bd] cursor-pointer hover:underline">
                                                    View Profile
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                            At Venue
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <span className="material-icons text-gray-400 text-sm">
                                                remove_circle_outline
                                            </span>
                                            <span className="text-xs">Not Required</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons text-lg">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 3: Issue */}
                                <tr className="bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
                                    <td className="px-6 py-4 align-middle">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-gray-800"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Singh-Kaur Wedding
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                                            BK-2023-901
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="text-gray-900 dark:text-gray-200">
                                            Nov 25, 2023
                                        </div>
                                        <div className="text-xs text-gray-500">09:30 AM</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                                The Oberoi
                                            </div>
                                            <div className="text-xs text-gray-500">Gurgaon, NCR</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                                Pt
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    Pt. V. Tiwari
                                                </div>
                                                <div className="text-xs text-red-600 font-medium">
                                                    Unreachable
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                            <span className="material-icons text-[14px] mr-1">
                                                warning
                                            </span>{" "}
                                            Issue
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <button className="flex items-center gap-2 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-white shadow-sm hover:border-[#0f49bd] hover:text-[#0f49bd] transition-colors">
                                            <span className="material-icons text-sm text-yellow-500">
                                                notification_important
                                            </span>
                                            Activate Backup
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons text-lg">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 4: Assigned */}
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 align-middle">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-gray-800"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Patel Engagement
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                                            BK-2023-910
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="text-gray-900 dark:text-gray-200">
                                            Nov 25, 2023
                                        </div>
                                        <div className="text-xs text-gray-500">02:00 PM</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                                Taj Lake Palace
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Udaipur, Rajasthan
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlvusViyobEJVQidejXaN81pwVB8UVWPC5fBAoraZih__9vpnUXfheCh6oomw0iIWhgV-pu9pp0s9CK-66h-l9Xb2tj6YW8bTlGimj6qfv0K8wiUjJ9APDNhOf9iPmURv87PkxXA2XpsKT2L8TwBW3QkZJbsQDLkBX7LyXZxnxqgBXx-FWjqlqa_5Qys31L-EtyNrpioHK11dxB6CD7Vvr6ka1dWLvsO7WHOIdVBsMXSqiCuZI5tMDn6w-6Cjf59p50sps6Hgbxm0"
                                                alt="Pandit Profile"
                                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    Pt. S. Patel
                                                </div>
                                                <div className="text-xs text-[#0f49bd] cursor-pointer hover:underline">
                                                    View Profile
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                            Assigned
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <span className="material-icons text-green-500 text-sm">
                                                check_circle
                                            </span>
                                            <span className="text-xs">Ready (Pt. K. Trivedi)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons text-lg">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 5: Traveling */}
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 align-middle">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-gray-800"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Reddy Wedding
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                                            BK-2023-912
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="text-gray-900 dark:text-gray-200">
                                            Nov 25, 2023
                                        </div>
                                        <div className="text-xs text-gray-500">07:00 PM</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                                Novotel
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                HITEC City, Hyderabad
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkT7Q1TLY6FuY701UAvyWn7V64M3Xkdg6wyaEoIsErs6xxSkxnY71qbuq3JBq-BIgGddalsZyRQrQLiD1zTSGZxHaA_Y0uggwJz-TXHezPcM-51nEWGdk9LVGuuCh-lOy6mkfeNx3MQW091bAFisR8QYI5Dw6XQs8VJYoi_16cYWwFb6dFCekNY8UuFZZMLMn0EJKhq7SVtPKvv41H9apKMkLU1Uq5HTGIqmHCGjGBH-a3q1812FdtNrLl9MOjZcZvSI17MVUAMJ4"
                                                alt="Pandit Profile"
                                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    Pt. K. Acharya
                                                </div>
                                                <div className="text-xs text-[#0f49bd] cursor-pointer hover:underline">
                                                    View Profile
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff9933]/10 text-orange-700 dark:text-orange-400 border border-[#ff9933]/20">
                                            <span className="w-1.5 h-1.5 bg-[#ff9933] rounded-full mr-1.5 animate-pulse"></span>
                                            Traveling
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-900/30">
                                            <span className="material-icons text-sm">
                                                warning_amber
                                            </span>
                                            <span className="text-xs">Unassigned</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons text-lg">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 6: Assigned */}
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 align-middle">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-gray-800"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Iyer Sangeet
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                                            BK-2023-915
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="text-gray-900 dark:text-gray-200">
                                            Nov 26, 2023
                                        </div>
                                        <div className="text-xs text-gray-500">11:00 AM</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">
                                                Private Villa
                                            </div>
                                            <div className="text-xs text-gray-500">Lonavala, MH</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-[#0f49bd]/10 flex items-center justify-center text-[#0f49bd] text-xs font-bold">
                                                Pt
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    Pt. N. Iyer
                                                </div>
                                                <div className="text-xs text-[#0f49bd] cursor-pointer hover:underline">
                                                    View Profile
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                            Assigned
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <span className="material-icons text-green-500 text-sm">
                                                check_circle
                                            </span>
                                            <span className="text-xs">Ready (Pt. S. Rao)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-icons text-lg">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Table Footer */}
                    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Showing 1 to 6 of 14 bookings
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 disabled:opacity-50">
                                Previous
                            </button>
                            <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
