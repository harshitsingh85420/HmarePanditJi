"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "saffron" | "gold" | "leaf";
  onClick?: () => void;
  clickable?: boolean;
}

export function Card({
  children,
  className,
  accent,
  onClick,
  clickable = false,
}: CardProps) {
  const accentClasses = {
    saffron: "border-l-4 border-l-saffron-500",
    gold: "border-l-4 border-l-gold",
    leaf: "border-l-4 border-l-leaf-500",
  };

  const Element = clickable ? "button" : "div";

  return (
    <Element
      onClick={onClick}
      type={clickable ? "button" : undefined}
      className={cn(
        "bg-white rounded-card shadow-card p-5 text-left block w-full",
        accent && accentClasses[accent],
        clickable && "cursor-pointer active:scale-[0.98] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-saffron-200 focus:outline-none",
        className
      )}
    >
      {children}
    </Element>
  );
}
