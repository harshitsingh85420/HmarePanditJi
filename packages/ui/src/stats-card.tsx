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
      ? (trend.positive !== undefined ? trend.positive : trend.value >= 0)
      : undefined;

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 relative overflow-hidden ${className}`}
    >
      {/* Top-right icon */}
      <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-xl text-primary">
          {icon}
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>

      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
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
