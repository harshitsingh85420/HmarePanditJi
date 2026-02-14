"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JobPayoutPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] dark:bg-[#221810] text-[#181411] dark:text-[#f8f7f5] font-sans">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e6e0db] dark:border-[#3d2b1d] px-4 md:px-10 py-3 bg-white dark:bg-[#2d1f14] sticky top-0 z-50">
                <div className="flex items-center gap-4 text-[#f48525]">
                    <div className="size-6">
                        <span className="material-symbols-outlined text-3xl">temple_hindu</span>
                    </div>
                    <h2 className="text-[#181411] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        HmarePanditJi
                    </h2>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <div className="hidden md:flex items-center gap-9">
                        <Link href="/pandit/earnings" className="text-[#181411] dark:text-[#d4ccc4] text-sm font-medium leading-normal hover:text-[#f48525] transition-colors">
                            Earnings
                        </Link>
                        <Link href="/pandit/bookings" className="text-[#181411] dark:text-[#d4ccc4] text-sm font-medium leading-normal hover:text-[#f48525] transition-colors">
                            Bookings
                        </Link>
                        <Link href="/pandit/profile" className="text-[#181411] dark:text-[#d4ccc4] text-sm font-medium leading-normal hover:text-[#f48525] transition-colors">
                            Profile
                        </Link>
                        <Link href="/pandit/support" className="text-[#181411] dark:text-[#d4ccc4] text-sm font-medium leading-normal hover:text-[#f48525] transition-colors">
                            Support
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#f48525] text-white text-sm font-bold leading-normal hover:bg-[#f48525]/90">
                            <span>Logout</span>
                        </button>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#f48525]/20"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBH6zn8Ena8oRRKFrVzHt1PtGkek8zqo34PDsKyNxh8CgjiKPB6kSjR8j3837WQ4VGDmxKWdSZSTacGltI1NWvjvzVXwwtfxvTKsBQpqfFeG_R4gTivcDwGwrPQDSlsgZcJiUWtn6CNDMNIVwgBSegWZdk10hpMtB4vhAodEcXnPM9pFTpbnJTNvDho84G-1X348La8QbUjUhaXUgylCtPru8rntmVrDr99Sm-W7HptikxfGlrcvvLPpTF-LaNTIJrwOyEhpXyIVpM")',
                            }}
                        ></div>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 justify-center py-8 px-4 md:px-10 lg:px-40">
                <div className="flex flex-col max-w-[960px] flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => router.back()}
                            className="text-[#8a7460] dark:text-[#a6917c] text-sm font-medium flex items-center gap-1 hover:text-[#f48525]"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Earnings
                        </button>
                        <span className="text-[#8a7460] dark:text-[#a6917c] text-sm font-medium">/</span>
                        <span className="text-[#181411] dark:text-[#f8f7f5] text-sm font-medium">
                            Delhi Wedding Breakdown
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-between items-end gap-3 mb-6 bg-white dark:bg-[#2d1f14] p-6 rounded-xl border border-[#e6e0db] dark:border-[#3d2b1d]">
                        <div className="flex min-w-72 flex-col gap-2">
                            <h1 className="text-[#181411] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                                Earnings for Delhi Wedding
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-[#f48525]">
                                    receipt_long
                                </span>
                                <p className="text-[#8a7460] dark:text-[#a6917c] text-sm font-normal">
                                    Transaction ID: TXN9876543210
                                </p>
                            </div>
                        </div>
                        <button className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#f5f2f0] dark:bg-[#3d2b1d] text-[#181411] dark:text-white text-sm font-bold leading-normal border border-transparent hover:border-[#f48525] transition-all">
                            <span className="material-symbols-outlined mr-2 text-base">download</span>
                            <span className="truncate">Download Invoice</span>
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-8 bg-[#f48525] text-white shadow-lg shadow-[#f48525]/20">
                            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                                Total Credited to Wallet
                            </p>
                            <div className="flex items-baseline gap-2">
                                <p className="tracking-light text-4xl font-black leading-tight">
                                    ₹52,750
                                </p>
                                <span className="material-symbols-outlined text-green-200">
                                    check_circle
                                </span>
                            </div>
                            <p className="text-white/70 text-xs mt-2">
                                Available for withdrawal immediately
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e6e0db] dark:border-[#3d2b1d] overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-[#e6e0db] dark:border-[#3d2b1d] bg-[#f8f7f5]/50 dark:bg-[#221810]/50">
                            <h3 className="text-[#181411] dark:text-white font-bold">
                                Line Item Details
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white dark:bg-[#2d1f14]">
                                        <th className="px-6 py-4 text-[#181411] dark:text-white text-xs font-bold uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-4 text-[#181411] dark:text-white text-xs font-bold uppercase tracking-wider text-right">
                                            Gross Amount
                                        </th>
                                        <th className="px-6 py-4 text-[#181411] dark:text-white text-xs font-bold uppercase tracking-wider text-center">
                                            Deductions/Status
                                        </th>
                                        <th className="px-6 py-4 text-[#181411] dark:text-white text-xs font-bold uppercase tracking-wider text-right">
                                            Net Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e6e0db] dark:divide-[#3d2b1d]">
                                    <tr className="hover:bg-[#f8f7f5] dark:hover:bg-[#221810]/30 transition-colors">
                                        <td className="px-6 py-5 text-[#181411] dark:text-white text-sm font-semibold">
                                            Dakshina
                                        </td>
                                        <td className="px-6 py-5 text-[#8a7460] dark:text-[#a6917c] text-sm text-right">
                                            ₹35,000
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                -15% Platform Fee
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-[#f48525] text-sm font-bold text-right">
                                            ₹29,750
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-[#f8f7f5] dark:hover:bg-[#221810]/30 transition-colors">
                                        <td className="px-6 py-5 text-[#181411] dark:text-white text-sm font-semibold">
                                            Samagri Package
                                        </td>
                                        <td className="px-6 py-5 text-[#8a7460] dark:text-[#a6917c] text-sm text-right">
                                            ₹8,000
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-xs text-[#8a7460] dark:text-[#a6917c]">
                                                —
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-[#f48525] text-sm font-bold text-right">
                                            ₹8,000
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-[#f8f7f5] dark:hover:bg-[#221810]/30 transition-colors">
                                        <td className="px-6 py-5 text-[#181411] dark:text-white text-sm font-semibold">
                                            Travel Reimbursement
                                        </td>
                                        <td className="px-6 py-5 text-[#8a7460] dark:text-[#a6917c] text-sm text-right">
                                            ₹12,000
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                <span className="material-symbols-outlined text-[10px] mr-1">
                                                    verified
                                                </span>{" "}
                                                Approved
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-[#f48525] text-sm font-bold text-right">
                                            ₹12,000
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-[#f8f7f5] dark:hover:bg-[#221810]/30 transition-colors">
                                        <td className="px-6 py-5 text-[#181411] dark:text-white text-sm font-semibold">
                                            Food Allowance
                                        </td>
                                        <td className="px-6 py-5 text-[#8a7460] dark:text-[#a6917c] text-sm text-right">
                                            ₹3,000
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-xs text-[#8a7460] dark:text-[#a6917c]">
                                                —
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-[#f48525] text-sm font-bold text-right">
                                            ₹3,000
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-[#f48525]/5 dark:bg-[#f48525]/10">
                                        <td
                                            className="px-6 py-4 text-[#181411] dark:text-white text-sm font-bold text-right"
                                            colSpan={3}
                                        >
                                            Total Net Payout
                                        </td>
                                        <td className="px-6 py-4 text-[#f48525] text-lg font-black text-right underline decoration-2 underline-offset-4">
                                            ₹52,750
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 bg-white dark:bg-[#2d1f14] rounded-xl border border-[#e6e0db] dark:border-[#3d2b1d]">
                        <div className="flex flex-col gap-1">
                            <p className="text-[#181411] dark:text-white font-bold">
                                Ready to withdraw?
                            </p>
                            <p className="text-[#8a7460] dark:text-[#a6917c] text-sm">
                                Withdrawal requests are processed within 24-48 hours.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button className="text-[#f48525] text-sm font-bold hover:underline">
                                View Policy
                            </button>
                            <button className="flex-1 md:flex-none flex min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-[#f48525] text-white text-base font-bold shadow-lg shadow-[#f48525]/30 hover:bg-[#f48525]/90 transition-all">
                                <span>Withdraw Now</span>
                                <span className="material-symbols-outlined ml-2">
                                    account_balance_wallet
                                </span>
                            </button>
                        </div>
                    </div>

                    <footer className="mt-12 mb-8 text-center">
                        <div className="flex justify-center gap-6 text-[#8a7460] dark:text-[#a6917c] text-sm font-medium">
                            <Link href="#" className="hover:text-[#f48525]">Support Center</Link>
                            <Link href="#" className="hover:text-[#f48525]">Terms of Service</Link>
                            <Link href="#" className="hover:text-[#f48525]">Contact Us</Link>
                        </div>
                        <p className="mt-4 text-[#8a7460]/60 text-xs">
                            © 2024 HmarePanditJi. All rights reserved.
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
