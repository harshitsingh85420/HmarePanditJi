"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseTTSOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  muted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (e: SpeechSynthesisErrorEvent) => void;
}

export function useTTS({
  text,
  lang = "hi-IN",
  rate = 0.9,
  pitch = 1,
  muted = false,
  onStart,
  onEnd,
  onError,
}: UseTTSOptions) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (muted) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      onStart?.();
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      isSpeakingRef.current = false;
      onError?.(e);
    };

    utteranceRef.current = utterance;
    // Chrome sometimes has a bug where it won't speak unless we wait briefly
    setTimeout(() => {
      if (!muted) {
        window.speechSynthesis.speak(utterance);
      }
    }, 400);
  }, [text, lang, rate, pitch, muted, onStart, onEnd, onError]);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
  }, []);

  // Speak on mount; stop on unmount
  useEffect(() => {
    speak();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, muted]);

  return { speak, stop };
}
