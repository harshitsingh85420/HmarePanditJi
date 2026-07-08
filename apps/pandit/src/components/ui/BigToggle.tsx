"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { t } from "../../lib/i18n";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface BigToggleProps {
  value: boolean;
  onChange: (val: boolean) => void;
  className?: string;
}

export function BigToggle({ value, onChange, className }: BigToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "w-full h-[88px] min-h-[88px] rounded-card flex flex-col items-center justify-center transition-all duration-300 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none select-none",
        value
          ? "bg-leaf-500 text-white border border-[#9BE8B8] shadow-lg online-glow"
          : "bg-card border-2 border-[#D8C7A8] text-softgrey shadow-sm",
        className
      )}
    >
      <span className="text-[20px] font-bold">
        {value ? t("home.toggleOnline") : t("home.toggleOffline")}
      </span>
      <span className="text-[14px] font-medium opacity-90 mt-0.5">
        {value ? t("home.toggleOnlineSub") : t("home.toggleOfflineSub")}
      </span>
    </button>
  );
}
