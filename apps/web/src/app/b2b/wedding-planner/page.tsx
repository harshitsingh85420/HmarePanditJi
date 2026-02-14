"use client";

import React from "react";
import Link from "next/link";

export default function WeddingPlannerDashboardPage() {
    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] font-sans text-slate-900 dark:text-slate-100 min-h-screen flex h-screen overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-[#1152d4] flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">temple_hindu</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-none text-[#1152d4]">
                            HmarePanditJi
                        </h1>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#D4AF37]">
                            B2B Planner Portal
                        </p>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1152d4]/10 border-l-4 border-[#1152d4] text-[#1152d4] font-medium"
                        href="#"
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        Dashboard
                    </a>
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        href="#"
                    >
                        <span className="material-symbols-outlined">groups</span>
                        Client Lists
                    </a>
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        href="/b2b/bulk-booking"
                    >
                        <span className="material-symbols-outlined">
                            calendar_month
                        </span>
                        Wedding Calendar
                    </a>
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        href="#"
                    >
                        <span className="material-symbols-outlined">verified</span>
                        Preferred Pandits
                    </a>
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        href="/b2b/invoices/list"
                    >
                        <span className="material-symbols-outlined">receipt_long</span>
                        Bulk Invoices
                    </a>
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        href="#"
                    >
                        <span className="material-symbols-outlined">inventory_2</span>
                        Samagri Inventory
                    </a>
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
                    <a
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-4"
                        href="#"
                    >
                        <span className="material-symbols-outlined">settings</span>
                        Account Settings
                    </a>
                    <button className="w-full bg-[#FF9933] hover:bg-orange-500 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
                        <span className="material-symbols-outlined">add_circle</span>
                        New Booking
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            Professional Planner Portal
                        </h2>
                        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-slate-400 text-xl">
                                search
                            </span>
                            <input
                                className="bg-transparent border-none focus:ring-0 text-sm w-64 text-slate-800 dark:text-white placeholder-slate-400"
                                placeholder="Search events or Pandits..."
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                            <span className="material-symbols-outlined">
                                notifications
                            </span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:border-slate-700"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold leading-none">
                                    Wedding Artistry Co.
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    Gold Member
                                </p>
                            </div>
                            <div
                                className="size-10 rounded-full bg-slate-200 bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrqJ-5KPlAfISQm50DAsdrDemuPl2GjW8diG9x5vYi0NiAsQ_mpH0PMjm2m8qOLd-A_CEE6iNrVIVSv6P7Lc12uw1q_5FDcNQcjZbypq2mq6DkNRjrYNomsjHbpWcUCfYYZxIYHHazW7vsNgyILGJh7ZvbYJaYNmtGu1tjhi_F4DV0TcMzHS7_FH58IHY3dGwGPzJU2oDt3jRLN_kSycmByjBZ5mLKjHOSpLqDI7wSMS3W_Wz-7p3Az2Z2HYsd6OVK9-mlXsVMte8')",
                                }}
                            ></div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 space-y-8">
                    {/* Metrics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <span className="p-2 bg-[#1152d4]/10 text-[#1152d4] rounded-lg material-symbols-outlined">
                                    celebration
                                </span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                    +12%
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Total Weddings
                            </p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                                24
                            </h3>
                        </div>
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <span className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg material-symbols-outlined">
                                    person_check
                                </span>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    Stable
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Confirmed Pandits
                            </p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                                22
                            </h3>
                        </div>
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <span className="p-2 bg-[#FF9933]/10 text-[#FF9933] rounded-lg material-symbols-outlined">
                                    hourglass_top
                                </span>
                                <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                                    Action Required
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Pending Muhurat
                            </p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                                02
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Main Table: Upcoming Weddings */}
                        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 dark:text-white">
                                    Upcoming Weddings
                                </h3>
                                <button className="text-sm font-semibold text-[#1152d4] hover:underline">
                                    View All
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">
                                                Client Name
                                            </th>
                                            <th className="px-6 py-3 font-semibold">
                                                Wedding Date
                                            </th>
                                            <th className="px-6 py-3 font-semibold">
                                                Venue
                                            </th>
                                            <th className="px-6 py-3 font-semibold">
                                                Assigned Pandit
                                            </th>
                                            <th className="px-6 py-3 font-semibold text-center">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-sm">
                                                    Aditi &amp; Rahul
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    ID: HP-9021
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                Oct 12, 2023
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                Taj Palace, Delhi
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="size-6 rounded-full bg-slate-200 bg-cover bg-center"
                                                        style={{
                                                            backgroundImage:
                                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-F7u_fcyGTg7oZhWGwcREIiWDDx9X4vPyTmWtHFjyMrY9snI-GhlBN8GbrJJZPqq1qpQCZWKImBloo5uUFcZN5phpbsM80vZbil0O0GawREOylMnjATDrqe1TcteHTfBzJ7DY9gAxL3-sjojvtQCyIrAZRsfOZHAOQqiJmQViJB34VU6JN9dI1WZC9fPKdBPPl1ITTQ0Vo8pajXlu7mah8OoXEwFAgjLD_N0R0IavZc1l96cg5QztNWfGJApfhKm7jPmZP9n2k_o')",
                                                        }}
                                                    ></div>
                                                    <span className="text-sm font-medium">
                                                        Pt. Rajesh Sharma
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                                    Confirmed
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-sm">
                                                    Priya &amp; Amit
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    ID: HP-9044
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                Oct 18, 2023
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                The Leela, Mumbai
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="size-6 rounded-full bg-slate-200 bg-cover bg-center"
                                                        style={{
                                                            backgroundImage:
                                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvPMX1gNaiQwi7KYXTcvqaut7n9NqH6Xhot6aImt9Mm85QKZkmMibkzPG9l9SIJDofS9D4rwIpY_uFJAcQaol0madsMJKexmlO-vYHB45x7h0DgaFcxt-3HIg6aaNeC5J7RTKgnwVORALRV-akJ_lHZ8JPHFY3BupmJHhG_Hmuf1paEryZ2DDx5YfHYoeCgf1ftaNNmld3hgAnMdprF0lFEcEIBuBlyDA8eryUcDfTZ-pAPBXtRYWpgdqelYXDfnDHH4FBrGnV-L8')",
                                                        }}
                                                    ></div>
                                                    <span className="text-sm font-medium">
                                                        Pt. Vishnu Kant
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                                                    Pending
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-sm">
                                                    Sanya &amp; Vikram
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    ID: HP-9088
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                Nov 05, 2023
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                ITC Rajputana, Jaipur
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="size-6 rounded-full bg-slate-200 bg-cover bg-center"
                                                        style={{
                                                            backgroundImage:
                                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDcfTz9jUqvFrHV264f1xH3_FHhI0wkFuIb4XaiE_XSr3nnHUI7Uxc2Clz5q54nBg1iqFHejphW9mLAKVwN73yY0k2P_uS1iIvj0qaaqBA2CZOeEusnldMmotmXt1wssfx71U50iG6AGy33De7KOmX-laO2jap-al76hqJaUgy9DateH4U8731Fu1nkAw0PH1XIDvxuG6HA2JvlXhQNxGw0Qn1TXMxGiKeRqN_UuFEJq7CFaUiDpc1nPOHubCJ8nC-pMC6MLpYNKbA')",
                                                        }}
                                                    ></div>
                                                    <span className="text-sm font-medium">
                                                        Pt. G.N. Shastri
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                                    Confirmed
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Side Features */}
                        <div className="space-y-8">
                            {/* Quick Booking Feature */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#D4AF37]">
                                        bolt
                                    </span>
                                    <h3 className="font-bold text-slate-800 dark:text-white">
                                        Quick Booking
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    Saved frequent Pandit + Samagri combinations
                                </p>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-[#D4AF37] transition-all group bg-slate-50 dark:bg-slate-800">
                                        <p className="text-sm font-semibold group-hover:text-[#D4AF37] text-slate-700 dark:text-slate-200">
                                            Vedic Vivah Special
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            Senior Pandit + Full Havan Kit + GST
                                        </p>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-[#D4AF37] transition-all group bg-slate-50 dark:bg-slate-800">
                                        <p className="text-sm font-semibold group-hover:text-[#D4AF37] text-slate-700 dark:text-slate-200">
                                            Sangeet Sandhya Kit
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            Bhajan Group + Basic Samagri
                                        </p>
                                    </button>
                                </div>
                            </div>
                            {/* Bulk Invoices Feature */}
                            <div className="bg-[#1152d4] text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined">
                                            receipt_long
                                        </span>
                                        <h3 className="font-bold">Bulk Invoicing</h3>
                                    </div>
                                    <p className="text-sm text-blue-100 mb-4">
                                        Manage GST compliant invoices for all active
                                        events.
                                    </p>
                                    <button className="bg-white text-[#1152d4] text-xs font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                                        Generate Batch
                                    </button>
                                </div>
                                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-blue-400/20 text-9xl">
                                    account_balance_wallet
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preferred Pandit List */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#D4AF37]">
                                    star
                                </span>
                                <h3 className="font-bold text-slate-800 dark:text-white">
                                    Preferred Pandit List
                                </h3>
                            </div>
                            <span className="text-xs text-slate-400 italic">
                                Priority booking access enabled
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
                            {/* Pandit Card 1 */}
                            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="size-12 rounded-lg bg-cover bg-center"
                                        style={{
                                            backgroundImage:
                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4dSQ6ZOzOPi1BVup4WOyjdggnYyb6ifu0u0BEz8J09HBgZkjscVZ_SyL3YEcvHKdAldXcsKfaslr5Dlk4kgmWo_SY4lf4NakIlxPq-vJEB8pIG66z0O78jlLd6EcRAQGhHkVvkAXnan34Tp67cn01LHiAGxr_uc3kkXEAzX-KrRtx_2ROWBanC05i4rNRGGcV30QZ8a2N-25vl8_CnEyn7RxnIgxPDBhfSgbIBRw-8ajGaVNdRkospuciSUkwkf7KOCeQ4R_e5lY')",
                                        }}
                                    ></div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                            Pt. Rajesh Sharma
                                        </p>
                                        <div className="flex items-center gap-1 text-[#D4AF37]">
                                            <span className="material-symbols-outlined text-xs">
                                                star
                                            </span>
                                            <span className="text-xs font-bold">
                                                4.9
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">
                                    Specialization: Vedic Rituals, North Indian
                                    Weddings
                                </p>
                                <button className="w-full border border-[#1152d4] text-[#1152d4] text-[10px] font-bold py-1.5 rounded uppercase hover:bg-[#1152d4] hover:text-white transition-all">
                                    Instant Book
                                </button>
                            </div>
                            {/* Pandit Card 2 */}
                            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="size-12 rounded-lg bg-cover bg-center"
                                        style={{
                                            backgroundImage:
                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVCjmq-ujZXvZuy7VHtqbDm5kXoH25dewrdMtytV08uRjP3e1dVwwg0vpBWAo22uB9fJZ-vMBzeHpq7eDe_R6OugTfotRjgQmB3ItDTy4TRfx4fwKd9eUlcnnoTgMWCCYvAaJTlRbi1fuuRjLk1iPKIv6cQF-aFvVekb4edxkUdrHTQq7_OJD26IBGsS2B94kLk6vKsCBth0VXGLojjU6cdks6nTCwILyyXm898HwRz6WZ5jFCfxNCvq9Y4AITZ3xoXyXBoKzLx6Q')",
                                        }}
                                    ></div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                            Pt. K. Srinivasan
                                        </p>
                                        <div className="flex items-center gap-1 text-[#D4AF37]">
                                            <span className="material-symbols-outlined text-xs">
                                                star
                                            </span>
                                            <span className="text-xs font-bold">
                                                4.8
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">
                                    Specialization: Tamil/Telugu Brahmin Traditions
                                </p>
                                <button className="w-full border border-[#1152d4] text-[#1152d4] text-[10px] font-bold py-1.5 rounded uppercase hover:bg-[#1152d4] hover:text-white transition-all">
                                    Instant Book
                                </button>
                            </div>
                            {/* Pandit Card 3 */}
                            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="size-12 rounded-lg bg-cover bg-center"
                                        style={{
                                            backgroundImage:
                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1SyGQeh3HqUmVyWi4Z39olmoxvuV9UFAqB8IA0uPveYyE3ehGRSFX3R4rCBCpJmDtp6452ObOJ8NjIHob1wrZKMogv8wrea-WF_U7KVtWLuw9Qf5Z9PG5AuuGKJUETc_VlwNOEN0aMhnYj0q2Yweg5jxCAXsf7DnwjZqaLgiGDZdgxMgP7Ar3t3b559yah7LWDpxKWBwBWqf2354cUl4a2W3HvWl5hLoCIQhMpkhwrXJMsNm0Sni7iu-DQxiTGaG1ZjGSaoKhX3E')",
                                        }}
                                    ></div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                            Pt. G.N. Shastri
                                        </p>
                                        <div className="flex items-center gap-1 text-[#D4AF37]">
                                            <span className="material-symbols-outlined text-xs">
                                                star
                                            </span>
                                            <span className="text-xs font-bold">
                                                5.0
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">
                                    Specialization: Maharashtrian &amp; Marwari
                                    Rituals
                                </p>
                                <button className="w-full border border-[#1152d4] text-[#1152d4] text-[10px] font-bold py-1.5 rounded uppercase hover:bg-[#1152d4] hover:text-white transition-all">
                                    Instant Book
                                </button>
                            </div>
                            {/* Pandit Card 4 */}
                            <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="size-12 rounded-lg bg-cover bg-center"
                                        style={{
                                            backgroundImage:
                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtCPqy7vi96f7UefWAdolE6IJYW68DRe4V0ekv0GNAs8nO1EEeYmkr79r9Q5O_TWVOf5UBMhhE391qClVnAPRgP7vh9V5UUYqmn_NbD-O9pdi8SWG0irSGT8GcmBHfHcNVDDg5ZBQaDC04OWgXdmjkyRMJ7U9p-rn1sJMvf9XqTvnBGY3v_jdSkD52L9mrCc2AoDP2pXGUi55MotYvjsmZhnMtODVh_mPGkCotOo-sGhiQ9uHjn94jw-D3f39BmM-FSxRYTZhONGo')",
                                        }}
                                    ></div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                            Pt. Vishnu Kant
                                        </p>
                                        <div className="flex items-center gap-1 text-[#D4AF37]">
                                            <span className="material-symbols-outlined text-xs">
                                                star
                                            </span>
                                            <span className="text-xs font-bold">
                                                4.7
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">
                                    Specialization: Destination Weddings, Modern
                                    Rituals
                                </p>
                                <button className="w-full border border-[#1152d4] text-[#1152d4] text-[10px] font-bold py-1.5 rounded uppercase hover:bg-[#1152d4] hover:text-white transition-all">
                                    Instant Book
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-8 mt-auto text-center border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <p className="text-xs text-slate-400">
                        © 2023 HmarePanditJi B2B Solutions. All rights reserved. GST
                        Registered.
                    </p>
                </footer>
            </main>
        </div>
    );
}
