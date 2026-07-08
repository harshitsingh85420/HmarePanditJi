"use client";

import { useEffect, useState } from "react";
import { voiceController } from "@/lib/voiceController";
import { Toast } from "@/components/ui/Toast";
import { t, refreshBundleInBackground } from "@/lib/i18n";

// Mounted once in app/layout.tsx: the "any interactive tap silences
// narration" rule (capture phase — speech never talks over action).
// The voice control itself is the शिष्य orb, docked in each screen's
// footer (BottomNav center-slot or the footer bar's orb slot).
// Also hosts the once-per-session "voice unavailable" toast (X2b):
// voiceController dispatches `hpj-voice-unavailable` when BOTH the TTS
// endpoint and speechSynthesis are unusable.
export function VoiceRoot() {
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);

  // D3: a persisted language bundle serves instantly on reload; refresh
  // it quietly so copy edits and not-yet-fetched groups catch up.
  useEffect(() => {
    refreshBundleInBackground();
  }, []);

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
    const onVoiceUnavailable = () => setVoiceUnavailable(true);
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("hpj-voice-unavailable", onVoiceUnavailable);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("hpj-voice-unavailable", onVoiceUnavailable);
    };
  }, []);

  if (!voiceUnavailable) return null;
  return (
    <Toast
      message={t("voice.unavailable")}
      show={voiceUnavailable}
      onClose={() => setVoiceUnavailable(false)}
    />
  );
}

export default VoiceRoot;
