"use client";

import { useEffect } from "react";
import { SpeakerFab } from "@/components/ui/SpeakerFab";
import { voiceController } from "@/lib/voiceController";

// Mounted once in app/layout.tsx: the global speaker toggle + the
// "any interactive tap silences narration" rule (capture phase, so it
// fires before the button's own handler — speech never talks over action).
export function VoiceRoot() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(
        'button, a, input, select, textarea, [role="button"]',
      );
      if (!el) return;
      // The speaker fab manages speech itself
      if (el.getAttribute("aria-label")?.includes("आवाज़")) return;
      voiceController.stopSpeech();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return <SpeakerFab />;
}

export default VoiceRoot;
