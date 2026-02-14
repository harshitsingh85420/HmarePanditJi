"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EarningsPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] dark:bg-[#221b10] text-[#181511] dark:text-[#f8f7f5] font-sans">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e6e2db] dark:border-[#3d3428] bg-white dark:bg-[#181511] px-6 md:px-10 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-4 text-[#181511] dark:text-[#f4a825]">
                    <div className="size-6">
                        <span className="material-symbols-outlined text-3xl">temple_hindu</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] dark:text-[#f8f7f5]">
                        HmarePanditJi
                    </h2>
                </div>
                <div className="flex flex-1 justify-end gap-8 items-center">
                    <nav className="hidden md:flex items-center gap-9">
                        <Link href="/pandit/dashboard" className="text-sm font-medium leading-normal hover:text-[#f4a825] transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/pandit/earnings" className="text-[#f4a825] text-sm font-bold leading-normal border-b-2 border-[#f4a825] pb-1">
                            Earnings
                        </Link>
                        <Link href="/pandit/calendar" className="text-sm font-medium leading-normal hover:text-[#f4a825] transition-colors">
                            Schedule
                        </Link>
                        <Link href="/pandit/profile" className="text-sm font-medium leading-normal hover:text-[#f4a825] transition-colors">
                            Profile
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#f4a825] text-[#181511] text-sm font-bold leading-normal hover:bg-[#f4a825]/90 transition-colors">
                            Logout
                        </button>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#f4a825]"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA_-LzKHGppqJgzpbRyi7vNYRDGNUmmXqVhzRw6zk2WBTa6UVhmcgckiyB2kgdZXLDzda8EFh8VHDC5O_tfdk9hEyd_moUgBK4PrkZ4ZUCAI72KTq559oIIJwhEJ4fAFt35enRSHuqcLhPjMMSAnClp0lbLZJI9n9HVAHFAwqW42kq3tAa7DHMuinGMWbQpk45haxaOrXfygH4cGbqqoFR9nCzP_Ucdvfm34uDeBYcmh8otReGBksFqKR1HEO-0Ppo_H67mxmGr4EQ")',
                            }}
                        ></div>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 justify-center py-10 px-4">
                <div className="flex flex-col max-w-[960px] flex-1 gap-6">
                    {/* Page Title & Subtitle */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-[#181511] dark:text-[#f8f7f5]">
                            Earnings &amp; Wallet
                        </h1>
                        <p className="text-[#8a7b60] dark:text-[#a89980] text-base font-normal">
                            Manage your professional dakshina, reimbursements and tax compliance.
                        </p>
                    </div>

                    {/* Balance Card Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-1 md:col-span-2 flex flex-col justify-between gap-6 rounded-xl p-8 bg-white dark:bg-[#2d2418] border border-[#e6e2db] dark:border-[#3d3428] shadow-sm">
                            <div className="flex flex-col gap-2">
                                <p className="text-[#8a7b60] dark:text-[#a89980] text-sm font-semibold uppercase tracking-wider">
                                    Available Balance
                                </p>
                                <p className="text-5xl font-black text-[#181511] dark:text-[#f4a825]">
                                    ₹52,000
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-14 px-6 bg-[#f4a825] text-[#181511] text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#f4a825]/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined">
                                        account_balance_wallet
                                    </span>
                                    Withdraw to Bank
                                </button>
                                <button className="flex items-center justify-center rounded-lg w-14 h-14 bg-[#f4a825]/10 text-[#f4a825] border border-[#f4a825]/20 hover:bg-[#f4a825]/20 transition-colors">
                                    <span className="material-symbols-outlined">settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Tax Summary Mini Card */}
                        <div className="flex flex-col gap-4 rounded-xl p-6 bg-[#fef7e7] dark:bg-[#342a1a] border border-[#f4a825]/20">
                            <div className="flex items-center gap-3 text-[#f4a825]">
                                <span className="material-symbols-outlined">description</span>
                                <p className="font-bold">Tax Summary</p>
                            </div>
                            <p className="text-sm text-[#8a7b60] dark:text-[#a89980]">
                                View your TDS certificates and annual tax statements for the current
                                financial year.
                            </p>
                            <button className="mt-auto flex items-center gap-2 text-sm font-bold text-[#181511] dark:text-[#f8f7f5] hover:underline underline-offset-4">
                                View Documents
                                <span className="material-symbols-outlined text-sm">
                                    arrow_forward
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Breakdown & Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        <div className="flex flex-col gap-6 rounded-xl border border-[#e6e2db] dark:border-[#3d3428] p-8 bg-white dark:bg-[#181511]">
                            <div className="flex items-center justify-between">
                                <p className="text-[#181511] dark:text-[#f8f7f5] text-xl font-bold">
                                    Earnings Breakdown
                                </p>
                                <select className="bg-[#f8f7f5] dark:bg-[#2d2418] border-none rounded-lg text-sm font-medium py-1 px-3 dark:text-white">
                                    <option>This Month</option>
                                    <option>Last 3 Months</option>
                                    <option>Yearly</option>
                                </select>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                {/* Chart Area */}
                                <div className="relative size-48 flex items-center justify-center shrink-0">
                                    {/* Simple CSS-based Donut placeholder */}
                                    <div className="absolute inset-0 rounded-full border-[16px] border-[#f5f3f0] dark:border-[#2d2418]"></div>
                                    <div className="absolute inset-0 rounded-full border-[16px] border-[#f4a825] border-r-transparent border-b-transparent rotate-[30deg]"></div>
                                    <div className="flex flex-col items-center">
                                        <p className="text-3xl font-black text-[#181511] dark:text-[#f8f7f5]">
                                            100%
                                        </p>
                                        <p className="text-[10px] text-[#8a7b60] font-bold uppercase">
                                            Total
                                        </p>
                                    </div>
                                </div>
                                {/* Legends & Bars */}
                                <div className="flex-1 w-full flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold flex items-center gap-2 dark:text-white">
                                                <span className="size-3 rounded-full bg-[#f4a825]"></span>{" "}
                                                Dakshina
                                            </span>
                                            <span className="text-sm font-black dark:text-white">81%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[#f5f3f0] dark:bg-[#2d2418] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#f4a825] rounded-full"
                                                style={{ width: "81%" }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold flex items-center gap-2 dark:text-white">
                                                <span className="size-3 rounded-full bg-[#fcd581]"></span>{" "}
                                                Travel Reimbursement
                                            </span>
                                            <span className="text-sm font-black dark:text-white">15%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[#f5f3f0] dark:bg-[#2d2418] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#fcd581] rounded-full"
                                                style={{ width: "15%" }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold flex items-center gap-2 dark:text-white">
                                                <span className="size-3 rounded-full bg-[#e6e2db]"></span>{" "}
                                                Food Allowance
                                            </span>
                                            <span className="text-sm font-black dark:text-white">4%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[#f5f3f0] dark:bg-[#2d2418] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#e6e2db] rounded-full"
                                                style={{ width: "4%" }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="flex flex-col gap-4 mb-20">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold dark:text-white">Recent Transactions</h3>
                            <button
                                onClick={() => router.push('/pandit/earnings/history')}
                                className="text-[#f4a825] text-sm font-bold hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {/* Transaction Item 1 */}
                            <div
                                onClick={() => router.push('/pandit/earnings/123')}
                                className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#2d2418] border border-[#e6e2db] dark:border-[#3d3428] hover:border-[#f4a825]/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#f4a825]/10 text-[#f4a825] flex items-center justify-center">
                                        <span className="material-symbols-outlined">celebration</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#181511] dark:text-[#f8f7f5]">
                                            Delhi Wedding - Grand Hyatt
                                        </p>
                                        <p className="text-xs text-[#8a7b60] dark:text-[#a89980]">
                                            Oct 24, 2023 • Vivah Sanskar
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-black text-[#181511] dark:text-[#f8f7f5]">
                                        ₹52,750
                                    </p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#078810]/10 text-[#078810] uppercase">
                                        <span className="size-1.5 rounded-full bg-[#078810] mr-1.5"></span>{" "}
                                        Paid
                                    </span>
                                </div>
                            </div>
                            {/* Transaction Item 2 */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#2d2418] border border-[#e6e2db] dark:border-[#3d3428] hover:border-[#f4a825]/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#f4a825]/10 text-[#f4a825] flex items-center justify-center">
                                        <span className="material-symbols-outlined">home</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#181511] dark:text-[#f8f7f5]">
                                            Griha Pravesh - Noida Sec 150
                                        </p>
                                        <p className="text-xs text-[#8a7b60] dark:text-[#a89980]">
                                            Oct 22, 2023 • Puja Services
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-black text-[#181511] dark:text-[#f8f7f5]">
                                        ₹12,500
                                    </p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#078810]/10 text-[#078810] uppercase">
                                        <span className="size-1.5 rounded-full bg-[#078810] mr-1.5"></span>{" "}
                                        Paid
                                    </span>
                                </div>
                            </div>
                            {/* Transaction Item 3 */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#2d2418] border border-[#e6e2db] dark:border-[#3d3428] hover:border-[#f4a825]/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#f4a825]/10 text-[#f4a825] flex items-center justify-center">
                                        <span className="material-symbols-outlined">flight</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#181511] dark:text-[#f8f7f5]">
                                            Travel Reimbursement - Mumbai
                                        </p>
                                        <p className="text-xs text-[#8a7b60] dark:text-[#a89980]">
                                            Oct 20, 2023 • Airfare &amp; Taxi
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-black text-[#181511] dark:text-[#f8f7f5]">
                                        ₹8,400
                                    </p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#078810]/10 text-[#078810] uppercase">
                                        <span className="size-1.5 rounded-full bg-[#078810] mr-1.5"></span>{" "}
                                        Paid
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <footer className="md:hidden flex justify-around border-t border-solid border-[#e6e2db] dark:border-[#3d3428] bg-white dark:bg-[#181511] px-4 py-4 fixed bottom-0 left-0 right-0 z-50">
                <Link href="/pandit/dashboard" className="flex flex-col items-center gap-1 text-[#8a7b60] hover:text-[#f4a825] transition-colors">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                </Link>
                <Link href="/pandit/earnings" className="flex flex-col items-center gap-1 text-[#f4a825]">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Wallet</span>
                </Link>
                <Link href="/pandit/bookings" className="flex flex-col items-center gap-1 text-[#8a7b60] hover:text-[#f4a825] transition-colors">
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Bookings</span>
                </Link>
                <Link href="/pandit/profile" className="flex flex-col items-center gap-1 text-[#8a7b60] hover:text-[#f4a825] transition-colors">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
                </Link>
            </footer>
        </div>
    );
}
