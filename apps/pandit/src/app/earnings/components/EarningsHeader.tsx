"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Building2, PencilLine } from "lucide-react";

interface EarningsHeaderProps {
    summary: any;
    onMonthChange: (monthStr: string) => void;
    selectedMonth: string;
}

export default function EarningsHeader({ summary, onMonthChange, selectedMonth }: EarningsHeaderProps) {
    // Generate last 12 months for dropdown
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const label = `${d.toLocaleString('hi-IN', { month: 'long' })} ${d.getFullYear()}`;
        months.push({ value, label });
    }

    const { totalEarned, totalPaid, totalPending, bookingsCount, bankAccount } = summary;

    return (
        <div className="space-y-6">
            {/* Month Selector */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">आपकी कमाई</h1>
                <div className="relative">
                    <select
                        value={selectedMonth}
                        onChange={(e) => onMonthChange(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                        <option value="">सभी समय (All Time)</option>
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Stat Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Earned */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 shadow-sm transition-all duration-300 hover:shadow-md">
                    <p className="text-sm font-medium text-amber-800 mb-1">कुल कमाई</p>
                    <p className="text-3xl font-bold text-amber-900 mb-1">₹{totalEarned.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-amber-700">{bookingsCount} बुकिंग से</p>
                </div>

                {/* Paid Out */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm transition-all duration-300 hover:shadow-md">
                    <p className="text-sm font-medium text-green-800 mb-1">भुगतान हो गया</p>
                    <p className="text-3xl font-bold text-green-900 mb-1">₹{totalPaid.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-green-700">{bankAccount.maskedAccountNumber} को</p>
                </div>

                {/* Pending */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border border-orange-100 shadow-sm transition-all duration-300 hover:shadow-md">
                    <p className="text-sm font-medium text-orange-800 mb-1">बाकी है</p>
                    <p className="text-3xl font-bold text-orange-900 mb-1">₹{totalPending.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-orange-700">जल्द ही आपके खाते में आएगा</p>
                </div>
            </div>

            {/* Bank Account Info */}
            <div className="bg-white border text-sm rounded-xl p-4 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <p className="text-gray-500 text-sm">भुगतान जाएगा:</p>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-gray-900">{bankAccount.bankName}</span>
                        <span className="text-gray-900">{bankAccount.maskedAccountNumber}</span>
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{bankAccount.accountType}</span>
                    </div>
                </div>
                <Link href="/profile/bank-details" className="text-amber-600 font-medium flex items-center gap-1 hover:text-amber-700 transition">
                    <PencilLine className="w-4 h-4" />
                    <span className="hidden sm:inline">बदलें</span>
                </Link>
            </div>
        </div>
    );
}
