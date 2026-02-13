import React from "react";
import type { AppTheme } from "./tokens";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  appTheme?: AppTheme;
}

const themeColors: Record<AppTheme, { bg: string; ring: string }> = {
  customer: {
    bg: "bg-[#f49d25] hover:bg-[#d4850f]",
    ring: "focus:ring-[#f49d25]",
  },
  pandit: {
    bg: "bg-[#f09942] hover:bg-[#c77a2a]",
    ring: "focus:ring-[#f09942]",
  },
  admin: {
    bg: "bg-[#137fec] hover:bg-[#0d5cb8]",
    ring: "focus:ring-[#137fec]",
  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  appTheme,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const themed = appTheme ? themeColors[appTheme] : null;

  const variants: Record<string, string> = {
    primary: themed
      ? `${themed.bg} text-white shadow-sm ${themed.ring}`
      : "bg-primary hover:bg-primary/90 text-white shadow-sm focus:ring-primary",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus:ring-slate-400",
    outline:
      "border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 focus:ring-slate-400",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 focus:ring-slate-400",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-400",
  };

  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-5 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
