"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Toran } from "./Toran";
import { t } from "@/lib/i18n";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface HeaderProps {
  title: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
  /** प्रथम आरती band: genda→sindoor gradient (entry/auth screens). */
  festive?: boolean;
}

export function Header({ title, showBack = false, onBack, rightSlot, className, festive = false }: HeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());
  return (
    <header className={cn("sticky top-0 z-30", className)}>
      <div className={cn(
        "h-16 min-h-[56px] px-4 flex items-center justify-between gap-4",
        festive ? "bg-gradient-to-r from-genda to-saffron-500" : "bg-saffron-500",
      )}>
      {/* Left Back Button Slot — collapses when there is no back button so the
          title gets the space instead of ellipsizing */}
      <div className={showBack ? "w-14 flex items-center justify-start flex-shrink-0" : "hidden"}>
        {showBack && (
          <button
            onClick={handleBack}
            className="w-14 h-14 min-h-[56px] min-w-[56px] flex items-center justify-center active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200 rounded-full"
            aria-label={t("common.back")}
          >
            {/* UNIVERSAL BACK LAW: 48px circle, card bg, 1px sand border, ← 24px ink */}
            <span className="w-12 h-12 rounded-full bg-card border border-saffron-200 shadow-card flex items-center justify-center text-[24px] text-ink" aria-hidden="true">
              ←
            </span>
          </button>
        )}
      </div>

      {/* Center Title */}
      <h1 className="t-title font-bold text-center truncate flex-grow text-[#FFE8D2]">
        {title}
      </h1>

      {/* Right Voice Toggle Slot — min-width keeps the title centered for the
          default single button, but the slot may grow (e.g. home passes two) */}
      <div className="min-w-14 flex items-center justify-end flex-shrink-0">
        {/* शिष्य (footer orb) owns the voice control; keep the slot for balance */}
        {rightSlot !== undefined ? rightSlot : <span className="w-14" aria-hidden="true" />}
        </div>
      </div>
      <Toran tone="onSindoor" className="bg-saffron-500" />
    </header>
  );
}

export default Header;
