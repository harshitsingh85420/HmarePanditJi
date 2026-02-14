"use client";

import { useState } from "react";

const UPCOMING_WEDDINGS = [
    {
        id: "HP-9021",
        client: "Aditi & Rahul",
        date: "Oct 12, 2023",
        venue: "Taj Palace, Delhi",
        pandit: "Pt. Rajesh Sharma",
        panditImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-F7u_fcyGTg7oZhWGwcREIiWDDx9X4vPyTmWtHFjyMrY9snI-GhlBN8GbrJJZPqq1qpQCZWKImBloo5uUFcZN5phpbsM80vZbil0O0GawREOylMnjATDrqe1TcteHTfBzJ7DY9gAxL3-sjojvtQCyIrAZRsfOZHAOQqiJmQViJB34VU6JN9dI1WZC9fPKdBPPl1ITTQ0Vo8pajXlu7mah8OoXEwFAgjLD_N0R0IavZc1l96cg5QztNWfGJApfhKm7jPmZP9n2k_o",
        status: "Confirmed",
        statusColor: "bg-green-100 text-green-700",
    },
    {
        id: "HP-9044",
        client: "Priya & Amit",
        date: "Oct 18, 2023",
        venue: "The Leela, Mumbai",
        pandit: "Pt. Vishnu Kant",
        panditImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvPMX1gNaiQwi7KYXTcvqaut7n9NqH6Xhot6aImt9Mm85QKZkmMibkzPG9l9SIJDofS9D4rwIpY_uFJAcQaol0madsMJKexmlO-vYHB45x7h0DgaFcxt-3HIg6aaNeC5J7RTKgnwVORALRV-akJ_lHZ8JPHFY3BupmJHhG_Hmuf1paEryZ2DDx5YfHYoeCgf1ftaNNmld3hgAnMdprF0lFEcEIBuBlyDA8eryUcDfTZ-pAPBXtRYWpgdqelYXDfnDHH4FBrGnV-L8",
        status: "Pending",
        statusColor: "bg-orange-100 text-orange-700",
    },
    {
        id: "HP-9088",
        client: "Sanya & Vikram",
        date: "Nov 05, 2023",
        venue: "ITC Rajputana, Jaipur",
        pandit: "Pt. G.N. Shastri",
        panditImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcfTz9jUqvFrHV264f1xH3_FHhI0wkFuIb4XaiE_XSr3nnHUI7Uxc2Clz5q54nBg1iqFHejphW9mLAKVwN73yY0k2P_uS1iIvj0qaaqBA2CZOeEusnldMmotmXt1wssfx71U50iG6AGy33De7KOmX-laO2jap-al76hqJaUgy9DateH4U8731Fu1nkAw0PH1XIDvxuG6HA2JvlXhQNxGw0Qn1TXMxGiKeRqN_UuFEJq7CFaUiDpc1nPOHubCJ8nC-pMC6MLpYNKbA",
        status: "Confirmed",
        statusColor: "bg-green-100 text-green-700",
    },
];

