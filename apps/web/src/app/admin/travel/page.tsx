"use client";

import React from "react";
import Link from "next/link";

export default function AdminTravelPage() {
    return (
        <div className="bg-[#f8f7f5] dark:bg-[#221a10] font-sans text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    {/* Top Navigation Bar */}
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] px-10 py-3 sticky top-0 z-50">
                        <div className="flex items-center gap-8">
                            <Link href="/admin" className="flex items-center gap-4 text-[#f49d25]">
                                <div className="size-8 flex items-center justify-center bg-[#f49d25]/10 rounded-lg">
                                    <span className="material-symbols-outlined">
                                        temple_hindu
                                    </span>
                                </div>
                                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                                    HmarePanditJi Admin
                                </h2>
                            </Link>
                            <nav className="flex items-center gap-6">
                                <Link
                                    className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f49d25] transition-colors"
                                    href="/admin/dashboard"
                                >
                                    Dashboard
                                </Link>
                                <a
                                    className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f49d25] transition-colors"
                                    href="#"
                                >
                                    Religious Services
                                </a>
                                <Link
                                    className="text-[#f49d25] text-sm font-bold border-b-2 border-[#f49d25] py-1"
                                    href="/admin/travel"
                                >
                                    Travel Ops
                                </Link>
                                <a
                                    className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#f49d25] transition-colors"
                                    href="#"
                                >
                                    Risk Management
                                </a>
                            </nav>
                        </div>
                        <div className="flex flex-1 justify-end gap-4 items-center">
                            <label className="flex flex-col min-w-40 h-10 max-w-64">
                                <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-zinc-800">
                                    <div className="text-slate-400 flex items-center justify-center pl-4">
                                        <span className="material-symbols-outlined text-[20px]">
                                            search
                                        </span>
                                    </div>
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-slate-400 px-2 text-sm font-normal"
                                        placeholder="Search trips, pandits..."
                                    />
                                </div>
                            </label>
                            <div className="flex gap-2">
                                <button className="relative flex items-center justify-center rounded-lg size-10 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700">
                                    <span className="material-symbols-outlined">
                                        notifications
                                    </span>
                                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                                </button>
                                <button className="flex items-center justify-center rounded-lg size-10 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700">
                                    <span className="material-symbols-outlined">
                                        account_circle
                                    </span>
                                </button>
                            </div>
                            <div className="bg-[#f49d25]/20 rounded-full size-10 flex items-center justify-center text-[#f49d25] font-bold overflow-hidden border-2 border-[#f49d25]/50">
                                <div
                                    className="w-full h-full bg-cover"
                                    style={{
                                        backgroundImage:
                                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMPFoN3iIApXNWx5D8JTcVtZoaf2YJ_nvx0zE11hyrKaClvTRGa7bZvVti7Q6LPt3Nu0mTLPd6OmcAf3hxd6ZcTjz_rVjZa-AFLxgrKD_oTlmG0tsEAcL45JFdhwxpuHgDo2rCV_n4VhkcXNmD8G4aITBn-Su_6_KimrBr0dmTE8LdBGFnzFLsvJWYeT7etBktEn7W3N6gL0FZFbYF8NtkraWSbU5ZM42kLP-tdhjEMQzyi6_bOj8RD4Zv9DHwKfeS9GTj8erELPg')",
                                    }}
                                ></div>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full p-6 gap-6">
                        {/* Hero Title */}
                        <div className="flex flex-wrap justify-between items-end gap-3">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="flex size-3 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-[#f49d25] text-sm font-bold uppercase tracking-wider">
                                        Live Monitoring
                                    </p>
                                </div>
                                <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                                    Travel Operations Center - 24/7 Helpline Active
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                                    Real-time monitoring and logistics management for all
                                    ongoing priest travels.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-[#f49d25] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#f49d25]/90">
                                    <span className="material-symbols-outlined">add</span>{" "}
                                    New Manual Trip
                                </button>
                            </div>
                        </div>
                        {/* Stats Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                                <p className="text-slate-500 text-xs font-bold uppercase">
                                    Total Active Travels
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    124
                                </p>
                            </div>
                            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-green-500">
                                <p className="text-slate-500 text-xs font-bold uppercase">
                                    On Track
                                </p>
                                <p className="text-2xl font-black text-green-500">112</p>
                            </div>
                            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#f49d25]">
                                <p className="text-slate-500 text-xs font-bold uppercase">
                                    Delayed
                                </p>
                                <p className="text-2xl font-black text-[#f49d25]">9</p>
                            </div>
                            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-red-500">
                                <p className="text-slate-500 text-xs font-bold uppercase">
                                    Emergency / Blocked
                                </p>
                                <p className="text-2xl font-black text-red-500">3</p>
                            </div>
                        </div>
                        {/* Main Split Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left: List View */}
                            <div className="lg:col-span-8 flex flex-col gap-4">
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f49d25] text-white px-4 text-sm font-bold">
                                        All Travels{" "}
                                        <span className="bg-white/20 px-1.5 rounded">
                                            124
                                        </span>
                                    </button>
                                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-4 text-sm font-medium">
                                        Delayed{" "}
                                        <span className="bg-[#f49d25]/20 text-[#f49d25] px-1.5 rounded">
                                            9
                                        </span>
                                    </button>
                                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-4 text-sm font-medium">
                                        Emergency{" "}
                                        <span className="bg-red-500/20 text-red-500 px-1.5 rounded">
                                            3
                                        </span>
                                    </button>
                                </div>
                                <div className="bg-white dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                                                    Trip ID
                                                </th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                                                    Service
                                                </th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                                                    Current Location
                                                </th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                                                    ETA Offset
                                                </th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                            <tr className="bg-[#f49d25]/5 border-l-4 border-l-[#f49d25]">
                                                <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                                                    HPJ-1257
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">
                                                            Mumbai Wedding
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            Pandit G. Sharma
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="bg-[#f49d25] text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                                                        Delayed
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    Kalyan Junction
                                                </td>
                                                <td className="px-4 py-4 text-[#f49d25] font-bold text-sm">
                                                    +45 min
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button className="text-[#f49d25] text-xs font-black hover:underline uppercase">
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                                                    HPJ-1302
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">
                                                            Varanasi Puja
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            Pandit R. Mishra
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="bg-green-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                                                        On Track
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    Varanasi Cantt
                                                </td>
                                                <td className="px-4 py-4 text-green-500 font-bold text-sm">
                                                    On Time
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button className="text-slate-400 text-xs font-black hover:underline uppercase">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="bg-red-500/5 border-l-4 border-l-red-500">
                                                <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                                                    HPJ-1188
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">
                                                            Delhi Havan
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            Pandit A. Tiwari
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                                                        Emergency
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    New Delhi
                                                </td>
                                                <td className="px-4 py-4 text-red-500 font-bold text-sm">
                                                    Stopped
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button className="text-red-500 text-xs font-black hover:underline uppercase animate-pulse">
                                                        Alert Admin
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Right: Detailed Card & Action Panel */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="bg-white dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50">
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            HPJ-1257 | Mumbai Wedding
                                        </h3>
                                        <span className="material-symbols-outlined text-slate-400">
                                            open_in_full
                                        </span>
                                    </div>
                                    <div className="p-4 flex flex-col gap-4">
                                        {/* Mini Map */}
                                        <div className="w-full h-40 rounded-lg bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                                            <div
                                                className="w-full h-full bg-cover"
                                                style={{
                                                    backgroundImage:
                                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCtxAn63IIMsNgCkzhXfOSNigmmQhQHUI0HNUjGVAwDvwKWiLiSkBr1eBTN77tMnDLHcLn0xn2alJNzMTytqUYRu7zBVEKuj8NvV_I5H1iGOGQ0CJWK9lovF7ISDtWtHT17bX2WflBB_qUd7p58_eOsabiyYtXQVpzu1bVIKkEGRJR4U7kufmiT2Gfc3yydCTNteJs51ZOR9kc-aVFlW63qxdwOg3frP4jIa2JOLqrR34vCr1_CzZHhdpddyn9SCgbN3ePtlBSdCRQ')",
                                                }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative">
                                                    <span className="material-symbols-outlined text-[#f49d25] text-4xl">
                                                        person_pin_circle
                                                    </span>
                                                    <div className="absolute top-0 right-0 size-2 bg-red-500 rounded-full animate-ping"></div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
                                                GPS: 19.2344° N, 73.1298° E
                                            </div>
                                        </div>
                                        {/* Logistics Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                                    Train Status
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[#f49d25] text-sm">
                                                        train
                                                    </span>
                                                    <span className="text-sm font-bold text-[#f49d25]">
                                                        45 min delay
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                                    Next Stop
                                                </span>
                                                <span className="text-sm font-bold">
                                                    Thane Jn.
                                                </span>
                                            </div>
                                        </div>
                                        <hr className="border-slate-100 dark:border-zinc-800" />
                                        {/* Customer Info */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-400">
                                                        person
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">
                                                        Rahul Malhotra
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        Customer (Wedding Host)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="size-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm">
                                                        call
                                                    </span>
                                                </button>
                                                <button className="size-8 rounded-lg bg-[#f49d25] text-white flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm">
                                                        chat
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        {/* Action Panel */}
                                        <div className="flex flex-col gap-2 pt-2">
                                            <button className="w-full py-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700">
                                                <span className="material-symbols-outlined text-sm">
                                                    campaign
                                                </span>{" "}
                                                Alert Customer
                                            </button>
                                            <button className="w-full py-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700">
                                                <span className="material-symbols-outlined text-sm">
                                                    local_taxi
                                                </span>{" "}
                                                Arrange Cab from Kalyan
                                            </button>
                                            <div className="mt-4 p-4 border-2 border-dashed border-red-500/50 rounded-xl bg-red-500/5 flex flex-col gap-4">
                                                <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                                                    <span className="material-symbols-outlined">
                                                        verified_user
                                                    </span>{" "}
                                                    ACTIVATE BACKUP PANDIT
                                                </button>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-red-500 mb-2">
                                                        Available Local Backups
                                                        (Thane/Mumbai)
                                                    </p>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-red-500/20">
                                                            <span className="text-xs font-medium">
                                                                Pandit V. Kulkarni
                                                            </span>
                                                            <span className="text-[10px] bg-green-500/10 text-green-500 px-1 rounded">
                                                                5km away
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-red-500/20 opacity-60">
                                                            <span className="text-xs font-medium">
                                                                Pandit M. Joshi
                                                            </span>
                                                            <span className="text-[10px] bg-slate-500/10 text-slate-500 px-1 rounded">
                                                                12km away
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    {/* API Footer */}
                    <footer className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 px-10 py-4 mt-auto">
                        <div className="max-w-[1440px] mx-auto flex flex-wrap justify-between items-center gap-4">
                            <div className="flex gap-8">
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-green-500 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        IRCTC API: CONNECTED
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-green-500 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        MMT API: LIVE
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-yellow-500 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        UBER API: LATENCY
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                                © 2024 HmarePanditJi Operations - Internal Use Only
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
