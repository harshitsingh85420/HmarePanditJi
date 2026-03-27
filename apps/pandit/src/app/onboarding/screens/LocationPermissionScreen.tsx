'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { speak, stopSpeaking } from '@/lib/voice-engine';

interface LocationPermissionScreenProps {
  language: string;
  onLanguageChange: () => void;
  onGranted: (city: string, state: string) => void;
  onDenied: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function LocationPermissionScreen({
  language: _language,
  onLanguageChange,
  onGranted,
  onDenied,
  onBack,
  showBack = true
}: LocationPermissionScreenProps) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        speak("Namaste Pandit Ji. Main aapka shehar jaanna chahta hoon...", 'hi-IN');
      }
    }, 500);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

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
    <main className="relative mx-auto min-h-dvh w-full max-w-[390px] xs:max-w-[430px] flex flex-col bg-surface-base">
      {/* TopBar Component Reference */}
      <div className="min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] px-4 xs:px-6 flex items-center justify-between border-b border-outline-variant sticky top-0 bg-surface-base z-50">
        <div className="flex items-center gap-2">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Go back"
            >
              <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {!showBack && (
            <button
              onClick={() => { }}
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 flex items-center justify-center text-saffron rounded-full active:bg-black/5 focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Exit"
            >
              <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <span className="text-2xl xs:text-3xl sm:text-[32px] text-saffron">ॐ</span>
          <h1 className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">HmarePanditJi</h1>
        </div>
        {/* ACC-009 FIX: Larger language switcher with text label */}
        <button
          onClick={onLanguageChange}
          className="min-h-[52px] xs:min-h-[56px] sm:min-h-[64px] px-4 xs:px-6 flex items-center gap-2 text-sm xs:text-base sm:text-[20px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card"
          aria-label="Language switcher"
        >
          <span>हिन्दी / English</span>
        </button>
      </div>

      {/* Illustration Area */}
      <section className="mt-2 xs:mt-4 px-4 flex justify-center">
        <div className="w-full max-w-[358px] h-32 xs:h-36 sm:h-[160px] relative flex flex-col items-center justify-center bg-transparent">
          {/* Background Circle */}
          <div className="absolute w-28 h-28 xs:w-32 xs:h-32 sm:w-[140px] sm:h-[140px] bg-saffron-lt rounded-full"></div>
          {/* Minimal India Map SVG path mock */}
          <svg className="relative z-10 w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5L60 15L75 20L85 35L80 55L65 75L50 95L35 75L20 55L15 35L25 20L40 15L50 5Z" fill="#FAF0E6" stroke="#F0E6D3" strokeWidth="1"></path>
          </svg>

          {/* Animated Pin and Rings */}
          <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
            {/* Pulse Rings */}
            <div className="absolute top-6 xs:top-7 sm:top-8 left-1/2 -translate-x-1/2">
              <motion.div animate={{ scale: [0.8, 1.5], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }} className="absolute w-10 h-12 xs:w-11 xs:h-[50px] sm:w-12 sm:h-[52px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-saffron"></motion.div>
            </div>

            <motion.svg initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="w-10 h-12 xs:w-11 xs:h-[50px] sm:w-12 sm:h-[52px] text-saffron" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
            </motion.svg>
          </div>
        </div>
      </section>

      {/* Title Section */}
      <section className="mt-2 xs:mt-4 px-4">
        <h2 className="text-xl xs:text-2xl sm:text-[26px] font-bold text-text-primary leading-tight">
          आपका शहर जानना क्यों ज़रूरी है?
        </h2>
      </section>

      {/* Content Body */}
      <section className="px-4 flex-grow">
        <hr className="my-4 xs:my-6 border-outline-variant" />
        {/* Benefit Rows */}
        <div className="space-y-4 xs:space-y-6">
          {[{ title: 'आपकी भाषा खुद सेट हो जाएगी', desc: 'टाइपिंग की ज़रूरत नहीं' },
          { title: 'आपके शहर की पूजाएं मिलेंगी', desc: 'दूर-दराज़ की नहीं' },
          { title: 'ग्राहक आपको ढूंढ पाएंगे', desc: 'नए ग्राहक, नई आमदनी' }].map((item, idx) => (
            <motion.div key={idx} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 * (idx + 1) }} className="flex items-start gap-3 xs:gap-4">
              <div className="flex-shrink-0 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-saffron flex items-center justify-center mt-1">
                <span className="text-white text-base xs:text-lg sm:text-[20px]">✓</span>
              </div>
              <div>
                <h3 className="text-base xs:text-lg sm:text-[20px] font-bold text-text-primary">{item.title}</h3>
                <p className="text-sm xs:text-base sm:text-[18px] font-semibold text-text-secondary">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Privacy Card */}
        <div className="mt-6 xs:mt-8 p-3 xs:p-4 bg-success-lt rounded-xl flex items-center gap-2 xs:gap-3">
          <span className="text-xl xs:text-2xl sm:text-[24px]">🔒</span>
          <p className="text-sm xs:text-base sm:text-[18px] font-bold text-success leading-snug">
            आपका पूरा पता कभी नहीं दिखेगा किसी को भी
          </p>
        </div>
      </section>

      {/* Footer Buttons */}
      <footer className="p-4 xs:p-6 space-y-3 xs:space-y-4 mb-4 xs:mb-6">
        {/* UX-009 FIX: Error banner with aria-live for screen readers */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="w-full bg-error-red-bg border-2 border-error-red rounded-xl p-3 xs:p-4 flex items-center gap-2 xs:gap-3"
          >
            <span className="text-xl xs:text-2xl sm:text-[24px]">⚠️</span>
            <p className="text-sm xs:text-base sm:text-[18px] font-bold text-error-red">{error}</p>
          </div>
        )}

        <button
          onClick={handleAllowClick}
          disabled={loading}
          className="w-full bg-saffron text-white py-3 xs:py-4 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] rounded-2xl text-lg xs:text-xl sm:text-[22px] font-bold active:scale-[0.98] transition-transform shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 xs:h-6 xs:w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              लोकेशन जांची जा रही है...
            </span>
          ) : (
            '✅ हाँ, मेरा शहर जानें'
          )}
        </button>
        <button
          onClick={onDenied}
          className="w-full text-saffron text-base xs:text-lg sm:text-[20px] font-bold text-center block active:opacity-75 py-3 xs:py-4 min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] focus:ring-2 focus:ring-primary focus:outline-none rounded-2xl"
        >
          छोड़ें — हाथ से भरूँगा
        </button>
      </footer>
    </main>
  );
}
