"use client";

import React from "react";
import Link from "next/link";

export default function VerificationDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="bg-[#f8f6f6] dark:bg-[#1a120e] text-slate-900 dark:text-slate-100 min-h-screen font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-[#3d2b21] bg-white/80 dark:bg-[#1a120e]/80 backdrop-blur-md">
                <div className="px-6 flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-8">
                        <Link href="/admin" className="flex items-center gap-3 text-[#ec5b13]">
                            <span className="material-symbols-outlined text-3xl font-bold">
                                account_balance
                            </span>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                                VedaAdmin
                            </h2>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                className="text-slate-600 dark:text-slate-400 hover:text-[#ec5b13] transition-colors text-sm font-medium"
                                href="#"
                            >
                                Dashboard
                            </Link>
                            <Link
                                className="text-[#ec5b13] text-sm font-semibold border-b-2 border-[#ec5b13] py-5"
                                href="/admin/verifications"
                            >
                                Applications
                            </Link>
                            <Link
                                className="text-slate-600 dark:text-slate-400 hover:text-[#ec5b13] transition-colors text-sm font-medium"
                                href="#"
                            >
                                Verification
                            </Link>
                            <Link
                                className="text-slate-600 dark:text-slate-400 hover:text-[#ec5b13] transition-colors text-sm font-medium"
                                href="#"
                            >
                                Settings
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4 flex-1 justify-end">
                        <div className="relative max-w-sm w-full hidden sm:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                search
                            </span>
                            <input
                                className="w-full bg-slate-100 dark:bg-[#2a1e17] border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#ec5b13]/50 text-slate-900 dark:text-white placeholder:text-slate-500"
                                placeholder="Search Pandit ID, Name..."
                                type="text"
                            />
                        </div>
                        <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a1e17] rounded-xl transition-all">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="h-10 w-10 rounded-full border-2 border-[#ec5b13] overflow-hidden">
                            <div className="w-full h-full bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDdQcQrZxGwyU9rt4x9dsWMJgitzeFNbMm0UGdez7eie7N_Semjh1ksZDM_bARkI1uR4tOz8vusCu1734igwGnDACJSYNyPM8tG3P74zKrT6_W3pHrcj_8xeZMt6OQhL_jMV1ZlkO7WkDVZUCIyYL-pwUyOBwSNb96PbOqKrH-M0tDtK0ZHgSIvAz-LwfNw_0wH9NwR6WXHOzEdSS-JWNHUhdj5ED2jNt3EoPwsalw3XbzOAj1a9G6RqdF2ZYHOmXTRR4nFqvchpGY")' }}></div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto p-4 lg:p-6 space-y-6">
                {/* Breadcrumb & Header Profile */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <Link href="/admin/verifications" className="hover:text-[#ec5b13]">
                                Applications
                            </Link>
                            <span className="material-symbols-outlined text-xs">
                                chevron_right
                            </span>
                            <span className="text-slate-900 dark:text-slate-300">
                                Review: Pandit Vishnu Shastri
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-[#ec5b13]/20 bg-[#2a1e17]">
                                <div className="w-full h-full bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9Fg7lwZv6h2O4pMPrvHuNP9knpRCmthrMN6R07haJzRIrPS8_wrumEBqo43xkwsmleAgrhpHBrLJRcZwPk5jxpZEbG_1wji8IsNZszWjrML55ZcOky3bSGZjtsi_g1oKblUY4gWd7-x_z7xGBUcwqrNKQQlI4l8I6pOas-vgU3KXRhNRkQpQsNKTdZBC5N8ue4X6oCF_jiZ1RwsL-ifZWCakh6-lPeq74oxHYDN3nwTLYUqqkKa_GPkpJiRJcfHUKIIUgm8HCWEc")' }}></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold dark:text-white">
                                    Pandit Vishnu Shastri
                                </h1>
                                <p className="text-slate-500 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">
                                        location_on
                                    </span>{" "}
                                    Varanasi, UP • Joined Oct 2023 • ID: #{params.id}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                        <div className="bg-[#ec5b13]/10 dark:bg-[#ec5b13]/20 border border-[#ec5b13]/30 p-4 rounded-xl flex items-center gap-4">
                            <div className="relative flex items-center justify-center">
                                <svg className="w-14 h-14 transform -rotate-90">
                                    <circle
                                        className="text-[#ec5b13]/20"
                                        cx="28"
                                        cy="28"
                                        fill="transparent"
                                        r="24"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <circle
                                        className="text-[#ec5b13]"
                                        cx="28"
                                        cy="28"
                                        fill="transparent"
                                        r="24"
                                        stroke="currentColor"
                                        strokeDasharray="150.8"
                                        strokeDashoffset="150.8"
                                        strokeWidth="4"
                                        style={{
                                            strokeDashoffset: "calc(150.8 - (150.8 * 94) / 100)",
                                        }}
                                    ></circle>
                                </svg>
                                <span className="absolute text-sm font-bold text-[#ec5b13]">
                                    94
                                </span>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider font-bold text-[#ec5b13]/80">
                                    Expertise Score
                                </p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    Superior Rank
                                </p>
                            </div>
                        </div>
                        <button className="flex-1 md:flex-none px-6 py-3 bg-[#2a1e17] hover:bg-[#3d2b21] border border-[#3d2b21] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">download</span> Dossier
                        </button>
                    </div>
                </div>

                {/* Verification Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Identity & Video */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Aadhaar Verification */}
                        <section className="bg-white dark:bg-[#2a1e17] rounded-xl border border-slate-200 dark:border-[#3d2b21] overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-[#3d2b21] flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#ec5b13]">
                                        fingerprint
                                    </span>{" "}
                                    Aadhaar Verification
                                </h3>
                                <span className="px-2.5 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
                                    98% Match
                                </span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-[#1a120e] p-3 rounded-lg border border-dashed border-slate-300 dark:border-[#3d2b21]">
                                        <div className="w-full h-40 bg-cover rounded-md opacity-50 grayscale" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBdpvLRdldDAKo7Qcm5gNVBnKHDAEUS7WJfUd7_An9AIJjSUNLJtp5zWXgUR2hhC3mVPMNHQXCK4iGXC540DR4RbT0bRfvmaMh4pMBFXp6u08m6dQ8oHgTuIi4fxfcKsIVY53H-ScEv_95Z30EpYF_0hOgCCfcCwcKb2uj4yQfugSxwCHtmQtIhVyFsX5DUQN9Tyt9_aGWh2qPCf27vnWOuSfecvwzrBTROfLG4Xuj6cC2S4PzyrQwpgp7DyJ68amYgKMAEbj1pKJ8")' }}></div>
                                        <button className="w-full mt-3 py-2 bg-[#ec5b13]/10 text-[#ec5b13] text-sm font-bold rounded-lg hover:bg-[#ec5b13]/20 transition-all">
                                            View Full Scan
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-200 dark:border-[#3d2b21]">
                                        <span className="text-slate-500 text-sm font-medium">
                                            Field
                                        </span>
                                        <span className="text-slate-500 text-sm font-medium">
                                            OCR Extraction
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <span className="text-xs font-bold uppercase text-slate-400">
                                            Full Name
                                        </span>
                                        <span className="text-sm font-semibold dark:text-white">
                                            Vishnu Kant Shastri
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <span className="text-xs font-bold uppercase text-slate-400">
                                            Date of Birth
                                        </span>
                                        <span className="text-sm font-semibold dark:text-white">
                                            15/05/1978
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <span className="text-xs font-bold uppercase text-slate-400">
                                            Aadhaar No.
                                        </span>
                                        <span className="text-sm font-semibold dark:text-white">
                                            XXXX-XXXX-9901
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <span className="text-xs font-bold uppercase text-slate-400">
                                            Address Match
                                        </span>
                                        <span className="text-sm font-semibold text-green-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-base">
                                                check_circle
                                            </span>{" "}
                                            Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* Video KYC & Phonetics */}
                        <section className="bg-white dark:bg-[#2a1e17] rounded-xl border border-slate-200 dark:border-[#3d2b21] overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-[#3d2b21] flex justify-between items-center bg-slate-50/50 dark:bg-[#1a120e]/20">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#ec5b13]">
                                        videocam
                                    </span>{" "}
                                    Video KYC &amp; Phonetics Analysis
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-slate-200 dark:bg-[#3d2b21] text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded">
                                        Ritual Speed: 1.2x
                                    </span>
                                    <span className="px-2 py-1 bg-[#ec5b13]/10 text-[#ec5b13] text-[10px] font-bold uppercase rounded">
                                        AI Verified
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row h-[400px]">
                                <div className="flex-1 bg-black relative group">
                                    <div className="w-full h-full bg-cover opacity-60" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpOWV3umqysaumJNwHlSP4guVk9rRv3uQf48JuDL3OMLdV5xgtJI072H8kCE3nHCnBRf8w0GHGOAVosDNz0zwXrrwSv-OfsqxdPFmTSq73L634ZlQvH6cWGHYDVVlpbxIAqjBt_s85MtRqxKxlR62hDkGTCnD87E4DKgQMynGHKztkniggQUvMCDnmUydL_4yKapZW6J42G1nPvb_e8s-IWFZsZWY6zN5CUt0l1UAEr5o_iUGDxJNfXh6ZZVt09aH3xxBieLb9010")' }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button className="h-16 w-16 bg-[#ec5b13] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-4xl fill-1">
                                                play_arrow
                                            </span>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#ec5b13] w-1/3"></div>
                                    </div>
                                </div>
                                <div className="w-full md:w-72 bg-slate-50 dark:bg-[#1a120e] border-l border-slate-200 dark:border-[#3d2b21] flex flex-col">
                                    <div className="p-3 border-b border-slate-200 dark:border-[#3d2b21] font-bold text-xs uppercase text-slate-500">
                                        AI Phonetic Notes
                                    </div>
                                    <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-[#ec5b13]">
                                                <span>00:45</span>
                                                <span>High Confidence</span>
                                            </div>
                                            <p className="text-xs dark:text-slate-300 leading-relaxed italic">
                                                "Gayatri Mantra recital clarity is exceptionally high.
                                                Phoneme 'bhargo' pronounced correctly."
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                <span>01:22</span>
                                                <span>Standard</span>
                                            </div>
                                            <p className="text-xs dark:text-slate-300 leading-relaxed italic">
                                                "Sanskrit diction flow is consistent with traditional
                                                Varanasi school of thought."
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                <span>02:15</span>
                                                <span>Note</span>
                                            </div>
                                            <p className="text-xs dark:text-slate-300 leading-relaxed italic">
                                                "Visual presence: Calm and professional. Background
                                                matches reported location."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Academic & Background */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Academic Credentials */}
                        <section className="bg-white dark:bg-[#2a1e17] rounded-xl border border-slate-200 dark:border-[#3d2b21]">
                            <div className="p-4 border-b border-slate-200 dark:border-[#3d2b21]">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-500">
                                        school
                                    </span>{" "}
                                    Academic Credentials
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="aspect-[4/5] bg-[#f8f6f6] dark:bg-[#1a120e] rounded-lg overflow-hidden border border-slate-200 dark:border-[#3d2b21] group relative">
                                    <div className="w-full h-full bg-cover opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIuWIQrhaYKLYY6FHF2esqN0iJZiMCS7VLiKZI65EEG8yFDfi8t3-H2AvqMolrVCWoLyeoIzbAiaplFLv_W8RovDlHuaMfnnHKnllwLbM6ErwvNkQZbZaogYQI6YOsH39mu0f7epBtvwb9GtUQavf1D7o1M5t2pZYVDb2Av5ebl16H4bce04EDbrLJf9l65i-GB37-LAWPE_7A1mh5Qs8rAcEiUcpgdeMVBOoDVNuDY5UT7F2nXP0lwXtqp5AZwVq7dxQevzemNIQ")' }}></div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg cursor-pointer">
                                            View High Res
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">
                                            Qualification
                                        </p>
                                        <p className="text-sm font-semibold dark:text-white">
                                            Acharya (Masters in Vedic Studies)
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">
                                            Institution
                                        </p>
                                        <p className="text-sm font-semibold dark:text-white">
                                            Sampurnanand Sanskrit Vishwavidyalaya
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-green-500">
                                                verified
                                            </span>
                                            <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase">
                                                Degree Verified
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                            June 2022
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* Background Check */}
                        <section className="bg-white dark:bg-[#2a1e17] rounded-xl border border-slate-200 dark:border-[#3d2b21]">
                            <div className="p-4 border-b border-slate-200 dark:border-[#3d2b21]">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#ec5b13]">
                                        gavel
                                    </span>{" "}
                                    Background Check
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                <span className="material-symbols-outlined text-sm">
                                                    check
                                                </span>
                                            </div>
                                            <div className="w-0.5 h-8 bg-green-500/30 my-1"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">
                                                Criminal Record Clear
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                No matches found in CCTNS national database.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                <span className="material-symbols-outlined text-sm">
                                                    check
                                                </span>
                                            </div>
                                            <div className="w-0.5 h-8 bg-green-500/30 my-1"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">
                                                Residential Verification
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Physical address verified via third-party agent.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full bg-[#ec5b13] flex items-center justify-center text-white animate-pulse">
                                                <span className="material-symbols-outlined text-sm">
                                                    sync
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">
                                                Social Media Scan
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                AI currently processing public profiles...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Sticky Decision Bar */}
                <div className="sticky bottom-6 left-0 right-0 z-40">
                    <div className="bg-white/80 dark:bg-[#2a1e17]/95 backdrop-blur-md border border-slate-200 dark:border-[#3d2b21] p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-[#ec5b13]/10 rounded-full flex items-center justify-center text-[#ec5b13]">
                                <span className="material-symbols-outlined">
                                    verified_user
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-500">
                                    Vetting Recommendation
                                </p>
                                <p className="text-sm font-bold dark:text-white">
                                    Highly Recommended for Premium Category
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all border border-red-500/20">
                                Reject
                            </button>
                            <button className="flex-1 md:flex-none px-6 py-3 bg-slate-200 dark:bg-[#3d2b21] hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all">
                                Request Info
                            </button>
                            <button className="flex-1 md:flex-none px-8 py-3 bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(236,91,19,0.3)]">
                                Approve Pandit
                            </button>
                            <button className="hidden lg:flex p-3 bg-slate-100 dark:bg-[#1a120e] text-slate-500 rounded-xl hover:text-[#ec5b13] transition-colors">
                                <span className="material-symbols-outlined">skip_next</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Spacing for sticky bar */}
                <div className="h-20"></div>
            </main>
        </div>
    );
}
