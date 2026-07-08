"use client";

import { useEffect, useRef } from "react";
import { voiceController } from "@/lib/voiceController";

/**
 * Screen-level narration: speaks on mount, registers itself as the current
 * replay target (शिष्य wakes → re-narrates this screen), and cuts
 * speech on unmount so navigation never carries stale narration along.
 */
export function useScreenVoice(
  narration: string,
  opts?: { onNarrationEnd?: () => void },
) {
  const onEndRef = useRef(opts?.onNarrationEnd);
  onEndRef.current = opts?.onNarrationEnd;

  useEffect(() => {
    const timer = setTimeout(() => {
      voiceController.speak(narration, {
        onEnd: () => onEndRef.current?.(),
      });
    }, 150);
    const unregister = voiceController.registerReplay(() => {
      voiceController.speak(narration);
    });
    return () => {
      clearTimeout(timer);
      unregister();
      voiceController.stopSpeech();
    };
  }, [narration]);

  return {
    replay: () => voiceController.speak(narration),
  };
}

/**
 * ONE-शिष्य LAW: screens have exactly one voice presence — the footer
 * orb. Narrate replaces the old visible speaker chip: same narration +
 * replay registration, zero UI.
 * (Plain function component returning null — no JSX, so .ts is fine.)
 */
export function Narrate({ text }: { text: string }): null {
  useScreenVoice(text);
  return null;
}

export default useScreenVoice;
