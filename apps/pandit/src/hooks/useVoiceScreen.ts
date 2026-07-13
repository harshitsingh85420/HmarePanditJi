"use client";

// ─────────────────────────────────────────────────────────────
// J1 — VoiceLoop v2: THE per-screen voice presence.
// NARRATE → LISTEN → resolve (field | command | global) → act/speak →
// LISTEN again, forever, until sleep/mute/hidden/unmount. Silence
// re-arms silently (no nagging, no cycle cap); unmatched speech gets at
// most one gentle line per 30s per screen (controller-enforced).
//
//   useVoiceScreen({ narration, commands, helpText })
//     = narration on mount + replay target + command registry + the
//       screen's priority-0 command listen (a mounted VoiceField
//       outranks it at priority 1 and falls through to the registry
//       when its parser rejects).
//   useVoiceCommands(commands, helpText, enabled?)
//     = registry-only — for screens whose narration/listen lives in a
//       child (VoiceField promptText, OtpBoxes) but whose commands
//       belong to the page.
//   useScreenVoice (legacy name) = useVoiceScreen({ narration }) — every
//     narrated screen answers the GLOBAL grammar (फिर से / मदद / सो जाओ)
//     with zero migration.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { voiceController, type VoiceCommand, type VoiceOption } from "@/lib/voiceController";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoice } from "@/hooks/useVoice";

export interface UseVoiceScreenOpts {
  /** Omit for command-only presences (a page whose narration lives in a
   *  child Narrate/VoiceField) — the loop still arms and resolves. */
  narration?: string;
  commands?: readonly VoiceCommand[];
  helpText?: string;
  onNarrationEnd?: () => void;
  /** BCP-47 override — the language-confirm ceremony speaks in the
   *  DETECTED language, not the active one. */
  languageCode?: string;
  /** Set false to keep the hook mounted but inert (step-gated screens). */
  enabled?: boolean;
  /** S3: the narration instructs pressing THIS control — it glows for
   *  the line's duration (until any gesture or the 10s failsafe). */
  highlightRef?: { current: HTMLElement | null };
}

/** Registry-only flavor — commands without narration/arming. */
export function useVoiceCommands(
  commands: readonly VoiceCommand[],
  helpText?: string,
  enabled: boolean = true,
): void {
  const commandsRef = useRef(commands);
  commandsRef.current = commands;
  useEffect(() => {
    if (!enabled) return;
    // register a STABLE proxy so keyword edits don't re-register; the
    // LENGTH is a dep — a screen that swaps command sets (e.g. a spoken
    // confirmation) re-registers with the new shape.
    const proxied = commandsRef.current.map((_, i) => ({
      get keywords() {
        return commandsRef.current[i]?.keywords ?? [];
      },
      action: () => commandsRef.current[i]?.action(),
      get confirmSpeech() {
        return commandsRef.current[i]?.confirmSpeech;
      },
      // W3: the agent's tool identity rides the same proxy
      get id() {
        return commandsRef.current[i]?.id;
      },
      get pure() {
        return commandsRef.current[i]?.pure;
      },
      get label() {
        return commandsRef.current[i]?.label;
      },
    }));
    return voiceController.registerVoiceScreen(proxied, helpText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, helpText, commands.length]);
}

/**
 * Q3 — EVERY VISIBLE CHOICE IS SPEAKABLE. Any component rendering
 * tappable choice cards/buttons registers each printed label (plus
 * optional synonyms) so speaking it taps it. One line per choice UI:
 *   useVoiceOptions(items.map(i => ({ label: i.title, onSelect: () => pick(i) })))
 */
export function useVoiceOptions(options: readonly VoiceOption[], enabled: boolean = true): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useEffect(() => {
    if (!enabled || !optionsRef.current.length) return;
    // stable proxies (same shape as useVoiceCommands) — label edits and
    // fresh onSelect closures flow through without re-registering
    const proxied = optionsRef.current.map((_, i) => ({
      get label() {
        return optionsRef.current[i]?.label ?? "";
      },
      get keywords() {
        return optionsRef.current[i]?.keywords;
      },
      onSelect: () => optionsRef.current[i]?.onSelect(),
    }));
    return voiceController.registerOptions(proxied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, options.length]);
}

export function useVoiceScreen(opts: UseVoiceScreenOpts) {
  const { narration, commands, helpText, languageCode, enabled = true } = opts;
  const onEndRef = useRef(opts.onNarrationEnd);
  onEndRef.current = opts.onNarrationEnd;
  const highlightRefRef = useRef(opts.highlightRef);
  highlightRefRef.current = opts.highlightRef;
  const { enabled: voiceOn } = useVoice();
  const voiceInput = useVoiceInput();

  // command registry (optional)
  useVoiceCommands(commands ?? [], helpText, enabled && !!commands?.length);

  // narration + replay target (the legacy useScreenVoice contract)
  useEffect(() => {
    if (!enabled || !narration) return;
    const timer = setTimeout(() => {
      voiceController.speak(narration, {
        languageCode,
        highlightRef: highlightRefRef.current,
        onEnd: () => onEndRef.current?.(),
      });
    }, 150);
    const unregister = voiceController.registerReplay(() => {
      voiceController.speak(narration, {
        languageCode,
        highlightRef: highlightRefRef.current,
      });
    });
    return () => {
      clearTimeout(timer);
      unregister();
      voiceController.stopSpeech("unmount:screen-voice");
    };
  }, [narration, languageCode, enabled]);

  // the screen's PERPETUAL command listen (priority 0 — a mounted
  // VoiceField outranks it and owns the mic instead)
  useEffect(() => {
    if (!enabled || !voiceOn) return;
    const unregister = voiceController.registerAutoListen(0, () => {
      // J3b: screen answers are 1-3 words — command endpointing (700ms)
      void voiceInput.start({ mode: "command" });
    });
    // no mount narration to end-trigger the loop? kick it ourselves
    // (a child Narrate/VoiceField speaking just makes this a no-op)
    if (!narration) voiceController.loopRearm(600);
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, voiceOn]);

  // resolve transcripts: screen commands → global grammar → gentle line
  useEffect(() => {
    if (!enabled) return;
    if (voiceInput.state === "idle" && voiceInput.transcript) {
      const text = voiceInput.transcript;
      voiceInput.reset();
      if (!voiceController.handleTranscript(text, voiceInput.confidence ?? 1)) {
        // S6c: the transcript rides along — question-shaped misses get
        // the honest line + telemetry instead of the terse nudge
        voiceController.speakUnmatchedGently(text);
      }
    }
    if (voiceInput.state === "error") {
      // silence/timeout — the loop law: re-arm SILENTLY, forever
      voiceInput.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, voiceInput.state, voiceInput.transcript]);

  return {
    replay: () => {
      if (narration) voiceController.speak(narration, { languageCode });
    },
  };
}

export default useVoiceScreen;
