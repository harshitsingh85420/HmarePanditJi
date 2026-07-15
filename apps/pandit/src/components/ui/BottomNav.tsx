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
            <span className="w-[46px] h-[46px] rounded-full bg-saffron-500 border-[3px] border-gold flex items-center justify-center text-[22px] leading-none text-[#FFE8D2]" role="img" aria-label={tab.label}>
              {tab.emoji}
            </span>
          </span>
        ) : (
          <span className="text-[24px] leading-none mb-1" role="img" aria-label={tab.label}>
            {tab.emoji}
          </span>
        )}
        <span
          className={cn(
            "leading-none mt-0.5",
            isActive ? "text-[12px] text-saffron-500 font-bold" : "text-[16px] font-medium text-softgrey"
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
        "relative w-full z-40 bg-[#FFF9EE] border-t-2 border-gold pb-safe h-[72px] min-h-[72px] flex items-center",
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
