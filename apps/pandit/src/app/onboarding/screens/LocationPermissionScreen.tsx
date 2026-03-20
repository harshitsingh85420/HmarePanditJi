'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { speak, stopSpeaking } from '@/lib/voice-engine';
import TopBar from '@/components/TopBar';

interface LocationPermissionScreenProps {
  language: string;
  onLanguageChange: () => void;
  onGranted: (city: string, state: string) => void;
  onDenied: () => void;
}

export default function LocationPermissionScreen({
  language,
  onLanguageChange,
  onGranted,
  onDenied
}: LocationPermissionScreenProps) {

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 500ms delay to speak the prompt
    const timer = setTimeout(() => {
      speak("Namaste Pandit Ji. Main aapka shehar jaanna chahta hoon...", 'hi-IN');
    }, 500);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  const handleAllowClick = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
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
          onDenied();
        }
      },
      (error) => {
        console.warn("Location denied:", error);
        onDenied();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <main className="relative mx-auto min-h-dvh w-full flex flex-col bg-vedic-cream">
      {/* TopBar Component Reference */}
      <div className="h-[56px] px-4 flex items-center justify-between border-b border-vedic-border sticky top-0 bg-vedic-cream z-50">
        <div className="flex items-center gap-2">
          <span className="text-[20px] text-primary">ॐ</span>
          <h1 className="text-[18px] font-semibold text-vedic-brown">HmarePanditJi</h1>
        </div>
        <button onClick={onLanguageChange} className="text-[24px] text-vedic-gold">
          🌐
        </button>
      </div>

      {/* IllustrationArea */}
      <section className="mt-4 px-4 flex justify-center">
        <div className="w-[358px] h-[160px] relative flex flex-col items-center justify-center bg-transparent">
          {/* Background Circle */}
          <div className="absolute w-[140px] h-[140px] bg-primary-lt rounded-full"></div>
          {/* Minimal India Map SVG path mock */}
          <svg className="relative z-10 w-32 h-32" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5L60 15L75 20L85 35L80 55L65 75L50 95L35 75L20 55L15 35L25 20L40 15L50 5Z" fill="#FAF0E6" stroke="#F0E6D3" strokeWidth="1"></path>
          </svg>
          
          {/* Animated Pin and Rings */}
          <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
            {/* Pulse Rings */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
              <motion.div animate={{ scale: [0.8, 1.5], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }} className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary"></motion.div>
            </div>
            
            <motion.svg initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
            </motion.svg>
          </div>
        </div>
      </section>

      {/* TitleSection */}
      <section className="mt-4 px-4">
        <h2 className="text-[26px] font-bold text-vedic-brown leading-tight">
          आपका शहर जानना क्यों ज़रूरी है?
        </h2>
      </section>

      {/* ContentBody */}
      <section className="px-4 flex-grow">
        <hr className="my-6 border-vedic-border"/>
        {/* Benefit Rows */}
        <div className="space-y-6">
          {[{ title: 'आपकी भाषा खुद सेट हो जाएगी', desc: 'टाइपिंग की ज़रूरत नहीं' }, 
            { title: 'आपके शहर की पूजाएं मिलेंगी', desc: 'दूर-दराज़ की नहीं' }, 
            { title: 'ग्राहक आपको ढूंढ पाएंगे', desc: 'नए ग्राहक, नई आमदनी' }].map((item, idx) => (
            <motion.div key={idx} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 * (idx + 1) }} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-vedic-brown">{item.title}</h3>
                <p className="text-[16px] font-normal text-vedic-gold">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Privacy Card */}
        <div className="mt-8 p-4 bg-success-lt rounded-xl flex items-center gap-3">
          <span className="text-[20px]">🔒</span>
          <p className="text-[16px] font-semibold text-success leading-snug">
            आपका पूरा पता कभी नहीं दिखेगा किसी को भी
          </p>
        </div>
      </section>

      {/* FooterButtons */}
      <footer className="p-4 space-y-4 mb-4">
        <button 
          onClick={handleAllowClick} 
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl text-[18px] font-bold active:scale-[0.98] transition-transform shadow-md"
        >
          {loading ? 'लोकेशन जांची जा रही है...' : '✅ हाँ, मेरा शहर जानें'}
        </button>
        <button onClick={onDenied} className="w-full text-vedic-gold text-[16px] font-medium text-center block active:opacity-75">
          छोड़ें — हाथ से भरूँगा
        </button>
      </footer>
    </main>
  );
}
