"use client";

// ─────────────────────────────────────────────────────────────
// VoiceActionListener v4 (J2) — a thin ADAPTER over VoiceLoop v2.
// Commands now live in the controller's screen registry (screen
// commands first, then the GLOBAL grammar), and the listen is the
// standard priority-0 command listen with fast endpointing — so every
// screen that mounts this component automatically answers फिर से /
// मदद / सो जाओ and stays in the perpetual loop. confirmText commands
// keep their spoken हाँ/नहीं confirmation via a temporary command
// swap. UI unchanged: the slim listening pill under the header.
// ─────────────────────────────────────────────────────────────

import React, { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "../../hooks/useVoice";
import { useVoiceScreen } from "../../hooks/useVoiceScreen";
import { voiceController, type VoiceCommand } from "../../lib/voiceController";
import { YES, NO, BACK } from "../../lib/voiceGrammar";
import { t } from "../../lib/i18n";

export interface Command {
  keywords: string[];
  action: () => void;
  confirmText?: string;
  /** W3: stable tool id/label for the agent (see VoiceCommand). */
  id?: string;
  label?: string;
}

export interface VoiceActionListenerProps {
  commands: Command[];
  narratingText?: string;
  promptText?: string; // spoken again on the "मदद" command
}

export function VoiceActionListener({
  commands,
  narratingText,
  promptText,
}: VoiceActionListenerProps) {
  const router = useRouter();
  const { enabled: voiceOn } = useVoice();
  const [pending, setPending] = useState<Command | null>(null);

  const listening = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.listening,
    () => false,
  );

  // While a destructive command awaits confirmation, the screen answers
  // ONLY हाँ/नहीं; otherwise the caller's commands + a पीछे fallback.
  // NO REGISTERS FIRST — the registry fires the first inclusion hit, and
  // a decline sentence can embed YES substrings (mr: "असं होणार नाही"
  // contains हो). matchYesNo's NO-first law applies here too: an
  // explicit decline must never confirm a destructive action.
  const registryCommands: VoiceCommand[] = pending
    ? [
        { id: "confirm-no", label: "नहीं", keywords: NO, action: () => setPending(null) },
        {
          id: "confirm-yes",
          label: "हाँ",
          keywords: YES,
          action: () => {
            const cmd = pending;
            setPending(null);
            cmd.action();
          },
        },
      ]
    : [
        ...commands.map((cmd) => ({
          // W3: the agent's tool identity rides through the wrapper
          id: cmd.id,
          label: cmd.label,
          keywords: cmd.keywords,
          action: () => {
            if (cmd.confirmText) {
              setPending(cmd);
              voiceController.speak(`${cmd.confirmText} ${t("voiceLoop.confirmSure")}`);
            } else {
              cmd.action();
            }
          },
        })),
        { id: "go-back", label: "पीछे जाओ", keywords: BACK, action: () => router.back() },
      ];

  // Mount-time narration only (the old firstMount contract): a screen
  // whose narrating text CHANGES (e.g. home's welcome after an
  // online-toggle) must not re-announce itself mid-visit.
  const mountNarration = useRef(narratingText);
  useVoiceScreen({
    narration: mountNarration.current,
    commands: registryCommands,
    helpText: promptText,
  });

  if (!voiceOn) return null;

  // Slim command-listening pill under the header — the ONLY feedback.
  return listening ? (
    <div className="sticky top-16 z-30 flex justify-center pointer-events-none">
      <span className="bg-gold/15 border border-gold text-temple-600 text-[16px] font-semibold font-hindi rounded-full px-4 py-1.5 backdrop-blur-sm">
        {t("voiceLoop.listening")}
      </span>
    </div>
  ) : null;
}

export default VoiceActionListener;
