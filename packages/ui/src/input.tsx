import React from "react";

export type InputVariant = "text" | "phone" | "textarea" | "search";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, &quot;size&quot;> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rows?: number;
}

export function Input({
  variant = &quot;text&quot;,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  rows = 4,
  className = &quot;&quot;,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, &quot;-&quot;);

  const baseClasses = [
    &quot;w-full bg-white dark:bg-slate-800&quot;,
    &quot;border border-slate-200 dark:border-slate-700 rounded-lg&quot;,
    // ACC-010 FIX: Larger text for elderly users (minimum 16px)
    &quot;text-base text-slate-900 dark:text-slate-100&quot;,
    &quot;placeholder:text-slate-400&quot;,
    &quot;focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary&quot;,
    &quot;disabled:opacity-50 disabled:cursor-not-allowed&quot;,
    // ACC-009 FIX: Larger touch target (min 52px height)
    &quot;min-h-[56px]&quot;,
    error ? &quot;border-red-400 focus:ring-red-400&quot; : &quot;&quot;,
  ];

  const hasLeftContent =
    !!leftIcon || variant === &quot;phone&quot; || variant === &quot;search&quot;;
  const paddingLeft = hasLeftContent ? &quot;pl-10&quot; : &quot;pl-4&quot;;

  if (variant === &quot;textarea&quot;) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            // ACC-010 FIX: Larger label text for elderly users
            className="text-base font-medium text-slate-700 dark:text-slate-300"
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
          // ACC-010 FIX: Larger error text for elderly visibility
          <p id={`${inputId}-error`} className="text-base text-red-500 font-medium">
            {error}
          </p>
        )}
        {helperText && !error && (
          // ACC-010 FIX: Larger helper text for elderly visibility
          <p id={`${inputId}-hint`} className="text-base text-slate-400">
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
          // ACC-010 FIX: Larger label text for elderly users (minimum 16px)
          className="text-base font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {variant === &quot;phone&quot; && (
          // ACC-010 FIX: Larger phone prefix text
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-500 font-medium pointer-events-none select-none">
            +91
          </span>
        )}
        {variant === &quot;search&quot; && !leftIcon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            search
          </span>
        )}
        {leftIcon && variant !== &quot;phone&quot; && (
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
        // ACC-010 FIX: Larger error text for elderly visibility
        <p id={`${inputId}-error`} className="text-base text-red-500 font-medium">
          {error}
        </p>
      )}
      {helperText && !error && (
        // ACC-010 FIX: Larger helper text for elderly visibility
        <p id={`${inputId}-hint`} className="text-base text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
