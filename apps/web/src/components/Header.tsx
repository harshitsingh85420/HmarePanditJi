"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GuestBanner, Button, Avatar } from "@hmarepanditji/ui";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import { useSamagriCart } from "../../context/SamagriCartContext";

export function Header() {
    const { user, isAuthenticated, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showGuestBanner, setShowGuestBanner] = useState(false);
    const router = useRouter();
    const { selection, setIsCartOpen } = useSamagriCart();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            const dismissed = sessionStorage.getItem("hpj_guest_dismissed");
            if (!dismissed) {
                setShowGuestBanner(true);
            }
        }
    }, [loading, isAuthenticated]);

    const handleDismissBanner = () => {
        sessionStorage.setItem("hpj_guest_dismissed", "true");
        setShowGuestBanner(false);
    };

    return (
        <>
            {showGuestBanner && (
                <div className="relative">
                    <GuestBanner
                        variant="inline"
                        onLoginClick={() => router.push("/login")}
                        className="rounded-none border-x-0 border-t-0 bg-amber-50"
                    />
                    <button
                        onClick={handleDismissBanner}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xl leading-none text-amber-800 hover:text-amber-900"
                        aria-label="Dismiss"
                    >
                        &times;
                    </button>
                </div>
            )}

            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-2xl font-bold text-amber-600 transition-colors hover:text-amber-700">
                            🙏 HmarePanditJi
                        </Link>
                    </div>

                    <nav className={`absolute left-0 top-16 w-full flex-col bg-white p-4 shadow-lg md:static md:flex md:w-auto md:flex-row md:items-center md:gap-8 md:bg-transparent md:p-0 md:shadow-none ${isMenuOpen ? "flex" : "hidden"}`}>
                        <Link href="/" className="text-sm font-medium text-gray-700 hover:text-amber-600">Home</Link>
                        <Link href="/search" className="text-sm font-medium text-gray-700 hover:text-amber-600">Find Pandits</Link>
                        <Link href="/muhurat" className="text-sm font-medium text-gray-700 hover:text-amber-600">Muhurat Explorer</Link>
                        <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-amber-600">About</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {selection && (
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative flex items-center justify-center p-2 text-gray-700 hover:text-amber-600 transition-colors"
                            >
                                <span className="text-2xl">🛒</span>
                                <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                    1
                                </span>
                            </button>
                        )}
                        {!loading && !isAuthenticated && (
                            <Button variant="outline" onClick={() => router.push("/login")}>
                                Login / Register
                            </Button>
                        )}

                        {!loading && isAuthenticated && user && user.role === 'CUSTOMER' && (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="text-sm font-medium text-amber-600 hover:text-amber-700 hidden md:block">
                                    My Bookings
                                </Link>
                                <Link href="/dashboard/profile">
                                    <Avatar name={user.name ?? user.fullName ?? "User"} size="sm" />
                                </Link>
                            </div>
                        )}

                        <button
                            className="md:hidden p-2 text-gray-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            <span className="material-symbols-outlined">{isMenuOpen ? "close" : "menu"}</span>
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
