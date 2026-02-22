"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();
    const [badges, setBadges] = useState({
        travel: 0,
        verify: 0,
        payouts: 0,
        cancellations: 0,
    });

    useEffect(() => {
        fetch("http://localhost:3001/api/admin/dashboard-stats", {
            headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ''}` }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setBadges({
                        travel: data.data.pendingActions.travel,
                        verify: data.data.pendingActions.verification,
                        payouts: data.data.pendingActions.payouts,
                        cancellations: data.data.pendingActions.cancellations,
                    });
                }
            })
            .catch(() => { });
    }, []);

    const navItems = [
        { label: "Dashboard", href: "/", icon: "stacked_bar_chart", badge: 0 },
        { label: "Travel Desk", href: "/travel-desk", icon: "flight_takeoff", badge: badges.travel },
        { label: "All Bookings", href: "/bookings", icon: "book_online", badge: 0 },
        { label: "Pandits", href: "/pandits", icon: "how_to_reg", badge: badges.verify },
        { label: "Payouts", href: "/payouts", icon: "currency_rupee", badge: badges.payouts },
        { label: "Cancellations", href: "/cancellations", icon: "cancel", badge: badges.cancellations },
        { label: "Support Log", href: "/support", icon: "support_agent", badge: 0 },
        { label: "Settings", href: "/settings", icon: "settings", badge: 0 },
    ];

    return (
        <aside className="w-[260px] bg-white border-r border-slate-200 shrink-0 flex flex-col h-full shadow-sm relative z-10">
            <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black group-hover:scale-105 transition-transform shadow-md shadow-blue-500/30">
                        🙏
                    </div>
                    <span className="font-bold text-[20px] tracking-tight text-blue-900">HPJ Admin</span>
                </Link>
            </div>

            <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium text-sm group ${isActive
                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`material-symbols-outlined text-[20px] ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </div>
                            {item.badge > 0 && (
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-blue-600 text-white" : "bg-red-500 text-white"
                                        }`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                        <span className="material-symbols-outlined text-blue-700 text-sm">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Logged in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">Arjun Verma</p>
                    </div>
                </div>
                <button className="w-full mt-3 text-sm text-slate-500 hover:text-red-600 font-semibold text-left flex items-center gap-2 group p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-lg group-hover:text-red-500 text-slate-400">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
}
