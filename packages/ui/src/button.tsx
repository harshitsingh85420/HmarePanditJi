import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<string, string> = {
    primary:
      "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 focus:ring-primary",
    secondary:
      "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 focus:ring-slate-400",
    danger:
      "border-2 border-red-500/20 text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-950 focus:ring-red-400",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 focus:ring-slate-400",
  };

  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs gap-1",
    md: "h-10 px-5 text-sm gap-1.5",
    lg: "h-12 px-8 text-base gap-2",
  };

  const iconSizes: Record<string, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 mr-1"
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
      ) : icon ? (
        <span className={`material-symbols-outlined ${iconSizes[size]}`}>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
