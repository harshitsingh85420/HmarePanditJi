'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { speakWithSarvam } from '@/lib/sarvam-tts';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    void speakWithSarvam({
      text: 'स्वागत है पंडित जी। आइए आपका परिचय करवाते हैं।',
      languageCode: 'hi-IN',
    });
  }, []);

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-surface-base flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base/90 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl xs:text-3xl sm:text-[32px] text-saffron">ॐ</span>
          <h1 className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">HmarePanditJi</h1>
        </div>
        <button
          onClick={() => {}}
          className="min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] px-4 xs:px-6 flex items-center gap-2 text-sm xs:text-base sm:text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"
        >
          हिन्दी / English
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow px-4 xs:px-6 py-6 xs:py-8 overflow-y-auto">
        {/* Illustration */}
        <div className="w-full max-w-[320px] h-40 xs:h-44 sm:h-[200px] relative flex items-center justify-center mx-auto mb-6 xs:mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-6xl xs:text-7xl sm:text-[80px] mb-2 xs:mb-4"
          >
            🙏
          </motion.div>
        </div>

        {/* Title */}
        <h2 className="text-xl xs:text-2xl sm:text-[28px] font-bold text-text-primary leading-tight font-devanagari text-center mb-1 xs:mb-2">
          नमस्ते पंडित जी!
        </h2>
        <p className="text-base xs:text-lg sm:text-[20px] text-text-secondary mt-1 xs:mt-2 font-devanagari text-center">
          आपका हार्दिक स्वागत है
        </p>

        {/* Feature Cards */}
        <div className="space-y-4 xs:space-y-6 mt-6 xs:mt-8">
          {/* Card 1 */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-border-default rounded-2xl p-4 xs:p-5 flex items-start gap-3 xs:gap-4 shadow-card"
          >
            <span className="text-3xl xs:text-4xl sm:text-[40px]">✨</span>
            <div>
              <p className="text-base xs:text-lg sm:text-[18px] font-bold text-text-primary font-devanagari leading-snug">
                नए ग्राहक, नई आमदनी
              </p>
              <p className="text-sm xs:text-base sm:text-[16px] text-text-secondary mt-1 xs:mt-2 font-devanagari">
                आपके क्षेत्र के ग्राहक आपको सीधे संपर्क करेंगे
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-saffron-lt border-2 border-saffron rounded-2xl p-4 xs:p-5 flex items-start gap-3 xs:gap-4 shadow-card"
          >
            <span className="text-3xl xs:text-4xl sm:text-[40px]">🕉️</span>
            <div>
              <p className="text-sm xs:text-base sm:text-[16px] font-bold text-text-secondary font-devanagari">
                हमारा वादा
              </p>
              <p className="text-base xs:text-lg sm:text-[20px] font-bold text-saffron mt-1 xs:mt-2 font-devanagari leading-snug">
                App पंडित के लिए है, पंडित App के लिए नहीं
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Text */}
        <p className="text-sm xs:text-base sm:text-[16px] text-text-secondary font-devanagari mt-6 xs:mt-8 text-center ml-1 xs:ml-2">
          आगे बढ़ने के लिए नीचे बटन दबाएं
        </p>
      </div>

      {/* Footer Buttons */}
      <footer className="px-4 xs:px-6 pb-6 xs:pb-8 pt-3 xs:pt-4 bg-surface-base/90 backdrop-blur-sm border-t border-border-default">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/location-permission')}
          className="w-full bg-saffron text-white py-3 xs:py-4 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] rounded-2xl text-lg xs:text-xl sm:text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none"
        >
          आगे बढ़ें →
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/tutorial')}
          className="w-full bg-surface-card text-text-primary py-3 xs:py-4 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] rounded-2xl text-base xs:text-lg sm:text-[20px] font-bold border-2 border-border-default active:scale-[0.98] transition-transform focus:ring-2 focus:ring-saffron focus:outline-none mt-3 xs:mt-4"
        >
          जानें — कैसे काम करता है
        </motion.button>
      </footer>
    </main>
  );
}
