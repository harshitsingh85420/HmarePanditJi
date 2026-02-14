"use client";

import React from "react";

export default function CancellationPolicyPage() {
    return (
        <div className="bg-[#f8f7f6] dark:bg-[#221910] text-gray-800 dark:text-gray-100 font-sans min-h-screen flex flex-col">
            {/* Navigation (Simplified for context) */}
            <nav className="w-full bg-white dark:bg-[#2a2018] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-icons text-[#ec7f13] text-3xl">
                                temple_buddhist
                            </span>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                                HmarePanditJi
                            </span>
                        </div>
                        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                            <a
                                className="hover:text-[#ec7f13] transition-colors"
                                href="#"
                            >
                                Services
                            </a>
                            <a
                                className="hover:text-[#ec7f13] transition-colors"
                                href="#"
                            >
                                Book a Pandit
                            </a>
                            <a className="text-[#ec7f13]" href="#">
                                Policies
                            </a>
                            <a
                                className="hover:text-[#ec7f13] transition-colors"
                                href="#"
                            >
                                Contact
                            </a>
                        </div>
                        <div className="flex items-center">
                            <button className="bg-[#ec7f13]/10 hover:bg-[#ec7f13]/20 text-[#ec7f13] px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative bg-white dark:bg-[#2a2018] border-b border-gray-200 dark:border-gray-800 py-16 lg:py-24 overflow-hidden">
                {/* Abstract background pattern */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#ec7f13]/5 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ec7f13]/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ec7f13]/10 text-[#ec7f13] text-xs font-semibold uppercase tracking-wider mb-6">
                        <span className="material-icons text-sm">gavel</span>
                        Policy Framework v2.4
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        Transparent Cancellations &amp; <br className="hidden md:block" />{" "}
                        Our Promise to You
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        We understand that plans can change. Our goal is to provide a fair
                        framework for refunds while ensuring our Pandits are respected for
                        their committed time.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-16">
                {/* Section 1: User Cancellation Policy */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-[#ec7f13]">
                                    event_busy
                                </span>
                                Cancellation Tiers
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Refund eligibility based on time prior to the scheduled
                                event.
                            </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500 italic">
                            *Timings are calculated from the scheduled start time (IST).
                        </div>
                    </div>
                    {/* Tiered Cards Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tier 1: > 7 Days */}
                        <div className="bg-white dark:bg-[#2a2018] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg">
                                    <span className="material-icons">calendar_today</span>
                                </div>
                                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded">
                                    Best Value
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                More than 7 Days
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Before the scheduled event
                            </p>
                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                        90%
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Refund
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    10% deduction covers payment gateway &amp; admin
                                    processing fees.
                                </p>
                            </div>
                        </div>
                        {/* Tier 2: 2-7 Days */}
                        <div className="bg-white dark:bg-[#2a2018] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#ec7f13]"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-[#ec7f13]/20 text-[#ec7f13] p-2 rounded-lg">
                                    <span className="material-icons">schedule</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                2 to 7 Days
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Before the scheduled event
                            </p>
                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                        50%
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Refund
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Covers Pandit's reservation hold. Partial refund
                                    processed within 5 days.
                                </p>
                            </div>
                        </div>
                        {/* Tier 3: < 48 Hours */}
                        <div className="bg-white dark:bg-[#2a2018] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-2 rounded-lg">
                                    <span className="material-icons">
                                        hourglass_disabled
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Less than 48 Hours
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Before the scheduled event
                            </p>
                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                        No Refund
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Funds are disbursed to the Pandit and preparations are
                                    finalized.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Platform Liability (The Highlight) */}
                <section className="relative">
                    <div className="bg-white dark:bg-[#2a2018] rounded-2xl border-2 border-[#ec7f13]/20 shadow-xl overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ec7f13]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                        <div className="p-8 md:p-12 relative z-10 grid md:grid-cols-2 gap-10 items-center">
                            {/* Left Content */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ec7f13] text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                                    <span className="material-icons text-sm">
                                        verified_user
                                    </span>
                                    Trust Guarantee
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    Platform Fallback Liability
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                                    Religious ceremonies are high-stakes events. We take
                                    full responsibility for our service network. If the
                                    assigned Pandit fails to arrive due to unforeseen
                                    circumstances, our{" "}
                                    <span className="text-[#ec7f13] font-semibold">
                                        Safety Net
                                    </span>{" "}
                                    activates immediately.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded text-green-600 dark:text-green-400">
                                            <span className="material-icons text-sm font-bold">
                                                check
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                100% Instant Refund
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Full booking amount returned to your source
                                                account immediately.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded text-green-600 dark:text-green-400">
                                            <span className="material-icons text-sm font-bold">
                                                check
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                Instant Backup Arrangement
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                We deploy a backup Pandit from our reserve
                                                pool at no extra cost to you.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Right Visual/Card */}
                            <div className="relative">
                                <div className="bg-[#f8f7f6] dark:bg-[#1e160e] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-inner">
                                    <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                                        <div className="h-12 w-12 rounded-full bg-[#ec7f13]/20 flex items-center justify-center text-[#ec7f13]">
                                            <span className="material-icons">shield</span>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Coverage Status
                                            </div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                                Active Protection
                                                <span className="relative flex h-2 w-2 ml-1">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white dark:bg-[#2a2018] p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                Pandit No-Show
                                            </span>
                                            <span className="text-sm font-bold text-[#ec7f13]">
                                                Covered
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white dark:bg-[#2a2018] p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                Late Arrival (&gt;1 hr)
                                            </span>
                                            <span className="text-sm font-bold text-[#ec7f13]">
                                                Covered
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white dark:bg-[#2a2018] p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                Misconduct
                                            </span>
                                            <span className="text-sm font-bold text-[#ec7f13]">
                                                Covered
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto w-full pt-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Frequently Asked Questions
                    </h3>
                    <div className="space-y-4">
                        {/* FAQ Item 1 */}
                        <details className="group bg-white dark:bg-[#2a2018] rounded-lg border border-gray-200 dark:border-gray-700 open:border-[#ec7f13]/50 dark:open:border-[#ec7f13]/50 transition-colors">
                            <summary className="flex justify-between items-center cursor-pointer p-5 list-none">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    How do I initiate a cancellation?
                                </span>
                                <span className="transition group-open:rotate-180">
                                    <span className="material-icons text-gray-400">
                                        expand_more
                                    </span>
                                </span>
                            </summary>
                            <div className="text-gray-600 dark:text-gray-300 px-5 pb-5 pt-0 leading-relaxed text-sm">
                                You can cancel directly from your "My Bookings" dashboard.
                                The system automatically calculates your refund amount
                                based on the time remaining until your event.
                            </div>
                        </details>
                        {/* FAQ Item 2 */}
                        <details className="group bg-white dark:bg-[#2a2018] rounded-lg border border-gray-200 dark:border-gray-700 open:border-[#ec7f13]/50 dark:open:border-[#ec7f13]/50 transition-colors">
                            <summary className="flex justify-between items-center cursor-pointer p-5 list-none">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    What if the Pandit is late?
                                </span>
                                <span className="transition group-open:rotate-180">
                                    <span className="material-icons text-gray-400">
                                        expand_more
                                    </span>
                                </span>
                            </summary>
                            <div className="text-gray-600 dark:text-gray-300 px-5 pb-5 pt-0 leading-relaxed text-sm">
                                If the Pandit is delayed by more than 30 minutes, please
                                contact our emergency helpline. If delay exceeds 60
                                minutes, it falls under our Partial Fallback Liability,
                                and you may be eligible for partial refunds.
                            </div>
                        </details>
                        {/* FAQ Item 3 */}
                        <details className="group bg-white dark:bg-[#2a2018] rounded-lg border border-gray-200 dark:border-gray-700 open:border-[#ec7f13]/50 dark:open:border-[#ec7f13]/50 transition-colors">
                            <summary className="flex justify-between items-center cursor-pointer p-5 list-none">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    How long do refunds take?
                                </span>
                                <span className="transition group-open:rotate-180">
                                    <span className="material-icons text-gray-400">
                                        expand_more
                                    </span>
                                </span>
                            </summary>
                            <div className="text-gray-600 dark:text-gray-300 px-5 pb-5 pt-0 leading-relaxed text-sm">
                                Refunds are processed by HmarePanditJi within 24 hours.
                                However, depending on your bank or credit card provider,
                                it may take 5-7 business days for the amount to reflect
                                in your account.
                            </div>
                        </details>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="text-center pt-8 pb-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Have a unique situation not covered here?
                    </p>
                    <div className="inline-flex gap-4">
                        <a
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#ec7f13] hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                            href="#"
                        >
                            Contact Support
                        </a>
                        <a
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            href="#"
                        >
                            Read Full Terms
                        </a>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="bg-white dark:bg-[#2a2018] border-t border-gray-200 dark:border-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="material-icons text-[#ec7f13]">
                            temple_buddhist
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                            HmarePanditJi
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        © 2023 HmarePanditJi. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
