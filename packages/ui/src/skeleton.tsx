import React from "react";

export interface SkeletonProps {
  variant?: "card" | "profile" | "table-row" | "text" | "custom";
  lines?: number;
  className?: string;
}

function Pulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
  );
}

export function Skeleton({
  variant = "text",
  lines = 3,
  className = "",
}: SkeletonProps) {
  if (variant === "card") {
    return (
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 ${className}`}
        aria-busy="true"
        aria-label="Loading…"
      >
        <Pulse className="h-40 w-full rounded-xl mb-4" />
        <Pulse className="h-4 w-3/4 mb-2" />
        <Pulse className="h-4 w-1/2 mb-4" />
        <Pulse className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div
        className={`flex items-center gap-4 ${className}`}
        aria-busy="true"
        aria-label="Loading…"
      >
        <Pulse className="w-16 h-16 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-2/3" />
          <Pulse className="h-3 w-1/2" />
          <Pulse className="h-3 w-1/3" />
        </div>
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div
        className={`flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 ${className}`}
        aria-busy="true"
        aria-label="Loading…"
      >
        <Pulse className="w-10 h-10 rounded-full flex-shrink-0" />
        <Pulse className="h-4 flex-1" />
        <Pulse className="h-4 w-24" />
        <Pulse className="h-6 w-16 rounded" />
      </div>
    );
  }

  // text (default) or custom
  return (
    <div
      className={`space-y-2 ${className}`}
      aria-busy="true"
      aria-label="Loading…"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Pulse
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}
