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
        "bg-white rounded-card shadow-card p-5 border-t-4 border-saffron-200 flex flex-col gap-2",
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
