"use client";

import { useState } from "react";

const MOCK_BOOKINGS = [
    {
        id: "BK-2023-892",
        client: "Sharma-Verma Wedding",
        date: "Nov 24, 2023",
        time: "10:00 AM",
        venue: "Grand Hyatt",
        location: "Santacruz, Mumbai",
        pandit: "Pt. R. Sharma",
        panditImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWNoP4y6NuDDIfCJuUSJAqnywhy3U2Yzr0OBO1v0kqLodpcJmWxln4PBHM-Dvc6LC7HQHvB6mhQOa7kGo9HOufvDtrlbG2PcCGCwjeuWojdNm3WURM25LbL-Fwws8c9tYSimLNFMWoBXfnb3Rf3UwEls6RNQ3PXjYngR-ETh7vmH_CBCUvvzMpaQk4lF7UOv94wGlPS8J7eNWKz9oBo2AGJIyIYDxmAIGKm7KbSD5bEKDPYGr8G_t8pOerl9hdnCp_06lWcRu3vl8",
        status: "Traveling",
        backup: "Ready (Pt. J. Joshi)",
        statusColor: "bg-[#ff9933]/10 text-orange-700 dark:text-orange-400 border border-[#ff9933]/20",
        pulseColor: "bg-[#ff9933]",
    },
    {
        id: "BK-2023-894",
        client: "Gupta Wedding",
        date: "Nov 24, 2023",
        time: "06:00 PM",
        venue: "ITC Gardenia",
        location: "Residency Rd, Bangalore",
        pandit: "Pt. A. Mishra",
        panditImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo-YocNSAhVG9Z_OIv6YSemFYhrjN_ZfmSe24jx9Zysf9cIUKip7b0vWlyPaAps2VW17pw8JEBuOKh7dutMfJZ0HOSEUVt2gPzdeCrALHWDKuxwSLyjx8j7mBjpVvhUaihafpVj2KMNjxgkh2ojIGfQG_rxEU6cb3zYpnJabCoBJLFud5eWzAYVSiEbIGZKNHxdZcPErB9x5Ld24P5yFsb72CtC3vsakHzLyDYK0WgE4X2LIqvSdfim5Zrro6QXNH0RFnZsfXY_Js",
        status: "At Venue",
        backup: "Not Required",
        statusColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
    },
    {
        id: "BK-2023-901",
        client: "Singh-Kaur Wedding",
        date: "Nov 25, 2023",
        time: "09:30 AM",
        venue: "The Oberoi",
        location: "Gurgaon, NCR",
        pandit: "Pt. V. Tiwari",
        status: "Issue",
        backup: "Activate Backup",
        statusColor: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
        isIssue: true,
    },
    {
        id: "BK-2023-910",
        client: "Patel Engagement",
        date: "Nov 25, 2023",
        time: "02:00 PM",
        venue: "Taj Lake Palace",
        location: "Udaipur, Rajasthan",
        pandit: "Pt. S. Patel",
        panditImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlvusViyobEJVQidejXaN81pwVB8UVWPC5fBAoraZih__9vpnUXfheCh6oomw0iIWhgV-pu9pp0s9CK-66h-l9Xb2tj6YW8bTlGimj6qfv0K8wiUjJ9APDNhOf9iPmURv87PkxXA2XpsKT2L8TwBW3QkZJbsQDLkBX7LyXZxnxqgBXx-FWjqlqa_5Qys31L-EtyNrpioHK11dxB6CD7Vvr6ka1dWLvsO7WHOIdVBsMXSqiCuZI5tMDn6w-6Cjf59p50sps6Hgbxm0",
        status: "Assigned",
        backup: "Ready (Pt. K. Trivedi)",
        statusColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    },
    {
        id: "BK-2023-912",
        client: "Reddy Wedding",
        date: "Nov 25, 2023",
        time: "07:00 PM",
        venue: "Novotel",
        location: "HITEC City, Hyderabad",
        pandit: "Pt. K. Acharya",
        panditImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkT7Q1TLY6FuY701UAvyWn7V64M3Xkdg6wyaEoIsErs6xxSkxnY71qbuq3JBq-BIgGddalsZyRQrQLiD1zTSGZxHaA_Y0uggwJz-TXHezPcM-51nEWGdk9LVGuuCh-lOy6mkfeNx3MQW091bAFisR8QYI5Dw6XQs8VJYoi_16cYWwFb6dFCekNY8UuFZZMLMn0EJKhq7SVtPKvv41H9apKMkLU1Uq5HTGIqmHCGjGBH-a3q1812FdtNrLl9MOjZcZvSI17MVUAMJ4",
        status: "Traveling",
        backup: "Unassigned",
        statusColor: "bg-[#ff9933]/10 text-orange-700 dark:text-orange-400 border border-[#ff9933]/20",
        pulseColor: "bg-[#ff9933]",
        backupWarning: true,
    },
    {
        id: "BK-2023-915",
        client: "Iyer Sangeet",
        date: "Nov 26, 2023",
        time: "11:00 AM",
        venue: "Private Villa",
        location: "Lonavala, MH",
        pandit: "Pt. N. Iyer",
        status: "Assigned",
        backup: "Ready (Pt. S. Rao)",
        statusColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    },
];

