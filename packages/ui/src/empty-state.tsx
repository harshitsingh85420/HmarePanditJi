import React from "react";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  className?: string;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <span className="material-symbols-outlined text-4xl text-slate-400">
          {icon}
        </span>
      </div>
      <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary hover:bg-primary/90 shadow-primary/20 inline-flex h-10 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white shadow-lg transition-all"
        >
          {action.icon && (
            <span className="material-symbols-outlined text-base">
              {action.icon}
            </span>
          )}
          {action.label}
        </button>
      )}
    </div>
  );
}
