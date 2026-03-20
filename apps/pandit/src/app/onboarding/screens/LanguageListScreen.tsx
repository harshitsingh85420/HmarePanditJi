'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { startListening, stopListening, speak } from '@/lib/voice-engine';
import { SupportedLanguage } from '@/lib/onboarding-store';

interface LanguageListScreenProps {
  language: SupportedLanguage;
  onLanguageChange?: () => void;
  onSelect: (lang: SupportedLanguage) => void;
  onBack: () => void;
}

const LANGUAGES = [
  { id: 'Hindi', native: 'हिंदी', eng: 'Hindi' },
  { id: 'Bhojpuri', native: 'भोजपुरी', eng: 'Bhojpuri' },
  { id: 'Maithili', native: 'मैथिली', eng: 'Maithili' },
  { id: 'Bengali', native: 'বাংলা', eng: 'Bengali' },
  { id: 'Tamil', native: 'தமிழ்', eng: 'Tamil' },
  { id: 'Telugu', native: 'తెలుగు', eng: 'Telugu' },
  { id: 'Kannada', native: 'ಕನ್ನಡ', eng: 'Kannada' },
  { id: 'Malayalam', native: 'മലയാളം', eng: 'Malayalam' },
  { id: 'Marathi', native: 'मराठी', eng: 'Marathi' },
  { id: 'Gujarati', native: 'ગુજરાતી', eng: 'Gujarati' },
  { id: 'Sanskrit', native: 'संस्कृत', eng: 'Sanskrit' },
  { id: 'English', native: 'English', eng: 'English' },
  { id: 'Odia', native: 'ଓଡ଼ିଆ', eng: 'Odia' }
];

export default function LanguageListScreen({ language, onSelect, onBack }: LanguageListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Optional initial prompt
    // speak("Apni bhasha chunein", "hi-IN");
    return () => stopListening();
  }, []);

  const handleMicTap = () => {
    setIsListening(true);
    startListening({
      language: 'hi-IN',
      onStateChange: (s) => {
        if (s === 'IDLE' || s === 'SUCCESS' || s === 'FAILURE') setIsListening(false);
      },
      onResult: (result) => {
        setSearchQuery(result.transcript);
        if (result.isFinal) {
          setIsListening(false);
          stopListening();
          const match = LANGUAGES.find(l => l.eng.toLowerCase() === result.transcript.toLowerCase() || l.native === result.transcript);
          if (match) setTimeout(() => onSelect(match.id as SupportedLanguage), 800);
        }
      },
      onError: () => setIsListening(false),
    });
  };

  const filteredLanguages = LANGUAGES.filter(l => 
    l.eng.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.native.includes(searchQuery)
  );

  return (
    <main className="w-full min-h-dvh max-w-[390px] mx-auto bg-vedic-cream relative flex flex-col overflow-hidden shadow-2xl">
      {/* Header Section */}
      <header className="pt-12 px-6 pb-6 relative">
        <button onClick={onBack} aria-label="Go back" className="absolute left-6 top-6 p-1 active:opacity-50 text-vedic-brown">
            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
        </button>
        <h1 className="text-[28px] font-bold text-vedic-brown leading-tight mt-6">
          अपनी भाषा चुनें
        </h1>
      </header>

      {/* Voice Search Section */}
      <section className="px-6 mb-6">
        <div onClick={handleMicTap} className="bg-primary-lt border-2 border-primary rounded-2xl p-4 flex items-center space-x-4 cursor-pointer shadow-sm active:scale-95 transition-transform">
          <div className="bg-white p-2 rounded-full shadow-sm relative w-10 h-10 flex items-center justify-center">
            {isListening && <motion.div animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-primary rounded-full"></motion.div>}
            <svg className="h-6 w-6 text-primary z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-vedic-brown font-bold text-base">{searchQuery || 'भाषा का नाम बोलें'}</span>
            <span className="text-vedic-gold text-xs">जैसे: 'Hindi', 'Tamil', 'Bengali'</span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="px-6 mb-6 text-center">
        <span className="text-vedic-gold/60 text-sm font-medium">─── या नीचे से चुनें ───</span>
      </div>

      {/* Text Search Bar */}
      <section className="px-6 mb-8">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-vedic-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-vedic-border rounded-xl py-3 pl-10 pr-4 text-vedic-brown placeholder-vedic-gold/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200" 
            placeholder="भाषा खोजें..." 
            type="text"
          />
        </div>
      </section>

      {/* Language Grid */}
      <section className="px-6 flex-1 overflow-y-auto pb-24 relative">
        <div className="grid grid-cols-2 gap-4">
          {filteredLanguages.map((lang, idx) => {
            const isSelected = language === lang.id;
            return (
              <motion.button 
                key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                onClick={() => onSelect(lang.id as SupportedLanguage)}
                className={`relative flex items-center justify-center h-[64px] rounded-[10px] font-medium transition-all ${
                  isSelected 
                  ? 'bg-primary-lt border-2 border-primary text-primary font-bold shadow-sm' 
                  : 'bg-white border border-vedic-border text-vedic-brown hover:border-primary'
                }`}
              >
                {lang.native} / {lang.eng}
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                )}
              </motion.button>
            );
          })}
          
          <button className="flex items-center justify-center h-[64px] bg-white border border-vedic-border rounded-[10px] text-primary font-semibold hover:bg-primary-lt transition-colors">
            [+ More / अधिक]
          </button>
        </div>
      </section>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 w-full px-6 py-6 border-t border-vedic-border bg-white/50 backdrop-blur-sm">
        <button 
          onClick={() => onBack()} // Should probably be onNext, but based on prompt it selects immediately on click usually, or we can use this button
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          पीछे जाएँ (Go Back)
        </button>
      </div>
    </main>
  );
}
