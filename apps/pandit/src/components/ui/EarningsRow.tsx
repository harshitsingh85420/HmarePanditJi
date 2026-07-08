"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface EarningsRowProps {
  label: string;
  amount: number;
  kind: "plus" | "minus" | "total";
  className?: string;
}

export function EarningsRow({ label, amount, kind, className }: EarningsRowProps) {
  const formattedAmount = `₹${amount.toLocaleString("en-IN")}`;

  if (kind === "total") {
    return (
      <div
        className={cn(
          "bg-leaf-100 rounded-card p-4 border border-gold flex items-center justify-between gap-4",
          className
        )}
      >
        <span className="t-title text-ink font-semibold">{label}</span>
        <span className="t-money-hero">{formattedAmount}</span>
      </div>
    );
  }

  const isPlus = kind === "plus";

  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 border-b border-saffron-100 last:border-0 gap-4",
        className
      )}
    >
      <span className="t-body font-medium text-ink">{label}</span>
      <span
        className={cn(
          "t-title font-bold font-display",
          isPlus ? "text-leaf-700" : "text-danger"
        )}
      >
        {isPlus ? `+${formattedAmount}` : `−${formattedAmount}`}
      </span>
    </div>
  );
}
