"use client";

import React from "react";
import { t } from "../../lib/i18n";

export function DiyaLoader({ message, inline = false }: { message?: string; inline?: boolean } = {}) {
  if (inline) {
    // D1: compact waiting row (server waking) — no overlay, sits in flow
    return (
      <div className="flex items-center justify-center gap-3 px-4 py-2" role="status">
        <span className="text-[28px] animate-diya-sm select-none" aria-hidden="true">🪔</span>
        <span className="t-body font-semibold text-temple-600 font-hindi animate-pulse">
          {message ?? t("common.loading")}
        </span>
      </div>
    );
  }
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
      {/* Mockup frame 28: एक क्षण… 24/900 saffron-700 */}
      <p className="text-[24px] font-black text-saffron-700 font-hindi animate-pulse motion-reduce:animate-none">
        {message ?? t("common.loading")}
      </p>
    </div>
  );
}

export default DiyaLoader;
