"use client";

import React, { useEffect, useState } from "react";

// CANON (design/canon/CountUp.dc.html): 1500ms with a 200ms delay, eased
// with easeOutCubic. The app ran 800ms easeOutQuad with no delay, which
// made money appear to snap rather than arrive — and with no delay the
// climb often began mid-paint, so the pandit never saw it start from ०.
// Money deserves the ceremony; this is the one number he is here for.
const COUNT_MS = 1500;
const COUNT_DELAY_MS = 200;

export function useCountUp(target: number, durationMs = COUNT_MS, delayMs = COUNT_DELAY_MS) {
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
    // CANON's delay is folded into the SAME wall clock — never a second
    // timer. A separate setTimeout would reintroduce exactly the throttled
    // -clock bug this hardening exists to prevent.
    const start = performance.now() + delayMs;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      const elapsed = timestamp - start;
      // before the delay elapses `elapsed` is negative — clamp at 0 so the
      // number rests visibly at ० instead of starting mid-climb
      const progress = Math.min(Math.max(elapsed, 0) / durationMs, 1);

      // easeOutCubic (canon): a longer, softer landing than easeOutQuad —
      // the figure decelerates into place rather than stopping dead.
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    // rAF can be throttled/starved on low-end devices or hidden tabs —
    // whatever happens, land on the final value shortly after duration.
    // MUST include the delay: without it the settle fires while the count
    // is still climbing and snaps the figure early.
    const settleTimeout = window.setTimeout(() => setCount(target), delayMs + durationMs + 400);

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
  }, [target, durationMs, delayMs]);

  return count;
}

export interface MoneyCountProps {
  target: number;
  durationMs?: number;
  delayMs?: number;
  className?: string;
}

export function MoneyCount({ target, durationMs = COUNT_MS, delayMs = COUNT_DELAY_MS, className }: MoneyCountProps) {
  const count = useCountUp(target, durationMs, delayMs);
  return (
    // CANON typography for a big numeral: tightened tracking (-.5px) and
    // line-height 1 so the figure reads as one solid block, and nowrap so
    // a lakh figure can never break across two lines mid-number.
    <span
      className={className}
      style={{ letterSpacing: "-0.5px", lineHeight: 1, whiteSpace: "nowrap" }}
    >
      ₹{count.toLocaleString("en-IN")}
    </span>
  );
}

export default MoneyCount;