const PREFERRED_PANDITS = [
    {
        name: "Pt. Rajesh Sharma",
        rating: 4.9,
        specialization: "Vedic Rituals, North Indian Weddings",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4dSQ6ZOzOPi1BVup4WOyjdggnYyb6ifu0u0BEz8J09HBgZkjscVZ_SyL3YEcvHKdAldXcsKfaslr5Dlk4kgmWo_SY4lf4NakIlxPq-vJEB8pIG66z0O78jlLd6EcRAQGhHkVvkAXnan34Tp67cn01LHiAGxr_uc3kkXEAzX-KrRtx_2ROWBanC05i4rNRGGcV30QZ8a2N-25vl8_CnEyn7RxnIgxPDBhfSgbIBRw-8ajGaVNdRkospuciSUkwkf7KOCeQ4R_e5lY"
    },
    {
        name: "Pt. K. Srinivasan",
        rating: 4.8,
        specialization: "Tamil/Telugu Brahmin Traditions",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVCjmq-ujZXvZuy7VHtqbDm5kXoH25dewrdMtytV08uRjP3e1dVwwg0vpBWAo22uB9fJZ-vMBzeHpq7eDe_R6OugTfotRjgQmB3ItDTy4TRfx4fwKd9eUlcnnoTgMWCCYvAaJTlRbi1fuuRjLk1iPKIv6cQF-aFvVekb4edxkUdrHTQq7_OJD26IBGsS2B94kLk6vKsCBth0VXGLojjU6cdks6nTCwILyyXm898HwRz6WZ5jFCfxNCvq9Y4AITZ3xoXyXBoKzLx6Q"
    },
    {
        name: "Pt. G.N. Shastri",
        rating: 5.0,
        specialization: "Maharashtrian & Marwari Rituals",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1SyGQeh3HqUmVyWi4Z39olmoxvuV9UFAqB8IA0uPveYyE3ehGRSFX3R4rCBCpJmDtp6452ObOJ8NjIHob1wrZKMogv8wrea-WF_U7KVtWLuw9Qf5Z9PG5AuuGKJUETc_VlwNOEN0aMhnYj0q2Yweg5jxCAXsf7DnwjZqaLgiGDZdgxMgP7Ar3t3b559yah7LWDpxKWBwBWqf2354cUl4a2W3HvWl5hLoCIQhMpkhwrXJMsNm0Sni7iu-DQxiTGaG1ZjGSaoKhX3E"
    },
    {
        name: "Pt. Vishnu Kant",
        rating: 4.7,
        specialization: "Destination Weddings, Modern Rituals",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtCPqy7vi96f7UefWAdolE6IJYW68DRe4V0ekv0GNAs8nO1EEeYmkr79r9Q5O_TWVOf5UBMhhE391qClVnAPRgP7vh9V5UUYqmn_NbD-O9pdi8SWG0irSGT8GcmBHfHcNVDDg5ZBQaDC04OWgXdmjkyRMJ7U9p-rn1sJMvf9XqTvnBGY3v_jdSkD52L9mrCc2AoDP2pXGUi55MotYvjsmZhnMtODVh_mPGkCotOo-sGhiQ9uHjn94jw-D3f39BmM-FSxRYTZhONGo"
    }
];

