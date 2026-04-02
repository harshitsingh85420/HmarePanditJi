'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { SupportedLanguage } from '@/lib/onboarding-store';

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
  const [showSujatamInfo, setShowSujatamInfo] = useState(false);

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
          <span className="font-serif text-[#904d00] text-xl font-bold">
            Sujatam
          </span>
          <button
            onClick={() => setShowSujatamInfo(true)}
            className="w-6 h-6 rounded-full bg-[#ff8c00]/20 flex items-center justify-center hover:bg-[#ff8c00]/30 transition-colors"
            aria-label="Sujatam के बारे में जानें"
          >
            <svg className="w-4 h-4 text-[#ff8c00]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 11-2 0 1 1 0 012 0zm-1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
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

      {/* Sujatam Info Bottom Sheet */}
      <AnimatePresence>
        {showSujatamInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSujatamInfo(false)}
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
                Sujatam का मतलब?
              </h3>
              <p className="text-[#564334] text-lg leading-relaxed mb-4">
                <span className="font-bold text-[#ff8c00]">"सुजतम"</span> संस्कृत शब्द है जिसका अर्थ है — <span className="font-bold text-[#1b6d24]">"अच्छी खबर"</span> या <span className="font-bold text-[#1b6d24]">"शुभ समाचार"</span>
              </p>
              <p className="text-[#564334] text-lg leading-relaxed mb-6">
                यह App आपके लिए <span className="font-bold">नए ग्राहक</span>, <span className="font-bold">नई आमदनी</span>, और <span className="font-bold">नई पहचान</span> लेकर आया है।
              </p>
              <div className="flex items-center gap-3 p-4 bg-[#fff3e0] rounded-2xl border-2 border-[#ff8c00]/30 mb-6">
                <div className="w-12 h-12 bg-[#ff8c00] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">ॐ</span>
                </div>
                <div>
                  <p className="text-[#904d00] font-bold text-base">HmarePanditJi का परिवार</p>
                  <p className="text-[#564334] text-sm">पंडित जी के लिए समर्पित</p>
                </div>
              </div>
              <button
                onClick={() => setShowSujatamInfo(false)}
                className="w-full h-14 bg-gradient-to-b from-[#ff8c00] to-[#f89100] text-white font-bold text-lg rounded-xl shadow-lg"
              >
                समझ गया
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            {/* Improved India Map SVG - More recognizable outline */}
            <svg
              className="w-full h-full opacity-50"
              viewBox="0 0 200 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Gradient definition */}
              <defs>
                <linearGradient id="indiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF8C00" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F89100" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Main India outline - More geographically accurate */}
              <path
                d="M80 25C85 22 92 20 100 20C108 20 115 22 120 25C125 28 130 32 133 38C136 44 138 50 139 56C140 62 142 68 145 72C148 76 152 78 155 78C158 78 160 76 161 73C162 70 161 67 159 65C157 63 156 61 156 58C156 55 158 53 161 52C163 51 165 52 166 54C167 56 167 59 165 62C163 65 162 68 162 72C162 78 160 84 156 89C152 94 149 99 147 105C145 111 144 117 144 124C144 131 145 137 147 142C149 147 150 152 150 157C150 162 148 167 145 172C142 177 138 181 133 185C128 189 123 192 118 195C113 198 109 202 106 207C103 212 101 217 100 220C99 223 97 224 95 223C93 222 91 219 90 215C89 211 87 208 84 205C81 202 77 199 72 197C67 195 63 192 60 188C57 184 55 179 54 173C53 167 53 161 55 156C57 151 60 146 64 142C68 138 71 133 73 127C75 121 76 115 76 109C76 103 75 98 73 94C71 90 68 86 64 83C60 80 57 76 55 71C53 66 52 61 53 56C54 51 56 46 60 42C64 38 68 35 72 32C76 29 78 27 80 25Z"
                fill="url(#indiaGradient)"
                stroke="#FF8C00"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Kashmir region indication */}
              <path
                d="M88 22C93 19 98 18 103 19C108 20 112 22 115 25"
                stroke="#FF8C00"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 3"
                opacity="0.6"
              />

              {/* Northeast region indication */}
              <ellipse
                cx="162"
                cy="68"
                rx="12"
                ry="18"
                stroke="#FF8C00"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                fill="none"
                opacity="0.6"
              />

              {/* Major city markers */}
              <circle cx="98" cy="58" r="3" fill="#FF8C00" opacity="0.8" />
              <circle cx="105" cy="75" r="3" fill="#FF8C00" opacity="0.8" />
              <circle cx="95" cy="95" r="3" fill="#FF8C00" opacity="0.8" />
              <circle cx="110" cy="115" r="3" fill="#FF8C00" opacity="0.8" />
              <circle cx="102" cy="140" r="3" fill="#FF8C00" opacity="0.8" />
              <circle cx="108" cy="165" r="3" fill="#FF8C00" opacity="0.8" />
              <circle cx="100" cy="190" r="3" fill="#FF8C00" opacity="0.8" />
            </svg>

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
              <span className="text-[#564334] font-medium text-sm">🔒 आपका पूरा पता कभी नहीं दिखेगा</span>
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
            छोड़ें — हाथ से भरूँगा
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
