'use client';

import React from 'react';

export default function HelpScreen() {
  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base text-text-primary font-hind flex flex-col shadow-2xl">
      {/* Header */}
      <header className="pt-6 xs:pt-8 pb-4 px-6 bg-gradient-to-b from-saffron-lt to-transparent border-b border-border-default">
        <div className="mt-6 xs:mt-8 mb-4 xs:mb-6 w-28 h-28 xs:w-32 xs:h-32 sm:w-[140px] sm:h-[140px] flex items-center justify-center bg-saffron-lt rounded-full mx-auto">
          <span className="text-5xl xs:text-6xl sm:text-7xl">🙏</span>
        </div>
        <h2 className="text-2xl xs:text-3xl sm:text-[32px] font-bold leading-tight text-text-primary text-center">
          कैसे मदद करें?
        </h2>
        <p className="text-base xs:text-lg sm:text-[20px] text-saffron font-medium mt-1 xs:mt-2 text-center">
          हमारी Team तैयार है
        </p>
      </header>

      {/* Content */}
      <div className="flex-grow px-4 xs:px-6 py-4 xs:py-6">
        <div className="w-full h-0.5 xs:h-[2px] bg-surface-dim my-4 xs:my-6" />

        {/* Call Team */}
        <a
          href="tel:18004654357"
          className="flex items-center gap-3 xs:gap-4 bg-saffron rounded-card shadow-cta px-4 xs:px-5 py-0 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] active:scale-[0.98] transition-transform mb-4"
        >
          <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-[56px] sm:h-[56px] flex items-center justify-center shrink-0">
            <span className="text-2xl xs:text-3xl sm:text-4xl">📞</span>
          </div>
          <div>
            <p className="text-base xs:text-lg sm:text-[20px] font-bold text-white">हमारी Team से बात करें</p>
            <p className="text-sm xs:text-base sm:text-[16px] text-white/85 mt-0.5">1800-HMJ-HELP | बिल्कुल Free</p>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/911234567890"
          className="flex items-center gap-3 xs:gap-4 rounded-card px-4 xs:px-5 py-0 min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] active:scale-[0.98] transition-transform bg-[#25D366] mb-4"
        >
          <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-[56px] sm:h-[56px] flex items-center justify-center shrink-0">
            <span className="text-2xl xs:text-3xl sm:text-4xl">💬</span>
          </div>
          <div>
            <p className="text-base xs:text-lg sm:text-[18px] font-bold text-white">WhatsApp पर लिखें</p>
            <p className="text-sm xs:text-base sm:text-[16px] text-white/90 mt-0.5">Message भेजें, जवाब आएगा</p>
          </div>
        </a>

        <div className="flex items-center gap-3 xs:gap-4 my-4 xs:my-6">
          <div className="flex-1 h-0.5 xs:h-[2px] bg-surface-dim" />
          <span className="text-sm xs:text-base sm:text-[18px] text-saffron font-medium">─── या ───</span>
          <div className="flex-1 h-0.5 xs:h-[2px] bg-surface-dim" />
        </div>

        {/* Self Help */}
        <button className="text-base xs:text-lg sm:text-[18px] font-semibold border-b-2 border-saffron-lt pb-0.5 hover:border-saffron transition-colors w-full text-left py-2">
          खुद से मदद — FAQ देखें
        </button>

        <p className="text-sm xs:text-base sm:text-[16px] text-saffron mt-4 xs:mt-6">
          ⏱️ जवाब का समय: सुबह 8 बजे – रात 10 बजे (सभी दिन)
        </p>
      </div>
    </main>
  );
}
