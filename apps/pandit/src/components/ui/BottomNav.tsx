"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { hi } from "../../lib/strings";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface BottomNavProps {
  activeTab: number; // 0 = Home, 1 = Bookings, 2 = Earnings, 3 = Calendar
  onChange: (index: number) => void;
  className?: string;
}

export function BottomNav({ activeTab, onChange, className }: BottomNavProps) {
  const tabs = [
    { label: hi.design.navHome, emoji: "🏠" },
    { label: hi.design.navBookings, emoji: "📿" },
    { label: hi.design.navEarnings, emoji: "💰" },
    { label: hi.design.navCalendar, emoji: "📅" },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-saffron-100 pb-safe h-[72px] min-h-[72px] flex items-center justify-around",
        className
      )}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;

        return (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none focus-visible:bg-saffron-50/50"
            style={{ minHeight: "56px" }}
          >
            {/* Top active indicator bar */}
            {isActive && (
              <div className="absolute top-0 w-7 h-[3px] bg-saffron-500 rounded-full" />
            )}

            {/* Emoji icon */}
            <span
              className="text-[26px] leading-none mb-1"
              role="img"
              aria-label={tab.label}
            >
              {tab.emoji}
            </span>

            {/* Label */}
            <span
              className={cn(
                "text-[14px] font-medium leading-none",
                isActive ? "text-saffron-500 font-bold" : "text-softgrey"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
