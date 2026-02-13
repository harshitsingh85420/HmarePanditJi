import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  header,
  footer,
  onClick,
  className = "",
  ...props
}: CardProps) {
  const base = "bg-white dark:bg-slate-900 rounded-xl overflow-hidden";

  const variants: Record<string, string> = {
    default: "border border-slate-100 dark:border-slate-800 shadow-sm",
    outlined: "border-2 border-slate-200 dark:border-slate-700",
    elevated: "border border-slate-100 dark:border-slate-800 shadow-lg",
  };

  const paddings: Record<string, string> = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  const clickable = onClick
    ? "cursor-pointer hover:shadow-md transition-shadow"
    : "";

  return (
    <div
      className={`${base} ${variants[variant]} ${clickable} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      {...props}
    >
      {header && (
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          {header}
        </div>
      )}
      <div className={paddings[padding]}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          {footer}
        </div>
      )}
    </div>
  );
}
