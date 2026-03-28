'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';
import type { SupportedLanguage } from '@/lib/onboarding-store';

interface LocationPermissionScreenProps {
  language: SupportedLanguage;
  onLanguageChange: () => void;
  onGranted: (city: string, state: string) => void;
  onDenied: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function LocationPermissionScreen({
  language,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLanguageChange,
  onGranted,
  onDenied,
  onBack,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showBack = true
}: LocationPermissionScreenProps) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const isMountedRef = React.useRef(true);

  // Voice flow for location permission screen
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { voiceFlowState } = useSarvamVoiceFlow({
    language,
    script: 'नमस्ते पंडित जी। मैं आपका शहर जानना चाहता हूँ। लोकेशन अनुमति दें या हाथ से चुनें।',
    repromptScript: 'लोकेशन अनुमति दें या "कीबोर्ड" बोलें।',
    initialDelayMs: 800,
    pauseAfterMs: 1000,
    autoListen: !keyboardMode,
    onIntent: (intentOrRaw) => {
      if (!isMountedRef.current) return;

      const lower = intentOrRaw.toLowerCase();

      // Check for keyboard fallback request
      if (lower.includes('keyboard') || lower.includes('कीबोर्ड') || lower.includes('type') || lower.includes('टाइप')) {
        setKeyboardMode(true);
        return;
      }

      // Check for yes/allow
      if (lower.includes('haan') || lower.includes('ha') || lower.includes('yes') || lower.includes('sahi') || lower.includes('allow') || lower.includes('deen')) {
        handleAllowClick();
      }
      // Check for no/deny
      else if (lower.includes('nahi') || lower.includes('no') || lower.includes('nahin') || lower.includes('mat') || lower.includes('chhoden')) {
        onDenied();
      }
    },
    onNoiseHigh: () => {
      setKeyboardMode(true);
    },
  });

  useEffect(() => {
    isMountedRef.current = true;
    const timer = setTimeout(() => {
      if (isMountedRef.current && !keyboardMode) {
        void speakWithSarvam({
          text: 'नमस्ते पंडित जी। मैं आपका शहर जानना चाहता हूँ।',
          languageCode: 'hi-IN',
        });
      }
    }, 500);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      stopCurrentSpeech();
    };
  }, [keyboardMode]);

  const handleAllowClick = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      onDenied();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          if (!res.ok) throw new Error("Reverse geocode failed");

          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
          const stateStr = data.address.state || 'Unknown State';

          onGranted(city, stateStr);
        } catch (e) {
          console.error(e);
          setError('शहर पहचानने में समस्या हुई। कृपया हाथ से चुनें।');
          setTimeout(() => {
            onDenied();
          }, 2000);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn("Location denied:", error);
        setError('लोकेशन अनुमति नहीं दी गई। कृपया हाथ से चुनें।');
        setTimeout(() => {
          onDenied();
        }, 2000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <main className="font-body min-h-screen flex flex-col bg-[#fbf9f3]">
      {/* Top Navigation Placeholder */}
      <header className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-[#fbf9f3]">
        <div className="font-serif text-[#904d00] text-xl font-bold">Sujatam</div>
        <button
          onClick={onBack}
          className="h-8 w-8 rounded-full bg-[#eae8e2] flex items-center justify-center hover:bg-[#e4e2dd] transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-[#904d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col px-8 pb-10 max-w-lg mx-auto w-full">
        {/* Hero Illustration Section */}
        <div className="relative w-full aspect-square max-h-[300px] flex items-center justify-center mb-10 overflow-hidden">
          {/* Decorative Background Glow */}
          <div className="absolute w-64 h-64 bg-[#ff8c00]/10 rounded-full blur-3xl"></div>

          <div className="relative w-full h-full flex items-center justify-center">
            {/* India Map Outline Placeholder */}
            <div className="relative w-4/5 h-4/5">
              <img
                className="w-full h-full object-contain opacity-40 grayscale sepia brightness-110"
                alt="Minimalist flat map of India with saffron highlights"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/India_location_map.svg/570px-India_location_map.svg.png"
              />

              {/* Pulsing Saffron Signal Circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ scale: [0.8, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute w-24 h-24 border-2 border-[#ff8c00] rounded-full"
                />
                <motion.div
                  animate={{ scale: [0.8, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                  className="absolute w-24 h-24 border-2 border-[#ff8c00] rounded-full"
                />

                {/* Saffron Pin */}
                <div className="relative z-10 flex flex-col items-center">
                  <svg className="w-16 h-16 text-[#ff8c00] drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div className="w-8 h-2 bg-[#1b1c19]/10 rounded-full blur-[2px] mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="font-headline text-3xl font-bold text-[#1b1c19] leading-tight mb-4">
              आपका शहर जानना क्यों ज़रूरी है?
            </h1>

            {/* Privacy Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f3ee] rounded-full border border-[#ddc1ae]/20 shadow-sm">
              <svg className="w-5 h-5 text-[#564334]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[#564334] font-medium text-sm">आपका पूरा पता कभी नहीं दिखेगा</span>
            </div>
          </div>

          {/* Benefit Rows */}
          <div className="space-y-6 pt-2">
            {/* Row 1 */}
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffdcc3] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#904d00] font-bold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[18px] font-medium text-[#1b1c19] leading-snug pt-1">
                आपकी भाषा खुद सेट हो जाएगी
              </p>
            </div>

            {/* Row 2 */}
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffdcc3] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#904d00] font-bold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[18px] font-medium text-[#1b1c19] leading-snug pt-1">
                आपके शहर की पूजाएं मिलेंगी
              </p>
            </div>

            {/* Row 3 */}
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffdcc3] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#904d00] font-bold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[18px] font-medium text-[#1b1c19] leading-snug pt-1">
                ग्राहक आपको ढूंढ पाएंगे
              </p>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-auto pt-12 flex flex-col gap-4">
          {/* Error Banner */}
          {error && (
            <div className="w-full bg-[#ffdad6] border-2 border-[#ba1a1a] rounded-xl p-4 flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-[#ba1a1a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-[#ba1a1a] font-bold text-base">{error}</p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAllowClick}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-b from-[#ff8c00] to-[#f89100] text-white font-bold text-lg rounded-xl shadow-[0px_8px_24px_rgba(144,77,0,0.15)] active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                लोकेशन जांची जा रही है...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                हाँ, मेरा शहर जानें
              </>
            )}
          </motion.button>

          <button
            onClick={() => setKeyboardMode(true)}
            className="w-full py-4 text-[#564334] font-medium text-base hover:bg-[#f5f3ee] rounded-lg transition-colors"
          >
            छोड़ें — हाथ से भरूँगा
          </button>
        </div>
      </div>

      {/* Decorative Corner Element (Asymmetry) */}
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-[#904d00]/20 to-transparent rounded-full blur-2xl"></div>
      </div>
    </main>
  );
}
