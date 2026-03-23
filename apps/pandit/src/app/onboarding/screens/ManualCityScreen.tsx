'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { startListening, stopListening, speak, stopSpeaking } from '@/lib/voice-engine';

interface ManualCityScreenProps {
  language?: string;
  onLanguageChange?: () => void;
  onCitySelected: (city: string) => void;
  onBack: () => void;
}

const POPULAR_CITIES_ROW1 = ['दिल्ली', 'वाराणसी', 'पटना', 'लखनऊ'];
const POPULAR_CITIES_ROW2 = ['मुंबई', 'जयपुर', 'कोलकाता', 'हरिद्वार'];

// Hindi → English city name mapping (as per prompt specification)
const HINDI_TO_ENGLISH_CITIES: Record<string, string> = {
  'दिल्ली': 'Delhi',
  'वाराणसी': 'Varanasi',
  'पटना': 'Patna',
  'लखनऊ': 'Lucknow',
  'मुंबई': 'Mumbai',
  'जयपुर': 'Jaipur',
  'कोलकाता': 'Kolkata',
  'हरिद्वार': 'Haridwar',
  'उज्जैन': 'Ujjain',
  'चेन्नई': 'Chennai',
  'हैदराबाद': 'Hyderabad',
  'बेंगलुरु': 'Bengaluru',
  'पुणे': 'Pune',
  'अहमदाबाद': 'Ahmedabad',
  'भोपाल': 'Bhopal',
  'इंदौर': 'Indore',
};

