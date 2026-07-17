"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface EmptyStateProps {
  emoji: string;
  title: string;
  hint: string;
  className?: string;
}

export function EmptyState({ emoji, title, hint, className }: EmptyStateProps) {
  // Mockup frame 27: empty states sit straight on cream (no card box);
  // title 22/900 saffron-700, hint = शिष्य's warm 17/600 line.
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4 w-full",
        className
      )}
    >
      <div className="text-[64px] leading-none mb-4 select-none animate-gentle-float motion-reduce:animate-none" role="img" aria-hidden="true">
        {emoji}
      </div>
      <h3 className="text-[22px] font-black text-saffron-700 font-hindi mb-2">
        {title}
      </h3>
      <p className="text-[17px] font-semibold text-softgrey font-hindi max-w-sm leading-snug">
        {hint}
      </p>
    </div>
  );
}