export default function WeddingPlannerDashboard() {
    return (
        <main className="flex-1 p-8 overflow-y-auto bg-[#f6f6f8] dark:bg-[#101622] font-display text-slate-900 dark:text-slate-100 h-[calc(100vh-64px)]">

            {/* ── Header ────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Professional Planner Portal</h2>
                    <div className="flex items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                        <input className="bg-transparent border-none focus:ring-0 text-sm w-64 outline-none placeholder-slate-400 ml-2" placeholder="Search events or Pandits..." type="text" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">Wedding Artistry Co.</p>
                            <p className="text-[10px] text-slate-500 font-medium">Gold Member</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrqJ-5KPlAfISQm50DAsdrDemuPl2GjW8diG9x5vYi0NiAsQ_mpH0PMjm2m8qOLd-A_CEE6iNrVIVSv6P7Lc12uw1q_5FDcNQcjZbypq2mq6DkNRjrYNomsjHbpWcUCfYYZxIYHHazW7vsNgyILGJh7ZvbYJaYNmtGu1tjhi_F4DV0TcMzHS7_FH58IHY3dGwGPzJU2oDt3jRLN_kSycmByjBZ5mLKjHOSpLqDI7wSMS3W_Wz-7p3Az2Z2HYsd6OVK9-mlXsVMte8')" }}></div>
                    </div>
                </div>
            </div>

            {/* ── Metrics Section ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-2 bg-[#1152d4]/10 text-[#1152d4] rounded-lg material-symbols-outlined">celebration</span>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+12%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Weddings</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">24</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg material-symbols-outlined">person_check</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Stable</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Confirmed Pandits</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">22</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-2 bg-[#FF9933]/10 text-[#FF9933] rounded-lg material-symbols-outlined">hourglass_top</span>
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Action Required</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Pending Muhurat</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">02</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

                {/* ── Main Table: Upcoming Weddings ───────────────────────────────── */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-800 dark:text-white">Upcoming Weddings</h3>
                        <button className="text-sm font-semibold text-[#1152d4] hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-semibold border-b border-slate-100 dark:border-slate-800">Client Name</th>
                                    <th className="px-6 py-3 font-semibold border-b border-slate-100 dark:border-slate-800">Wedding Date</th>
                                    <th className="px-6 py-3 font-semibold border-b border-slate-100 dark:border-slate-800">Venue</th>
                                    <th className="px-6 py-3 font-semibold border-b border-slate-100 dark:border-slate-800">Assigned Pandit</th>
                                    <th className="px-6 py-3 font-semibold border-b border-slate-100 dark:border-slate-800 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {UPCOMING_WEDDINGS.map((wedding) => (
                                    <tr key={wedding.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{wedding.client}</p>
                                            <p className="text-xs text-slate-400">ID: {wedding.id}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{wedding.date}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{wedding.venue}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url('${wedding.panditImg}')` }}></div>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{wedding.pandit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${wedding.statusColor}`}>
                                                {wedding.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Side Features ────────────────────────────────────────────────── */}
                <div className="space-y-6">
                    {/* Quick Booking */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#D4AF37]">bolt</span>
                            <h3 className="font-bold text-slate-900 dark:text-white">Quick Booking</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Saved frequent Pandit + Samagri combinations</p>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-[#D4AF37] transition-all group bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm font-semibold group-hover:text-[#D4AF37] text-slate-900 dark:text-white">Vedic Vivah Special</p>
                                <p className="text-[10px] text-slate-400">Senior Pandit + Full Havan Kit + GST</p>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-[#D4AF37] transition-all group bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm font-semibold group-hover:text-[#D4AF37] text-slate-900 dark:text-white">Sangeet Sandhya Kit</p>
                                <p className="text-[10px] text-slate-400">Bhajan Group + Basic Samagri</p>
                            </button>
                        </div>
                    </div>

                    {/* Bulk Invoices */}
                    <div className="bg-[#1152d4] text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">receipt_long</span>
                                <h3 className="font-bold">Bulk Invoicing</h3>
                            </div>
                            <p className="text-sm text-blue-100 mb-4">Manage GST compliant invoices for all active events.</p>
                            <button className="bg-white text-[#1152d4] text-xs font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">Generate Batch</button>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-blue-400/20 text-9xl pointer-events-none">account_balance_wallet</span>
                    </div>
                </div>

            </div>

            {/* ── Preferred Pandit List ─────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#D4AF37]">star</span>
                        <h3 className="font-bold text-slate-900 dark:text-white">Preferred Pandit List</h3>
                    </div>
                    <span className="text-xs text-slate-400 italic">Priority booking access enabled</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                    {PREFERRED_PANDITS.map((pandit, idx) => (
                        <div key={idx} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-cover bg-center shadow-sm" style={{ backgroundImage: `url('${pandit.img}')` }}></div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{pandit.name}</p>
                                    <div className="flex items-center gap-1 text-[#D4AF37]">
                                        <span className="material-symbols-outlined text-xs">star</span>
                                        <span className="text-xs font-bold">{pandit.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mb-4 min-h-[2.5em]">Specialization: {pandit.specialization}</p>
                            <button className="w-full border border-[#1152d4] text-[#1152d4] text-[10px] font-bold py-1.5 rounded uppercase hover:bg-[#1152d4] hover:text-white transition-all">Instant Book</button>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="p-8 mt-auto text-center border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400">© 2023 HmarePanditJi B2B Solutions. All rights reserved. GST Registered.</p>
            </footer>

        </main>
    );
}
