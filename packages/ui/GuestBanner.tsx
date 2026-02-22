"use client";

import React, { useState, useEffect } from 'react';
import { Theme, themes } from './tokens';

export interface GuestBannerProps {
    onLogin: () => void;
    theme?: Theme;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({
    onLogin,
    theme = 'customer',
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const currentTheme = themes[theme] || themes.customer;

    useEffect(() => {
        // Check sessionStorage to see if user dismissed it in this session
        const isDismissed = sessionStorage.getItem('guestBannerDismissed');
        if (!isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('guestBannerDismissed', 'true');
    };

    if (!isVisible) return null;

    const styleVars = {
        '--banner-primary': currentTheme.primary,
        '--banner-primary-dark': currentTheme.primaryDark,
        '--banner-primary-light': currentTheme.primaryLight,
    } as React.CSSProperties;

    return (
        <div
            className="sticky top-0 z-40 bg-[var(--banner-primary-light)] border-b border-[var(--banner-primary)] px-4 py-3 sm:px-6 lg:px-8 shadow-sm transition-all duration-300"
            style={styleVars}
            role="alert"
        >
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <div className="flex items-center text-sm font-medium leading-6 text-gray-900">
                    <span className="mr-2 text-lg">👋</span>
                    <p>
                        Exploring as Guest — Login to book pandits and save favorites
                    </p>
                </div>

                <div className="flex flex-1 justify-end items-center gap-4">
                    <button
                        onClick={onLogin}
                        className="rounded-md bg-[var(--banner-primary)] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--banner-primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors whitespace-nowrap"
                    >
                        Login / Register
                    </button>

                    <button
                        type="button"
                        className="-m-1.5 p-1.5 hover:bg-black/5 rounded-full transition-colors focus:outline-none"
                        onClick={handleDismiss}
                        aria-label="Dismiss banner"
                    >
                        <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
