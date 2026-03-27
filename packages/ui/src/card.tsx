import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: &quot;default&quot; | &quot;outlined&quot; | &quot;elevated&quot;;
  padding?: &quot;none&quot; | &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({
  children,
  variant = &quot;default&quot;,
  padding = &quot;md&quot;,
  header,
  footer,
  onClick,
  className = &quot;&quot;,
  ...props
}: CardProps) {
  const base = &quot;bg-white dark:bg-slate-900 rounded-xl overflow-hidden&quot;;

  const variants: Record<string, string> = {
    default: &quot;border border-slate-100 dark:border-slate-800 shadow-sm&quot;,
    outlined: &quot;border-2 border-slate-200 dark:border-slate-700&quot;,
    elevated: &quot;border border-slate-100 dark:border-slate-800 shadow-lg&quot;,
  };

  const paddings: Record<string, string> = {
    none: &quot;&quot;,
    sm: &quot;p-3&quot;,
    md: &quot;p-5&quot;,
    lg: &quot;p-6&quot;,
  };

  const clickable = onClick
    ? &quot;cursor-pointer hover:shadow-md transition-shadow&quot;
    : &quot;&quot;;

  return (
    <div
      className={`${base} ${variants[variant]} ${clickable} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === &quot;Enter&quot; || e.key === &quot; &quot;) {
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
