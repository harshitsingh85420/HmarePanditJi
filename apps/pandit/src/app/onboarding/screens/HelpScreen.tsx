'use client';

import React from 'react';

interface HelpScreenProps {
  language?: string;
  onLanguageChange?: () => void;
  onBack: () => void;
}

export default function HelpScreen({ onBack }: HelpScreenProps) {
  return (
    <main className="w-full min-h-dvh max-w-[390px] mx-auto bg-vedic-cream text-vedic-brown font-hind flex flex-col items-center p-6 shadow-2xl relative">
      {/* Header Section */}
      <header className="w-full flex justify-between items-center mb-8 pt-4">
        <button onClick={onBack} aria-label="Go back" className="p-2 active:opacity-50">
          <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-vedic-brown">सहायता</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <div className="w-full flex flex-col items-center text-center space-y-6 flex-grow">
        {/* Illustration */}
        <div className="w-48 h-48 flex items-center justify-center bg-primary-lt rounded-full mb-2">
          <span className="text-7xl">🙏</span>
        </div>

        {/* Reassuring Headline & Subtext */}
        <div className="space-y-2">
          <h2 className="text-[32px] font-bold leading-tight text-vedic-brown">
            कोई बात नहीं।
          </h2>
          <p className="text-xl font-medium opacity-80">
            हम मदद के लिए यहाँ हैं।
          </p>
          <p className="text-sm italic opacity-60 mt-1">
            "You are not alone"
          </p>
        </div>

        {/* Help Cards Section */}
        <section className="w-full space-y-4 pt-4">
          {/* Phone Call Card */}
          <a
            className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-primary-lt active:scale-95 transition-transform"
            href="tel:+916355000000"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-lt">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-lg font-semibold text-vedic-brown">हमारी Team से बात करें</span>
            </div>
            <div className="text-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
          </a>

          {/* WhatsApp Card */}
          <a
            className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-success-lt active:scale-95 transition-transform"
            href="https://wa.me/916355000000"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-success-lt">
                <svg className="h-8 w-8 text-success" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                </svg>
              </div>
              <span className="text-lg font-semibold text-vedic-brown">WhatsApp पर लिखें</span>
            </div>
            <div className="text-success">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
          </a>
        </section>

        {/* Availability Note */}
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-vedic-gold">
            सहायता उपलब्ध: <span className="font-bold text-vedic-brown">सुबह 8 बजे – रात 10 बजे</span>
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="w-full text-center pb-8 pt-4">
        <button onClick={onBack} className="inline-block text-primary font-semibold border-b-2 border-primary-lt pb-0.5 hover:border-primary transition-colors">
          वापस जाएं / खुद करें
        </button>
      </footer>
    </main>
  );
}
