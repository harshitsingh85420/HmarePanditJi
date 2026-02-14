"use client";

import React from "react";

export default function AdminPnrManagementPage() {
    return (
        <div className="bg-[#f8fafc] text-[#1e293b] font-sans antialiased min-h-screen flex text-sm">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 h-screen fixed left-0 top-0 z-20 flex flex-col border-r border-slate-800">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#137fec] flex items-center justify-center text-white font-bold">
                            HP
                        </div>
                        <h1 className="text-white font-bold text-lg tracking-tight">
                            HmarePanditJi
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 pl-11">
                        Admin Console
                    </p>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <a
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        href="#"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            dashboard
                        </span>
                        Dashboard
                    </a>
                    <a
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-white bg-[#137fec] transition-colors"
                        href="#"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            train
                        </span>
                        Travel Queue
                        <span className="ml-auto bg-[#0f65bd] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            7
                        </span>
                    </a>
                    {/* Other links... */}
                    <a
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        href="#"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            verified_user
                        </span>
                        Verification
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 bg-[#f8fafc] min-h-screen">
                <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-sm text-[#64748b]">
                        <a className="hover:text-[#137fec]" href="#">
                            Travel Queue
                        </a>
                        <span className="material-symbols-outlined text-[16px]">
                            chevron_right
                        </span>
                        <span className="font-medium text-[#1e293b]">
                            Booking #HPJ-2026-1045
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-[#64748b] hover:bg-slate-100 rounded-full">
                            <span className="material-symbols-outlined">
                                notifications
                            </span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1e293b]">
                                Travel Detail &amp; PNR Entry
                            </h1>
                            <p className="text-[#64748b] mt-1">
                                Confirm ticket details for Pandit Ji's journey
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="border border-red-200 bg-white text-red-600 hover:bg-red-50 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">
                                    report_problem
                                </span>
                                Report Issue
                            </button>
                            <button className="border border-[#e2e8f0] bg-white text-[#1e293b] hover:bg-slate-50 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">
                                    arrow_back
                                </span>
                                Back to Queue
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* Left Column: Context */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Requirement Card */}
                            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                        Journey Requirement
                                    </h3>
                                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                                        Pending Booking
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1">
                                        <p className="text-xs text-[#64748b]">From</p>
                                        <p className="font-semibold text-lg text-[#1e293b]">
                                            Varanasi (BSB)
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="material-symbols-outlined text-[#64748b]">
                                            arrow_right_alt
                                        </span>
                                        <span className="text-[10px] text-[#64748b] font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                            TRAIN
                                        </span>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <p className="text-xs text-[#64748b]">To</p>
                                        <p className="font-semibold text-lg text-[#1e293b]">
                                            Ayodhya (AY)
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-[#e2e8f0]">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#64748b]">Travel Date</span>
                                        <span className="font-medium">Dec 15, 2026</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#64748b]">
                                            Preferred Class
                                        </span>
                                        <span className="font-medium">3AC / CC</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#64748b]">Budget Limit</span>
                                        <span className="font-medium text-green-600">
                                            ₹1,800
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Action Form */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                                        1
                                    </span>
                                    <h2 className="text-lg font-bold text-[#1e293b]">
                                        Enter Booking Details
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
                                            Transport Mode
                                        </label>
                                        <select className="w-full rounded-lg border-[#e2e8f0] text-sm focus:ring-[#137fec] focus:border-[#137fec] shadow-sm bg-slate-50">
                                            <option value="TRAIN">Train (IRCTC)</option>
                                            <option value="FLIGHT">Flight</option>
                                            <option value="BUS">Bus</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
                                            PNR / Booking ID{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            className="w-full rounded-lg border-[#e2e8f0] text-sm focus:ring-[#137fec] focus:border-[#137fec] shadow-sm font-mono uppercase"
                                            placeholder="e.g. 2456789012"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                {/* More Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#1e293b] mb-1.5">Train/Flight No.</label>
                                        <input className="w-full rounded-lg border-[#e2e8f0] text-sm focus:ring-[#137fec] focus:border-[#137fec] shadow-sm uppercase" placeholder="e.g. 12345" type="text" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1e293b] mb-1.5">Class/Coach</label>
                                        <input className="w-full rounded-lg border-[#e2e8f0] text-sm focus:ring-[#137fec] focus:border-[#137fec] shadow-sm uppercase" placeholder="e.g. 3AC" type="text" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1e293b] mb-1.5">Seat/Berth No.</label>
                                        <input className="w-full rounded-lg border-[#e2e8f0] text-sm focus:ring-[#137fec] focus:border-[#137fec] shadow-sm uppercase" placeholder="e.g. 45 / LOWER" type="text" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#1e293b] mb-1.5">Departure Time</label>
                                        <input className="w-full rounded-lg border-[#e2e8f0] text-sm focus:ring-[#137fec] focus:border-[#137fec] shadow-sm" type="time" defaultValue="08:30" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1e293b] mb-1.5">Actual Cost (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-slate-500">₹</span>
                                            <input className="w-full rounded-lg border-[#e2e8f0] text-sm focus:ring-[#137fec] focus:border-[#137fec] shadow-sm pl-7" placeholder="0.00" type="number" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notify Card */}
                            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-6 border-t-4 border-t-[#f49d25]">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">2</span>
                                    <h2 className="text-lg font-bold text-[#1e293b]">Notify Pandit Ji</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Phone Preview */}
                                    <div className="bg-slate-900 rounded-[2rem] p-4 border-[6px] border-slate-800 shadow-xl max-w-[300px] mx-auto md:mx-0 w-full relative">
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-24 bg-slate-800 rounded-b-xl"></div>
                                        <div className="bg-white h-full rounded-2xl overflow-hidden flex flex-col">
                                            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 pt-8">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                        <span className="material-symbols-outlined text-sm">sms</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700">HP-PANDIT</p>
                                                        <p className="text-[10px] text-slate-400">now</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-50 flex-1">
                                                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 leading-relaxed">
                                                    Pranam Pandit Ji 🙏,<br /><br />
                                                    Your travel for the Ayodhya event is booked!<br /><br />
                                                    <strong>Train:</strong> 12345 (Ganga Express)<br />
                                                    <strong>Class:</strong> 3AC<br />
                                                    <strong>PNR:</strong> 2456789012<br />
                                                    <strong>Date:</strong> Dec 15, 08:30 AM
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Action */}
                                    <div className="flex flex-col justify-center space-y-4">
                                        <div className="pt-4 flex gap-3">
                                            <button className="bg-[#137fec] hover:bg-[#0f65bd] text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 w-full shadow-lg shadow-blue-500/30">
                                                <span className="material-symbols-outlined">send</span>
                                                Confirm &amp; Send to Pandit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
