'use client';

import React, { useEffect } from 'react';
import { speak, stopSpeaking } from '@/lib/voice-engine';
import { SupportedLanguage } from '@/lib/onboarding-store';
import TopBar from '@/components/TopBar';

interface HelpScreenProps {
  language: SupportedLanguage;
  onLanguageChange: () => void;
  onBack: () => void;
}

export default function HelpScreen({ onLanguageChange, onBack }: HelpScreenProps) {
  useEffect(() => {
    const t = setTimeout(() => {
      speak(
        'Koi baat nahi. Hum madad ke liye yahan hain. Humari team se baat karein — bilkul muft. Ya neeche Wapas jaayein dabayein agar khud karna ho.',
        'hi-IN'
      );
    }, 400);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
  }, []);

  return (
    <main className="w-full min-h-dvh max-w-[390px] mx-auto bg-surface-base text-text-baserimary font-hind flex flex-col shadow-2xl">
      {/* TopBar — showBack=false per spec */}
      <TopBar showBack={false} onLanguageChange={onLanguageChange} />

      <div className="flex flex-col items-center text-center px-6 flex-1">
        {/* Illustration — two figures facing each other, 140px circle */}
        <div className="mt-8 mb-6 w-[140px] h-[140px] flex items-center justify-center bg-saffron-lt rounded-full">
          <span className="text-lgxl">🧑‍⚖️</span>
          <span className="text-lgxl">📱</span>
        </div>

        {/* Headlines */}
        <h2 className="text-[32px] font-bold leading-tight text-text-baserimary">
          कोई बात नहीं।
        </h2>
        <p className="text-[20px] text-saffron font-medium mt-2">
          हम मदद के लिए यहाँ हैं।
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-vedic-border my-6" />

        {/* Help Cards */}
        <section className="w-full space-y-3">
          {/* Phone Card */}
          <a
            href="tel:+911800123456"
            className="flex items-center gap-4 bg-saffron rounded-card shadow-cta px-5 py-0 min-h-[72px] active:scale-[0.98] transition-transform"
          >
            <div className="w-[56px] h-[56px] flex items-center justify-center shrink-0">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[20px] font-bold text-white">हमारी Team से बात करें</p>
              <p className="text-[15px] text-white/85">1800-HMJ-HELP | बिल्कुल Free</p>
            </div>
          </a>

          {/* WhatsApp Card */}
          <a
            href="https://wa.me/919876543210"
            className="flex items-center gap-4 rounded-card px-5 py-0 min-h-[64px] active:scale-[0.98] transition-transform"
            style={{ backgroundColor: '#25D366' }}
          >
            <div className="w-[56px] h-[56px] flex items-center justify-center shrink-0">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[18px] font-bold text-white">WhatsApp पर लिखें</p>
              <p className="text-[14px] text-white/90">Message भेजें, जवाब आएगा</p>
            </div>
          </a>
        </section>

        {/* "या" Divider */}
        <div className="flex items-center gap-3 my-5 w-full">
          <div className="flex-1 h-px bg-vedic-border" />
          <span className="text-[15px] text-saffron font-medium">─── या ───</span>
          <div className="flex-1 h-px bg-vedic-border" />
        </div>

        {/* Back link */}
        <button
          onClick={onBack}
          className="text-saffron font-semibold border-b-2 border-saffron-lt pb-0.5 hover:border-saffron transition-colors text-[16px]"
        >
          वापस जाएं / खुद करें
        </button>
      </div>

      {/* Footer hours note */}
      <footer className="text-center pb-8 pt-4">
        <p className="text-[14px] text-saffron">
          सुबह 8 बजे – रात 10 बजे
        </p>
      </footer>
    </main>
  );
}
