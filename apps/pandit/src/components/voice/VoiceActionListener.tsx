"use client";

// ─────────────────────────────────────────────────────────────
// VoiceActionListener v3 — the screen's COMMAND target in the
// always-listening loop (priority 0; an active VoiceField outranks it).
// No mic buttons, no overlays: the only feedback is a slim listening
// pill under the header. Narration (if provided) plays through the
// controller, whose loop then re-arms listening automatically.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "../../hooks/useVoice";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { voiceController } from "../../lib/voiceController";
import { t } from "../../lib/i18n";

export interface Command {
  keywords: string[];
  action: () => void;
  confirmText?: string;
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
  const voiceInput = useVoiceInput();

  const [pendingCommand, setPendingCommand] = useState<Command | null>(null);
  const pendingRef = useRef(pendingCommand);
  pendingRef.current = pendingCommand;

  const listening = useSyncExternalStore(
    voiceController.subscribe,
    () => voiceController.listening,
    () => false,
  );

  // ── Command matching ───────────────────────────────────────
  const matchTranscript = useCallback(
    (text: string) => {
      const cleanText = text.toLowerCase().trim();

      if (pendingRef.current) {
        const isYes = ["हाँ", "हां", "haan", "han", "yes", "सही", "ठीक"].some((w) => cleanText.includes(w));
        const cmd = pendingRef.current;
        setPendingCommand(null);
        if (isYes) cmd.action();
        return;
      }

      if (["मदद", "help", "madad"].some((k) => cleanText.includes(k))) {
        if (promptText) voiceController.speak(promptText);
        return;
      }
      if (["पीछे", "वापस", "piche", "wapas", "back"].some((k) => cleanText.includes(k))) {
        router.back();
        return;
      }
      for (const cmd of commands) {
        if (cmd.keywords.some((k) => cleanText.includes(k.toLowerCase()))) {
          if (cmd.confirmText) {
            setPendingCommand(cmd);
            voiceController.speak(`${cmd.confirmText}। क्या आप निश्चित हैं? हाँ या नहीं बोलें।`);
          } else {
            cmd.action();
          }
          return;
        }
      }
      // No match: the loop quietly re-arms via endListen — no nagging.
    },
    [commands, promptText, router],
  );

  // ── Loop registration: fallback command target (priority 0) ─
  useEffect(() => {
    if (!voiceOn) return;
    const unregister = voiceController.registerAutoListen(0, () => {
      void voiceInput.start();
    });
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn]);

  // ── Screen narration on mount (loop re-arms after it ends) ──
  const firstMount = useRef(true);
  useEffect(() => {
    if (!firstMount.current) return;
    firstMount.current = false;
    if (!narratingText) {
      voiceController.loopRearm(600);
      return;
    }
    const t = setTimeout(() => voiceController.speak(narratingText), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── STT results → commands ─────────────────────────────────
  useEffect(() => {
    if (voiceInput.state === "idle" && voiceInput.transcript) {
      const text = voiceInput.transcript;
      voiceInput.reset();
      matchTranscript(text);
    }
    if (voiceInput.state === "error") {
      voiceInput.reset();
      // silence timeout → the controller's endListen already re-armed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceInput.state, voiceInput.transcript]);

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
