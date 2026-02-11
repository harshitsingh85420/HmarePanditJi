import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
  icon?: string;
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  icon,
  className = "",
}: BadgeProps) {
  const variants: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${variants[variant]} ${className}`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[10px] leading-none">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
