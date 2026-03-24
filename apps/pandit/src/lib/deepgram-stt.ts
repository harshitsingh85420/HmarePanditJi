'use client';

import { startListening, stopListening } from '@/lib/voice-engine';

export interface DeepgramSTTConfig {
  language?: string;
  onTranscript: (text: string, confidence: number, isFinal: boolean) => void;
  onStateChange?: (state: 'connecting' | 'listening' | 'processing' | 'error' | 'stopped') => void;
  onError?: (error: string) => void;
  keyterms?: string[];
}

export const POOJA_KEYTERMS = [
  'haan', 'nahi', 'theek', 'sahi', 'bilkul', 'aage', 'wapas',
  'badle', 'skip', 'sahayata', 'madad',
  'varanasi', 'kashi', 'banaras', 'lucknow', 'patna', 'delhi',
  'prayagraj', 'haridwar', 'rishikesh', 'mathura', 'vrindavan',
  'ujjain', 'nashik', 'gaya', 'tirupati',
  'dakshina', 'pooja', 'puja', 'pandit', 'mandir', 'yajna', 'havan',
  'muhurat', 'kundali', 'gotra', 'vidhi', 'sankalp', 'prasad',
  'satyanarayan', 'griha', 'pravesh', 'vivah', 'mundan', 'namkaran',
  'annaprashan', 'shradh', 'navratri', 'ganesh', 'durga',
  'bhojpuri', 'maithili', 'bengali', 'tamil', 'telugu', 'kannada',
  'malayalam', 'marathi', 'gujarati', 'punjabi', 'odia', 'assamese',
];

const SHORT_LANG_TO_BCP47: Record<string, string> = {
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  en: 'en-IN',
};

function toBcp47(language?: string): string {
  if (!language) return 'hi-IN';
  return SHORT_LANG_TO_BCP47[language] ?? language;
}

export class DeepgramSTTSession {
  private cleanup: (() => void) | null = null;
  private config: DeepgramSTTConfig;

  constructor(config: DeepgramSTTConfig) {
    this.config = config;
  }

  async start(): Promise<boolean> {
    try {
      this.config.onStateChange?.('connecting');
      this.cleanup = startListening({
        language: toBcp47(this.config.language),
        onStateChange: (state) => {
          if (state === 'LISTENING') this.config.onStateChange?.('listening');
          else if (state === 'PROCESSING') this.config.onStateChange?.('processing');
          else if (state === 'FAILURE') this.config.onStateChange?.('error');
          else if (state === 'IDLE') this.config.onStateChange?.('stopped');
        },
        onResult: (result) => {
          this.config.onTranscript(result.transcript, result.confidence, result.isFinal);
        },
        onError: (error) => {
          this.config.onStateChange?.('error');
          this.config.onError?.(error);
        },
      });
      return true;
    } catch (error) {
      this.config.onStateChange?.('error');
      this.config.onError?.(error instanceof Error ? error.message : 'STT_START_FAILED');
      return false;
    }
  }

  stop(): void {
    this.cleanup?.();
    this.cleanup = null;
    stopListening();
    this.config.onStateChange?.('stopped');
  }
}

export function listenOnce(
  language: string = 'hi',
  timeoutMs: number = 12000,
  onResult: (transcript: string) => void,
  onTimeout: () => void
): () => void {
  // BUG-047 FIX: Actually pass keyterms to startListening for custom vocabulary
  const session = new DeepgramSTTSession({
    language,
    keyterms: POOJA_KEYTERMS,
    onTranscript: (text, _confidence, isFinal) => {
      if (isFinal && text.length > 0) {
        cleanup();
        onResult(text);
      }
    },
    onError: () => {
      cleanup();
      onTimeout();
    },
  });

  let timer: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    if (timer) clearTimeout(timer);
    session.stop();
  };

  session.start().then((started) => {
    if (!started) {
      onTimeout();
      return;
    }

    timer = setTimeout(() => {
      cleanup();
      onTimeout();
    }, timeoutMs);
  });

  return cleanup;
}
