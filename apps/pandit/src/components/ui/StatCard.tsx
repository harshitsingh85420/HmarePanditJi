"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface StatCardProps {
  label: string;
  value: number | string;
  emoji: string;
  className?: string;
}

export function StatCard({ label, value, emoji, className }: StatCardProps) {
  // Format numeric values if passed as number
  const displayValue = typeof value === "number"
    ? `₹${value.toLocaleString("en-IN")}`
    : value;

  return (
    <div
      className={cn(
        // CANON stat tile (frame 12, the home 3-stat row — 8 identical uses):
        //   border-radius:18px; padding:18px 12px; background:#FFFDF8;
        //   border:2px solid #E7DCC9;  (no shadow — these sit IN the page,
        //   they are not lifted off it the way a Card is)
        // The app had pure #fff, a 20px radius and a 4px saffron top-rail.
        // The rail is the tell: canon frames these tiles evenly on all four
        // sides, so three of them in a row read as one ruled band; the top
        // rail made each tile shout independently.
        "bg-card rounded-tile py-[18px] px-3 border-2 border-sand-200 flex flex-col gap-2",
        className
      )}
    >
      <div className="text-[32px] leading-none" role="img" aria-label={label}>
        {emoji}
      </div>
      <div className="t-money mt-1 break-words">
        {displayValue}
      </div>
      <div className="t-hint">
        {label}
      </div>
    </div>
  );
}
