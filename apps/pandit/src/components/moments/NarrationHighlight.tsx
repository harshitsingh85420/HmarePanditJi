"use client";

// ─────────────────────────────────────────────────────────────
// S3 — NARRATION-SYNCED CONTROL HIGHLIGHT. When शिष्य's line says
// "press THIS button", that control wears the gold pulse ring (the
// CoachSpotlight ring WITHOUT the dim) from utterance start until any
// gesture — tap or voice command — or the 10s failsafe. Mounted once
// in VoiceRoot; driven by voiceController.highlight (speak's
// highlightRef opt). pointer-events-none always: it never eats the
// very tap it invites.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { voiceController } from "@/lib/voiceController";

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 6;

export function NarrationHighlight() {
  const highlight = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.highlight,
    () => null,
  );
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (!highlight) {
      setBox(null);
      return;
    }
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const el = highlight.el();
      if (!el || !el.isConnected) {
        // target unmounted (navigation) — the highlight is over
        voiceController.clearHighlight();
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setBox(null);
        return;
      }
      setBox({
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      });
    };
    measure();
    const iv = setInterval(measure, 300);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    // 10s failsafe — a glow that overstays becomes noise
    const cap = setTimeout(() => voiceController.clearHighlight(), 10000);
    return () => {
      alive = false;
      clearInterval(iv);
      clearTimeout(cap);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [highlight]);

  if (!highlight || !box) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none" aria-hidden="true">
      {/* ring only — NO 9999px dim shadow: the screen stays fully lit */}
      <div
        className="absolute rounded-card coach-ring"
        style={{
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          border: "3px solid #E7B54A",
          boxShadow: "0 0 18px 2px rgba(231, 181, 74, 0.55)",
        }}
      />
    </div>
  );
}

export default NarrationHighlight;
