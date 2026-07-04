"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_TOKEN_KEY } from '@hmarepanditji/utils';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [badges, setBadges] = useState({
        verify: 0,
        payouts: 0,
    });

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/dashboard-stats`, {
            headers: { Authorization: `Bearer ${localStorage.getItem(ADMIN_TOKEN_KEY) || ''}` }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setBadges({
                        verify: data.data.pendingVerifications || 0,
                        payouts: data.data.pendingPayouts?.count || 0,
                    });
                }
            })
            .catch((err) => {
                console.error('Failed to fetch admin badges:', err);
            });
    }, []);

    const navItems = [
        { label: "Dashboard", href: "/", icon: "stacked_bar_chart", badge: 0 },
        { label: "Verifications", href: "/verifications", icon: "verified_user", badge: badges.verify },
        { label: "Payouts", href: "/payouts", icon: "currency_rupee", badge: badges.payouts },
        { label: "Bookings", href: "/bookings", icon: "book_online", badge: 0 },
        { label: "Pandits", href: "/pandits", icon: "groups", badge: 0 },
    ];

    return (
        <aside className="w-[260px] bg-slate-900 text-slate-300 shrink-0 flex flex-col h-full shadow-lg relative z-10">
            <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black group-hover:scale-105 transition-transform shadow-md shadow-blue-500/30">
                        🙏
                    </div>
                    <span className="font-bold text-[20px] tracking-tight text-white">HPJ Ops Panel</span>
                </Link>
            </div>

            <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium text-sm group ${isActive
                                ? "bg-blue-600 text-white font-semibold"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </div>
                            {item.badge > 0 && (
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500 text-white"
                                >
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950/40">
                <button
                    onClick={() => {
                        localStorage.removeItem(ADMIN_TOKEN_KEY);
                        window.location.href = "/login";
                    }}
                    className="w-full text-sm text-slate-400 hover:text-red-500 font-semibold text-left flex items-center gap-2 group p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-lg group-hover:text-red-500 text-slate-500">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
}
