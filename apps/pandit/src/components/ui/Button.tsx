"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger-outline" | "ghost";
  size?: "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  children,
  className,
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  // Styles based on variant
  const variantStyles = {
    primary: "bg-saffron-500 text-white shadow-btn hover:bg-saffron-600 active:scale-[0.97]",
    success: "bg-leaf-500 text-white hover:bg-leaf-600 active:scale-[0.97]",
    "danger-outline": "bg-white border-2 border-danger text-danger hover:bg-red-50 active:scale-[0.97]",
    secondary: "bg-saffron-100 text-saffron-700 hover:bg-saffron-200 active:scale-[0.97]",
    ghost: "bg-transparent text-temple-500 underline hover:bg-saffron-50 active:scale-[0.97]",
  };

  // Sizes: height and text-size
  const sizeStyles = {
    md: "h-[56px] min-h-[56px] text-[18px]",
    lg: "h-[64px] min-h-[64px] text-[20px]",
    xl: "h-[80px] min-h-[80px] text-[24px]",
  };

  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        "rounded-btn font-semibold flex items-center justify-center transition-all duration-200 select-none relative",
        "focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none",
        fullWidth ? "w-full" : "px-6",
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && "opacity-60 pointer-events-none active:scale-100",
        className
      )}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="animate-spin motion-reduce:animate-none inline-block text-[22px]" role="img" aria-label="loading">
            🪔
          </span>
        </span>
      )}
      <span className={cn("flex items-center justify-center gap-2", loading && "opacity-0")}>
        {children}
      </span>
    </button>
  );
}
