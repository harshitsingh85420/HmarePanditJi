"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { ...item, id }]);
      const duration = item.duration ?? 5000;
      if (duration > 0) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Container ─────────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Single Toast ──────────────────────────────────────────────────────────────

const variantConfig: Record<
  ToastVariant,
  { icon: string; bar: string; text: string }
> = {
  success: { icon: "check_circle", bar: "bg-green-500", text: "text-green-600" },
  error: { icon: "error", bar: "bg-red-500", text: "text-red-600" },
  warning: { icon: "warning", bar: "bg-orange-500", text: "text-orange-600" },
  info: { icon: "info", bar: "bg-blue-500", text: "text-blue-600" },
};

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const cfg = variantConfig[item.variant];

  return (
    <div
      className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden flex items-start gap-3 p-4"
      role="alert"
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-2xl`} />

      <span
        className={`material-symbols-outlined text-xl mt-0.5 ${cfg.text} ml-1`}
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden="true"
      >
        {cfg.icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {item.title}
        </p>
        {item.message && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {item.message}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(item.id)}
        className="flex-shrink-0 p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined text-slate-400 text-lg">
          close
        </span>
      </button>
    </div>
  );
}

export { ToastItem as Toast };
