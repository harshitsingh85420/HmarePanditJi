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
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-card shadow-card w-full",
        className
      )}
    >
      <div className="text-[64px] leading-none mb-4 select-none animate-gentle-float motion-reduce:animate-none" role="img" aria-hidden="true">
        {emoji}
      </div>
      <h3 className="t-title font-bold text-ink mb-2">
        {title}
      </h3>
      <p className="t-hint max-w-sm">
        {hint}
      </p>
    </div>
  );
}
