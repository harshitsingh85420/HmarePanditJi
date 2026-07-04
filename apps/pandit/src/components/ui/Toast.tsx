"use client";

import React, { useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useVoice } from "../../hooks/useVoice";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface ToastProps {
  message: string;
  voiceText?: string;
  show: boolean;
  onClose: () => void;
  className?: string;
}

export function Toast({ message, voiceText, show, onClose, className }: ToastProps) {
  const { speak } = useVoice();

  useEffect(() => {
    if (show) {
      if (voiceText) {
        // Delay slightly to prevent browser context cutoff
        const speakTimer = setTimeout(() => {
          speak(voiceText);
        }, 100);
        
        const closeTimer = setTimeout(() => {
          onClose();
        }, 3000);

        return () => {
          clearTimeout(speakTimer);
          clearTimeout(closeTimer);
        };
      } else {
        const closeTimer = setTimeout(() => {
          onClose();
        }, 3000);

        return () => clearTimeout(closeTimer);
      }
    }
  }, [show, voiceText, speak, onClose]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-4 right-4 z-50 bg-temple-600 text-white px-4 py-3.5 rounded-card shadow-lg flex items-center justify-between gap-3 animate-fade-up",
        className
      )}
      role="alert"
    >
      <span className="text-[18px] font-medium leading-normal">{message}</span>
      {voiceText && (
        <button
          onClick={() => speak(voiceText)}
          className="w-14 h-14 min-h-[56px] min-w-[56px] flex items-center justify-center bg-white/15 hover:bg-white/25 active:scale-90 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50 text-[18px] flex-shrink-0"
          aria-label="Replay Audio"
        >
          🔊
        </button>
      )}
    </div>
  );
}
