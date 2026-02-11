import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: string;
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  icon,
  label,
  error,
  options,
  placeholder,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          className={[
            "w-full py-3 pr-10 bg-white dark:bg-slate-800 appearance-none",
            "border border-slate-200 dark:border-slate-700 rounded-xl",
            "text-sm text-slate-900 dark:text-slate-100",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-red-400 focus:ring-red-400" : "",
            icon ? "pl-10" : "pl-4",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none"
        >
          expand_more
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
