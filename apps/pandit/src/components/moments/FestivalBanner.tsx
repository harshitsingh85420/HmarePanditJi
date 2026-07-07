"use client";

import React from "react";
import { hi } from "@/lib/strings";
import { getActiveFestival, type Festival } from "@/lib/festivals2026";

export interface FestivalBannerProps {
  /** Force a specific festival (used by /design); default resolves from today. */
  festival?: Festival | null;
}

export function FestivalBanner({ festival }: FestivalBannerProps) {
  const f = festival !== undefined ? festival : getActiveFestival();
  if (!f) return null;
  return (
    <div className="w-full rounded-card bg-gradient-to-r from-saffron-100 to-gold/20 border border-saffron-100 px-4 py-3 flex items-center gap-4">
      <span className="text-[40px] leading-none select-none" role="img" aria-hidden="true">
        {f.emoji}
      </span>
      <div className="flex flex-col">
        <span className="text-[18px] font-bold text-temple-600 font-hindi leading-snug">
          {f.name} {hi.festival.greeting}
        </span>
        <span className="t-hint text-softgrey font-hindi">{hi.festival.hint}</span>
      </div>
    </div>
  );
}

export default FestivalBanner;
