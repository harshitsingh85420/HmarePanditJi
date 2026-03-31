"use client";

import type { ReactNode } from "react";

export interface ListenButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function ListenButton({ onClick, disabled = false, children }: ListenButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-base">hearing</span>
      {children ?? "Listen"}
    </button>
  );
}
