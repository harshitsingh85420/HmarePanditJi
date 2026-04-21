"use client";

import { useEffect, useState, type ReactNode, type MouseEvent } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  closeOnOverlayClick?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}: ModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Small delay to allow element to mount before triggering transition
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimate(true)),
      );
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setMounted(false), 300); // Wait for transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-full m-4",
  }[size];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${sizeClass} transform rounded-xl bg-white shadow-2xl transition-all duration-300 ${animate ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-500 focus:outline-none"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Close Button if no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 text-gray-400 transition-colors hover:text-gray-500 focus:outline-none"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="rounded-b-xl border-t border-gray-100 bg-gray-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
