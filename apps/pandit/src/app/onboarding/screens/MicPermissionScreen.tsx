'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { speakWithSarvam } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import type { SupportedLanguage, ScriptPreference } from '@/lib/onboarding-store';
import { getBrandName } from '@/lib/onboarding-store';
import { LANGUAGE_TO_SARVAM_CODE } from '@/lib/sarvam-tts';

interface MicPermissionScreenProps {
  language: SupportedLanguage;
  scriptPreference: ScriptPreference | null;
  onGranted: () => void;
  onDenied: () => void;
  onBack?: () => void;
}

export default function MicPermissionScreen({
  language,
  scriptPreference,
  onGranted,
  onDenied,
  onBack
}: MicPermissionScreenProps) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLatin = scriptPreference === 'latin';
  const brandName = getBrandName(language, scriptPreference);

  const TITLE = isLatin ? 'Yeh app aapki awaaz se chalega 🎙️' : 'यह ऐप आपकी आवाज़ से चलेगा 🎙️';
  const DESC = isLatin ? 'Is app mein aapko kuch bhi type karne ki zaroorat nahi. Bas boliye aur apna kaam karein.' : 'इस ऐप में आपको कुछ भी टाइप करने की ज़रूरत नहीं। बस बोलें और अपना काम करें।';
  const STEP1 = isLatin ? 'Aap boliye' : 'आप बोलें';
  const STEP2 = isLatin ? 'App sune' : 'ऐप सुने';
  const STEP3 = isLatin ? 'Ho gaya!' : 'हो गया!';
  const SAFETY_TITLE = isLatin ? 'Aapki awaaz kabhi record nahi hoti' : 'आपकी आवाज़ कभी रिकॉर्ड नहीं होती';
  const SAFETY_DESC = isLatin ? 'Sirf tab sunta hai jab aap bol rahe hain' : 'सिर्फ़ तब सुनता है जब आप बोल रहे हैं';
  const CTA_TEXT = isLatin ? 'Theek hai, Microphone kholein' : 'ठीक है, माइक्रोफ़ोन खोलें';
  const DENY_TEXT = isLatin ? 'Nahi chahiye — Main type karna chahta hoon' : 'नहीं चाहिए — मैं टाइप करना चाहता हूँ';
  const VOICE_PROMPT = isLatin ? 'This app will run on your voice. Please allow microphone access.' : 'यह App आपकी आवाज़ से चलेगा। Microphone की अनुमति दें।';
  const SUCCESS_MSG = isLatin ? 'Great! Microphone is ON.' : 'बहुत अच्छा! Microphone चालू है।';
  const ERROR_MSG = isLatin ? 'Microphone permission denied. No problem, you can use keyboard too.' : 'Microphone अनुमति नहीं दी गई। कोई बात नहीं, आप कीबोर्ड से भी कर सकते हैं।';

  const { voiceFlowState } = useSarvamVoiceFlow({
    language,
    script: VOICE_PROMPT,
    repromptScript: isLatin ? 'Open microphone or say "keyboard"' : 'Microphone खोलें या "कीबोर्ड" बोलें।',
    initialDelayMs: 800,
    pauseAfterMs: 1000,
    onIntent: (intentOrRaw) => {
      const lower = intentOrRaw.toLowerCase();

      if (lower.includes('keyboard') || lower.includes('कीबोर्ड') || lower.includes('type')) {
        onDenied();
        return;
      }

      if (lower.includes('haan') || lower.includes('yes') || lower.includes('sahi') || lower.includes('allow') || lower.includes('kholen')) {
        handleRequestPermission();
      }
    },
  });

  useEffect(() => {
    const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';

    // Check if mic is available before trying to speak
    const checkMicAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMic = devices.some(d => d.kind === 'audioinput');
        console.log('[MicPermission] Mic available:', hasMic);
        if (!hasMic) {
          console.log('[MicPermission] No mic detected, suggesting keyboard mode');
          // Auto-switch to keyboard mode after short delay
          setTimeout(() => {
            onDenied();
          }, 1500);
        }
      } catch (err) {
        console.warn('[MicPermission] Cannot check devices:', err);
      }
    };

    checkMicAvailability();

    void speakWithSarvam({
      text: VOICE_PROMPT,
      languageCode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestPermission = async () => {
    console.log('[MicPermission] handleRequestPermission called');

    // Check if mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('[MicPermission] MediaDevices API not available');
      setError(isLatin ? 'Microphone not supported on this browser' : 'Microphone इस ब्राउज़र पर समर्थित नहीं है');
      setTimeout(() => {
        console.log('[MicPermission] Calling onDenied due to unsupported API');
        onDenied();
      }, 2000);
      return;
    }

    try {
      console.log('[MicPermission] Calling getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[MicPermission] Microphone stream obtained');
      // Permission granted - stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);

      console.log('[MicPermission] Calling onGranted...');
      const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
      void speakWithSarvam({
        text: SUCCESS_MSG,
        languageCode,
        onEnd: () => {
          console.log('[MicPermission] Speech ended, calling onGranted callback');
          setTimeout(onGranted, 500);
        },
      });
    } catch (err) {
      console.error('[MicPermission] Microphone permission denied:', err);
      setError(isLatin ? 'Mic permission denied' : 'Microphone अनुमति नहीं दी गई');

      const languageCode = LANGUAGE_TO_SARVAM_CODE[language] || 'hi-IN';
      void speakWithSarvam({
        text: ERROR_MSG,
        languageCode,
      });

      console.log('[MicPermission] Calling onDenied after error');
      setTimeout(() => {
        onDenied();
      }, 2000);
    }
  };

  return (
    <main className="bg-[#FFFDF7] font-body text-[#1b1c19] selection:bg-[#ff8c00]/10 min-h-screen flex flex-col overflow-x-hidden">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-[#fbf9f3] shadow-[0px_8px_24px_rgba(144,77,0,0.08)]">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-surface-container rounded-full transition-colors"
              aria-label="वापस जाएं"
            >
              <svg className="w-6 h-6 text-[#904d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="font-serif text-2xl font-bold leading-[150%] text-[#904d00]">{brandName}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#e4e2dd] flex items-center justify-center overflow-hidden border-2 border-[#ff8c00]/20">
          <div className="w-full h-full bg-gradient-to-br from-[#ff8c00]/20 to-[#f89100]/10 flex items-center justify-center">
            <span className="text-[#904d00] font-bold text-lg">ॐ</span>
          </div>
        </div>
      </header>

      <div className="flex-grow pt-24 pb-32 px-6 flex flex-col items-center max-w-lg mx-auto w-full">
        {/* Hero Illustration */}
        <div className="relative mb-10 flex flex-col items-center">
          {/* Saffron Sound Rings (Abstract) */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-[#ff8c00]/5 scale-125"></div>
            <div className="absolute w-40 h-40 rounded-full bg-[#ff8c00]/10"></div>
          </div>

          {/* Mic Icon Container */}
          <div className="bg-[#f5f3ee] p-8 rounded-full shadow-[0px_8px_24px_rgba(144,77,0,0.15)] border-4 border-[#ff8c00]/10 mb-6">
            <svg className="w-24 h-24 text-[#ff8c00]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>

          {/* Animated Sound Waves */}
          <div className="flex items-end gap-2 h-8">
            <motion.div
              animate={{ height: [6, 20, 10, 24, 6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 bg-[#ff8c00] rounded-full"
            />
            <motion.div
              animate={{ height: [20, 10, 24, 6, 20] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="w-2 bg-[#ff8c00] rounded-full"
            />
            <motion.div
              animate={{ height: [10, 24, 6, 20, 10] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="w-2 bg-[#ff8c00] rounded-full"
            />
          </div>
        </div>

        {/* Typography Section */}
        <div className="text-center space-y-4 mb-10">
          <h2 className="font-headline text-3xl font-bold text-[#904d00] leading-tight">
            {TITLE}
          </h2>
          <p className="text-[#564334] text-lg leading-relaxed">
            {DESC}
          </p>
        </div>

        {/* Demo Flow (Bento-style row) */}
        <div className="w-full flex justify-between items-center gap-4 mb-12">
          <div className="flex-1 bg-[#f5f3ee] p-4 rounded-xl flex flex-col items-center gap-2 border-l-4 border-[#ff8c00] shadow-sm">
            <svg className="w-8 h-8 text-[#904d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-sm font-bold text-[#904d00]">{STEP1}</span>
          </div>
          <svg className="w-8 h-8 text-[#ddc1ae] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <div className="flex-1 bg-[#f5f3ee] p-4 rounded-xl flex flex-col items-center gap-2 border-l-4 border-[#ff8c00] shadow-sm">
            <svg className="w-8 h-8 text-[#904d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span className="text-sm font-bold text-[#904d00]">{STEP2}</span>
          </div>
          <svg className="w-8 h-8 text-[#ddc1ae] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <div className="flex-1 bg-[#f5f3ee] p-4 rounded-xl flex flex-col items-center gap-2 border-l-4 border-[#1b6d24] shadow-sm">
            <svg className="w-8 h-8 text-[#1b6d24]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold text-[#1b6d24]">{STEP3}</span>
          </div>
        </div>

        {/* Safety Card (Trust Green) */}
        <div className="w-full bg-[#E8F5E9] p-5 rounded-2xl flex gap-4 items-start mb-12 border border-[#1b6d24]/10">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <svg className="w-6 h-6 text-[#1b6d24]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-[#002204] text-lg">{SAFETY_TITLE}</p>
            <p className="text-[#217128] text-base opacity-90">{SAFETY_DESC}</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full space-y-6 flex flex-col items-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleRequestPermission}
            className="w-full h-14 bg-[#ff8c00] text-white font-bold text-xl rounded-xl shadow-lg shadow-[#ff8c00]/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            {CTA_TEXT}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
          <button
            type="button"
            onClick={onDenied}
            className="text-stone-500 font-medium text-lg underline underline-offset-4 hover:text-stone-700 transition-colors"
          >
            {DENY_TEXT}
          </button>
        </div>
      </div>
    </main>
  );
}
