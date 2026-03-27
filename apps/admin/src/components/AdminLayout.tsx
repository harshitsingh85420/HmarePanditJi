"use client";
import React from "react";
import AdminSidebar from "./AdminSidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    React.useEffect(() => {
        if (!pathname.startsWith(&quot;/login&quot;) && !localStorage.getItem(&quot;adminToken&quot;)) {
            window.location.href = &quot;/login&quot;;
        }
    }, [pathname]);

    const getPageTitle = (path: string) => {
        switch (true) {
            case path === &quot;/&quot;: return &quot;Dashboard&quot;;
            case path.startsWith(&quot;/travel-desk&quot;): return &quot;Travel Operations Desk&quot;;
            case path.startsWith(&quot;/bookings&quot;): return &quot;All Bookings&quot;;
            case path.startsWith(&quot;/pandits&quot;): return &quot;Pandit Directory&quot;;
            case path.startsWith(&quot;/payouts&quot;): return &quot;Payout Queue&quot;;
            case path.startsWith(&quot;/cancellations&quot;): return &quot;Cancellation Queue&quot;;
            case path.startsWith(&quot;/support&quot;): return &quot;Helpline Log&quot;;
            case path.startsWith(&quot;/settings&quot;): return &quot;Platform Settings&quot;;
            default: return &quot;Admin Center&quot;;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-slate-800">{getPageTitle(pathname)}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xl">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Search bookings, phone..."
                                className="pl-10 pr-4 py-1.5 w-64 bg-slate-100 border-none rounded-full text-sm focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                            />
                        </div>
                        <button className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
