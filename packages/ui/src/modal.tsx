"use client";

import React, { useEffect, useCallback } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;full&quot;;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = &quot;md&quot;,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === &quot;Escape&quot;) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener(&quot;keydown&quot;, handleKeyDown);
      document.body.style.overflow = &quot;hidden&quot;;
    }
    return () => {
      document.removeEventListener(&quot;keydown&quot;, handleKeyDown);
      document.body.style.overflow = &quot;&quot;;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: &quot;max-w-sm&quot;,
    md: &quot;max-w-md&quot;,
    lg: &quot;max-w-2xl&quot;,
    full: &quot;max-w-full mx-4 sm:mx-8 h-[calc(100vh-4rem)]&quot;,
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
        className={`relative w-full ${sizes[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 ${
          size === "full" ? "flex flex-col overflow-hidden" : ""
        }`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-slate-500 text-xl">
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
