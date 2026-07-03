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

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    speak,
    stop,
    enabled: mounted ? enabled : true,
    toggle,
  };
}
export type UseVoiceReturn = ReturnType<typeof useVoice>;
