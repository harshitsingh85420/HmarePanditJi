"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { matchCommand, TutorialCommand } from "../components/tutorial/voicePrompts";

interface UseVoiceRecognitionOptions {
  stepIndex: number;
  active: boolean; // only listen when TTS has finished
  lang?: string;
  onCommand: (cmd: TutorialCommand) => void;
  onError?: (errorCount: number) => void;
}

export function useVoiceRecognition({
  stepIndex,
  active,
  lang = "hi-IN",
  onCommand,
  onError,
}: UseVoiceRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const errorCountRef = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop any previous instance
    recognitionRef.current?.abort();

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still active (so it listens continuously)
      if (activeRef.current) {
        setTimeout(() => {
          if (activeRef.current) startListening();
        }, 600);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      // Ignore "no-speech" – restart quietly
      if (e.error === "no-speech" || e.error === "aborted") {
        if (activeRef.current) {
          setTimeout(() => {
            if (activeRef.current) startListening();
          }, 600);
        }
        return;
      }
      errorCountRef.current += 1;
      onError?.(errorCountRef.current);
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const results: string[] = [];
      for (let i = 0; i < e.results.length; i++) {
        for (let j = 0; j < e.results[i].length; j++) {
          results.push(e.results[i][j].transcript);
        }
      }
      const best = results[0] ?? "";
      setTranscript(best);

      const command = matchCommand(best, stepIndex);
      if (command) {
        errorCountRef.current = 0;
        onCommand(command);
      } else {
        errorCountRef.current += 1;
        onError?.(errorCountRef.current);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // Already started — ignore
    }
  }, [lang, stepIndex, onCommand, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    errorCountRef.current = 0;
    if (active) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [active, stepIndex]);

  return { isListening, transcript, startListening, stopListening };
}
