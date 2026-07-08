"use client";

import React, { useSyncExternalStore } from "react";
import { voiceController } from "@/lib/voiceController";
import { hi } from "@/lib/strings";

// The ONE voice switch, present on every route (mounted in app/layout.tsx).
// Tap while speaking → instant silence + mute; tap again → "आवाज़ चालू"
// and the current screen re-narrates via its registered replay.
export function SpeakerFab() {
  const muted = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.muted,
    () => false,
  );
  const speaking = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.speaking,
    () => false,
  );

  return (
    <button
      onClick={() => voiceController.setMuted(!muted)}
      aria-label={muted ? hi.voice.on : hi.voice.off}
      className={`fixed z-50 w-16 h-16 min-w-[64px] min-h-[64px] rounded-full bg-temple-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform ${
        speaking ? "ring-[3px] ring-gold speaker-fab-pulse" : "ring-1 ring-gold/40"
      }`}
      style={{
        top: "max(16px, env(safe-area-inset-top))",
        right: "16px",
        fontSize: "28px",
      }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

export default SpeakerFab;
