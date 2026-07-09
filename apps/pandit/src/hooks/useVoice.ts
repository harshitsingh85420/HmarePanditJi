"use client";

import { useCallback, useSyncExternalStore } from "react";
import { voiceController } from "@/lib/voiceController";

// Thin React adapter over the VoiceController singleton.
// Public API unchanged (speak/stop/stopAll/enabled/toggle) so existing
// screens keep working; all state now lives in the controller.
export function useVoice() {
  const muted = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.muted,
    () => false,
  );

  const speak = useCallback((text: string) => {
    voiceController.speak(text);
  }, []);

  const stop = useCallback(() => {
    voiceController.stopSpeech("useVoice:stop");
  }, []);

  const stopAll = useCallback(() => {
    voiceController.stopSpeech("useVoice:stop");
  }, []);

  const toggle = useCallback(() => {
    voiceController.setMuted(!voiceController.muted);
  }, []);

  return {
    speak,
    stop,
    stopAll,
    enabled: !muted,
    toggle,
  };
}
export type UseVoiceReturn = ReturnType<typeof useVoice>;
