'use client';

import { SarvamLanguageCode } from '@/lib/sarvam-tts';

// ─────────────────────────────────────────────────────────────
// VOICE PRELOADER
// Warms up the most critical audio clips during the 3s splash.
// This eliminates the "first voice delay" that makes the app feel laggy.
// ─────────────────────────────────────────────────────────────

const CRITICAL_PRELOADS: Array<{ text: string; lang: SarvamLanguageCode }> = [
  // S-0.0.2 — First spoken words after splash (HIGHEST PRIORITY)
  {
    text: 'नमस्ते। मैं आपका शहर जानना चाहता हूँ — ताकि आपकी भाषा अपने आप सेट हो जाए, और आपके शहर की पूजाएं आपको मिलें। आपका पूरा पता किसी को नहीं दिखेगा। क्या आप अनुमति देंगे?',
    lang: 'hi-IN',
  },
  // Generic positive/negative responses (used everywhere)
  { text: 'बहुत अच्छा।', lang: 'hi-IN' },
  { text: 'कोई बात नहीं।', lang: 'hi-IN' },
  // Error recovery scripts
  { text: 'माफ़ कीजिए, फिर से बोलिए — थोड़ा धीरे और साफ़।', lang: 'hi-IN' },
  { text: 'आवाज़ समझ नहीं आई। कोई बात नहीं — नीचे button भी है।', lang: 'hi-IN' },
  // S-0.1 Welcome
  {
    text: 'नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है। यह platform आपके लिए ही बना है। अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है।',
    lang: 'hi-IN',
  },
];

export async function preloadCriticalAudio(): Promise<void> {
  // TODO: implement preloadAudio logic once API supports it
  // for (const item of CRITICAL_PRELOADS) { ... }
}
