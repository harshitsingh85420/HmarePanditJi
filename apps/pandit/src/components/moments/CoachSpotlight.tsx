"use client";

// ─────────────────────────────────────────────────────────────
// CoachSpotlight — the glow-to-try system (Spec 3).
// Dims the whole screen via a box-shadow CUTOUT around the target's
// bounding rect (so the target itself stays fully visible + interactive)
// with a 3px gold pulse ring, and shows a chandan tooltip card that
// auto-flips above/below by available space. requireInteraction lets
// pointer events through ONLY on the target rect; completing the
// interaction (or tapping [समझा]) calls onDone.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from "react";
import { hi } from "@/lib/strings";

export interface CoachSpotlightProps {
  targetRef: React.RefObject<HTMLElement | null>;
  title: string;
  line: string;
  actionHint?: string;
  onDone: () => void;
  requireInteraction?: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function CoachSpotlight({
  targetRef,
  title,
  line,
  actionHint,
  onDone,
  requireInteraction,
}: CoachSpotlightProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
  }, [targetRef]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const interval = setInterval(measure, 500); // targets can move (layout settle)
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      clearInterval(interval);
    };
  }, [measure]);

  // requireInteraction: watch for the target being activated
  useEffect(() => {
    if (!requireInteraction) return;
    const el = targetRef.current;
    if (!el) return;
    const done = () => onDone();
    el.addEventListener("click", done);
    return () => el.removeEventListener("click", done);
  }, [requireInteraction, targetRef, onDone]);

  if (!rect) return null;

  const viewportH = typeof window !== "undefined" ? window.innerHeight : 640;
  const spaceBelow = viewportH - (rect.top + rect.height);
  const tooltipBelow = spaceBelow > 180;

  return (
    <div className="fixed inset-0 z-[60]" style={{ pointerEvents: requireInteraction ? "none" : "auto" }}>
      {/* Cutout: everything but the target is dimmed + inert */}
      <div
        className="absolute rounded-card coach-ring"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          boxShadow: "0 0 0 9999px rgba(52,26,19,0.62)",
          border: "3px solid #E7B54A",
          pointerEvents: "none",
        }}
      />

      {/* Blocker layers around the target (interactive overlays only) */}
      {!requireInteraction && (
        <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />
      )}

      {/* Tooltip card */}
      <div
        className="absolute left-4 right-4 bg-cream rounded-card shadow-card border border-saffron-100 p-4 flex flex-col gap-2"
        style={{
          pointerEvents: "auto",
          ...(tooltipBelow
            ? { top: rect.top + rect.height + 14 }
            : { bottom: viewportH - rect.top + 14 }),
        }}
      >
        <span className="text-[20px] font-bold text-temple-600 font-hindi">{title}</span>
        <span className="text-[16px] text-ink font-hindi leading-snug">{line}</span>
        {requireInteraction ? (
          <span className="text-[16px] font-bold text-saffron-600 font-hindi">
            {actionHint || hi.coach.tryIt}
          </span>
        ) : (
          <button
            onClick={onDone}
            className="self-end min-h-[56px] px-6 bg-saffron-500 text-[#FFF3EA] rounded-btn text-[18px] font-bold active:scale-[0.97] transition-transform"
          >
            {hi.coach.gotIt}
          </button>
        )}
      </div>
    </div>
  );
}

export default CoachSpotlight;
