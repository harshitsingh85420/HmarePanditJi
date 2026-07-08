"use client";

import { useEffect } from "react";
import { voiceController } from "@/lib/voiceController";

// Mounted once in app/layout.tsx: the "any interactive tap silences
// narration" rule (capture phase — speech never talks over action).
// The voice control itself is the शिष्य orb, docked in each screen's
// footer (BottomNav center-slot or the footer bar's orb slot).
export function VoiceRoot() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(
        'button, a, input, select, textarea, [role="button"]',
      );
      if (!el) return;
      // शिष्य manages speech himself
      const label = el.getAttribute("aria-label") || "";
      if (label.includes("शिष्य")) return;
      voiceController.stopSpeech();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return null;
}

export default VoiceRoot;
