'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { HINDI_TO_ENGLISH_CITIES } from '@/lib/cities';

interface ManualCityScreenProps {
  onCitySelected: (city: string) => void;
  onBack: () => void;
  onLanguageChange?: () => void;
}

const POPULAR_CITIES_ROW1 = ['वाराणसी', 'दिल्ली', 'मुंबई', 'कोलकाता'];
const POPULAR_CITIES_ROW2 = ['चेन्नई', 'बेंगलुरु', 'हैदराबाद', 'पटना'];

export default function ManualCityScreen({ onCitySelected, onBack, onLanguageChange }: ManualCityScreenProps) {
  const [cityInput, setCityInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMicTap = () => {
    setVoiceError('');
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const cities = Object.keys(HINDI_TO_ENGLISH_CITIES);
      const random = cities[Math.floor(Math.random() * cities.length)];
      setCityInput(random);
    }, 2000);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[390px] xs:max-w-[430px] flex flex-col overflow-hidden bg-surface-base shadow-xl">
      {/* Top Bar with Prominent Om Symbol */}
      <header className="flex flex-col items-center pt-4 xs:pt-6 pb-2 px-4">
        {/* Large Om Symbol - Trust Signal for Vedic App */}
        <div className="mb-2">
          <span className="text-6xl xs:text-7xl sm:text-[80px] font-bold font-body text-saffron animate-gentle-float" aria-label="पवित्र ओम प्रतीक">
            ॐ
          </span>
        </div>
        <div className="flex items-center gap-2 font-bold font-body text-xl xs:text-2xl sm:text-[28px] text-text-primary">
          <span className="text-3xl xs:text-4xl sm:text-[40px] text-saffron">ॐ</span>
          <span>HmarePanditJi</span>
        </div>
      </header>

      {/* Back and Language Row */}
      <div className="flex items-center justify-between px-4 xs:px-6 py-2 xs:py-3">
        {/* Back button with haptic feedback and larger touch target */}
        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            onBack();
          }}
          aria-label="पीछे जाएं"
          className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] min-w-[52px] xs:min-w-[56px] sm:min-w-[72px] p-1 xs:p-2 active:opacity-50 text-text-primary focus:ring-4 focus:ring-saffron focus:outline-none rounded-full hover:bg-surface-muted"
        >
          <svg fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="32">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        {/* Language switcher with text label - ACC-009 FIX: Larger touch target */}
        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            onLanguageChange?.();
          }}
          aria-label="भाषा बदलें / Change Language"
          className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center gap-2 xs:gap-3 text-lg xs:text-xl sm:text-[24px] font-bold font-body text-text-primary active:opacity-50 focus:ring-4 focus:ring-saffron focus:outline-none border-3 border-border-default rounded-2xl bg-surface-card hover:bg-surface-muted transition-colors shadow-card"
        >
          <span>हिन्दी</span>
          <span className="text-lg xs:text-xl sm:text-[24px] text-text-secondary">/</span>
          <span>English</span>
        </button>
      </div>

      {/* Content Area */}
      <section className="flex-grow px-4 xs:px-6 pt-3 xs:pt-4 flex flex-col gap-4 xs:gap-6">

        {/* Reassurance and Title */}
        <div className="text-center space-y-1 xs:space-y-2">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl xs:text-2xl sm:text-[28px] font-body text-saffron font-bold">
            कोई बात नहीं।
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl xs:text-4xl sm:text-[40px] font-body font-bold leading-tight text-text-primary">
            अपना शहर बताइए
          </motion.h1>
        </div>

        {/* Voice Input Box - Haptic feedback */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
            handleMicTap();
          }}
          className="relative bg-saffron-lt border-3 border-saffron rounded-2xl p-4 xs:p-6 flex items-center gap-3 xs:gap-5 cursor-pointer overflow-hidden shadow-card active:scale-95 transition-transform min-h-[52px] xs:min-h-[56px] sm:min-h-[120px]"
        >
          <div className="relative flex items-center justify-center w-16 h-16 xs:w-[68px] sm:w-20 sm:h-20 shrink-0">
            {isListening && (
              <>
                <motion.div
                  animate={{ scale: [0.8, 1.8], opacity: [1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-saffron border-4 border-saffron/50 rounded-full"
                />
                <motion.div
                  animate={{ scale: [0.8, 1.8], opacity: [1, 0.3] }}
                  transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
                  className="absolute inset-0 bg-saffron border-4 border-saffron/50 rounded-full"
                />
              </>
            )}
            <div className="relative bg-saffron rounded-full p-3 xs:p-4 z-10">
              <svg fill="none" height="32" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="32">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xl xs:text-2xl sm:text-[30px] font-body font-bold text-text-primary truncate">
              {isListening ? 'सुन रहा हूँ...' : (cityInput || 'अपना शहर बोलें')}
            </span>
            <span className="text-base xs:text-lg sm:text-[24px] font-body text-saffron font-medium">जैसे: 'वाराणसी' या 'दिल्ली'</span>
          </div>
        </motion.div>

        {/* Voice error */}
        {voiceError && (
          <p className="text-error text-lg xs:text-xl sm:text-[26px] font-body text-center font-bold -mt-1 xs:-mt-2">{voiceError}</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 xs:gap-4 text-base xs:text-lg sm:text-[24px] font-body font-bold text-saffron/60">
          <div className="h-0.5 xs:h-[3px] flex-grow bg-surface-dim"></div>
          <span>या नीचे से चुनें</span>
          <div className="h-0.5 xs:h-[3px] flex-grow bg-surface-dim"></div>
        </div>

        {/* Text Search Bar */}
        <div className="relative bg-surface-card border-3 border-border-default rounded-2xl px-4 xs:px-6 py-4 xs:py-5 flex items-center gap-3 xs:gap-4 shadow-card min-h-[52px] xs:min-h-[56px] sm:min-h-[96px]">
          <svg fill="none" height="32" stroke="#FF8C00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="32">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="text-xl xs:text-2xl sm:text-[30px] font-body text-text-primary bg-transparent outline-none w-full placeholder-text-placeholder font-bold"
            placeholder="अपना शहर लिखें..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && cityInput.trim().length > 1) {
                const englishCity = HINDI_TO_ENGLISH_CITIES[cityInput.trim()] || cityInput.trim();
                onCitySelected(englishCity);
              }
            }}
          />
          {cityInput.trim().length > 1 && (
            <button
              onClick={() => {
                const englishCity = HINDI_TO_ENGLISH_CITIES[cityInput.trim()] || cityInput.trim();
                onCitySelected(englishCity);
              }}
              className="bg-saffron text-white text-lg xs:text-xl sm:text-[26px] font-body font-bold px-6 xs:px-8 py-3 xs:py-5 min-h-[52px] xs:min-h-[56px] sm:min-h-[80px] rounded-2xl active:scale-95 shrink-0 focus:ring-4 focus:ring-saffron focus:outline-none shadow-btn-saffron"
            >
              ठीक है
            </button>
          )}
        </div>

        {/* Popular Cities */}
        <div className="space-y-3 xs:space-y-4">
          <h2 className="text-xl xs:text-2xl sm:text-[28px] font-body font-bold text-text-secondary">लोकप्रिय शहर</h2>

          {[POPULAR_CITIES_ROW1, POPULAR_CITIES_ROW2].map((row, rIdx) => (
            <div key={rIdx} className="flex gap-3 xs:gap-4 overflow-x-auto no-scrollbar pb-2">
              {row.map((city, cIdx) => (
                <motion.button
                  key={cIdx}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * (rIdx * 4 + cIdx) }}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    const englishCity = HINDI_TO_ENGLISH_CITIES[city] || city;
                    onCitySelected(englishCity);
                  }}
                  className="whitespace-nowrap px-8 xs:px-10 py-4 xs:py-5 min-h-[52px] xs:min-h-[56px] sm:min-h-[88px] bg-surface-card border-3 border-saffron text-text-primary rounded-2xl font-body font-bold text-xl xs:text-2xl sm:text-[28px] active:bg-saffron-light shrink-0 focus:ring-4 focus:ring-saffron focus:outline-none hover:border-saffron/60 shadow-card"
                >
                  {city}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Voice Status Footer */}
      <footer className="mt-auto px-4 xs:px-6 pb-6 xs:pb-8 pt-3 xs:pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 xs:gap-3">
          {isListening && (
            <>
              <div className="flex items-end gap-1 xs:gap-2 h-6 xs:h-8">
                <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar"></div>
                <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar-2 h-full"></div>
                <div className="w-2 xs:w-3 bg-saffron rounded-full animate-voice-bar-3"></div>
              </div>
              <span className="text-lg xs:text-xl sm:text-[26px] font-body text-text-primary font-bold">सुन रहा हूँ...</span>
            </>
          )}
        </div>

        {/* Keyboard toggle button with larger touch target */}
        <button
          aria-label="Toggle keyboard"
          onClick={() => inputRef.current?.focus()}
          className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] min-w-[52px] xs:min-w-[56px] sm:min-w-[72px] p-3 xs:p-4 bg-surface-card rounded-2xl shadow-card border-3 border-border-default active:scale-95 transition-transform focus:ring-4 focus:ring-saffron focus:outline-none"
        >
          <svg fill="none" height="32" stroke="#FF8C00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="32">
            <rect height="16" rx="2" width="20" x="2" y="4"></rect>
            <path d="M6 8h.01"></path><path d="M10 8h.01"></path><path d="M14 8h.01"></path><path d="M18 8h.01"></path>
            <path d="M8 12h.01"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path>
            <path d="M7 16h10"></path>
          </svg>
        </button>
      </footer>
    </main>
  );
}
