'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import { detectIntent } from '@/lib/voice-engine';
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
}

interface UseSarvamVoiceFlowResult {
  voiceFlowState: VoiceFlowState;
  isListening: boolean;
  isSpeaking: boolean;
  restartListening: () => void;
  stopFlow: () => void;
}

// BUG-002 FIX: Reduced timeouts for faster keyboard fallback (was 12000ms)
const DEFAULT_TIMEOUT_MS = 8000;
const ELDERLY_TIMEOUT_MS = 10000;

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
}: UseSarvamVoiceFlowOptions): UseSarvamVoiceFlowResult {
  const [voiceFlowState, setVoiceFlowState] = useState<VoiceFlowState>('idle');
  const { incrementError, setState: setVoiceState } = useVoiceStore();

  const repromptCountRef = useRef(0);
  const cleanupSTTRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(false);
  const restartListeningRef = useRef<() => void>(() => { });
  const onIntentRef = useRef(onIntent);
  const onScriptCompleteRef = useRef(onScriptComplete);

  onIntentRef.current = onIntent;
  onScriptCompleteRef.current = onScriptComplete;

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
          onIntentRef.current?.(intent);
        } else {
          onIntentRef.current?.(`RAW:${transcript}`);
        }

        setVoiceFlowState('idle');
      },
      () => {
        // Timeout callback - increment error count (triggers V-05/V-06/V-07 cascade)
        if (!mountedRef.current) return;

        incrementError();
        setVoiceState('error_1');

        if (repromptCountRef.current < 1 && repromptScript) {
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
          setVoiceFlowState('idle');
          onIntentRef.current?.('TIMEOUT');
        }
      }
    );
  }, [deepgramLang, disabled, effectiveListenTimeoutMs, incrementError, repromptScript, sarvamLangCode, setVoiceState]);

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
  };
}
