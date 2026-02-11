import React, { useEffect, useCallback } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Prevent closing by clicking the backdrop */
  persistent?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  persistent = false,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !persistent) onClose();
    },
    [onClose, persistent],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const sizes: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
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
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative w-full ${sizes[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            {!persistent && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-slate-500 text-xl">
                  close
                </span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
