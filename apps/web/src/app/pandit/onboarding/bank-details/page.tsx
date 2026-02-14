"use client";

import React from "react";

export default function BankVerificationPage() {
    return (
        <div className="bg-[#f3f4f6] font-sans antialiased min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col min-h-[800px]">
                {/* Header */}
                <header className="bg-[#f09942] text-white p-6 pb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                    <div className="flex items-center justify-between mb-4">
                        <button className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-white">
                                arrow_back
                            </span>
                        </button>
                        <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse"></span>
                            <span>Verification Pending</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold leading-tight mb-2">
                        Bank Verification &amp;
                        <br />
                        Payout Setup
                    </h1>
                    <p className="text-white/90 text-sm">
                        Secure your earnings with HmarePanditJi
                    </p>
                </header>

                {/* Main Content */}
                <main className="flex-1 -mt-4 bg-white rounded-t-3xl px-6 py-8 flex flex-col relative z-10">
                    <div className="bg-[#fff8f1] border border-orange-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-full shrink-0 text-orange-600">
                            <span className="material-symbols-outlined text-[20px]">
                                account_balance_wallet
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                Auto-Credit Enabled
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Your payments will be auto-credited to this account within 24
                                hours after every successful Puja.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Account Number */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Account Number
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">
                                        numbers
                                    </span>
                                </div>
                                <input
                                    className="w-full pl-10 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#f09942] transition-all outline-none text-gray-800 font-medium tracking-wide"
                                    placeholder="Enter account number"
                                    type="text"
                                />
                                <button
                                    className="absolute right-2 p-2 bg-[#f09942] text-white rounded-full hover:bg-[#d97f26] shadow-md transition-transform active:scale-95 flex items-center justify-center"
                                    title="Use Voice Input"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        mic
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Confirm Account Number */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Account Number
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">
                                        lock
                                    </span>
                                </div>
                                <input
                                    className="w-full pl-10 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#f09942] transition-all outline-none text-gray-800 font-medium tracking-wide"
                                    placeholder="Re-enter account number"
                                    type="password"
                                />
                                <button
                                    className="absolute right-2 p-2 bg-[#f09942] text-white rounded-full hover:bg-[#d97f26] shadow-md transition-transform active:scale-95 flex items-center justify-center"
                                    title="Use Voice Input"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        mic
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* IFSC Code */}
                        <div className="group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    IFSC Code
                                </label>
                                <a
                                    className="text-xs text-[#f09942] font-medium hover:underline"
                                    href="#"
                                >
                                    Find IFSC
                                </a>
                            </div>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">
                                        account_balance
                                    </span>
                                </div>
                                <input
                                    className="w-full pl-10 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#f09942] transition-all outline-none text-gray-800 font-medium uppercase"
                                    placeholder="e.g. SBIN0001234"
                                    type="text"
                                />
                                <button
                                    className="absolute right-2 p-2 bg-[#f09942] text-white rounded-full hover:bg-[#d97f26] shadow-md transition-transform active:scale-95 flex items-center justify-center"
                                    title="Use Voice Input"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        mic
                                    </span>
                                </button>
                            </div>
                            {/* Hidden success state manually togglable if functionality added */}
                            <div className="hidden mt-2 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                <span className="material-symbols-outlined text-[14px]">
                                    check_circle
                                </span>
                                <span>
                                    State Bank of India, Connaught Place Branch
                                </span>
                            </div>
                        </div>

                        {/* UPI ID */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                UPI ID <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-gray-400">
                                    <span className="material-symbols-outlined text-[20px]">
                                        qr_code_2
                                    </span>
                                </div>
                                <input
                                    className="w-full pl-10 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#f09942] transition-all outline-none text-gray-800 font-medium"
                                    placeholder="mobile@upi"
                                    type="text"
                                />
                                <button
                                    className="absolute right-2 p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-transform active:scale-95 flex items-center justify-center"
                                    title="Use Voice Input"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        mic
                                    </span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                For faster small payments and reimbursements.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer Action */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">
                            lock
                        </span>
                        <p>
                            Your bank details are encrypted and 100% secure with
                            HmarePanditJi.
                        </p>
                    </div>
                    <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-gray-200 hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <span>Verify &amp; Save</span>
                        <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
