import React from "react";
import type { AppTheme } from "./tokens";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: &quot;primary&quot; | &quot;secondary&quot; | &quot;outline&quot; | &quot;ghost&quot; | &quot;danger&quot;;
  size?: &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  appTheme?: AppTheme;
}

const themeColors: Record<AppTheme, { bg: string; ring: string }> = {
  customer: {
    bg: &quot;bg-[#f49d25] hover:bg-[#d4850f]&quot;,
    ring: &quot;focus:ring-[#f49d25]&quot;,
  },
  pandit: {
    bg: &quot;bg-[#f09942] hover:bg-[#c77a2a]&quot;,
    ring: &quot;focus:ring-[#f09942]&quot;,
  },
  admin: {
    bg: &quot;bg-[#137fec] hover:bg-[#0d5cb8]&quot;,
    ring: &quot;focus:ring-[#137fec]&quot;,
  },
};

export function Button({
  children,
  variant = &quot;primary&quot;,
  size = &quot;md&quot;,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  appTheme,
  className = &quot;&quot;,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    &quot;inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none&quot;;

  const themed = appTheme ? themeColors[appTheme] : null;

  const variants: Record<string, string> = {
    primary: themed
      ? `${themed.bg} text-white shadow-sm ${themed.ring}`
      : &quot;bg-primary hover:bg-primary/90 text-white shadow-sm focus:ring-primary&quot;,
    secondary:
      &quot;bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus:ring-slate-400&quot;,
    outline:
      &quot;border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 focus:ring-slate-400&quot;,
    ghost:
      &quot;bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 focus:ring-slate-400&quot;,
    danger: &quot;bg-red-500 hover:bg-red-600 text-white focus:ring-red-400&quot;,
  };

  const sizes: Record<string, string> = {
    // ACC-009 FIX: Larger touch targets for elderly users (min 52px)
    sm: &quot;h-[52px] px-4 text-base gap-2&quot;,
    md: &quot;h-[56px] px-6 text-lg gap-2&quot;,
    lg: &quot;h-[64px] px-8 text-xl gap-3&quot;,
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
