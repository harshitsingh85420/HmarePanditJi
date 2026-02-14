"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GuestCheckoutPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            // For demo, just alert or redirect
            alert(`OTP sent to ${phone} (Demo)`);
            // In real app, we would redirect to OTP verification or show OTP input
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f8f7f6] dark:bg-[#221910] text-gray-800 dark:text-gray-100 font-sans flex flex-col">
            {/* Navbar */}
            <nav className="w-full bg-white dark:bg-[#18181b] border-b border-gray-100 dark:border-[#27272a] py-4 px-6 md:px-12 flex justify-between items-center shadow-sm relative z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#ec7f13] flex items-center justify-center text-white font-bold text-lg">H</div>
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">HmarePanditJi</span>
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#ec7f13] text-base">lock</span> Secure Checkout
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#ec7f13]/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-[#ec7f13]/5 rounded-full blur-3xl"></div>
                </div>

                {/* Split Card */}
                <div className="w-full max-w-5xl bg-white dark:bg-[#18181b] rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row relative z-10 border border-gray-100 dark:border-[#27272a]">

                    {/* Left Side: Summary */}
                    <div className="w-full lg:w-5/12 bg-[#ec7f13]/5 dark:bg-[#27272a]/50 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-[#27272a] relative">
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #ec7f13 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold mb-6 shadow-sm border border-green-200 dark:border-green-800">
                                <span className="material-symbols-outlined text-sm">check_circle</span> Cart Saved
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">Your booking is almost ready</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">Review your selection before finalizing your Muhurat.</p>

                            {/* Booking Card */}
                            <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-[#27272a] flex gap-4 items-start transition-transform hover:scale-[1.01] duration-300">
                                <div className="w-20 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined text-4xl">temple_hindu</span>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Varanasi Pandit</h3>
                                    <p className="text-xs text-[#ec7f13] font-medium mb-2 uppercase tracking-wide">Wedding Rituals</p>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-base text-gray-400">calendar_today</span>
                                            <span>Dec 16, 2023 • 9:00 AM</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-base text-gray-400">location_on</span>
                                            <span>Delhi, NCR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-8 lg:mt-0 pt-6 lg:pt-0">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#27272a] bg-gray-300 flex items-center justify-center text-[10px] text-gray-600 font-bold">U{i}</div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Join 15,000+ devotees today</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="w-full lg:w-7/12 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#18181b]">
                        <div className="max-w-md mx-auto w-full">
                            <div className="mb-8">
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">Just one step away</h1>
                                <p className="text-gray-600 dark:text-gray-400">Login or create an account to secure your Pandit and receive booking updates instantly.</p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSendOtp}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="phone">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">+91</span>
                                            <div className="h-4 w-px bg-gray-300 dark:bg-zinc-600 mx-2"></div>
                                        </div>
                                        <input
                                            className="block w-full pl-14 pr-12 py-3.5 border border-gray-200 dark:border-[#27272a] rounded-lg focus:ring-2 focus:ring-[#ec7f13] focus:border-transparent sm:text-lg dark:bg-[#27272a] dark:text-white shadow-sm placeholder-gray-400 outline-none transition-all"
                                            id="phone"
                                            placeholder="98765 43210"
                                            required
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                            maxLength={10}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-400 text-xl">phone_iphone</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="w-full bg-[#ec7f13] hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg group disabled:opacity-70"
                                    type="submit"
                                    disabled={loading || phone.length !== 10}
                                >
                                    {loading ? "Sending..." : (
                                        <>
                                            Send OTP
                                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Trust Indicators */}
                            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-[#27272a]">
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Member Benefits</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                    {[
                                        { icon: "location_on", label: "Track Live", desc: "Real-time pandit tracking" },
                                        { icon: "auto_awesome", label: "Digital Blessings", desc: "Access rituals anytime" },
                                        { icon: "support_agent", label: "24/7 Support", desc: "Dedicated travel assistance" },
                                        { icon: "verified_user", label: "Secure Payments", desc: "100% money back guarantee" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="p-1.5 rounded bg-[#ec7f13]/10 text-[#ec7f13]">
                                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-8">
                                By continuing, you agree to HmarePanditJi's <a href="#" className="underline hover:text-[#ec7f13]">Terms of Service</a> and <a href="#" className="underline hover:text-[#ec7f13]">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white dark:bg-[#18181b] py-4 text-center border-t border-gray-100 dark:border-[#27272a] relative z-20">
                <p className="text-xs text-gray-400">© 2023 HmarePanditJi. All rights reserved. Om Shanti.</p>
            </footer>
        </div>
    );
}
