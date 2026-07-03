"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { hi } from "../../lib/strings";

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
          ? "bg-gradient-to-r from-leaf-500 to-leaf-700 text-white border-none shadow-lg"
          : "bg-white border-2 border-softgrey text-softgrey shadow-sm",
        className
      )}
    >
      <span className="text-[20px] font-bold">
        {value ? hi.design.onlineStatus : hi.design.offlineStatus}
      </span>
      <span className="text-[14px] font-medium opacity-90 mt-0.5">
        {value ? hi.design.onlineSub : hi.design.offlineSub}
      </span>
    </button>
  );
}
