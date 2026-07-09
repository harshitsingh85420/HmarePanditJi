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
  opts?: { onNarrationEnd?: () => void },
) {
  return useVoiceScreen({ narration, onNarrationEnd: opts?.onNarrationEnd });
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
