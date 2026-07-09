"use client";

import { useEffect, useState } from "react";
import { voiceController } from "@/lib/voiceController";
import { Toast } from "@/components/ui/Toast";
import { t, refreshBundleInBackground } from "@/lib/i18n";
import { VoiceDebugPanel, useVoiceDebugFlag } from "@/components/VoiceDebugPanel";
import { API_BASE_MISSING } from "@/lib/api";

// Mounted once in app/layout.tsx: the "any interactive tap silences
// narration" rule (capture phase — speech never talks over action).
// The voice control itself is the शिष्य orb, docked in each screen's
// footer (BottomNav center-slot or the footer bar's orb slot).
// Also hosts the once-per-session voice toasts — X2b "voice unavailable"
// (`hpj-voice-unavailable`) and A3 "tap to hear" (`hpj-voice-tap-to-hear`)
// — plus the flag-gated ?voicedebug=1 diagnostics panel (A1).
export function VoiceRoot() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const debugOn = useVoiceDebugFlag();

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
      voiceController.stopSpeech("barge-in:tap");
    };
    const onVoiceUnavailable = () => setToastMsg(t("voice.unavailable"));
    const onTapToHear = () => setToastMsg(t("voice.tapToHear"));
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("hpj-voice-unavailable", onVoiceUnavailable);
    window.addEventListener("hpj-voice-tap-to-hear", onTapToHear);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("hpj-voice-unavailable", onVoiceUnavailable);
      window.removeEventListener("hpj-voice-tap-to-hear", onTapToHear);
    };
  }, []);

  return (
    <>
      {/* F2: a deployed build without NEXT_PUBLIC_API_URL can never talk
          to the API — say so on screen instead of failing silently.
          pointer-events-none: it overlays the sticky Header, and eating
          back-button taps app-wide would sabotage the very QA walk it
          exists to inform. */}
      {API_BASE_MISSING && (
        <div className="fixed top-0 inset-x-0 z-[95] pointer-events-none bg-red-700 text-white text-[18px] font-bold font-hindi text-center px-4 py-2">
          {t("errors.apiBaseMissing")}
        </div>
      )}
      {toastMsg && (
        <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg(null)} />
      )}
      {debugOn && <VoiceDebugPanel />}
    </>
  );
}

export default VoiceRoot;
