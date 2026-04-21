import React from "react";

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number; // percentage
    positive?: boolean; // true = green, false = red; if undefined, auto-detect from value sign
  };
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  className = "",
}: StatsCardProps) {
  const isPositive =
    trend !== undefined
      ? trend.positive !== undefined
        ? trend.positive
        : trend.value >= 0
      : undefined;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {/* Top-right icon */}
      <div className="bg-primary/10 absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl">
        <span className="material-symbols-outlined text-primary text-xl">
          {icon}
        </span>
      </div>

      <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>

      {trend !== undefined && (
        <div
          className={`inline-flex items-center gap-0.5 text-xs font-bold ${
            isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isPositive ? "trending_up" : "trending_down"}
          </span>
          {Math.abs(trend.value)}% vs last month
        </div>
      )}
    </div>
  );
}
