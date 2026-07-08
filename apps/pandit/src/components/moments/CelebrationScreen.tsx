"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Toran } from "../ui/Toran";
import { MoneyCount } from "./MoneyCount";

export interface CelebrationScreenProps {
  emoji: string;
  title: string;
  message: string;
  amount?: number;
  ctaLabel: string;
  onCta: () => void;
}

export function CelebrationScreen({
  emoji,
  title,
  message,
  amount,
  ctaLabel,
  onCta,
}: CelebrationScreenProps) {
  const [marigolds, setMarigolds] = useState<Array<{ left: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Generate randomized positions and delays on mount (avoids hydration mismatch)
    const items = Array.from({ length: 10 }).map((_, i) => {
      const left = `${i * 10 + Math.floor(Math.random() * 5)}%`;
      const delay = `${(i * 0.35).toFixed(2)}s`;
      const duration = `${(2.5 + Math.random() * 1.5).toFixed(2)}s`;
      return { left, delay, duration };
    });
    setMarigolds(items);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-cream to-saffron-50 overflow-hidden flex flex-col">
      <Toran tone="onCream" />
      <div className="flex-1 flex flex-col justify-between p-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marigold-fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .marigold {
          position: absolute;
          top: -50px;
          font-size: 24px;
          animation-name: marigold-fall;
          animation-timing-function: linear;
          animation-iteration-count: 2;
          animation-fill-mode: forwards;
          pointer-events: none;
          user-select: none;
          z-index: 10;
        }
        @media (prefers-reduced-motion: reduce) {
          .marigold {
            display: none !important;
          }
        }
      `}} />

      {/* Falling marigold shower */}
      {marigolds.map((item, idx) => (
        <span
          key={idx}
          className="marigold"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
          role="img"
          aria-hidden="true"
        >
          🌼
        </span>
      ))}

      {/* Center Content */}
      <div className="flex-grow flex flex-col items-center justify-center text-center gap-6 px-4">
        <div className="text-[80px] leading-none select-none mb-2" role="img" aria-hidden="true">
          {emoji}
        </div>
        
        <h2 className="t-hero font-bold leading-tight">
          {title}
        </h2>

        {amount !== undefined && (
          <div className="t-money-hero my-2">
            <MoneyCount target={amount} className="t-money-hero" />
          </div>
        )}

        <p className="t-body max-w-sm text-ink leading-relaxed">
          {message}
        </p>
      </div>

      {/* Action Button */}
      <div className="w-full pb-safe mt-auto">
        <Button variant="primary" size="xl" fullWidth onClick={onCta}>
          {ctaLabel}
        </Button>
      </div>
      </div>
    </div>
  );
}

export default CelebrationScreen;
