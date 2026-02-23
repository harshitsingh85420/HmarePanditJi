"use client";

import { useEffect, useState } from "react";

/**
 * GuestBanner (Prompt 1, Section 2)
 * Shown in layout header when user is not logged in.
 * Provides login/register CTA.
 */
export default function GuestBanner() {
    const [hasToken, setHasToken] = useState(true); // default true to avoid flash

    useEffect(() => {
        const token =
            localStorage.getItem("hpj_pandit_token") ||
            localStorage.getItem("hpj_pandit_access_token") ||
            localStorage.getItem("token");
        setHasToken(!!token);
    }, []);

    if (hasToken) return null;

    return (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-lg">🙏</span>
                <span className="text-sm font-medium">
                    HmarePanditJi — Pandit Ji, login करें अपनी bookings manage करने के लिए
                </span>
            </div>
            <a
                href="http://localhost:3000/login?redirect=pandit"
                className="bg-white text-amber-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-amber-50 transition-colors flex-shrink-0"
                style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
            >
                Login / Register
            </a>
        </div>
    );
}
