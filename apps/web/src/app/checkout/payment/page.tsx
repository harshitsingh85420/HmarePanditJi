"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SecurePaymentPage() {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState("card");

    return (
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                <Link href="/services" className="text-slate-500 font-medium">Services</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <Link href="/checkout/summary" className="text-slate-500 font-medium">Booking #HPJ123</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-semibold">Secure Payment</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Summary Column */}
                <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Booking Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white leading-tight">Maha Mrityunjaya Jaap</span>
                                    <span className="text-xs text-slate-500">11 Pandits | 3 Days Ritual</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">₹71,868</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white leading-tight">Backup Pandit Coverage</span>
                                    <span className="text-xs text-slate-500 text-green-600">Premium Protection</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">₹8,000</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                                    <span className="text-base font-bold text-slate-900 dark:text-white">Total Amount</span>
                                    <span className="text-xl font-black text-[#135bec]">₹79,868</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Trust Markers */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-[#135bec]/10 rounded-lg border border-blue-100 dark:border-[#135bec]/20">
                            <span className="material-symbols-outlined text-[#135bec] text-2xl">verified_user</span>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">PCI DSS Compliant</p>
                                <p className="text-xs text-slate-500 mt-1">Bank-grade 256-bit encryption</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-100 dark:border-green-500/20">
                            <span className="material-symbols-outlined text-green-600 text-2xl">security</span>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">₹1 Crore Insurance</p>
                                <p className="text-xs text-slate-500 mt-1">Event protection guarantee</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Payment Methods Column */}
                <div className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Choose Payment Method</h1>
                            <p className="text-slate-500 text-sm mt-1">Transaction is encrypted and secure</p>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Saved Cards */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Saved Cards</h4>
                                <div className="flex flex-wrap gap-4">
                                    <div
                                        onClick={() => setPaymentMethod('card')}
                                        className={`flex items-center gap-4 p-4 border-2 rounded-xl w-full md:w-72 cursor-pointer relative overflow-hidden transition-all ${paymentMethod === 'card'
                                            ? 'border-[#135bec] bg-[#135bec]/5'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {paymentMethod === 'card' && (
                                            <div className="absolute top-2 right-2">
                                                <span className="material-symbols-outlined text-[#135bec] text-sm">check_circle</span>
                                            </div>
                                        )}
                                        <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                                            <span className="font-bold text-[10px] italic text-slate-600 dark:text-slate-400">VISA</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">HDFC Bank •••• 4242</p>
                                            <p className="text-xs text-slate-500">Exp: 12/28</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* UPI Options */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Fast UPI Payment</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { name: "Google Pay", icon: "account_balance_wallet" },
                                        { name: "PhonePe", icon: "payments" },
                                        { name: "Any UPI App", icon: "qr_code_2" },
                                        { name: "Paytm", icon: "send_to_mobile" }
                                    ].map((upi) => (
                                        <button
                                            key={upi.name}
                                            onClick={() => setPaymentMethod('upi')}
                                            className={`flex flex-col items-center justify-center p-4 border rounded-xl hover:border-[#135bec] transition-all bg-white dark:bg-slate-900 group ${paymentMethod === 'upi' ? 'border-[#135bec] bg-[#135bec]/5' : 'border-slate-200 dark:border-slate-800'
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined text-2xl group-hover:text-[#135bec] ${paymentMethod === 'upi' ? 'text-[#135bec]' : 'text-slate-400'}`}>{upi.icon}</span>
                                            <span className="text-xs font-bold mt-2 text-slate-700 dark:text-slate-300 group-hover:text-[#135bec]">{upi.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Credit/Debit Card Form */}
                            {paymentMethod === 'card' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Credit or Debit Card Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                                            <div className="relative">
                                                <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all outline-none" placeholder="0000 0000 0000 0000" type="text" />
                                                <div className="absolute right-4 top-3 flex gap-2">
                                                    <span className="material-symbols-outlined text-slate-400">credit_card</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                                            <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all outline-none" placeholder="MM / YY" type="text" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CVV</label>
                                            <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all outline-none" placeholder="•••" type="password" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Net Banking */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#135bec] transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500">account_balance</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Net Banking</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">expand_more</span>
                            </div>
                        </div>

                        {/* Footer Section of the card */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                            <div className="space-y-3 mb-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input className="mt-1 rounded border-slate-300 text-[#135bec] focus:ring-[#135bec]" type="checkbox" defaultChecked />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">I agree to the <Link href="#" className="text-[#135bec] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#135bec] hover:underline">Privacy Policy</Link>.</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input className="mt-1 rounded border-slate-300 text-[#135bec] focus:ring-[#135bec]" type="checkbox" defaultChecked />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">I acknowledge the <Link href="#" className="text-[#135bec] hover:underline">Cancellation & Refund Policy</Link> for religious services.</span>
                                </label>
                            </div>
                            <button
                                onClick={() => router.push('/bookings/123?status=success')}
                                className="w-full bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#135bec]/25 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Pay ₹79,868 Securely</span>
                                <span className="material-symbols-outlined">lock</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Help/Contact */}
                    <div className="flex items-center justify-center gap-6 text-slate-400 py-4">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">support_agent</span>
                            <span className="text-xs">24/7 Support: 1800-PANDIT-01</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">mail</span>
                            <span className="text-xs">support@hmarepanditji.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
