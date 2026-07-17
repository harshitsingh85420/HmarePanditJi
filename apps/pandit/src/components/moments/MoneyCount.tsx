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

    // MONEY-TRUTH: the clock starts NOW, not at the first rAF frame. In an
    // occluded/throttled window frames fire sporadically — seeding from the
    // first frame made every rare frame compute a near-zero elapsed, so a
    // capture or a returning user could see a frozen PARTIAL rupee figure
    // (live QA caught कुल stuck at ₹269 of ₹1,350). With wall-clock start,
    // ANY frame ≥durationMs later renders the exact final value.
    const start = performance.now();
    let animationFrameId: number;

    const step = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / durationMs, 1);

      // easeOutQuad easing
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    // rAF can be throttled/starved on low-end devices or hidden tabs —
    // whatever happens, land on the final value shortly after duration.
    const settleTimeout = window.setTimeout(() => setCount(target), durationMs + 400);

    // A hiding tab gets the TRUE value immediately — background timers are
    // throttled, and a money number must never wait wrong.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") setCount(target);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.clearTimeout(settleTimeout);
      document.removeEventListener("visibilitychange", onVisibility);
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
