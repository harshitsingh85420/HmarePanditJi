"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "../../hooks/useVoice";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export interface Command {
  keywords: string[];
  action: () => void;
  confirmText?: string;
}

export interface VoiceActionListenerProps {
  commands: Command[];
  narratingText?: string;
  promptText?: string; // used for "मदद" command
}

export function VoiceActionListener({
  commands,
  narratingText,
  promptText,
}: VoiceActionListenerProps) {
  const router = useRouter();
  const { speak, stop: stopVoice, enabled: voiceOutputEnabled } = useVoice();
  const voiceInput = useVoiceInput();

  const [internalState, setInternalState] = useState<
    "idle" | "prompting" | "listening" | "processing" | "confirming"
  >("idle");

  const [pendingCommand, setPendingCommand] = useState<Command | null>(null);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);

  const isFirstMount = useRef(true);

  // The header mute toggle (voice_enabled via useVoice) switches off the whole
  // voice interaction, not just narration — a muted app must not keep listening.
  useEffect(() => {
    const stored = localStorage.getItem("voice_input_enabled");
    const inputAllowed = stored === null || stored === "true";
    setVoiceInputEnabled(inputAllowed && voiceOutputEnabled);
  }, [voiceOutputEnabled]);

  // Narration and auto-start listen logic
  const triggerNarration = useCallback(() => {
    if (!voiceInputEnabled) return;

    setInternalState("prompting");
    stopVoice();

    if (!narratingText || !voiceOutputEnabled) {
      setInternalState("listening");
      voiceInput.start();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(narratingText);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9;
    utterance.onend = () => {
      setInternalState("listening");
      voiceInput.start();
    };
    utterance.onerror = () => {
      setInternalState("listening");
      voiceInput.start();
    };
    window.speechSynthesis.speak(utterance);
  }, [narratingText, voiceInputEnabled, voiceOutputEnabled, stopVoice, voiceInput]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const timer = setTimeout(() => {
        triggerNarration();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [triggerNarration]);

  // Execute or confirm matched command
  const executeCommand = useCallback((cmd: Command) => {
    if (cmd.confirmText) {
      setPendingCommand(cmd);
      setInternalState("confirming");
      stopVoice();

      const utterance = new SpeechSynthesisUtterance(`${cmd.confirmText}. क्या आप निश्चित हैं? हाँ या नहीं बोलें.`);
      utterance.lang = "hi-IN";
      utterance.rate = 0.9;
      utterance.onend = () => {
        voiceInput.start();
      };
      utterance.onerror = () => {
        voiceInput.start();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      cmd.action();
      setInternalState("idle");
    }
  }, [stopVoice, voiceInput]);

  // Match transcript against keywords
  const matchTranscript = useCallback((text: string) => {
    const cleanText = text.toLowerCase().trim();

    // 1. Global Commands
    // "मदद" / "help"
    if (["मदद", "help", "madad"].some(k => cleanText.includes(k))) {
      if (promptText) {
        stopVoice();
        speak(promptText);
      }
      setInternalState("idle");
      return;
    }

    // "पीछे" / "वापस" / "back"
    if (["पीछे", "वापस", "piche", "wapas", "back"].some(k => cleanText.includes(k))) {
      router.back();
      setInternalState("idle");
      return;
    }

    // 2. Custom passed commands
    for (const cmd of commands) {
      const match = cmd.keywords.some(k => cleanText.includes(k.toLowerCase()));
      if (match) {
        executeCommand(cmd);
        return;
      }
    }

    // No match found -> return to idle
    setInternalState("idle");
  }, [commands, promptText, router, speak, stopVoice, executeCommand]);

  // Match confirmation
  const matchConfirmation = useCallback((text: string) => {
    const cleanText = text.toLowerCase().trim();
    const isYes = ["हाँ", "हां", "haan", "han", "yes", "सही", "ठीक"].some(w => cleanText.includes(w));
    const isNo = ["नहीं", "nahi", "no", "ना", "गलत"].some(w => cleanText.includes(w));

    if (isYes && pendingCommand) {
      pendingCommand.action();
      setPendingCommand(null);
      setInternalState("idle");
    } else {
      // Negative or unclear confirmation
      setPendingCommand(null);
      setInternalState("idle");
    }
  }, [pendingCommand]);

  // Listen to Hook changes
  useEffect(() => {
    if (internalState === "listening" && voiceInput.state === "processing") {
      setInternalState("processing");
    }

    if (internalState === "processing" && voiceInput.state === "idle" && voiceInput.transcript) {
      matchTranscript(voiceInput.transcript);
    }

    if (internalState === "confirming" && voiceInput.state === "idle" && voiceInput.transcript) {
      matchConfirmation(voiceInput.transcript);
    }

    if (
      (internalState === "listening" || internalState === "confirming") &&
      voiceInput.state === "error"
    ) {
      setInternalState("idle");
    }
  }, [voiceInput.state, voiceInput.transcript, internalState, matchTranscript, matchConfirmation]);

  const handleMicTap = () => {
    if (internalState === "listening") {
      voiceInput.stop();
      setInternalState("processing");
    } else {
      setInternalState("listening");
      voiceInput.start();
    }
  };

  if (!voiceInputEnabled) return null;

  // Render Explainer Card if required
  if (voiceInput.showExplainer) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
        <Card className="max-w-[340px] w-full flex flex-col items-center justify-center text-center p-6 gap-4">
          <div className="text-[64px] leading-none animate-bounce" role="img" aria-label="Microphone">
            🎤
          </div>
          <h3 className="t-title font-bold text-ink">माइक की अनुमति आवश्यक है</h3>
          <p className="t-body text-softgrey">
            कृपया माइक की अनुमति दें, ताकि आप बोलकर जवाब दे सकें।
          </p>
          <div className="w-full flex flex-col gap-2 mt-2">
            <Button variant="primary" size="md" fullWidth onClick={voiceInput.proceedWithPermission}>
              अनुमति दें / Allow
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={voiceInput.cancelExplainer}>
              रद्द करें
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render floating microphone button
  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(230, 81, 0, 0.5);
          }
          70% {
            box-shadow: 0 0 0 16px rgba(230, 81, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(230, 81, 0, 0);
          }
        }
        .mic-listen-ring {
          animation: pulse-ring 1.5s infinite ease-in-out;
        }
      `}} />

      {/* Confirmation text overlay */}
      {internalState === "confirming" && (
        <div className="bg-saffron-600 text-white rounded-card px-4 py-2 text-[14px] font-semibold shadow-md mr-1 max-w-[200px] text-right pointer-events-auto">
          पक्का? हाँ या नहीं बोलें
        </div>
      )}

      {internalState === "listening" && (
        <div className="bg-saffron-500 text-white rounded-card px-4 py-2 text-[14px] font-semibold shadow-md mr-1 animate-pulse pointer-events-auto">
          सुन रहा हूँ...
        </div>
      )}

      {internalState === "processing" && (
        <div className="bg-temple-600 text-white rounded-card px-4 py-2 text-[14px] font-semibold shadow-md mr-1 pointer-events-auto">
          समझ रहा हूँ...
        </div>
      )}

      {/* Mic Button */}
      <button
        type="button"
        onClick={handleMicTap}
        className={`w-14 h-14 min-h-[56px] min-w-[56px] rounded-full text-white flex items-center justify-center text-[24px] shadow-lg focus:outline-none transition-all duration-300 pointer-events-auto active:scale-90 ${
          internalState === "listening"
            ? "bg-saffron-500 mic-listen-ring"
            : internalState === "processing"
            ? "bg-temple-600 animate-spin"
            : "bg-saffron-600 hover:bg-saffron-700"
        }`}
        aria-label="Voice command listener"
      >
        {internalState === "processing" ? "🪔" : "🎤"}
      </button>
    </div>
  );
}
export default VoiceActionListener;
