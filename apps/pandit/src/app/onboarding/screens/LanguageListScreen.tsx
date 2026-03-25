'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { speak, startListening, stopListening, stopSpeaking, detectLanguageName } from '@/lib/voice-engine';
import { ALL_LANGUAGES, LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store';
import TopBar from '@/components/TopBar';

interface LanguageListScreenProps {
  language: SupportedLanguage;
  onLanguageChange: () => void;
  onSelect: (language: SupportedLanguage) => void;
  onBack: () => void;
}

export default function LanguageListScreen({ language, onLanguageChange, onSelect, onBack }: LanguageListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const voiceFailCountRef = useRef(0);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // Voice on mount: 400ms delay
    const t = setTimeout(() => {
      speak(
        "Kripya apni bhasha ka naam boliye. Jaise — 'Bhojpuri', 'Tamil', 'Telugu', 'Bengali' — ya neeche se chunein.",
        'hi-IN',
        () => {
          // STT starts 300ms after TTS ends
          setTimeout(() => startVoiceSearch(), 300);
        }
      );
    }, 400);

    return () => {
      clearTimeout(t);
      cleanupRef.current?.();
      stopListening();
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startVoiceSearch = () => {
    setIsListening(true);
    cleanupRef.current = startListening({
      language: 'hi-IN',
      onResult: (result) => {
        if (!result.isFinal) return;
        setIsListening(false);
        stopListening();

        const detectedLang = detectLanguageName(result.transcript);
        if (detectedLang) {
          speak(`${detectedLang}? Sahi hai?`, 'hi-IN', () => {
            onSelect(detectedLang as SupportedLanguage);
          });
        } else {
          voiceFailCountRef.current += 1;
          if (voiceFailCountRef.current >= 2) {
            speak('Aawaz nahi pehchaan paya. Neeche se bhasha chhookar chunein.', 'hi-IN');
          } else {
            // Retry once
            setTimeout(() => startVoiceSearch(), 500);
          }
        }
      },
      onError: () => setIsListening(false),
      onStateChange: (s) => {
        if (s === 'IDLE' || s === 'FAILURE') setIsListening(false);
      },
    });
  };

  const handleMicTap = () => {
    if (isListening) return;
    voiceFailCountRef.current = 0;
    startVoiceSearch();
  };

  const filteredLanguages = ALL_LANGUAGES.filter(lang => {
    const info = LANGUAGE_DISPLAY[lang];
    return (
      info.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.nativeName.includes(searchQuery)
    );
  });

  return (
    <main className="w-full min-h-dvh max-w-[390px] mx-auto bg-surface-base relative flex flex-col overflow-hidden shadow-2xl">
      <TopBar showBack onBack={onBack} onLanguageChange={onLanguageChange} />

      {/* Title */}
      <div className="px-6 pt-5 pb-4">
        <h1 className="text-[28px] font-bold text-text-primary leading-tight">
          अपनी भाषा चुनें
        </h1>
      </div>

      {/* Voice Search Box */}
      <section className="px-6 mb-4">
        <div
          onClick={handleMicTap}
          className="bg-saffron-lt border-2 border-saffron rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="relative w-[64px] h-[64px] flex items-center justify-center bg-white rounded-full shadow-sm">
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-saffron rounded-full"
              />
            )}
            <svg className="h-7 w-7 text-saffron relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <p className="text-text-primary font-bold text-[24px]">
              {isListening ? 'सुन रहा हूँ...' : (searchQuery || 'भाषा का नाम बोलें')}
            </p>
            <p className="text-saffron text-[22px] mt-1">जैसे: &apos;Hindi&apos;, &apos;Tamil&apos;, &apos;Bengali&apos;</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="px-6 mb-4 text-center">
        <span className="text-saffron/60 text-lg font-medium">─── या नीचे से चुनें ───</span>
      </div>

      {/* Text Search */}
      <section className="px-6 mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <svg className="h-6 w-6 text-saffron/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-outline-variant rounded-xl py-4 pl-12 pr-4 text-text-primary placeholder-saffron/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-saffron transition-all text-[22px] min-h-[80px]"
            placeholder="भाषा खोजें..."
            type="text"
          />
        </div>
      </section>

      {/* Language Grid */}
      <section className="px-6 flex-1 overflow-y-auto pb-8">
        <div className="grid grid-cols-2 gap-3">
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
                className={`relative flex flex-col items-center justify-center min-h-[96px] rounded-xl px-5 transition-all ${isSelected
                  ? 'bg-saffron-lt border-2 border-saffron'
                  : 'bg-white border border-outline-variant hover:border-saffron'
                  }`}
              >
                <span className={`text-[26px] font-bold leading-tight ${isSelected ? 'text-saffron' : 'text-text-primary'}`}>
                  {info.nativeName}
                </span>
                <span className="text-[22px] text-saffron leading-tight mt-1">{info.latinName}</span>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <svg className="h-5 w-5 text-saffron" fill="currentColor" viewBox="0 0 20 20">
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