export default function B2BBookingsPage() {
    const [selected, setSelected] = useState<string[]>([]);
    const toggleSelect = (id: string) => {
        if (selected.includes(id)) setSelected(selected.filter(i => i !== id));
        else setSelected([...selected, id]);
    };

    return (
        <main className="flex-1 p-6 overflow-hidden flex flex-col h-[calc(100vh-64px)] font-display text-slate-800 dark:text-slate-100 bg-[#f6f6f8] dark:bg-[#101622]">

            {/* ── Page Header & Metrics ────────────────────────────────────────────── */}
            <div className="mb-6 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Bulk Bookings</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Managing real-time logistics for upcoming auspicious dates.</p>
                    </div>

                    {/* Top Summary Cards */}
                    <div className="flex gap-3">
                        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                            <div className="bg-[#0f49bd]/10 p-2 rounded-full text-[#0f49bd]">
                                <span className="material-symbols-outlined text-base">event</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Active</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">14</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                            <div className="bg-[#ff9933]/10 p-2 rounded-full text-[#ff9933]">
                                <span className="material-symbols-outlined text-base">commute</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Traveling</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">6</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 shadow-sm flex items-center gap-3">
                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full text-red-600">
                                <span className="material-symbols-outlined text-base">warning</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Alerts</p>
                                <p className="text-lg font-bold text-red-600 leading-none">2</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Toolbar: Actions & Filters ──────────────────────────────────────── */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">

                    {/* Filters Group */}
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">calendar_today</span>
                            <input className="pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-[#0f49bd] focus:border-[#0f49bd] w-48 transition-shadow outline-none" readOnly value="Nov 24 - Nov 26" />
                            <span className="material-symbols-outlined absolute right-2 top-2.5 text-slate-400 text-sm">arrow_drop_down</span>
                        </div>
                        <div className="relative">
                            <select className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-[#0f49bd] focus:border-[#0f49bd] appearance-none w-40 outline-none">
                                <option>All Locations</option>
                                <option>Mumbai</option>
                                <option>Delhi NCR</option>
                                <option>Bangalore</option>
                                <option>Udaipur</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-2.5 text-slate-400 text-sm pointer-events-none">place</span>
                        </div>
                        <div className="relative">
                            <select className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-[#0f49bd] focus:border-[#0f49bd] appearance-none w-40 outline-none">
                                <option>All Statuses</option>
                                <option>Assigned</option>
                                <option>Traveling</option>
                                <option>At Venue</option>
                                <option>Issue Reported</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-2.5 text-slate-400 text-sm pointer-events-none">filter_list</span>
                        </div>
                    </div>

                    {/* Actions Group */}
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#0f49bd]/10 hover:bg-[#0f49bd]/20 text-[#0f49bd] rounded-lg text-sm font-medium transition-colors border border-[#0f49bd]/20">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Bulk Itineraries
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#ff9933]/10 hover:bg-[#ff9933]/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium transition-colors border border-[#ff9933]/20">
                            <span className="material-symbols-outlined text-sm">calculate</span>
                            Samagri Costs
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#0f49bd] hover:bg-[#0c3b9b] text-white rounded-lg text-sm font-medium shadow-md shadow-[#0f49bd]/20 transition-all hover:shadow-lg hover:shadow-[#0f49bd]/30">
                            <span className="material-symbols-outlined text-sm">send</span>
                            Message Pandits
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Data Table Container ────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="overflow-x-auto flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-12 border-b border-slate-200 dark:border-slate-700">
                                    <input type="checkbox" className="rounded border-slate-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-slate-800" />
                                </th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Client / ID</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Date &amp; Time</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Venue &amp; Location</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Pandit Assigned</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-center">Status</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Backup Status</th>
                                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                            {MOCK_BOOKINGS.map((booking) => (
                                <tr key={booking.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group ${booking.isIssue ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}>
                                    <td className="px-6 py-4 align-middle">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-[#0f49bd] focus:ring-[#0f49bd] bg-white dark:bg-slate-800"
                                            checked={selected.includes(booking.id)}
                                            onChange={() => toggleSelect(booking.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="font-semibold text-slate-900 dark:text-white">{booking.client}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{booking.id}</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="text-slate-900 dark:text-slate-200">{booking.date}</div>
                                        <div className="text-xs text-slate-500">{booking.time}</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="font-medium text-slate-900 dark:text-slate-200">{booking.venue}</div>
                                        <div className="text-xs text-slate-500">{booking.location}</div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            {booking.panditImg ? (
                                                <img src={booking.panditImg} alt="Pandit" className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">Pt</div>
                                            )}
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{booking.pandit}</div>
                                                {booking.isIssue ? (
                                                    <div className="text-xs text-red-600 font-medium">Unreachable</div>
                                                ) : (
                                                    <div className="text-xs text-[#0f49bd] cursor-pointer hover:underline">View Profile</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${booking.statusColor}`}>
                                            {booking.pulseColor && <span className={`w-1.5 h-1.5 ${booking.pulseColor} rounded-full mr-1.5 animate-pulse`}></span>}
                                            {booking.isIssue && <span className="material-symbols-outlined text-[14px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>}
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        {booking.isIssue ? (
                                            <button className="flex items-center gap-2 text-xs font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-700 dark:text-white shadow-sm hover:border-[#0f49bd] hover:text-[#0f49bd] transition-colors">
                                                <span className="material-symbols-outlined text-sm text-yellow-500">notification_important</span>
                                                Activate Backup
                                            </button>
                                        ) : booking.backupWarning ? (
                                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-900/30">
                                                <span className="material-symbols-outlined text-sm">warning_amber</span>
                                                <span className="text-xs">Unassigned</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                {booking.backup === 'Not Required' ? (
                                                    <span className="material-symbols-outlined text-slate-400 text-sm">remove_circle_outline</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                                )}
                                                <span className="text-xs">{booking.backup}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-lg">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Footer */}
                <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Showing 1 to 6 of 14 bookings</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600">Next</button>
                    </div>
                </div>
            </div>
        </main>
    );
}
