"use client";

// उत्सव — canon frames 34 (बुकिंग स्वीकार) and 36 (प्रमाणित हुए).
// A full-screen moment: a stamped badge, a headline, one warm line, and
// (when there is real money to name) the amount.
//
// CANON LITERALS (extracted from design/canon/हमारे पंडित जी.dc.html):
//   screen bg   radial-gradient(120% 70% at 50% 34%,#FFF0D6,#FFF9EE 62%)
//   badge       130×130, radius 50%
//     · leaf    #1E7A46            shadow 0 12px 30px rgba(30,122,70,.4)
//     · gold    linear-gradient(150deg,#E7B54A,#B8860B)
//                                  shadow 0 12px 30px rgba(184,134,11,.4)
//     glyph     76px (leaf) / 74px (gold), #FFF6E9
//   headline    30/900  leaf #155C34 · gold #7A250E   (margin-top 22)
//   sub         17/600  leaf #7A250E · gold #8A6F5C   (margin-top 8)
//   amount      24/900  #155C34                        (margin-top 12)
//   ornament    six/four petals bursting from 50%/40% along --bx/--by
//
// LAW OVER CANON: the 17px sub is raised to 18px (18sp body floor) — a
// 62-year-old cannot read 17px. Everything else is the canon literal.
//
// A11Y/A12: petals and the stamp use transform+opacity only and are dropped
// under prefers-reduced-motion (the composed scene stays readable). The badge
// rests at the canon stamped angle, so nothing shifts when motion is off.
// The overlay auto-dismisses, but a tap dismisses it immediately — a
// celebration must never hold the pandit hostage.

import React, { useEffect, useRef } from "react";
import { useReduced } from "@/lib/motion";

type Petal = { bx: string; by: string; size: number; dur: number; delay: number; glyph: string };

/** canon frame 34 — six petals */
const BURST_LEAF: Petal[] = [
  { bx: "-100px", by: "-70px", size: 22, dur: 1.9, delay: -0.1, glyph: "🌼" },
  { bx: "100px", by: "-60px", size: 18, dur: 1.9, delay: -0.4, glyph: "🌸" },
  { bx: "-120px", by: "40px", size: 16, dur: 2.1, delay: -0.7, glyph: "🌼" },
  { bx: "120px", by: "50px", size: 20, dur: 2.1, delay: -1.0, glyph: "🌸" },
  { bx: "0px", by: "-100px", size: 18, dur: 2.0, delay: -1.3, glyph: "🌼" },
  { bx: "-60px", by: "80px", size: 15, dur: 2.2, delay: -1.6, glyph: "🌸" },
];

/** canon frame 36 — four petals */
const BURST_GOLD: Petal[] = [
  { bx: "-100px", by: "-65px", size: 20, dur: 2.0, delay: -0.15, glyph: "🌼" },
  { bx: "100px", by: "-60px", size: 18, dur: 2.0, delay: -0.55, glyph: "🌸" },
  { bx: "-118px", by: "45px", size: 16, dur: 2.2, delay: -0.95, glyph: "🌼" },
  { bx: "118px", by: "48px", size: 20, dur: 2.2, delay: -1.35, glyph: "🌸" },
];

const TONES = {
  leaf: {
    badge: "#1E7A46",
    badgeShadow: "0 12px 30px rgba(30,122,70,.4)",
    glyph: 76,
    title: "#155C34",
    subtitle: "#7A250E",
    burst: BURST_LEAF,
  },
  saffron: {
    badge: "linear-gradient(150deg,#E7B54A,#B8860B)",
    badgeShadow: "0 12px 30px rgba(184,134,11,.4)",
    glyph: 74,
    title: "#7A250E",
    subtitle: "#8A6F5C",
    burst: BURST_GOLD,
  },
} as const;

export interface CelebrationOverlayProps {
  /** big glyph in the badge (canon: ✓ for accept, ✓ for verified) */
  badge: string;
  /** 30/900 headline */
  title: string;
  /** 17/600 canon → 18/600 by the body floor */
  subtitle: string;
  /** optional real amount — omit entirely when there is none to name */
  amount?: number;
  /** badge tint: leaf for money/accept, saffron (canon gold) for verified */
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
  const t = TONES[tone];

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const timer = setTimeout(finish, autoMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMs]);

  return (
    <div
      role="status"
      onClick={finish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden p-6 text-center cursor-pointer"
      style={{ background: "radial-gradient(120% 70% at 50% 34%,#FFF0D6,#FFF9EE 62%)" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pa-cel-burst {
          0%   { transform: translate(0,0) scale(.4) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--bx),var(--by)) scale(1.1) rotate(180deg); opacity: 0; }
        }
        /* canon g-stamp, held at its 18% rest pose instead of looping to
           opacity 0 — a live overlay must not blink its badge away. */
        @keyframes pa-cel-stamp {
          0%   { transform: scale(2.6) rotate(-24deg); opacity: 0; }
          100% { transform: scale(1) rotate(-8deg); opacity: 1; }
        }
        .pa-cel-petal { position: absolute; animation-name: pa-cel-burst;
          animation-timing-function: ease-out; animation-iteration-count: infinite;
          pointer-events: none; user-select: none; }
        .pa-cel-badge { transform: rotate(-8deg);
          animation: pa-cel-stamp .54s cubic-bezier(.2,.8,.3,1) backwards; }
        @media (prefers-reduced-motion: reduce) {
          .pa-cel-petal { display: none !important; }
          .pa-cel-badge { animation: none !important; }
        }
      `,
        }}
      />

      {/* ornament — petals burst from the badge, canon offsets */}
      {!reduced && (
        <div className="absolute left-1/2 top-[40%] h-0 w-0" aria-hidden="true">
          {t.burst.map((p, i) => (
            <span
              key={i}
              className="pa-cel-petal"
              style={
                {
                  "--bx": p.bx,
                  "--by": p.by,
                  fontSize: `${p.size}px`,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            >
              {p.glyph}
            </span>
          ))}
        </div>
      )}

      <span
        className="pa-cel-badge relative z-[2] flex h-[130px] w-[130px] items-center justify-center rounded-full leading-none text-chandan"
        style={{
          background: t.badge,
          boxShadow: t.badgeShadow,
          fontSize: `${t.glyph}px`,
        }}
        aria-hidden="true"
      >
        {badge}
      </span>

      <div className="relative z-[2] mt-[22px]">
        <h1 className="text-[30px] font-black font-hindi leading-snug" style={{ color: t.title }}>
          {title}
        </h1>

        {/* canon 17px → 18px body floor */}
        <p
          className="mt-2 text-[18px] font-semibold font-hindi leading-snug"
          style={{ color: t.subtitle }}
        >
          {subtitle}
        </p>

        {typeof amount === "number" && amount > 0 && (
          <p className="mt-3 text-[24px] font-black font-hindi text-leaf-700">
            ₹{amount.toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </div>
  );
}

export default CelebrationOverlay;
