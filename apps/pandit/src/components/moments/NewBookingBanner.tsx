"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { hi } from "../../lib/strings";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface NewBookingBannerProps {
  onTap: () => void;
  className?: string;
}

export function NewBookingBanner({ onTap, className }: NewBookingBannerProps) {
  return (
    <button
      onClick={onTap}
      type="button"
      className={cn(
        "w-full h-20 min-h-[72px] rounded-card bg-gradient-to-r from-saffron-400 to-saffron-600 text-white p-4 shadow-md flex items-center gap-4 relative overflow-hidden text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-saffron-200 select-none active:scale-[0.98] transition-transform duration-200",
        className
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer-banner {
          0% {
            background-position: -250px 0;
          }
          100% {
            background-position: 250px 0;
          }
        }
        .banner-shimmer {
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.15) 45%,
            rgba(255, 255, 255, 0.15) 55%,
            rgba(255, 255, 255, 0) 70%
          );
          background-size: 250px 100%;
          animation: shimmer-banner 3.5s infinite linear;
        }
        @media (prefers-reduced-motion: reduce) {
          .banner-shimmer {
            animation: none !important;
          }
          .animate-bounce {
            animation: none !important;
          }
        }
      `}} />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 banner-shimmer pointer-events-none" />

      {/* Bouncing Bell icon */}
      <div className="text-[28px] animate-bounce flex-shrink-0 leading-none">
        🔔
      </div>

      {/* Text Info */}
      <div className="flex flex-col flex-grow min-w-0">
        <span className="text-[18px] font-bold leading-normal truncate">
          {hi.booking.newRequest}
        </span>
        <span className="text-[14px] font-medium opacity-90 leading-tight">
          {hi.design.viewSub}
        </span>
      </div>
    </button>
  );
}

export default NewBookingBanner;
