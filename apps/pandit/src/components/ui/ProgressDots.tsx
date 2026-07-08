"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { t } from "../../lib/i18n";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface ProgressDotsProps {
  total?: number;
  current: number; // 1-indexed
  onDotClick?: (index: number) => void;
  className?: string;
}

export function ProgressDots({ total = 7, current, onDotClick, className }: ProgressDotsProps) {
  return (
    <div className={cn("w-full flex flex-col items-center gap-3", className)}>
      <div className="w-full flex items-center justify-center max-w-[340px]">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isCurrent = stepNum === current;

          return (
            <React.Fragment key={i}>
              {/* Connector line (not before the first dot) */}
              {i > 0 && (
                <div
                  className={cn(
                    "h-[3px] flex-grow mx-1 rounded-full",
                    stepNum <= current ? "bg-saffron-500" : "bg-saffron-100"
                  )}
                />
              )}

              {/* Dot */}
              <button
                type="button"
                onClick={() => onDotClick?.(stepNum)}
                disabled={!onDotClick || (!isDone && !isCurrent)}
                className="focus:outline-none focus-visible:ring-4 focus-visible:ring-saffron-200 rounded-full transition-all duration-200 flex-shrink-0"
              >
                {isDone ? (
                  <div className="w-7 h-7 rounded-full bg-saffron-500 text-white flex items-center justify-center text-[14px] font-bold select-none shadow-sm">
                    ✓
                  </div>
                ) : isCurrent ? (
                  <div className="w-9 h-9 rounded-full border-2 border-saffron-500 bg-white text-saffron-700 flex items-center justify-center text-[16px] font-bold animate-pulse motion-reduce:animate-none shadow-sm">
                    {stepNum}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border border-saffron-200 bg-cream text-softgrey flex items-center justify-center text-[14px] font-medium">
                    {stepNum}
                  </div>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <div className="t-hint text-center font-medium">
        {t("onboarding.stepIndicator")} {current} / {total}
      </div>
    </div>
  );
}

export default ProgressDots;
