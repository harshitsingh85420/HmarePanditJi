"use client";

// उत्सव — canon frame 26. A full-screen moment: a big badge, a headline,
// one warm line, and (when there is real money to name) the amount.
//
// Canon type: headline 30/900, sub 17/600, amount 24/900 leaf-700.
// Petals drift behind it, exactly as on the splash.
//
// A11Y/A12: petals and badge use transform+opacity only and are dropped
// under prefers-reduced-motion (the composed scene stays readable).
// The overlay auto-dismisses, but a tap dismisses it immediately — a
// celebration must never hold the pandit hostage.

import React, { useEffect, useRef } from "react";
import { useReduced } from "@/lib/motion";

const PETALS = [
  { left: "10%", delay: 0.1, duration: 3.2, glyph: "🌼" },
  { left: "28%", delay: 0.5, duration: 2.8, glyph: "🌸" },
  { left: "46%", delay: 0.2, duration: 3.4, glyph: "🌼" },
  { left: "64%", delay: 0.7, duration: 3.0, glyph: "🌸" },
  { left: "82%", delay: 0.35, duration: 3.3, glyph: "🌼" },
];

export interface CelebrationOverlayProps {
  /** big glyph in the badge (canon: ✓ for accept, ✅-style for verified) */
  badge: string;
  /** 30/900 headline */
  title: string;
  /** 17/600 supporting line */
  subtitle: string;
  /** optional real amount — omit entirely when there is none to name */
  amount?: number;
  /** badge tint: leaf for money/accept, saffron for identity/verified */
  tone?: "leaf" | "saffron";
  /** ms before auto-dismiss (tap also dismisses) */
  autoMs?: number;
  onDone: () => void;
}

export function CelebrationOverlay({
  badge,
  title,
  subtitle,
  amount,
  tone = "leaf",
  autoMs = 3200,
  onDone,
}: CelebrationOverlayProps) {
  const reduced = useReduced();
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const t = setTimeout(finish, autoMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMs]);

  const badgeBg = tone === "leaf" ? "bg-leaf-500" : "bg-saffron-500";
  const titleColor = tone === "leaf" ? "text-leaf-700" : "text-saffron-700";

  return (
    <div
      role="status"
      onClick={finish}
      className="fixed inset-0 z-50 bg-cream flex flex-col items-center justify-center gap-5 px-8 text-center cursor-pointer"
    >
      {!reduced &&
        PETALS.map((p, i) => (
          <span
            key={i}
            className="pa-petal"
            style={{ left: p.left, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
            aria-hidden="true"
          >
            {p.glyph}
          </span>
        ))}

      <span
        className={`w-[120px] h-[120px] rounded-full ${badgeBg} text-chandan flex items-center justify-center text-[64px] leading-none shadow-btn ${
          reduced ? "" : "animate-scale-spring"
        }`}
        aria-hidden="true"
      >
        {badge}
      </span>

      <h1 className={`text-[30px] font-black font-hindi leading-snug ${titleColor}`}>{title}</h1>

      <p className="text-[17px] font-semibold text-softgrey font-hindi leading-snug">{subtitle}</p>

      {typeof amount === "number" && amount > 0 && (
        <p className="text-[24px] font-black text-leaf-700 font-mono">
          ₹{amount.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

export default CelebrationOverlay;
