"use client";

import { useEffect, useRef } from "react";
import { voiceController } from "@/lib/voiceController";

/**
 * Screen-level narration: speaks on mount, registers itself as the current
 * replay target (SpeakerFab unmute → re-narrates this screen), and cuts
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

export default useScreenVoice;
