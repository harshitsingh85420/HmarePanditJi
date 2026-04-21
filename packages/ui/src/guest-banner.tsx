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
        "flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-900/20",
        variant === "sticky"
          ? "fixed bottom-4 left-4 right-4 z-40 shadow-lg"
          : "",
        className,
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="material-symbols-outlined shrink-0 text-amber-500">
          explore
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-amber-800 dark:text-amber-300">
            Exploring as Guest
          </p>
          <p className="truncate text-xs text-amber-600 dark:text-amber-400">
            Log in to book a pandit or save favorites
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLoginClick}
        className="shrink-0 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
      >
        Log In
      </button>
    </div>
  );
}
