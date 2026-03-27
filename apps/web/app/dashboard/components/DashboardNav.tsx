"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav() {
    const pathname = usePathname();

    const topLinks = [
        { href: "/dashboard/profile", label: "My Profile", icon: "person" },
        { href: "/dashboard/family", label: "My Family", icon: "group" },
        { href: "/dashboard/addresses", label: "Saved Addresses", icon: "location_on" },
        { href: "/dashboard/payments", label: "Payment Methods", icon: "payments" },
        { href: "/dashboard/favorites", label: "My Pandits", icon: "self_improvement" },
        { href: "/dashboard/bookings", label: "My Bookings", icon: "list_alt" }, // Added to ensure path visibility
    ];

    return (
        <>
            {/* Desktop Sidebar (Dark Theme) */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 gap-6 bg-[#181511] min-h-[calc(100vh-72px)] pt-8 px-4 border-r border-[#393328] sticky top-[72px]">
                <div>
                    <h3 className="text-[#baaf9c] text-xs font-bold uppercase tracking-wider mb-4 px-3">Account Settings</h3>
                    <nav className="flex flex-col gap-1">
                        {topLinks.map((link) => {
                            // simple active check
                            const active = pathname.includes(link.href);
                            return (
                                <Link key={link.href} href={link.href}>
                                    <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${active ? "bg-[#393328] border-l-4 border-[#f29e0d] text-white" : "text-[#baaf9c] hover:bg-[#393328] hover:text-white"}`}>
                                        <span className={`material-symbols-outlined ${active ? "text-[#f29e0d]" : ""}`}>{link.icon}</span>
                                        {link.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-4">
                    <h3 className="text-[#baaf9c] text-xs font-bold uppercase tracking-wider mb-4 px-3">Preferences</h3>
                    <div className="flex flex-col gap-4 px-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">Booking Notifications</span>
                            <button className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full bg-[#f29e0d] transition-colors focus:outline-none">
                                <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">Travel Updates</span>
                            <button className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full bg-[#393328] transition-colors focus:outline-none">
                                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Nav (Dark Theme) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181511] border-t border-[#393328] z-50 px-2 flex justify-between items-center shadow-lg pb-safe">
                {[
                    { href: &quot;/dashboard&quot;, label: &quot;Home&quot;, icon: &quot;home&quot; },
                    { href: &quot;/dashboard/bookings&quot;, label: &quot;Bookings&quot;, icon: &quot;list_alt&quot; },
                    { href: &quot;/dashboard/favorites&quot;, label: &quot;Pandits&quot;, icon: &quot;self_improvement&quot; },
                    { href: &quot;/dashboard/profile&quot;, label: &quot;Profile&quot;, icon: &quot;person&quot; }
                ].map((link) => {
                    const active = (link.href === &quot;/dashboard&quot; && pathname === &quot;/dashboard&quot;) || (link.href !== &quot;/dashboard&quot; && pathname.includes(link.href));
                    return (
                        <Link key={link.href} href={link.href} className="flex-1 flex flex-col items-center gap-1 py-3 px-2">
                            <span className={`material-symbols-outlined text-[24px] ${active ? "text-[#f29e0d] font-bold" : "text-[#baaf9c]"}`}>
                                {link.icon}
                            </span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${active ? "text-[#f29e0d]" : "text-[#baaf9c]"}`}>
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
