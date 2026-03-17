"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Globe, User, Currency, Video, Calendar, PlaneTakeoff,
    Luggage, Info, Users, PlusCircle, Wallet, Shield,
    CheckCircle, Smile, MessageSquare
} from "lucide-react";

export default function NriBookingPage() {
    const [useIst, setUseIst] = useState(false);
    const [includeFlight, setIncludeFlight] = useState(true);

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#221b10] text-[#1a2b4b] dark:text-white min-h-screen font-display flex flex-col">
            <div className="relative flex flex-col w-full min-h-screen overflow-x-hidden">

                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#1a2b4b]/10 dark:border-white/10 px-6 py-4 bg-white dark:bg-[#1a2b4b]/20 sticky top-0 z-50">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 text-[#f29e0d]">
                            <span className="material-symbols-outlined !text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>temple_hindu</span>
                            <h2 className="text-[#1a2b4b] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">HmarePanditJi</h2>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/search" className="text-[#1a2b4b]/70 dark:text-white/70 hover:text-[#f29e0d] text-sm font-semibold transition-colors">Ceremonies</Link>
                            <Link href="/muhurat" className="text-[#1a2b4b]/70 dark:text-white/70 hover:text-[#f29e0d] text-sm font-semibold transition-colors">Muhurat Finders</Link>
                            <Link href="/nri" className="text-[#1a2b4b]/70 dark:text-white/70 hover:text-[#f29e0d] text-sm font-semibold transition-colors">Global Logistics</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-[#1a2b4b]/5 dark:bg-white/10 p-1 rounded-lg">
                            <button className="px-3 py-1.5 text-xs font-bold rounded-md bg-white dark:bg-[#1a2b4b] shadow-sm text-[#1a2b4b] dark:text-white">USD</button>
                            <button className="px-3 py-1.5 text-xs font-bold text-[#1a2b4b]/60 dark:text-white/60 hover:text-[#1a2b4b] dark:hover:text-white">GBP</button>
                            <button className="px-3 py-1.5 text-xs font-bold text-[#1a2b4b]/60 dark:text-white/60 hover:text-[#1a2b4b] dark:hover:text-white">INR</button>
                        </div>
                        <button className="hidden sm:flex items-center justify-center rounded-lg h-10 px-4 bg-[#f29e0d] text-[#1a2b4b] text-sm font-bold shadow-md hover:bg-[#f29e0d]/90 transition-all">
                            <Globe size={18} className="mr-2" />
                            International Booking
                        </button>
                        <Link href="/dashboard" className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#1a2b4b]/5 dark:bg-white/10 text-[#1a2b4b] dark:text-white hover:bg-[#1a2b4b]/10 dark:hover:bg-white/20 transition-colors">
                            <User size={20} />
                        </Link>
                    </div>
                </header>

                <main className="flex flex-1 justify-center py-10 px-4">
                    <div className="flex flex-col max-w-[1200px] flex-1 text-left">

                        {/* Hero Section for NRI */}
                        <div className="mb-10 p-8 rounded-2xl bg-gradient-to-r from-[#1a2b4b] to-[#1a2b4b]/80 text-white relative overflow-hidden">
                            <div className="relative z-10 max-w-2xl">
                                <span className="inline-block px-3 py-1 bg-[#f29e0d]/20 text-[#f29e0d] border border-[#f29e0d]/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                    Exclusively for Global Families
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">Premium NRI Ceremony Booking</h1>
                                <p className="text-white/80 text-lg mb-6 leading-relaxed">
                                    Bridge the distance between your home and heritage. Seamless coordination for sacred rituals across time zones.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-[#f29e0d]">currency_exchange</span>
                                        <span className="text-sm font-medium">Forex Payments Supported</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                        <Video className="text-[#f29e0d]" size={20} />
                                        <span className="text-sm font-medium">Live 4K HDR Streaming Included</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Element */}
                            <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden lg:block">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUeFzEE5FeUu8xkg2hnNh4D5Q1MnO9XHnUcj4PBy3MIRwuuGfIciR5Lg1CuqFTYZF4oYwiyH2LjlO1ENhJw4uuP_lqskuqQX6xNBZ0xseWU9ht-c75yCPr7GppMUdlrAJWapUb--i5seYJuTctFDEgq9dKdTbtQJYvAMqBe1ggJuRL80gMIsxjnEFRW1ljJX6zNmqM4BO8FKlh9BhlFAZMPntZ6uX2a-C6-8hTjUu15_-z5T-yWNHIhm5D-aldM8AoPfg_GKkC2Es"
                                    className="h-full w-full object-cover"
                                    alt="Sacred fire ritual"
                                />
                            </div>
                        </div>

                        {/* Scheduling & Logistics Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

                            {/* Time Management Card */}
                            <div className="lg:col-span-2 bg-white dark:bg-[#1a2b4b]/30 rounded-2xl p-6 border border-[#1a2b4b]/10 dark:border-white/10 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Calendar className="text-[#f29e0d]" size={24} />
                                        Smart Muhurat Timing
                                    </h3>
                                    <button className="text-[#f29e0d] text-sm font-bold flex items-center hover:underline">
                                        Change Date <span className="material-symbols-outlined ml-1 text-[18px]">calendar_month</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-xl bg-[#f8f7f5] dark:bg-[#221b10] border border-[#1a2b4b]/5">
                                        <p className="text-[#1a2b4b]/50 dark:text-white/50 text-xs font-bold uppercase mb-1">Standard Time (IST)</p>
                                        <p className="text-3xl font-black text-[#1a2b4b] dark:text-white">10:00 AM</p>
                                        <p className="text-sm font-medium text-[#1a2b4b]/60 dark:text-white/60">New Delhi, India</p>
                                    </div>
                                    <div className="p-6 rounded-xl bg-[#f29e0d]/10 border border-[#f29e0d]/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#f29e0d]/10 rounded-bl-full flex items-start justify-end p-2">
                                            <Globe className="text-[#f29e0d]" size={20} />
                                        </div>
                                        <p className="text-[#f29e0d] text-xs font-bold uppercase mb-1">Your Local Time (GMT)</p>
                                        <p className="text-3xl font-black text-[#1a2b4b] dark:text-white">04:30 AM</p>
                                        <p className="text-sm font-medium text-[#1a2b4b]/60 dark:text-white/60">London, United Kingdom</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-start gap-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30">
                                    <Info className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-snug">
                                        We will automatically send calendar invites with localized meeting links to all family members globally.
                                    </p>
                                </div>
                            </div>

                            {/* Travel Management Card */}
                            <div className="bg-white dark:bg-[#1a2b4b]/30 rounded-2xl p-6 border border-[#1a2b4b]/10 dark:border-white/10 shadow-sm">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <PlaneTakeoff className="text-[#f29e0d]" size={24} />
                                    Pandit Logistics
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-[#1a2b4b]/70 dark:text-white/70">International Flight Booking</label>
                                        <label className="flex items-center justify-between p-3 rounded-lg border border-[#1a2b4b]/10 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Luggage className="text-[#1a2b4b]/50 dark:text-white/50" size={20} />
                                                <span className="text-sm font-medium">Business Class Req.</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={includeFlight}
                                                onChange={(e) => setIncludeFlight(e.target.checked)}
                                                className="text-[#f29e0d] focus:ring-[#f29e0d] rounded w-5 h-5 cursor-pointer"
                                            />
                                        </label>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-[#1a2b4b]/70 dark:text-white/70">Visa Processing</label>
                                        <div className="p-4 bg-[#1a2b4b]/5 dark:bg-white/5 rounded-lg border-l-4 border-[#f29e0d]">
                                            <p className="text-xs font-bold mb-1">Visa Status: Required</p>
                                            <p className="text-xs text-[#1a2b4b]/60 dark:text-white/60">Express sponsorship assistance will be added to your invoice.</p>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 bg-[#1a2b4b] text-white dark:bg-white dark:text-[#1a2b4b] rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-opacity">
                                        Add Travel Package
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Family & Checkout Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Family & Local Contacts */}
                            <div className="bg-white dark:bg-[#1a2b4b]/30 rounded-2xl p-6 border border-[#1a2b4b]/10 dark:border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Users className="text-[#f29e0d]" size={24} />
                                        Family Coordination in India
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-[#1a2b4b]/50 dark:text-white/50 uppercase tracking-wider">Local Point of Contact</label>
                                        <input
                                            type="text"
                                            placeholder="Full Name in India"
                                            className="w-full h-12 bg-[#f8f7f5] dark:bg-[#221b10] border-none rounded-xl focus:ring-2 focus:ring-[#f29e0d] text-sm px-4"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-[#1a2b4b]/50 dark:text-white/50 uppercase tracking-wider">Contact Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+91 00000 00000"
                                                className="w-full h-12 bg-[#f8f7f5] dark:bg-[#221b10] border-none rounded-xl focus:ring-2 focus:ring-[#f29e0d] text-sm px-4"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-[#1a2b4b]/50 dark:text-white/50 uppercase tracking-wider">Relationship</label>
                                            <select className="w-full h-12 bg-[#f8f7f5] dark:bg-[#221b10] border-none rounded-xl focus:ring-2 focus:ring-[#f29e0d] text-sm px-4 text-[#1a2b4b] dark:text-white">
                                                <option>Brother</option>
                                                <option>Father</option>
                                                <option>Local Organizer</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button className="w-full py-2 border-2 border-dashed border-[#1a2b4b]/10 dark:border-white/10 rounded-xl text-sm font-bold text-[#1a2b4b]/40 dark:text-white/40 flex items-center justify-center gap-2 hover:border-[#f29e0d]/50 hover:text-[#f29e0d] transition-all bg-transparent mt-2">
                                        <PlusCircle size={20} /> Add Another Contact
                                    </button>
                                </div>
                            </div>

                            {/* Trust & Checkout Summary */}
                            <div className="bg-white dark:bg-[#1a2b4b]/30 rounded-2xl p-6 border border-[#1a2b4b]/10 dark:border-white/10 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                        <Wallet className="text-[#f29e0d]" size={24} />
                                        Premium Summary
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#1a2b4b]/60 dark:text-white/60">Global Service Fee</span>
                                            <span className="font-bold">$849.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#1a2b4b]/60 dark:text-white/60">Travel & Visa Mgmt</span>
                                            <span className="font-bold">$220.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#1a2b4b]/60 dark:text-white/60">4K Streaming Setup</span>
                                            <span className="text-[#f29e0d] font-bold">INCLUDED</span>
                                        </div>

                                        <div className="h-px bg-[#1a2b4b]/10 dark:bg-white/10 my-4"></div>

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs font-bold text-[#1a2b4b]/50 dark:text-white/50 uppercase">Total Booking Amount</p>
                                                <p className="text-3xl font-black text-[#1a2b4b] dark:text-white">$1,069.00</p>
                                            </div>
                                            <img
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpRIRGu9IbVfgybFc_sMs_933VeD575LvgUSZkS8ZdZkPZ6nFPListazxpk_0Bh8V7fYaz34twg4Ajd6tWg8tmK_HvC7F9FitAeKH-Dh-Awt3x1-D-4Q3qf76F77dYps725_5VxVr4JaNrBEvBbWAgska8WdzGD16uKT9wZGod9o5OrD3rR4QM1dNZELTih3iwlkTdWVaPBRD5rqQXJZW8o-LvQOyzPznsn38OtYcyNFPnqtgLCDmhsewpf8Zjr-od0Cm6a4V0LwQ"
                                                className="h-6 mb-2"
                                                alt="PayPal"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full h-14 bg-[#f29e0d] text-[#1a2b4b] text-lg font-black rounded-xl shadow-xl shadow-[#f29e0d]/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-8">
                                    Confirm & Secure Payment
                                </button>
                            </div>

                        </div>

                        {/* Footer High Trust Badges */}
                        <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-50 hover:opacity-100 transition-opacity duration-500">
                            <div className="flex items-center gap-2">
                                <Shield size={20} />
                                <span className="text-sm font-bold">SSL Secure Checkout</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={20} />
                                <span className="text-sm font-bold">Certified Pandits Only</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Smile size={20} />
                                <span className="text-sm font-bold">5000+ Global Families</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={20} />
                                <span className="text-sm font-bold">Multi-lingual Support</span>
                            </div>
                        </div>

                    </div>
                </main>

                <footer className="mt-auto border-t border-[#1a2b4b]/10 dark:border-white/10 py-8 bg-white dark:bg-[#1a2b4b]/50">
                    <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 opacity-70">
                            <span className="material-symbols-outlined text-[#f29e0d]" style={{ fontVariationSettings: "'FILL' 1" }}>temple_hindu</span>
                            <p className="text-xs font-medium">© 2024 HmarePanditJi International Services. All rights reserved.</p>
                        </div>
                        <div className="flex gap-6">
                            <Link href="#" className="text-xs font-bold text-[#1a2b4b]/60 dark:text-white/60 hover:text-[#f29e0d] transition-colors">Privacy Policy</Link>
                            <Link href="#" className="text-xs font-bold text-[#1a2b4b]/60 dark:text-white/60 hover:text-[#f29e0d] transition-colors">NRI Support Center</Link>
                            <Link href="#" className="text-xs font-bold text-[#1a2b4b]/60 dark:text-white/60 hover:text-[#f29e0d] transition-colors">Refund Policy</Link>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
}
