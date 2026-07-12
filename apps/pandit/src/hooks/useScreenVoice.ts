"use client";

import { useVoiceScreen } from "@/hooks/useVoiceScreen";

/**
 * Screen-level narration (legacy name — now a thin wrapper over
 * VoiceLoop v2's useVoiceScreen): speaks on mount, registers the replay
 * target, cuts speech on unmount, AND arms the perpetual command listen
 * so every narrated screen answers the global grammar (फिर से / मदद /
 * सो जाओ) even before it registers screen commands of its own.
 */
export function useScreenVoice(
  narration: string,
  opts?: {
    onNarrationEnd?: () => void;
    /** S3: control this narration tells the pandit to press — it glows. */
    highlightRef?: { current: HTMLElement | null };
  },
) {
  return useVoiceScreen({
    narration,
    onNarrationEnd: opts?.onNarrationEnd,
    highlightRef: opts?.highlightRef,
  });
}

/**
 * ONE-शिष्य LAW: screens have exactly one voice presence — the footer
 * orb. Narrate replaces the old visible speaker chip: same narration +
 * replay registration, zero UI.
 * (Plain function component returning null — no JSX, so .ts is fine.)
 */
export function Narrate({
  text,
  highlightRef,
}: {
  text: string;
  /** S3: the narration's "press THIS" target (wrapper-div ref). */
  highlightRef?: { current: HTMLElement | null };
}): null {
  useScreenVoice(text, { highlightRef });
  return null;
}

export default useScreenVoice;
