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

// BUG-001 FIX: Increased timeout for elderly users to have enough time to respond
const DEFAULT_TIMEOUT_MS = 12000;  // 12s for regular users (was 8s)
// BUG-001 FIX: Increased elderly timeout to 20s for slower speakers (reserved for future use)
const ELDERLY_TIMEOUT_MS = 20000;  // 20s for elderly users (was 12s commented out)
// BUG-001 FIX: Increased reprompts to 3 for better elderly accommodation (was 2)
const MAX_REPROMPTS = 3;
// VOICE-008 FIX: Maximum errors before automatic keyboard fallback
const MAX_ERRORS_BEFORE_KEYBOARD = 3;

export function useSarvamVoiceFlow({
  language,
  script,
  onIntent,
  autoListen = true,
  listenTimeoutMs = DEFAULT_TIMEOUT_MS, // BUG-001 FIX: Increased from 8000ms to 12000ms for elderly users
  repromptScript,
  repromptTimeoutMs = DEFAULT_TIMEOUT_MS, // BUG-001 FIX: Increased from 8000ms to 12000ms
  initialDelayMs = 800,  // BUG-001 FIX: Increased from 500ms to 800ms for elderly comprehension
  pauseAfterMs = 1000,  // BUG-001 FIX: Increased from 300ms to 1000ms for TTS completion
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
  // BUG-MEDIUM-04 FIX: Add calibration delay to prevent false-triggering from audio context initialization
  useEffect(() => {
    if (disabled) return;

    // BUG-MEDIUM-04 FIX: Don't act on noise events during 5-second calibration period
    let calibrationComplete = false;
    const calibrationTimer = setTimeout(() => {
      calibrationComplete = true;
    }, 5000);

    cleanupNoiseRef.current = startAmbientNoiseMonitoring(
      (level) => {
        // BUG-MEDIUM-04 FIX: Only trigger after calibration period
        if (!calibrationComplete) return;

        // BUG-MEDIUM-04 FIX: Noise threshold is 85 (RMS ~68+, temple bells, heavy traffic, crowds)
        // Scale: 0-20 (silence), 20-40 (normal room), 40-60 (conversation), 60-75 (loud), 75-85 (very loud), 85+ (painful)
        // Only triggers in genuinely loud environments after 5-second calibration + 5-second rolling average
        noiseTooHighRef.current = true;
        console.log(`[useSarvamVoiceFlow] High ambient noise detected (${level}) - using keyboard fallback`);
        onNoiseHighRef.current?.(level);
      },
      () => {
        // BUG-MEDIUM-04 FIX: Only update after calibration period
        if (!calibrationComplete) return;
        noiseTooHighRef.current = false;
      }
    );

    return () => {
      clearTimeout(calibrationTimer);
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
    // BUG-MEDIUM-04 FIX: If noise is too high (>85, RMS ~68+ like temple bells), skip voice and use keyboard
    // Scale: 0-20 (silence), 20-40 (normal room), 40-60 (conversation), 60-75 (loud), 75-85 (very loud), 85+ (painful)
    if (noiseTooHighRef.current) {
      console.log('[useSarvamVoiceFlow] High ambient noise detected - using keyboard fallback');

      // Immediately trigger the 3-error cascade to force keyboard
      const currentErrorCount = useVoiceStore.getState().errorCount;

      // Force keyboard mode after noise-related skip (don't wait for 3 errors)
      if (currentErrorCount < MAX_ERRORS_BEFORE_KEYBOARD) {
        // Set error count to max to trigger keyboard fallback
        useVoiceStore.getState().resetErrors();
        for (let i = 0; i < MAX_ERRORS_BEFORE_KEYBOARD; i++) {
          incrementError();
        }
      }

      // Switch to keyboard mode immediately
      useVoiceStore.getState().switchToKeyboard();
      setVoiceFlowState('idle');

      // Announce the switch to keyboard due to noise
      void speakWithSarvam({
        text: 'शोर बहुत ज्यादा है। कीबोर्ड का उपयोग करें।',
        languageCode: sarvamLangCode,
        pace: 0.85,
      });

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

          // VOICE-007 FIX: After 3 errors, automatically switch to keyboard
          const errorCount = useVoiceStore.getState().errorCount;
          if (errorCount >= MAX_ERRORS_BEFORE_KEYBOARD) {
            console.log('[useSarvamVoiceFlow] 3 errors reached, switching to keyboard');
            useVoiceStore.getState().switchToKeyboard();

            // Announce the switch
            void speakWithSarvam({
              text: 'कीबोर्ड का उपयोग करें।',
              languageCode: sarvamLangCode,
              pace: 0.85,
            });
          }

          stopFlow(); // Explicitly stop the flow
        }
      }
    );
  }, [deepgramLang, disabled, effectiveListenTimeoutMs, incrementError, repromptScript, sarvamLangCode, setVoiceState, handleIntentWithReset, stopFlow]);

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
