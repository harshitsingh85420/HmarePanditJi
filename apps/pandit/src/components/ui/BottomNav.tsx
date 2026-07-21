"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { t } from "../../lib/i18n";
import { ShishyaOrb } from "./ShishyaOrb";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface BottomNavProps {
  activeTab: number; // 0 = Home, 1 = Bookings, 2 = Earnings, 3 = Calendar
  onChange: (index: number) => void;
  className?: string;
}

// THALI NAV with शिष्य docked half-raised in a 78px center slot:
// [होम, बुकिंग] · (शिष्य) · [कमाई, कैलेंडर]
export function BottomNav({ activeTab, onChange, className }: BottomNavProps) {
  const tabs = [
    { label: t("nav.home"), emoji: "🏠" },
    { label: t("nav.bookings"), emoji: "📿" },
    { label: t("nav.earnings"), emoji: "💰" },
    { label: t("nav.calendar"), emoji: "📅" },
  ];

  const renderTab = (idx: number) => {
    const tab = tabs[idx];
    const isActive = activeTab === idx;
    return (
      <button
        key={idx}
        onClick={() => onChange(idx)}
        className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none focus-visible:bg-saffron-50/50"
        style={{ minHeight: "56px" }}
      >
        {isActive ? (
          <span className="relative -mt-1 flex items-center justify-center">
            {/* Boring-pass E: a gentle ripple welcomes you to this tab (one-shot) */}
            <span className="absolute inset-0 rounded-full border-2 border-gold pa-thali-ripple pointer-events-none" aria-hidden="true" />
            {/* CANON: the raised pill casts a sindoor drop shadow
                (0 4px 10px rgba(178,58,26,.35)) — without it the pill was
                a flat disc pasted on the bar instead of lifted off it. */}
            <span
              className="w-[46px] h-[46px] rounded-full bg-saffron-500 border-[3px] border-gold flex items-center justify-center text-[22px] leading-none text-[#FFE8D2]"
              style={{ boxShadow: "0 4px 10px rgba(178,58,26,.35)" }}
              role="img"
              aria-label={tab.label}
            >
              {tab.emoji}
            </span>
          </span>
        ) : (
          <span className="text-[24px] leading-none mb-1" role="img" aria-label={tab.label}>
            {tab.emoji}
          </span>
        )}
        {/* TYPE RHYTHM: labels were 12px active / 16px inactive — switching
            tabs visibly JUMPED the text size. Canon keeps them near-equal
            (12/13) and separates them by WEIGHT (800 vs 500), which is the
            calmer signal. Both sit at 15px here rather than canon's 12/13:
            13px nav labels are too small for a 62-year-old, and the persona
            floor outranks matching canon's exact size. */}
        <span
          className={cn(
            "leading-none mt-0.5 text-[15px]",
            isActive ? "text-saffron-500 font-extrabold" : "font-medium text-softgrey"
          )}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      className={cn(
        // CANON: an UPWARD shadow lifts the whole bar off the content
        // scrolling beneath it. Now `shadow-nav` rather than an inline style,
        // so the value lives with the rest of canon's shadow vocabulary.
        "relative w-full z-40 bg-[#FFF9EE] border-t-2 border-gold pb-safe h-[72px] min-h-[72px] flex items-center shadow-nav",
        className
      )}
    >
      {renderTab(0)}
      {renderTab(1)}

      {/* 78px empty center slot — शिष्य floats half-raised above it */}
      <div className="w-[78px] min-w-[78px] h-full relative" aria-hidden="false">
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: -26 }}>
          <ShishyaOrb />
        </div>
      </div>

      {renderTab(2)}
      {renderTab(3)}
    </nav>
  );
}

export default BottomNav;
