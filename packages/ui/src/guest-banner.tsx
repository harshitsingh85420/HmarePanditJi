"use client";
import React from "react";

export interface GuestBannerProps {
  onLoginClick: () => void;
  variant?: "sticky" | "inline";
  className?: string;
}

export function GuestBanner({
  onLoginClick,
  variant = "inline",
  className = "",
}: GuestBannerProps) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl",
        variant === "sticky" ? "fixed bottom-4 left-4 right-4 z-40 shadow-lg" : "",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-amber-500 shrink-0">explore</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 truncate">
            Exploring as Guest
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 truncate">
            Log in to book a pandit or save favorites
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLoginClick}
        className="shrink-0 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Log In
      </button>
    </div>
  );
}
