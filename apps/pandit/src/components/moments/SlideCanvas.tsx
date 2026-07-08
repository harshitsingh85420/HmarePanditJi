"use client";

// ─────────────────────────────────────────────────────────────
// प्रथम आरती — SlideCanvas: the tutorial's rotating festive canvas.
// A rounded-28 tinted zone (accentIndex % 5 → rani/neel/genda/kesar/
// gulal at 12% opacity) that holds BIG flat emoji compositions plus
// one key number/label at full accent strength. Enters with a 240ms
// fade+slide; children stagger 80ms (pa-stagger). Also exports the
// accent cycle (for dots/labels) and PetalBurst — the 🌼 micro-burst
// used on interactive completions. Accents color canvases, chips,
// dots and celebrations ONLY — never body text, never primary CTAs.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";

// hex paints canvases/chips/dots/borders at full accent strength;
// textHex is the AA-safe ink for TEXT in that accent's family (the
// light accents — genda/kesar/gulal — fail 3:1 on tinted canvases).
export const FESTIVE_ACCENTS = [
  { name: "rani", hex: "#D81B60", textHex: "#C2185B" },
  { name: "neel", hex: "#1B7F8E", textHex: "#15656F" },
  { name: "genda", hex: "#F2A02C", textHex: "#8F5E08" },
  { name: "kesar", hex: "#FF9E2C", textHex: "#9A5A00" },
  { name: "gulal", hex: "#F06292", textHex: "#C2185B" },
] as const;

export function accentFor(index: number) {
  return FESTIVE_ACCENTS[((index % 5) + 5) % 5];
}

export interface SlideCanvasProps {
  accentIndex: number;
  children: React.ReactNode;
  className?: string;
}

export function SlideCanvas({ accentIndex, children, className = "" }: SlideCanvasProps) {
  const accent = accentFor(accentIndex);
  return (
    <div
      // key re-runs the entrance when the accent (slide) changes
      key={accent.name + accentIndex}
      className={`pa-canvas-enter pa-stagger w-full rounded-canvas p-5 flex flex-col items-center justify-center gap-3 ${className}`}
      style={{ backgroundColor: `${accent.hex}1F` }} /* 12% tint */
    >
      {children}
    </div>
  );
}

// ── 🌼 micro-burst ───────────────────────────────────────────
// Renders `count` petals flying outward from the parent's center
// (parent must be position:relative), then removes itself. Petal
// directions are fixed per index (no Math.random → SSR-safe).
const BURST_DIRS = [
  [0, -72], [51, -51], [72, 0], [51, 51],
  [0, 72], [-51, 51], [-72, 0], [-51, -51],
];

export function PetalBurst({ count = 8, onEnd }: { count?: number; onEnd?: () => void }) {
  const [alive, setAlive] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setAlive(false);
      onEnd?.();
    }, 900);
    return () => clearTimeout(t);
  }, [onEnd]);

  if (!alive) return null;
  return (
    <span aria-hidden="true">
      {BURST_DIRS.slice(0, count).map(([x, y], i) => (
        <span
          key={i}
          className="pa-burst-petal"
          style={{ "--px": `${x}px`, "--py": `${y}px` } as React.CSSProperties}
        >
          🌼
        </span>
      ))}
    </span>
  );
}

export default SlideCanvas;
