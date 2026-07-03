"use client";

import React, { useEffect, useState } from "react";

export function useCountUp(target: number, durationMs = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Pre-checks for SSR or window undefined
    if (typeof window === "undefined") {
      setCount(target);
      return;
    }

    // Check if prefers reduced motion is active
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setCount(target);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // easeOutQuad easing
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, durationMs]);

  return count;
}

export interface MoneyCountProps {
  target: number;
  durationMs?: number;
  className?: string;
}

export function MoneyCount({ target, durationMs = 800, className }: MoneyCountProps) {
  const count = useCountUp(target, durationMs);
  return (
    <span className={className}>
      ₹{count.toLocaleString("en-IN")}
    </span>
  );
}

export default MoneyCount;
