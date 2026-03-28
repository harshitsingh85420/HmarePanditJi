'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import { ALL_LANGUAGES, LANGUAGE_DISPLAY, type SupportedLanguage } from '@/lib/onboarding-store';
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts';
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow';

interface LanguageListScreenProps {
  language: SupportedLanguage | null;
  onSelect: (lang: SupportedLanguage) => void;
  onBack: () => void;
  onLanguageChange: () => void;
}

export default function LanguageListScreen({ language, onSelect, onBack, onLanguageChange }: LanguageListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardMode, setKeyboardMode] = useState(false);
  const isMountedRef = React.useRef(true);

  // Voice flow for language selection
  const { isListening, isSpeaking, voiceFlowState } = useSarvamVoiceFlow({
    language: language || 'Hindi',
    script: 'अपनी भाषा का नाम बोलें — जैसे हिन्दी, तमिल, बंगाली।',
    repromptScript: 'भाषा का नाम बोलें या कीबोर्ड से चुनें।',
    initialDelayMs: 800,
    pauseAfterMs: 1000,
    autoListen: !keyboardMode,
    onIntent: (intentOrRaw) => {
      if (!isMountedRef.current) return;

      const lower = intentOrRaw.toLowerCase();

      // Check for keyboard fallback
      if (lower.includes('keyboard') || lower.includes('कीबोर्ड') || lower.includes('type') || lower.includes('टाइप') || lower.includes('list')) {
        setKeyboardMode(true);
        return;
      }

      // Try to match language from speech
      const detectedLang = detectLanguageFromSpeech(lower);
      if (detectedLang) {
        void speakWithSarvam({
          text: `${LANGUAGE_DISPLAY[detectedLang].latinName} — क्या यह सही है?`,
          languageCode: 'hi-IN',
          onEnd: () => {
            if (isMountedRef.current) {
              onSelect(detectedLang);
            }
          },
        });
      }
    },
    onNoiseHigh: () => {
      setKeyboardMode(true);
    },
  });

  useEffect(() => {
    isMountedRef.current = true;
    if (!keyboardMode) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          void speakWithSarvam({
            text: 'अपनी भाषा चुनें',
            languageCode: 'hi-IN',
          });
        }
      }, 500);
      return () => {
        clearTimeout(timer);
        stopCurrentSpeech();
      };
    }
  }, [keyboardMode]);

  const detectLanguageFromSpeech = (transcript: string): SupportedLanguage | null => {
    const langMap: Record<string, SupportedLanguage> = {
      'hindi': 'Hindi',
      'हिन्दी': 'Hindi',
      'हिंदी': 'Hindi',
      'tamil': 'Tamil',
      'तमिल': 'Tamil',
      'bengali': 'Bengali',
      'बंगाली': 'Bengali',
      'বাংলা': 'Bengali',
      'telugu': 'Telugu',
      'तेलुगु': 'Telugu',
      'marathi': 'Marathi',
      'मराठी': 'Marathi',
      'gujarati': 'Gujarati',
      'ગુજરાતી': 'Gujarati',
      'kannada': 'Kannada',
      'ಕನ್ನಡ': 'Kannada',
      'malayalam': 'Malayalam',
      'മലയാളം': 'Malayalam',
      'odia': 'Odia',
      'ଓଡ଼ିଆ': 'Odia',
      'punjabi': 'Punjabi',
      'ਪੰਜਾਬੀ': 'Punjabi',
      'bhojpuri': 'Bhojpuri',
      'भोजपुरी': 'Bhojpuri',
      'maithili': 'Maithili',
      'मैथिली': 'Maithili',
      'sanskrut': 'Sanskrit',
      'संस्कृत': 'Sanskrit',
      'english': 'English',
      'अंग्रेजी': 'English',
    };

    for (const [key, lang] of Object.entries(langMap)) {
      if (transcript.includes(key)) {
        return lang;
      }
    }
    return null;
  };

  const filteredLanguages = ALL_LANGUAGES.filter(lang => {
    const info = LANGUAGE_DISPLAY[lang];
    return (
      info.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.nativeName.includes(searchQuery)
    );
  });

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base relative flex flex-col overflow-hidden shadow-2xl">
      <TopBar showBack onBack={onBack} onLanguageChange={onLanguageChange} />

      {/* Title */}
      <div className="px-4 xs:px-6 pt-4 xs:pt-5 pb-3 xs:pb-4">
        <h1 className="text-xl xs:text-2xl sm:text-[28px] font-bold text-text-primary leading-tight">
          अपनी भाषा चुनें
        </h1>
      </div>

      {/* Voice Search Box */}
      <section className="px-4 xs:px-6 mb-3 xs:mb-4">
        {!keyboardMode ? (
          <div
            className="bg-saffron-lt border-2 border-saffron rounded-2xl p-3 xs:p-4 flex items-center gap-3 xs:gap-4"
          >
            <div className="relative w-14 h-14 xs:w-16 xs:h-16 flex items-center justify-center bg-white rounded-full shadow-sm">
              {isListening && (
                <motion.div
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-saffron rounded-full"
                />
              )}
              <svg className="h-6 w-6 xs:h-7 xs:w-7 text-saffron relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <p className="text-text-primary font-bold text-lg xs:text-xl sm:text-[24px]">
                {isListening ? 'सुन रहा हूँ...' : (isSpeaking ? 'बोल रहा हूँ...' : 'भाषा का नाम बोलें')}
              </p>
              <p className="text-saffron text-base xs:text-lg sm:text-[22px] mt-1">जैसे: 'Hindi', 'Tamil', 'Bengali'</p>
            </div>
          </div>
        ) : (
          <div className="bg-saffron-lt border-2 border-saffron rounded-2xl p-3 xs:p-4 flex items-center gap-3 xs:gap-4">
            <div className="w-14 h-14 xs:w-16 xs:h-16 flex items-center justify-center bg-white rounded-full shadow-sm">
              <svg className="h-6 w-6 xs:h-7 xs:w-7 text-saffron" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <p className="text-text-primary font-bold text-lg xs:text-xl sm:text-[24px]">कीबोर्ड मोड</p>
              <p className="text-saffron text-base xs:text-lg sm:text-[22px] mt-1">नीचे से भाषा चुनें</p>
            </div>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="px-4 xs:px-6 mb-3 xs:mb-4 text-center">
        <span className="text-saffron/60 text-sm xs:text-base sm:text-lg font-medium">─── या नीचे से चुनें ───</span>
      </div>

      {/* Text Search */}
      <section className="px-4 xs:px-6 mb-3 xs:mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-2 xs:left-3 flex items-center">
            <svg className="h-5 w-5 xs:h-6 xs:w-6 text-saffron/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-outline-variant rounded-xl py-3 xs:py-4 pl-10 xs:pl-12 pr-3 xs:pr-4 text-text-primary placeholder-saffron/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-saffron transition-all text-base xs:text-lg sm:text-[22px] min-h-[52px] xs:min-h-[56px] sm:min-h-[80px]"
            placeholder="भाषा खोजें..."
            type="text"
          />
        </div>
      </section>

      {/* Language Grid */}
      <section className="px-4 xs:px-6 flex-1 overflow-y-auto pb-6 xs:pb-8">
        <div className="grid grid-cols-2 gap-2 xs:gap-3">
          {filteredLanguages.map((lang, idx) => {
            const info = LANGUAGE_DISPLAY[lang];
            const isSelected = language === lang;
            return (
              <motion.button
                key={lang}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * idx }}
                onClick={() => onSelect(lang)}
                className={`relative flex flex-col items-center justify-center min-h-[64px] xs:min-h-[72px] sm:min-h-[96px] rounded-xl px-3 xs:px-4 sm:px-5 transition-all ${isSelected
                    ? 'bg-saffron-lt border-2 border-saffron'
                    : 'bg-white border border-outline-variant hover:border-saffron'
                  }`}
              >
                {/* Emoji + Compact Display */}
                <div className="flex flex-col items-center gap-1">
                  {/* Emoji (only for unselected state) */}
                  {!isSelected && (
                    <span className="text-2xl xs:text-3xl mb-1" aria-hidden="true">
                      {info.emoji}
                    </span>
                  )}

                  {/* Short Name (2-4 chars) */}
                  <span className={`text-xl xs:text-2xl font-bold leading-tight ${isSelected ? 'text-saffron' : 'text-text-primary'
                    }`}>
                    {info.shortName}
                  </span>

                  {/* Script Character */}
                  <span className={`text-xs ${isSelected ? 'text-saffron/70' : 'text-vedic-gold'
                    }`}>
                    {info.scriptChar}
                  </span>
                </div>

                {/* Checkmark for selected state */}
                {isSelected && (
                  <div className="absolute top-1 xs:top-2 right-1 xs:right-2">
                    <svg className="h-4 w-4 xs:h-5 xs:w-5 text-saffron" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
