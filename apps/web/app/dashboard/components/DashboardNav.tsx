"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav() {
    const pathname = usePathname();

    /* F-J4-15 · RULED 2026-08-01 (Isj) — GHOST LINKS REMOVED.
       Three of the six entries here 404'd, confirmed by HTTP status during
       the J4 dashboard walk:
         /dashboard/family    → 404, but the screen EXISTS at
                                /dashboard/profile/family — the LINK was
                                wrong, not the feature. Repointed.
         /dashboard/addresses → 404, nothing built. DELETED.
         /dashboard/payments  → 404, nothing built. DELETED.

       WHAT ISN'T BUILT ISN'T LINKED. A ghost link is
       priced-but-undelivered in navigation form: it promises a place, the
       customer spends a tap, and the platform answers with a 404. A link
       is a control, and 404 is the loudest way to do nothing. */
    const topLinks = [
        { href: "/dashboard/profile", label: "My Profile", icon: "person" },
        { href: "/dashboard/profile/family", label: "My Family", icon: "group" },
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
                            const active = pathname?.includes(link.href) ?? false;
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

            {/* MOBILE ACCOUNT ROW — batch 2d.
                WAS a second `fixed bottom-0 z-50` bar. The canon's 3-tab bar
                (components/BottomNav.tsx) now owns that strip app-wide, and two
                fixed bars stacked on a 360-wide screen is not a layout, it is a
                collision. This is the same navigation moved OFF the strip, not
                deleted — every destination survives, in-flow and scrollable.

                Two defects died with the old bar and are worth naming:
                  · its "Home" tab pointed at /dashboard, which is a bare
                    redirect() to /dashboard/bookings — a tab that duplicated
                    its neighbour;
                  · it carried four links while the desktop sidebar beside it
                    carried a different four. One list now feeds both, so a
                    destination cannot exist on one viewport and not the other. */}
            <nav
                aria-label="Account"
                // a direct child of the dashboard layout's flex container, which
                // carries no padding of its own — so the gutter lives here.
                className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-4"
            >
                {topLinks.map((link) => {
                    const active = pathname?.includes(link.href) ?? false;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex shrink-0 items-center gap-2 rounded-pill border px-4 py-2.5 text-sm font-semibold ${
                                active
                                    ? "border-[#f29e0d] bg-[#393328] text-[#f29e0d]"
                                    : "border-[#393328] bg-[#181511] text-[#baaf9c]"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
