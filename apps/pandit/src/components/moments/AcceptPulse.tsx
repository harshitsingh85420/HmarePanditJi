"use client";

import React, { useEffect } from "react";

export interface AcceptPulseProps {
  onComplete: () => void;
}

export function AcceptPulse({ onComplete }: AcceptPulseProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scale-spring-check {
          0% {
            transform: scale(0);
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-check-pulse {
          animation: scale-spring-check 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-check-pulse {
            animation: none !important;
            transform: scale(1) !important;
          }
        }
      `}} />
      <div className="w-32 h-32 rounded-full bg-leaf-100 flex items-center justify-center shadow-lg animate-check-pulse">
        <span className="text-[64px] leading-none select-none">✅</span>
      </div>
    </div>
  );
}

export default AcceptPulse;
