'use client';

import { speak, stopSpeaking } from '@/lib/voice-engine';

export type SarvamLanguageCode =
  | 'hi-IN'
  | 'bn-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'mr-IN'
  | 'gu-IN'
  | 'pa-IN'
  | 'or-IN'
  | 'en-IN';

export type SarvamSpeaker = 'ratan' | 'kabir' | 'aditya' | 'priya' | 'neha';

export interface SarvamTTSOptions {
  text: string;
  languageCode?: SarvamLanguageCode;
  speaker?: SarvamSpeaker;
  pace?: number;
  pitch?: number;
  loudness?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export const LANGUAGE_TO_SARVAM_CODE: Record<string, SarvamLanguageCode> = {
  Hindi: 'hi-IN',
  Bhojpuri: 'hi-IN',
  Maithili: 'hi-IN',
  Bengali: 'bn-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Punjabi: 'pa-IN',
  Odia: 'or-IN',
  Sanskrit: 'hi-IN',
  English: 'en-IN',
  Assamese: 'hi-IN',
};

let activeSpeechToken = 0;

export function stopCurrentSpeech(): void {
  activeSpeechToken += 1;
  stopSpeaking();
}

export async function speakWithSarvam({
  text,
  languageCode = 'hi-IN',
  onStart,
  onEnd,
  onError,
}: SarvamTTSOptions): Promise<void> {
  const speechToken = activeSpeechToken + 1;
  activeSpeechToken = speechToken;

  return new Promise((resolve) => {
    try {
      onStart?.();
      speak(text, languageCode, () => {
        if (speechToken !== activeSpeechToken) {
          resolve();
          return;
        }

        onEnd?.();
        resolve();
      });
    } catch (error) {
      if (speechToken === activeSpeechToken) {
        onError?.(error instanceof Error ? error.message : 'TTS_FAILED');
      }
      resolve();
    }
  });
}