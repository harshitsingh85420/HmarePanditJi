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
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    neutral:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    custom: "",
  };

  const dotColors: Record<string, string> = {
    success: "bg-green-500",
    warning: "bg-orange-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-slate-400",
    custom: "bg-current",
  };

  const sizes: Record<string, string> = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
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
