"use client";

import { useState, useEffect, CSSProperties } from "react";
import { Theme, themes } from "./tokens";

export interface GuestBannerProps {
  onLogin: () => void;
  theme?: Theme;
}

export const GuestBanner = ({
  onLogin,
  theme = "customer",
}: GuestBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const currentTheme = themes[theme] || themes.customer;

  useEffect(() => {
    // Check sessionStorage to see if user dismissed it in this session
    const isDismissed = sessionStorage.getItem("guestBannerDismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("guestBannerDismissed", "true");
  };

  if (!isVisible) return null;

  const styleVars = {
    "--banner-primary": currentTheme.primary,
    "--banner-primary-dark": currentTheme.primaryDark,
    "--banner-primary-light": currentTheme.primaryLight,
  } as CSSProperties;

  return (
    <div
      className="sticky top-0 z-40 border-b border-[var(--banner-primary)] bg-[var(--banner-primary-light)] px-4 py-3 shadow-sm transition-all duration-300 sm:px-6 lg:px-8"
      style={styleVars}
      role="alert"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex items-center text-[22px] font-bold leading-6 text-gray-900">
          <span className="mr-2 text-[28px]">👋</span>
          <p>अतिथि के रूप में देख रहे हैं — लॉगिन करें और पंडित बुक करें</p>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <button
            onClick={onLogin}
            className="min-h-[72px] whitespace-nowrap rounded-xl bg-[var(--banner-primary)] px-6 py-4 text-[24px] font-bold text-white shadow-sm transition-colors hover:bg-[var(--banner-primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            लॉगिन करें
          </button>

          <button
            type="button"
            className="-m-1.5 min-h-[56px] min-w-[56px] rounded-full p-1.5 transition-colors hover:bg-black/5 focus:outline-none"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            <svg
              className="h-7 w-7 text-gray-700"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
