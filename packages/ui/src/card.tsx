import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const base =
    "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden";

  const variants: Record<string, string> = {
    default: "shadow-sm",
    elevated: "shadow-xl border-primary/20",
    interactive: "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
  };

  const paddings: Record<string, string> = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
