"use client";

import React from "react";
import { t } from "../../lib/i18n";

export function DiyaLoader({ message }: { message?: string } = {}) {
  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col items-center justify-center gap-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes diya-flicker {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        .animate-diya {
          animation: diya-flicker 1.2s infinite ease-in-out;
        }
      `}} />
      <div className="text-[48px] animate-diya select-none" role="img" aria-label="loading">
        🪔
      </div>
      <p className="t-body font-semibold text-temple-600 animate-pulse">
        {message ?? t("common.loading")}
      </p>
    </div>
  );
}

export default DiyaLoader;
