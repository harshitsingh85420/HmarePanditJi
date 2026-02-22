"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function GuestBanner() {
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const d = sessionStorage.getItem("guestBannerDismissed");
        if (d) setDismissed(true);
    }, []);

    if (dismissed) return null;

    return (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-sm z-50">
            <span className="text-amber-800 font-medium">
                👋 Exploring as Guest — Login to book pandits and save favorites
            </span>
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="bg-primary text-white px-3 py-1 rounded-btn text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                    Login / Register →
                </Link>
                <button
                    onClick={() => {
                        sessionStorage.setItem("guestBannerDismissed", "1");
                        setDismissed(true);
                    }}
                    className="text-amber-600 hover:text-amber-900 font-bold text-base leading-none"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

export default function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
    const [isGuest, setIsGuest] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("hpj_user");
            if (stored) {
                const u = JSON.parse(stored);
                setUser(u);
                setIsGuest(false);
            }
        } catch { }
    }, []);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/search", label: "Find Pandits" },
        { href: "/muhurat", label: "Muhurat Explorer" },
    ];

    return (
        <>
            {isGuest && <GuestBanner />}
            <header className="sticky top-0 z-40 w-full border-b border-amber-100 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <span className="text-2xl">🙏</span>
                        <span className="text-xl font-extrabold text-gray-900 tracking-tight hover:text-primary transition-colors">
                            HmarePanditJi
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-semibold transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-gray-700"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right section */}
                    <div className="flex items-center gap-3">
                        {isGuest ? (
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex items-center px-4 py-2 border-2 border-primary text-primary text-sm font-bold rounded-btn hover:bg-primary hover:text-white transition-all"
                            >
                                Login / Register
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard/bookings"
                                    className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors hidden sm:block"
                                >
                                    My Bookings
                                </Link>
                                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                            </div>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 text-gray-700"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {mobileOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`block text-base font-semibold py-2 transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-gray-800"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isGuest && (
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="block w-full text-center mt-4 bg-primary text-white py-2 rounded-btn font-bold"
                            >
                                Login / Register
                            </Link>
                        )}
                    </div>
                )}
            </header>
        </>
    );
}
