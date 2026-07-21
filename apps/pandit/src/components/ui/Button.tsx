"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { vibrateTap } from "@/lib/sounds";

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
  // CANON CTA (the single most-repeated component in the artboards, 18 of
  // them, all identical bar a few px):
  //   border-radius:18px; background:#B23A1A; color:#FFF6E9;
  //   font-size:20-22px; font-weight:800; min-height:60-64px;
  //   box-shadow:0 6px 16px rgba(178,58,26,.3)
  // Deltas that were live: 16px radius, #FFF3EA (a near-miss for chandan
  // #FFF6E9), weight 600 not 800, and md at 56px/18px — so the app's primary
  // button was rounder-cornered, thinner-lettered and shorter than canon's
  // everywhere at once. Weight is the one that showed most: 600 on sindoor
  // reads washed out, 800 reads pressed-in.
  const variantStyles = {
    primary: "bg-saffron-500 text-chandan shadow-btn font-extrabold hover:bg-saffron-600 active:scale-[0.97]",
    // CANON lifts money/success highest of all (0 8px 20px leaf) AND sets it
    // a weight heavier than primary (900 vs 800) — the money button is meant
    // to be the boldest thing on its screen.
    success: "bg-leaf-500 text-white shadow-btn-leaf font-black hover:bg-leaf-600 active:scale-[0.97]",
    "danger-outline": "bg-card border-2 border-danger text-danger font-extrabold hover:bg-red-50 active:scale-[0.97]",
    // CANON secondary is an OUTLINED peach pill, not a solid tan slab:
    //   background:#FDEEE7; border:2px solid #F4B096; color:#7A250E; 800
    secondary: "bg-saffron-50 border-2 border-saffron-200 text-saffron-700 font-extrabold hover:bg-saffron-100 active:scale-[0.97]",
    ghost: "bg-transparent text-temple-500 underline font-bold hover:bg-saffron-50 active:scale-[0.97]",
  };

  // Sizes: height and text-size. Canon's own range is 60-66px / 20-23px;
  // every step here is >= the old one, so nothing can fall under the 52px
  // tap-target floor and no screen loses room.
  const sizeStyles = {
    md: "h-[62px] min-h-[62px] text-[21px]",
    lg: "h-[64px] min-h-[64px] text-[22px]",
    xl: "h-[80px] min-h-[80px] text-[24px]",
  };

  return (
    <button
      disabled={disabled || loading}
      onClick={(e) => {
        // Light haptic tap on primary actions (guarded for unsupported browsers)
        if (variant === "primary" || variant === "success") vibrateTap();
        onClick?.(e);
      }}
      className={cn(
        // rounded-cta == canon's 18px. Weight now comes from the variant
        // (canon differentiates primary 800 from success 900), so the blanket
        // font-semibold that used to sit here is gone.
        "rounded-cta flex items-center justify-center transition-all duration-200 select-none relative",
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
