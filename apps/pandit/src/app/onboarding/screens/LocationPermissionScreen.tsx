'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { SupportedLanguage } from '@/lib/onboarding-store';
import IndiaMapSVG from '@/components/IndiaMapSVG';

interface LocationPermissionScreenProps {
  language: SupportedLanguage;
  onLanguageChange: () => void;
  onGranted: (city: string, state: string) => void;
  onDenied: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function LocationPermissionScreen({
  language,
  onLanguageChange,
  onGranted,
  onDenied,
  onBack,
  showBack = true
}: LocationPermissionScreenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleAllowClick = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setTimeout(() => onDenied(), 2000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          if (!res.ok) throw new Error('Reverse geocode failed');

          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || 'Unknown';
          const stateStr = data.address.state || 'Unknown';

          onGranted(city, stateStr);
        } catch (e) {
          console.error(e);
          setError('शहर पहचानने में समस्या हुई। कृपया हाथ से चुनें।');
          setTimeout(() => onDenied(), 2000);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Location denied:', error);
        setError('लोकेशन अनुमति नहीं दी गई। कृपया हाथ से चुनें।');
        setTimeout(() => onDenied(), 2000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(true);
  };

  const handleExitCancel = () => {
    setShowExitConfirm(false);
  };

  const handleExitProceed = () => {
    setShowExitConfirm(false);
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  return (
    <main className="font-body min-h-screen flex flex-col bg-[#fbf9f3]">
      {/* Header */}
      <motion.header
        className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-[#fbf9f3]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-10 h-10 bg-[#ff8c00] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">ॐ</span>
          </div>
          <span className="font-serif text-[#904d00] text-xl font-bold">
            HmarePanditJi
          </span>
        </motion.div>
        <motion.button
          onClick={handleExitConfirm}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ delay: 0.3 }}
          className="h-10 w-10 rounded-full bg-[#eae8e2] flex items-center justify-center hover:bg-[#e4e2dd] transition-colors"
          aria-label="वापस जाएं"
        >
          <svg className="w-6 h-6 text-[#904d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>
      </motion.header>

      {/* Exit Confirmation Bottom Sheet */}
      <AnimatePresence>
        {showExitConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleExitCancel}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 max-w-lg mx-auto"
            >
              <div className="w-12 h-1.5 bg-[#e4e2dd] rounded-full mx-auto mb-6" />
              <h3 className="font-headline text-2xl font-bold text-[#1b1c19] mb-3">
                वापस जाएंगे?
              </h3>
              <p className="text-[#564334] text-lg leading-relaxed mb-6">
                आपका progress save नहीं होगा। क्या आप सुनिश्चित हैं?
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleExitProceed}
                  className="w-full h-14 bg-[#ba1a1a] text-white font-bold text-lg rounded-xl"
                >
                  हाँ, वापस जाना है
                </button>
                <button
                  onClick={handleExitCancel}
                  className="w-full h-14 bg-[#f5f3ee] text-[#564334] font-bold text-lg rounded-xl border-2 border-[#e4e2dd]"
                >
                  नहीं, यहीं रहूँगा
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col px-8 pb-10 max-w-lg mx-auto w-full">
        {/* Map Illustration */}
        <motion.div
          className="relative w-full aspect-square max-h-[280px] flex items-center justify-center mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {/* Background Glow */}
          <motion.div
            className="absolute w-56 h-56 bg-[#ff8c00]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative w-4/5 h-4/5">
            {/* Highly Accurate India Map SVG */}
            <IndiaMapSVG className="w-full h-full opacity-60 text-[#FF8C00] drop-shadow-md" />

            {/* Pulsing Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="absolute w-20 h-20 border-2 border-[#ff8c00] rounded-full -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute w-20 h-20 border-2 border-[#ff8c00] rounded-full -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
              />

              {/* Pin Icon */}
              <motion.div
                className="relative z-10"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-14 h-14 text-[#ff8c00] drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="space-y-6 flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center space-y-4">
            <motion.h1
              className="font-headline text-2xl font-bold text-[#1b1c19] leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              आपका शहर जानना क्यों ज़रूरी है?
            </motion.h1>

            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f3ee] rounded-full border border-[#ddc1ae]/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <svg className="w-5 h-5 text-[#564334]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[#564334] font-medium text-sm">आपका पूरा पता कभी नहीं दिखेगा</span>
            </motion.div>
          </div>

          {/* Benefits */}
          <div className="space-y-4 pt-2">
            {[
              { main: 'आपकी भाषा खुद सेट हो जाएगी', sub: 'टाइपिंग की ज़रूरत नहीं' },
              { main: 'आपके शहर की पूजाएं मिलेंगी', sub: 'दूर-दराज़ की नहीं' },
              { main: 'ग्राहक आपको ढूंढ पाएंगे', sub: 'नए ग्राहक, नई आमदनी' }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + (index * 0.15) }}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#ffdcc3] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#904d00]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[17px] font-medium text-[#1b1c19] leading-snug pt-0.5">{item.main}</p>
                  <p className="text-[14px] text-[#564334] mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="mt-auto pt-8 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {/* Error Banner */}
          {error && (
            <div className="w-full bg-[#ffdad6] border-2 border-[#ba1a1a] rounded-xl p-4 flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-[#ba1a1a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-[#ba1a1a] font-bold text-base">{error}</p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAllowClick}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-b from-[#ff8c00] to-[#f89100] text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                लोकेशन जांची जा रही है...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                हाँ, मेरा शहर जानें
              </>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onDenied()}
            disabled={loading}
            className="w-full py-4 text-[#564334] font-medium hover:bg-[#f5f3ee] rounded-lg transition-colors disabled:opacity-50"
          >
            बाद में
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