export default function ManualCityScreen({ onCitySelected, onBack, onLanguageChange }: ManualCityScreenProps) {
  const [cityInput, setCityInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Kripya apna shehar bolein ya neeche diye gaye shahron mein se chunein.", "hi-IN");
    }, 600);
    return () => {
      clearTimeout(timer);
      stopListening();
      stopSpeaking();
    };
  }, []);

  const handleMicTap = () => {
    setVoiceError('');
    setIsListening(true);
    setCityInput('');

    const cleanup = startListening({
      language: 'hi-IN',
      onStateChange: (s) => {
        if (s === 'IDLE' || s === 'SUCCESS' || s === 'FAILURE') {
          setIsListening(false);
        }
      },
      onResult: (result) => {
        setCityInput(result.transcript);
        setIsListening(false);
        if (result.isFinal && result.transcript.length > 1) {
          setTimeout(() => onCitySelected(result.transcript), 800);
        }
      },
      onError: (err) => {
        setIsListening(false);
        if (err === 'NOT_SUPPORTED') setVoiceError('आवाज़ इस ब्राउज़र में काम नहीं करती। नीचे से शहर चुनें।');
        else if (err === 'TIMEOUT') setVoiceError('समय समाप्त। फिर कोशिश करें।');
        else if (err !== 'MIC_OFF_WHILE_SPEAKING') setVoiceError('आवाज़ नहीं सुनाई दी। फिर कोशिश करें।');
      },
    });
    return cleanup;
  };

  return (
    <main className="relative mx-auto min-h-dvh max-w-[390px] flex flex-col overflow-hidden bg-vedic-cream shadow-xl w-full">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} aria-label="Go back" className="min-h-[52px] min-w-[52px] p-1 active:opacity-50 text-vedic-brown">
            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>
          <div className="flex items-center gap-1 font-bold text-lg text-vedic-brown">
            <span className="text-primary">ॐ</span>
            <span>HmarePanditJi</span>
          </div>
        </div>
        <button onClick={onLanguageChange} aria-label="Language" className="min-h-[52px] min-w-[52px] p-1 text-2xl active:opacity-50">🌐</button>
      </header>

      {/* Content Area */}
      <section className="flex-grow px-6 pt-4 flex flex-col gap-6">

        {/* Reassurance and Title */}
        <div className="text-center space-y-1">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[22px] text-vedic-gold font-medium">
            कोई बात नहीं।
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[32px] font-bold leading-tight text-vedic-brown">
            अपना शहर बताइए
          </motion.h1>
        </div>

        {/* Voice Input Box */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={handleMicTap}
          className="relative bg-primary-lt border-2 border-primary rounded-[16px] p-5 flex items-center gap-4 cursor-pointer overflow-hidden shadow-sm active:scale-95 transition-transform"
        >
          <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
            {isListening && (
              <>
                {/* UI-004 FIX: More visible pulse animation for bright sunlight */}
                <motion.div
                  animate={{ scale: [0.8, 1.8], opacity: [1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-primary border-4 border-primary/50 rounded-full"
                />
                <motion.div
                  animate={{ scale: [0.8, 1.8], opacity: [1, 0.3] }}
                  transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
                  className="absolute inset-0 bg-primary border-4 border-primary/50 rounded-full"
                />
              </>
            )}
            <div className="relative bg-primary rounded-full p-2.5 z-10">
              <svg fill="none" height="24" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[20px] font-bold text-vedic-brown truncate">
              {isListening ? 'सुन रहा हूँ...' : (cityInput || 'अपना शहर बोलें')}
            </span>
            <span className="text-[16px] text-vedic-gold">जैसे: &apos;वाराणसी&apos; या &apos;दिल्ली&apos;</span>
          </div>
        </motion.div>

        {/* Voice error */}
        {voiceError && (
          <p className="text-error text-sm text-center -mt-2">{voiceError}</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 text-sm font-medium text-vedic-gold/60">
          <div className="h-[1px] flex-grow bg-vedic-border"></div>
          <span>या नीचे से चुनें</span>
          <div className="h-[1px] flex-grow bg-vedic-border"></div>
        </div>

        {/* Text Search Bar */}
        <div className="relative bg-white border border-vedic-border rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
          <svg fill="none" height="20" stroke="#9B7B52" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="text-[18px] text-vedic-brown bg-transparent outline-none w-full placeholder-vedic-gold/60"
            placeholder="अपना शहर लिखें..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && cityInput.trim().length > 1) {
                // Convert Hindi city name to English using mapping
                const englishCity = HINDI_TO_ENGLISH_CITIES[cityInput.trim()] || cityInput.trim();
                onCitySelected(englishCity);
              }
            }}
          />
          {cityInput.trim().length > 1 && (
            <button
              onClick={() => {
                // Convert Hindi city name to English using mapping
                const englishCity = HINDI_TO_ENGLISH_CITIES[cityInput.trim()] || cityInput.trim();
                onCitySelected(englishCity);
              }}
              className="bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-lg active:scale-95 shrink-0"
            >
              ठीक है
            </button>
          )}
        </div>

        {/* Popular Cities */}
        <div className="space-y-3">
          <h2 className="text-[16px] font-semibold text-vedic-brown-2">लोकप्रिय शहर</h2>

          {[POPULAR_CITIES_ROW1, POPULAR_CITIES_ROW2].map((row, rIdx) => (
            <div key={rIdx} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {row.map((city, cIdx) => (
                <motion.button
                  key={cIdx}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * (rIdx * 4 + cIdx) }}
                  onClick={() => {
                    // Convert Hindi city name to English using mapping
                    const englishCity = HINDI_TO_ENGLISH_CITIES[city] || city;
                    onCitySelected(englishCity);
                  }}
                  className="whitespace-nowrap px-5 py-2 min-h-[52px] bg-white border-2 border-primary text-primary rounded-full font-semibold text-sm active:bg-primary-lt shrink-0"
                >
                  {city}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Voice Status Footer */}
      <footer className="mt-auto px-6 pb-8 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isListening && (
            <>
              <div className="flex items-end gap-1 h-6">
                <div className="w-1.5 bg-primary rounded-full animate-voice-bar"></div>
                <div className="w-1.5 bg-primary rounded-full animate-voice-bar-2 h-full"></div>
                <div className="w-1.5 bg-primary rounded-full animate-voice-bar-3"></div>
              </div>
              <span className="text-primary font-medium">सुन रहा हूँ...</span>
            </>
          )}
        </div>

        {/* BUG-020 FIX: Added onClick handler to toggle keyboard input */}
        {/* BUG-021 FIX: Added min-h-[52px] min-w-[52px] for elderly accessibility */}
        <button
          aria-label="Toggle keyboard"
          onClick={() => inputRef.current?.focus()}
          className="min-h-[52px] min-w-[52px] p-3 bg-white rounded-full shadow-md border border-vedic-border active:scale-95 transition-transform"
        >
          <svg fill="none" height="24" stroke="#2D1B00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
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
