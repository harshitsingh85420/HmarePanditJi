'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import { detectIntent, startAmbientNoiseMonitoring } from '@/lib/voice-engine';
import { useVoiceStore } from '@/stores/voiceStore';
import {
  LANGUAGE_TO_SARVAM_CODE,
  speakWithSarvam,
  stopCurrentSpeech,
} from '@/lib/sarvam-tts';
import { listenOnce } from '@/lib/deepgram-stt';

type VoiceIntentPayload = string;
export type VoiceFlowState = 'idle' | 'speaking' | 'listening' | 'processing' | 'error';

interface UseSarvamVoiceFlowOptions {
  language: SupportedLanguage;
  script: string;
  onIntent?: (intent: VoiceIntentPayload) => void;
  autoListen?: boolean;
  listenTimeoutMs?: number;
  repromptScript?: string;
  repromptTimeoutMs?: number;
  initialDelayMs?: number;
  pauseAfterMs?: number;
  disabled?: boolean;
  onScriptComplete?: () => void;
  onNoiseHigh?: (noiseLevel: number) => void;  // VOICE-008 FIX: Callback for high ambient noise
}

interface UseSarvamVoiceFlowResult {
  voiceFlowState: VoiceFlowState;
  isListening: boolean;
  isSpeaking: boolean;
  restartListening: () => void;
  stopFlow: () => void;
  ambientNoiseLevel: number;  // VOICE-008 FIX: Expose noise level
  isNoiseTooHigh: boolean;    // VOICE-008 FIX: Expose noise status
}

// BUG-002 FIX: Reduced timeouts for faster keyboard fallback (was 12000ms)
const DEFAULT_TIMEOUT_MS = 8000;
// BUG-ACCESSIBILITY FIX: Increased elderly timeout to 25s for slower speakers (reserved for future use)
// const ELDERLY_TIMEOUT_MS = 25000;
// VOICE-005 FIX: Maximum reprompts before forcing exit (prevents infinite loop)
const MAX_REPROMPTS = 2;
// VOICE-008 FIX: Maximum errors before automatic keyboard fallback
const MAX_ERRORS_BEFORE_KEYBOARD = 3;

