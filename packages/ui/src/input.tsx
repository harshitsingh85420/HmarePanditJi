import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  icon,
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none select-none"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            "w-full py-3 pr-4 bg-white dark:bg-slate-800",
            "border border-slate-200 dark:border-slate-700 rounded-xl",
            "text-sm text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-red-400 focus:ring-red-400" : "",
            icon ? "pl-10" : "pl-4",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          aria-invalid={!!error}
          {...props}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-500 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          id={`${inputId}-hint`}
          className="text-xs text-slate-400"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
