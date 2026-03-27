import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "custom";
  size?: "sm" | "md";
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  icon,
  className = "",
}: BadgeProps) {
  const variants: Record<string, string> = {
    success:
      &quot;bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400&quot;,
    warning:
      &quot;bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400&quot;,
    error: &quot;bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400&quot;,
    info: &quot;bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400&quot;,
    neutral:
      &quot;bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400&quot;,
    custom: &quot;&quot;,
  };

  const dotColors: Record<string, string> = {
    success: &quot;bg-green-500&quot;,
    warning: &quot;bg-orange-500&quot;,
    error: &quot;bg-red-500&quot;,
    info: &quot;bg-blue-500&quot;,
    neutral: &quot;bg-slate-400&quot;,
    custom: &quot;bg-current&quot;,
  };

  const sizes: Record<string, string> = {
    // ACC-010 FIX: Larger badge text for elderly users (minimum readable size)
    sm: &quot;text-[13px] px-3 py-1&quot;,
    md: &quot;text-base px-4 py-1.5&quot;,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