export function useSarvamVoiceFlow({
  language,
  script,
  onIntent,
  autoListen = true,
  listenTimeoutMs = DEFAULT_TIMEOUT_MS, // BUG-002 FIX: Reduced from 12000ms to 8000ms
  repromptScript,
  repromptTimeoutMs = DEFAULT_TIMEOUT_MS, // BUG-002 FIX: Reduced from 12000ms to 8000ms
  initialDelayMs = 500,
  pauseAfterMs = 300,
  disabled = false,
  onScriptComplete,
  onNoiseHigh,
}: UseSarvamVoiceFlowOptions): UseSarvamVoiceFlowResult {
  const [voiceFlowState, setVoiceFlowState] = useState<VoiceFlowState>('idle');
  const { incrementError, setState: setVoiceState, ambientNoiseLevel } = useVoiceStore();

  const repromptCountRef = useRef(0);
  const cleanupSTTRef = useRef<(() => void) | null>(null);
  const cleanupNoiseRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(false);
  const restartListeningRef = useRef<() => void>(() => { });
  const onIntentRef = useRef(onIntent);
  const onScriptCompleteRef = useRef(onScriptComplete);
  const onNoiseHighRef = useRef(onNoiseHigh);
  const noiseTooHighRef = useRef(false);

  onIntentRef.current = onIntent;
  onScriptCompleteRef.current = onScriptComplete;
  onNoiseHighRef.current = onNoiseHigh;

  // VOICE-008 FIX: Start ambient noise monitoring on mount
  useEffect(() => {
    if (disabled) return;

    cleanupNoiseRef.current = startAmbientNoiseMonitoring(
      (level) => {
        // Noise is too high (>65dB)
        noiseTooHighRef.current = true;
        onNoiseHighRef.current?.(level);
      },
      () => {
        // Noise is normal
        noiseTooHighRef.current = false;
      }
    );

    return () => {
      cleanupNoiseRef.current?.();
    };
  }, [disabled]);

  // STATE-002 FIX: Reset error count on successful intent (not timeout)
  const handleIntentWithReset = useCallback((intent: string) => {
    // Reset errors on successful voice input (not timeout or raw)
    if (intent !== 'TIMEOUT' && !intent.startsWith('RAW:') && intent !== 'MAX_REPROMPTS_REACHED') {
      // Reset error count on successful intent
      useVoiceStore.getState().resetErrors();
    }
    onIntentRef.current?.(intent);
  }, []);

  const sarvamLangCode = LANGUAGE_TO_SARVAM_CODE[language] ?? 'hi-IN';
  const deepgramLang = sarvamLangCode.split('-')[0];
  const effectiveListenTimeoutMs = repromptScript
    ? Math.min(listenTimeoutMs, repromptTimeoutMs)
    : listenTimeoutMs;

  const stopFlow = useCallback(() => {
    stopCurrentSpeech();
    cleanupSTTRef.current?.();
    cleanupSTTRef.current = null;
    setVoiceFlowState('idle');
  }, []);

  const restartListening = useCallback(() => {
    if (!mountedRef.current || disabled) return;

    // VOICE-008 FIX: Check ambient noise before attempting voice interaction
    if (noiseTooHighRef.current) {
      console.warn('[useSarvamVoiceFlow] Ambient noise too high, skipping voice interaction');
      // Trigger keyboard fallback immediately
      const currentErrorCount = useVoiceStore.getState().errorCount;
      if (currentErrorCount >= MAX_ERRORS_BEFORE_KEYBOARD - 1) {
        // Force keyboard mode after noise-related skip
        useVoiceStore.getState().switchToKeyboard();
        setVoiceFlowState('idle');
        return;
      }
      incrementError();
      setVoiceState('error_1');
      return;
    }

    cleanupSTTRef.current?.();
    setVoiceFlowState('listening');

    cleanupSTTRef.current = listenOnce(
      deepgramLang,
      effectiveListenTimeoutMs,
      (transcript) => {
        if (!mountedRef.current) return;

        setVoiceFlowState('processing');

        const intent = detectIntent(transcript);
        if (intent) {
          // BUG-053 FIX: Reset reprompt count on successful intent detection
          repromptCountRef.current = 0;
          // STATE-002 FIX: Use handler that resets error count on success
          handleIntentWithReset(intent);
        } else {
          // STATE-002 FIX: Pass raw intents through handler (won't reset errors)
          handleIntentWithReset(`RAW:${transcript}`);
        }

        setVoiceFlowState('idle');
      },
      () => {
        // Timeout callback - increment error count (triggers V-05/V-06/V-07 cascade)
        if (!mountedRef.current) return;

        incrementError();
        setVoiceState('error_1');

        // VOICE-005 FIX: Use MAX_REPROMPTS constant to prevent infinite loop
        if (repromptCountRef.current < MAX_REPROMPTS && repromptScript) {
          repromptCountRef.current += 1;
          setVoiceFlowState('speaking');
          void speakWithSarvam({
            text: repromptScript,
            languageCode: sarvamLangCode,
            pace: 0.88,
            onEnd: () => {
              if (mountedRef.current) restartListeningRef.current();
            },
            onError: () => {
              if (mountedRef.current) setVoiceFlowState('error');
            },
          });
        } else {
          // VOICE-005 FIX: Force exit after max reprompts - no infinite loop
          setVoiceFlowState('idle');
          // STATE-002 FIX: Use handler (won't reset errors for timeout)
          handleIntentWithReset('MAX_REPROMPTS_REACHED');
          stopFlow(); // Explicitly stop the flow
        }
      }
    );
  }, [deepgramLang, disabled, effectiveListenTimeoutMs, incrementError, repromptScript, sarvamLangCode, setVoiceState, handleIntentWithReset]);

  restartListeningRef.current = restartListening;

  useEffect(() => {
    if (disabled || !script) return;

    mountedRef.current = true;
    repromptCountRef.current = 0;

    const timer = window.setTimeout(() => {
      if (!mountedRef.current) return;

      setVoiceFlowState('speaking');
      void speakWithSarvam({
        text: script,
        languageCode: sarvamLangCode,
        speaker: 'ratan',
        pace: 0.9,
        onEnd: () => {
          if (!mountedRef.current) return;

          onScriptCompleteRef.current?.();

          if (autoListen) {
            window.setTimeout(() => restartListeningRef.current(), pauseAfterMs);
          } else {
            setVoiceFlowState('idle');
          }
        },
        onError: () => {
          if (mountedRef.current) setVoiceFlowState('error');
        },
      });
    }, initialDelayMs);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);
      stopFlow();
    };
  }, [autoListen, disabled, initialDelayMs, pauseAfterMs, sarvamLangCode, script, stopFlow, onScriptComplete]);

  return {
    voiceFlowState,
    isListening: voiceFlowState === 'listening',
    isSpeaking: voiceFlowState === 'speaking',
    restartListening,
    stopFlow,
    ambientNoiseLevel,      // VOICE-008 FIX: Expose noise level
    isNoiseTooHigh: noiseTooHighRef.current,  // VOICE-008 FIX: Expose noise status
  };
}
