"use client";

import React, { useEffect, useCallback } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    full: "max-w-full mx-4 sm:mx-8 h-[calc(100vh-4rem)]",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative w-full ${sizes[size]} rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${
          size === "full" ? "flex flex-col overflow-hidden" : ""
        }`}
      >
        {/* Header */}
        {title && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-xl text-slate-500">
                close
              </span>
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className={`p-6 ${size === "full" ? "flex-1 overflow-y-auto" : ""}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
