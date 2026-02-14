"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EarningsHistoryPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f6f6] dark:bg-[#221610] text-[#1e293b] dark:text-[#f1f5f9] font-sans">
            {/* Header Section */}
            <header className="flex items-center justify-between border-b border-[#ec5b13]/10 bg-white dark:bg-[#221610] px-6 md:px-20 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#ec5b13]/10 text-[#ec5b13] hover:bg-[#ec5b13]/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#ec5b13]/10 text-[#ec5b13]">
                        <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight">
                            Earnings Breakdown
                        </h2>
                        <p className="text-xs text-[#64748b] font-medium">
                            Verified Pandit Profile
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="hidden md:flex items-center gap-2 rounded-xl h-10 px-4 bg-[#ec5b13] text-white text-sm font-bold transition-all hover:bg-[#ec5b13]/90">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Download Invoice</span>
                    </button>
                    <button className="flex md:hidden items-center justify-center rounded-xl h-10 w-10 bg-[#ec5b13] text-white">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4 md:px-20 py-8 max-w-6xl mx-auto w-full">
                {/* Event Context */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#ec5b13] font-bold text-sm uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">
                                calendar_today
                            </span>
                            <span>24 Oct 2023</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                            Earnings for Delhi Wedding
                        </h1>
                        <p className="text-[#64748b] dark:text-[#94a3b8] font-medium">
                            Reference ID: #DW-8829 • South Delhi Venue
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Payment Approved
                    </div>
                </div>

                {/* Highlight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="md:col-span-2 flex flex-col justify-center rounded-2xl p-8 bg-white dark:bg-[#1c1917] border border-[#e2e8f0] dark:border-[#292524] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-[80px]">
                                account_balance_wallet
                            </span>
                        </div>
                        <p className="text-[#64748b] dark:text-[#94a3b8] text-sm font-bold uppercase tracking-widest mb-2">
                            Total Credited to Wallet
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-5xl font-black text-[#ec5b13]">
                                ₹52,750
                            </span>
                            <span className="text-green-500 text-sm font-bold">+100% Paid</span>
                        </div>
                        <p className="mt-4 text-xs text-[#94a3b8]">
                            Funds are ready for withdrawal to your linked bank account ending in
                            **4290
                        </p>
                    </div>
                    <div className="flex flex-col justify-between rounded-2xl p-6 bg-[#ec5b13]/5 border border-[#ec5b13]/20">
                        <div>
                            <p className="text-[#64748b] text-xs font-bold uppercase tracking-widest mb-1">
                                Platform Fee
                            </p>
                            <p className="text-xl font-bold text-[#1e293b] dark:text-[#e2e8f0]">
                                ₹9,308.00
                            </p>
                        </div>
                        <div className="pt-4 border-t border-[#ec5b13]/10">
                            <p className="text-[10px] text-[#94a3b8] leading-tight">
                                Calculated at standard 15% rate for premium wedding events.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown Table */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold tracking-tight">Detailed Breakdown</h2>
                        <button className="text-[#ec5b13] text-sm font-bold hover:underline">
                            View Policy
                        </button>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] dark:border-[#292524] bg-white dark:bg-[#1c1917]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafc] dark:bg-[#292524]/50">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748b]">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748b]">
                                        Gross Amount
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748b]">
                                        Deductions/Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748b] text-right">
                                        Net Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#292524]">
                                {/* Row 1 */}
                                <tr className="hover:bg-[#f8fafc]/50 dark:hover:bg-[#292524]/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                                <span className="material-symbols-outlined text-sm">
                                                    auto_awesome
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">
                                                    Dakshina (Ritual Fees)
                                                </p>
                                                <p className="text-xs text-[#94a3b8]">
                                                    Main Wedding Ceremony
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium">₹45,000.00</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-block px-2 py-1 rounded-md bg-[#f1f5f9] dark:bg-[#292524] text-[#64748b] text-[10px] font-bold">
                                            -15% Platform Fee
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-right">
                                        ₹38,250.00
                                    </td>
                                </tr>
                                {/* Row 2 */}
                                <tr className="hover:bg-[#f8fafc]/50 dark:hover:bg-[#292524]/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                <span className="material-symbols-outlined text-sm">
                                                    inventory_2
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">
                                                    Samagri Reimbursement
                                                </p>
                                                <p className="text-xs text-[#94a3b8]">
                                                    Pooja Materials &amp; Flowers
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium">₹8,500.00</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-block px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold">
                                            100% Approved
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-right">
                                        ₹8,500.00
                                    </td>
                                </tr>
                                {/* Row 3 */}
                                <tr className="hover:bg-[#f8fafc]/50 dark:hover:bg-[#292524]/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                                <span className="material-symbols-outlined text-sm">
                                                    directions_car
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Travel Allowance</p>
                                                <p className="text-xs text-[#94a3b8]">
                                                    Round trip to Venue
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium">₹4,000.00</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-block px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold">
                                            Approved
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-right">
                                        ₹4,000.00
                                    </td>
                                </tr>
                                {/* Row 4 */}
                                <tr className="hover:bg-[#f8fafc]/50 dark:hover:bg-[#292524]/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                                <span className="material-symbols-outlined text-sm">
                                                    restaurant
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Food &amp; Lodging</p>
                                                <p className="text-xs text-[#94a3b8]">2 Days Stay</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium">₹2,000.00</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-block px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold">
                                            Approved
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-right">
                                        ₹2,000.00
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-[#f8fafc] dark:bg-[#292524]/80">
                                <tr>
                                    <td
                                        className="px-6 py-4 text-sm font-bold text-right"
                                        colSpan={3}
                                    >
                                        Grand Total
                                    </td>
                                    <td className="px-6 py-4 text-lg font-black text-[#ec5b13] text-right">
                                        ₹52,750.00
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="rounded-3xl p-8 bg-gradient-to-br from-[#ec5b13] to-[#ff8c52] text-white shadow-xl shadow-[#ec5b13]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-bold">Ready to withdraw?</h3>
                        <p className="text-white/80 text-sm max-w-md">
                            Your earnings have been cleared. You can transfer them to your bank
                            account instantly.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button className="flex flex-1 md:flex-none items-center justify-center gap-2 rounded-xl h-14 px-8 bg-white text-[#ec5b13] text-base font-bold shadow-lg transition-transform active:scale-95">
                            <span className="material-symbols-outlined">account_balance</span>
                            <span>Withdraw Funds</span>
                        </button>
                        <button className="flex flex-1 md:flex-none items-center justify-center gap-2 rounded-xl h-14 px-8 bg-black/10 border border-white/20 text-white text-base font-bold hover:bg-black/20">
                            <span>Transaction History</span>
                        </button>
                    </div>
                </div>

                {/* Trust Message */}
                <div className="mt-12 text-center pb-12">
                    <div className="flex items-center justify-center gap-2 text-[#94a3b8] text-xs font-medium">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        <span>
                            Payments are secured with 256-bit encryption and verified by PanditPay
                            Services.
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
