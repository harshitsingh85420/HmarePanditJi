import { useCallback, useEffect, useState } from "react";

export function useVoice() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("voice_enabled");
      if (stored !== null) {
        setEnabled(stored === "true");
      }
    } catch (e) {
      // Ignore security errors in some sandbox environments
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const newVal = !prev;
      try {
        localStorage.setItem("voice_enabled", String(newVal));
      } catch (e) {
        // Ignore
      }
      if (!newVal) {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
      return newVal;
    });
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        return;
      }
      // Cancel ongoing speech
      window.speechSynthesis.cancel();

      if (!enabled) {
        return;
      }

      // Check if a recording is active (shared ref isListening via window property)
      if ((window as any).isVoiceInputRecording) {
        if (!(window as any).voiceSpeechQueue) {
          (window as any).voiceSpeechQueue = [];
        }
        (window as any).voiceSpeechQueue.push(text);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      (window as any).voiceSpeechQueue = [];
    }
  }, []);

  const stopAll = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    try {
      const { stopActiveAudio } = require("@/lib/sarvam-tts");
      stopActiveAudio();
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    speak,
    stop,
    stopAll,
    enabled: mounted ? enabled : true,
    toggle,
  };
}
export type UseVoiceReturn = ReturnType<typeof useVoice>;
