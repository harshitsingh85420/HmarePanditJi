"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function VerificationsQueuePage() {
    const [selectedId, setSelectedId] = useState("APID-20934");

    return (
        <div className="flex flex-col min-h-screen bg-[#f6f7f8] dark:bg-[#101922] text-slate-800 dark:text-slate-200 font-sans">
            <nav className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-[#137fec] p-2 rounded-lg text-white">
                        <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">
                            HmarePanditJi <span className="text-[#137fec]">Admin</span>
                        </h1>
                        <p className="text-xs text-slate-500">Centralized Operations &amp; Vetting</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="font-medium">System Online</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold">Admin User</p>
                            <p className="text-xs text-slate-500">Super Admin</p>
                        </div>
                        <div className="h-10 w-10 rounded-full border-2 border-[#137fec]/20 overflow-hidden">
                            <div className="w-full h-full bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCARs40hvKb1EBVHM4WlZOmebo5djDqKVv7t3yniMpiYSQFczRx1Won1f1fNDIp0FQqVNC0COesVSeQFoCAgVGGNfdEaCBUhYOQE3lGhuFOmrL-hgxpzWlzRltgvaXm0Qjt9BER2ScwerxDrGSA7fgi92X1vVZyGNfqZ3uQLGi4kDfkNb96RYJid84jjd1Xnbws6yO_Y1tKY0BLlvxBCphTL19A5FuCyYMDyaqHYK0fg-wMQWa1f0cf1x6ZnSoaAC5aF3jKkXcUYNQ")' }}></div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex h-[calc(100vh-64px)] overflow-hidden">
                <aside className="w-1/4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
                                search
                            </span>
                            <input
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#137fec]"
                                placeholder="Search applications..."
                                type="text"
                            />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 bg-[#137fec] text-white py-1.5 rounded text-xs font-semibold">
                                PENDING (24)
                            </button>
                            <button className="flex-1 bg-slate-100 dark:bg-slate-800 py-1.5 rounded text-xs font-semibold">
                                REVIEWS (12)
                            </button>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Selected Applicant */}
                        <div
                            className={`p-4 cursor-pointer border-l-4 ${selectedId === 'APID-20934' ? 'bg-[#137fec]/5 border-[#137fec]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent transition-colors'}`}
                            onClick={() => setSelectedId('APID-20934')}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#137fec]">
                                    APID-20934
                                </span>
                                <span className="text-xs text-slate-500">2h ago</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <div className="w-full h-full bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB47bUav9Vi8Nu13y6G3UfEPOR6EapbnL1YwxbkXZbuIpQHKZKNIFRTmtfT09WOhjUHv8kC6ZIn3Uwd_a0I24091WSEjZO1_Ml5g6HGt7aB22CytpSIPObmuuiKLh7Nw2dfx2FUGoiNqINpUdYiAajxFdT0aU_gWZJSVcYmho-_Sg8x18TsORv8Ku1Eu_erUWrE_qIRyojw2CxJbHXjdVGnHaQqimuRMBnYjdOxldXquP9G4eIfuMgHgrCEUMyGidoJaXuj65Z1lLA")' }}></div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Pandit Vishnu Shastri</p>
                                    <p className="text-xs text-slate-500">Varanasi, Uttar Pradesh</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">Risk Score:</span>
                                    <span className="text-xs font-bold text-green-500">12/100</span>
                                </div>
                                <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[12%]"></div>
                                </div>
                            </div>
                        </div>
                        {/* Other Applicants */}
                        <div
                            className={`p-4 cursor-pointer border-l-4 ${selectedId === 'APID-20935' ? 'bg-[#137fec]/5 border-[#137fec]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent transition-colors'}`}
                            onClick={() => setSelectedId('APID-20935')}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    APID-20935
                                </span>
                                <span className="text-xs text-slate-500">4h ago</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <div className="w-full h-full bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGFoqR9qSERX2s1U1dfbvnM7nV517uVb49JVC7KbiyI-sYQopFS4R2E5oBYs_8dNjSiJX7cBj3vuFgS2KeECzlvS9Z1Q0r72P4VgwSRQHEyov2AIAakwTUeIza9V2phJwjSkEcB4qK7RAvmZdmNJMn5-Qo9Jl8_Tq8GvfI7PnZma5fNh7qe1oBqLZQC8oaRiH7utgZ95QQcAxLQnMrPhNu-_zeHuZf6DVplPfOE-SX4WsvExhYPuQJecdbAcEojN7hPN8os8d70a4")' }}></div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Acharya Ravi Kumar</p>
                                    <p className="text-xs text-slate-500">Haridwar, Uttarakhand</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">Risk Score:</span>
                                    <span className="text-xs font-bold text-orange-500">48/100</span>
                                </div>
                                <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[48%]"></div>
                                </div>
                            </div>
                        </div>
                        <div
                            className={`p-4 cursor-pointer border-l-4 ${selectedId === 'APID-20936' ? 'bg-[#137fec]/5 border-[#137fec]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent transition-colors'}`}
                            onClick={() => setSelectedId('APID-20936')}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    APID-20936
                                </span>
                                <span className="text-xs text-slate-500">6h ago</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <div className="w-full h-full bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBpkj22G2w6_gkgZgxMRWP6Q1RN8nkS0WxdisvZK6AjL0JiC3uB9W3ZfFBPS5Ku37lmESOSh_sEHaHhl6TMPOqH4rGMQyENlmmL3VvBM43KDqmRPOvP_9gjFQkVWuptGzE9hd_WzH5NdAmAO3KYgsKxpHlUjQvVpsEJvDDSCflq41h31v15n-tfr0BD0qlewI408Wcha7lp8g9FtFEskVapu_z08OlLGjXzPFKzKTPMk003MKx-l9S0ORgmCR9G8CZqVSVHIcpsZV0")' }}></div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Pandit Madhav Das</p>
                                    <p className="text-xs text-slate-500">Ujjain, MP</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">Risk Score:</span>
                                    <span className="text-xs font-bold text-red-500">82/100</span>
                                </div>
                                <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[82%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex-1 flex flex-col overflow-hidden">
                    {/* Details Header */}
                    <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <span className="material-symbols-outlined text-[#137fec]">
                                    verified_user
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Pandit Vishnu Shastri</h2>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs text-green-500">
                                            check_circle
                                        </span>{" "}
                                        Application Complete
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">
                                            location_on
                                        </span>{" "}
                                        Varanasi (Central HQ)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-400 uppercase">
                                    Expertise Score
                                </p>
                                <p className="text-2xl font-black text-[#137fec]">94/100</p>
                            </div>
                            <Link href="/admin/verifications/APID-20934" className="bg-[#137fec] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#137fec]/90">
                                Full Details
                            </Link>

                        </div>
                    </div>

                    {/* Deep Dive Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f6f7f8] dark:bg-[#101922]">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Aadhaar Verification */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500 text-sm">
                                            badge
                                        </span>
                                        Aadhaar Verification
                                    </h3>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded uppercase">
                                        Match Found
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs py-2 border-b border-dashed border-slate-200 dark:border-slate-800">
                                        <span className="text-slate-500">ID Number:</span>
                                        <span className="font-mono font-medium">
                                            XXXX XXXX 8291
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs py-2 border-b border-dashed border-slate-200 dark:border-slate-800">
                                        <span className="text-slate-500">Name Match:</span>
                                        <span className="text-green-500 font-bold">98% Match</span>
                                    </div>
                                    <div className="flex justify-between text-xs py-2">
                                        <span className="text-slate-500">DOB Verification:</span>
                                        <span className="text-green-500 font-bold">Verified</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex items-center gap-3">
                                        <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-400">
                                                image
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold">
                                                Aadhaar_Front_Vishnu.jpg
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                OCR Confidence: 94.2%
                                            </p>
                                        </div>
                                        <button className="text-[#137fec] text-xs font-bold">
                                            VIEW
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Video KYC */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-sm">
                                            videocam
                                        </span>
                                        Video KYC &amp; Phonetics
                                    </h3>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold">
                                            AI AI SCORE
                                        </p>
                                        <p className="text-lg font-black text-[#137fec]">
                                            78/100
                                        </p>
                                    </div>
                                </div>
                                <div className="relative group aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 w-full h-full bg-cover opacity-60" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD-YQtreJNGNZv_Fs08jjvN0kr8C7vHNoWOFrcF4usv2EPLguABMkkgnzis29tcRS3-tAYS18KuwUi8nait40mAodgt0sw4B9aozrRdsmf3MwkvWOboGHQ5GBG9C5h3eCvxV20r8lefgFWB91aMRlTRnlTXlFB4zSk0ryoxHhIovOttpRo1oBK60uivSFuhfjGfRfdAmUQQuFCY_RQMtTgU2vsjpPnl49WxknO-gZzsNT8ovPvbQ1f2I2B3yKQNbaPKq5BZsmJCaFU")' }}></div>
                                    <button className="z-10 bg-[#137fec]/90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">play_arrow</span>
                                    </button>
                                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                                        <div className="flex-1 h-1 bg-[#137fec]/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#137fec] w-2/3"></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-3 text-[11px] text-slate-500 leading-relaxed italic">
                                    "Mantra pronunciation clarity is high. Minor dialect variations
                                    noted in Gayatri Mantra recital."
                                </p>
                            </div>
                        </div>

                        {/* Second Row */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Sanskrit Certificate */}
                            <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-orange-500 text-sm">
                                            workspace_premium
                                        </span>
                                        Academic Credentials
                                    </h3>
                                    <div className="flex gap-2">
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                            <span className="material-symbols-outlined text-sm">
                                                zoom_in
                                            </span>
                                        </button>
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                            <span className="material-symbols-outlined text-sm">
                                                file_download
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/3 aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                                        <div className="w-full h-full bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAgUt5SClO8Zo4v534-GRbg7sqP0lqItu-HT-NHc60x17wLo8bahMMeLxE5gyMMhydwEV2mCE6iUY3uqXP4oLDiJiAzevAAPC0wl49gVFkF9TnazZ2S3fTQL1THSuWD4AjC0biOa5aKtBQNs9hFwKpg66At_sF3fY7yNf3LckDAJ819-F0ssJRXrg8HINH-IYCh3zwYnH9Yf3U3IgaatxKxP3iCXl_I3xBCHfFda_kq31j_ucgJEWYvTIvfr4jyL95GOth_N6uZ96s")' }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                                            <span className="text-[9px] text-white font-medium uppercase">
                                                Acharya Degree - BHU
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-[#137fec]/5 p-3 rounded-lg">
                                            <p className="text-[10px] text-[#137fec] font-bold uppercase mb-1">
                                                Institution Verification
                                            </p>
                                            <p className="text-sm font-semibold">
                                                Banaras Hindu University (BHU)
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Year of Passing: 1998 • Grade: A+
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-500 text-sm">
                                                    check_circle
                                                </span>
                                                <span className="text-xs">
                                                    Seal and Signature Authenticated
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-500 text-sm">
                                                    check_circle
                                                </span>
                                                <span className="text-xs">
                                                    Public Ledger Record Matched
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-300 text-sm">
                                                    radio_button_unchecked
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    Previous Employment Check (In Progress)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Check */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col">
                                <h3 className="font-bold flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-purple-500 text-sm">
                                        gavel
                                    </span>
                                    Background Check
                                </h3>
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-green-500 text-3xl">
                                            verified
                                        </span>
                                    </div>
                                    <p className="font-bold text-green-500">NO RECORDS FOUND</p>
                                    <p className="text-[11px] text-slate-500 mt-2">
                                        Searched across national criminal database, civil court
                                        records, and sex offender registry.
                                    </p>
                                </div>
                                <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <p className="text-[10px] text-slate-400">
                                        LAST SYNC: 15 OCT 2023, 10:45 AM
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decision Footer */}
                    <footer className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-4">
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Internal Note:
                            </label>
                            <input
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-80 px-4 py-2 focus:ring-1 focus:ring-[#137fec]"
                                placeholder="Add a comment for the team..."
                                type="text"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 text-red-500 border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors">
                                REJECT
                            </button>
                            <button className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors">
                                REQUEST INFO
                            </button>
                            <button className="px-8 py-2 bg-[#137fec] hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-[#137fec]/20 transition-colors">
                                APPROVE PANDIT
                            </button>
                        </div>
                    </footer>
                </section>
            </main>
        </div>
    );
}
