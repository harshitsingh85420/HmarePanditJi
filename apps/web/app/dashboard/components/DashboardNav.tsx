"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListTodo, Bookmark, Bell, User } from "lucide-react";

export function DashboardNav() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard/bookings", label: "My Bookings", icon: ListTodo },
        { href: "/dashboard/favorites", label: "Favorites", icon: Bookmark },
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
        { href: "/dashboard/profile", label: "Profile", icon: User },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen pt-8 px-4 sticky top-[72px] h-[calc(100vh-72px)]">
                <div className="mb-8 px-4">
                    <h2 className="text-xl font-bold text-gray-800">Namaste!</h2>
                </div>
                <nav className="flex flex-col gap-2">
                    {links.map((link) => {
                        const active = pathname.startsWith(link.href);
                        return (
                            <Link key={link.href} href={link.href}>
                                <span className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${active ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-100"
                                    }`}>
                                    <link.icon size={20} />
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
                {links.map((link) => {
                    const active = pathname.startsWith(link.href);
                    return (
                        <Link key={link.href} href={link.href} className="flex-1 flex flex-col items-center gap-1 py-3 px-2">
                            <span className={`${active ? "text-orange-600" : "text-gray-500"}`}>
                                <link.icon size={22} className={active ? "fill-orange-100" : ""} />
                            </span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${active ? "text-orange-600" : "text-gray-500"}`}>
                                {link.label.split(' ')[0]}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
