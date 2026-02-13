import React from "react";

export type InputVariant = "text" | "phone" | "textarea" | "search";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rows?: number;
}

export function Input({
  variant = "text",
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  rows = 4,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const baseClasses = [
    "w-full bg-white dark:bg-slate-800",
    "border border-slate-200 dark:border-slate-700 rounded-lg",
    "text-sm text-slate-900 dark:text-slate-100",
    "placeholder:text-slate-400",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    error ? "border-red-400 focus:ring-red-400" : "",
  ];

  const hasLeftContent =
    !!leftIcon || variant === "phone" || variant === "search";
  const paddingLeft = hasLeftContent ? "pl-10" : "pl-4";

  if (variant === "textarea") {
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
        <textarea
          id={inputId}
          rows={rows}
          className={[...baseClasses, "py-3 px-4 resize-y", className]
            .filter(Boolean)
            .join(" ")}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-hint`
                : undefined
          }
          aria-invalid={!!error}
          {...(props as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }

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
        {variant === "phone" && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium pointer-events-none select-none">
            +91
          </span>
        )}
        {variant === "search" && !leftIcon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            search
          </span>
        )}
        {leftIcon && variant !== "phone" && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          type={variant === "search" ? "search" : (props.type ?? "text")}
          className={[
            ...baseClasses,
            "py-3",
            variant === "phone" ? "pl-12" : paddingLeft,
            rightIcon ? "pr-10" : "pr-4",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-hint`
                : undefined
          }
          aria-invalid={!!error}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
