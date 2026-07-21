/**
 * Voice Scripts for Part 0 - Onboarding Flow
 * These scripts are pre-warmed on app load to reduce TTS latency from 300ms to <50ms
 *
 * ONE-VOICE LAW: शिष्य has a single voice — 'aditya' (Sarvam bulbul:v3
 * male) at pace 1.15. These speaker/pace fields are inert: the /api/tts
 * route ignores caller speaker/pace and uses the server VOICE_PROFILE.
 */

export interface VoiceScript {
  screenId: string      // e.g., "S-0.0.2", "S-0.1"
  text: string          // Hindi Devanagari text
  language: string      // e.g., "hi-IN"
  speaker: string       // inert — one-voice law (server owns the voice)
  pace?: number         // inert — one-voice law
}

// ─────────────────────────────────────────────────────────────
// PART 0: ONBOARDING & TUTORIAL SCRIPTS
// ─────────────────────────────────────────────────────────────

export const PART_0_SCRIPTS: VoiceScript[] = [
  // S-0.0.2: Location Permission
  {
    screenId: 'S-0.0.2',
    text: 'नमस्ते। मैं आपका शहर जानना चाहता हूँ।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
  {
    screenId: 'S-0.0.2-location-request',
    text: 'क्या मैं आपकी लोकेशन एक्सेस कर सकता हूँ?',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.0.2B: Manual City Entry
  {
    screenId: 'S-0.0.2B',
    text: 'कोई बात नहीं। कृपया अपना शहर बताइए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.0.3: Language Confirmation
  {
    screenId: 'S-0.0.3',
    text: 'क्या आप हिंदी बोलते हैं?',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.0.4: Language Selection List
  {
    screenId: 'S-0.0.4',
    text: 'कृपया अपनी भाषा चुनिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.0.5: Language Choice Confirmation
  {
    screenId: 'S-0.0.5',
    text: 'बहुत अच्छा। आपने चुना है',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.0.6: Language Set Celebration
  {
    screenId: 'S-0.0.6',
    text: 'बधाई हो! आपकी भाषा सेट हो गई है।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.0.7: Help Screen
  {
    screenId: 'S-0.0.7',
    text: 'आपको किसी भी समय मदद चाहिए, तो बस पूछिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.0.8: Voice Micro-Tutorial
  {
    screenId: 'S-0.0.8',
    text: 'आप मुझसे बात कर सकते हैं। माइक पर क्लिक कीजिए और बोलिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.1: Tutorial - Welcome
  {
    screenId: 'S-0.1',
    text: 'नमस्ते! मैं आपका डिजिटल सहायक हूँ।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.2: Tutorial - Booking Pooja
  {
    screenId: 'S-0.2',
    text: 'आप पूजा बुक कर सकते हैं, पंडित जी को खोज सकते हैं।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.3: Tutorial - Voice Commands
  {
    screenId: 'S-0.3',
    text: 'बस बोलिए, मैं सब समझ जाऊंगा।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.4: Tutorial - Language Support
  {
    screenId: 'S-0.4',
    text: 'मैं हिंदी, भोजपुरी, मैथिली और कई अन्य भाषाएं समझता हूँ।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.5: Tutorial - Safety
  {
    screenId: 'S-0.5',
    text: 'आपकी जानकारी पूरी तरह सुरक्षित है।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.6: Tutorial - Getting Started
  {
    screenId: 'S-0.6',
    text: 'चलिए शुरू करते हैं।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.7: Tutorial - Registration Prompt
  {
    screenId: 'S-0.7',
    text: 'क्या आप रजिस्ट्रेशन करना चाहेंगे?',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.8: Tutorial - Skip Option
  {
    screenId: 'S-0.8',
    text: 'आप चाहें तो बाद में भी रजिस्टर कर सकते हैं।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.9: Tutorial - Continue
  {
    screenId: 'S-0.9',
    text: 'आगे बढ़ने के लिए नीचे क्लिक कीजिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.10: Tutorial - Profile Setup
  {
    screenId: 'S-0.10',
    text: 'अपनी प्रोफ़ाइल सेटअप कीजिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.11: Tutorial - Preferences
  {
    screenId: 'S-0.11',
    text: 'अपनी पसंद बताइए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // S-0.12: Tutorial - Complete
  {
    screenId: 'S-0.12',
    text: 'बहुत बढ़िया! आप तैयार हैं।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },

  // Common responses
  {
    screenId: 'common-yes',
    text: 'बहुत अच्छा।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
  {
    screenId: 'common-no',
    text: 'कोई बात नहीं।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
  {
    screenId: 'common-retry',
    text: 'माफ़ कीजिए, फिर से बोलिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
  {
    screenId: 'common-continue',
    text: 'आगे बोलिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
  {
    screenId: 'common-processing',
    text: 'एक पल रुकिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
  {
    screenId: 'common-success',
    text: 'हो गया!',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
  {
    screenId: 'common-error',
    text: 'कुछ गड़बड़ हो गई। कृपया फिर से कोशिश कीजिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
  {
    screenId: 'common-loading',
    text: 'लोड हो रहा है, कृपया प्रतीक्षा कीजिए।',
    language: 'hi-IN',
    speaker: 'aditya',
    pace: 1.15,
  },
]

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Get script by screen ID
 */
export function getScriptByScreenId(screenId: string): VoiceScript | undefined {
  return PART_0_SCRIPTS.find(script => script.screenId === screenId)
}

/**
 * Get all scripts for pre-warming
 */
export function getAllScripts(): VoiceScript[] {
  return PART_0_SCRIPTS
}

/**
 * Get scripts for specific screen IDs
 */
export function getScriptsForScreens(screenIds: string[]): VoiceScript[] {
  return PART_0_SCRIPTS.filter(script => screenIds.includes(script.screenId))
}
