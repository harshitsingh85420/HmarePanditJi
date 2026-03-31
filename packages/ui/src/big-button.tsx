"use client";

import type { ReactNode } from "react";

export interface BigButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function BigButton({ onClick, disabled = false, className = "", children }: BigButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
