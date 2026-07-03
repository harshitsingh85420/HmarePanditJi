"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useVoice } from "../../hooks/useVoice";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function Header({ title, showBack = false, onBack, rightSlot, className }: HeaderProps) {
  const { enabled, toggle } = useVoice();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-saffron-100/50 h-16 min-h-[56px] px-4 flex items-center justify-between gap-4",
        className
      )}
    >
      {/* Left Back Button Slot */}
      <div className="w-12 flex items-center justify-start flex-shrink-0">
        {showBack && (
          <button
            onClick={onBack}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white shadow-card hover:bg-saffron-50 active:scale-90 flex items-center justify-center text-[18px] transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
            aria-label="Go Back"
          >
            ←
          </button>
        )}
      </div>

      {/* Center Title */}
      <h1 className="t-title font-bold text-center truncate flex-grow">
        {title}
      </h1>

      {/* Right Voice Toggle Slot */}
      <div className="w-12 flex items-center justify-end flex-shrink-0">
        {rightSlot !== undefined ? (
          rightSlot
        ) : (
          <button
            onClick={toggle}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white shadow-card hover:bg-saffron-50 active:scale-90 flex items-center justify-center text-[20px] transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
            aria-label={enabled ? "Mute Voice" : "Unmute Voice"}
          >
            {enabled ? "🔊" : "🔇"}
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
