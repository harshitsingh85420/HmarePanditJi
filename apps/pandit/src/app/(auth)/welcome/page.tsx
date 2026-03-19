'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WelcomeVoiceIntro() {
  const router = useRouter()
  const [isSpeaking, setIsSpeaking] = useState(true)

  // Decorative voice animation array
  const voiceHeights = [8, 12, 6, 10, 4]

  return (
    <main className="flex-grow flex flex-col items-center px-8 pt-8 pb-32 w-full justify-center">
      
      {/* Voice Playing Indicator */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-end justify-center space-x-1.5 h-12 mb-4">
          {voiceHeights.map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h * 2}px`, `${h * 4}px`, `${h * 2}px`] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: "easeInOut" }}
              className="w-1.5 bg-saffron rounded-full"
            />
          ))}
        </div>
        <p className="text-saffron font-medium text-lg tracking-wide animate-pulse">
          Aapke liye bol raha hoon...
        </p>
      </div>

      {/* Transcript Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-white rounded-3xl p-8 shadow-card mb-10 border-l-4 border-saffron"
      >
        <h1 className="font-serif text-2xl font-bold text-saffron mb-6 leading-relaxed">
          नमस्ते पंडित जी।
        </h1>
        <p className="text-text-primary text-xl leading-[180%] font-medium">
          HmarePanditJi में आपका स्वागत है। यह App पूरी तरह आपकी आवाज़ से चलेगा। आपको कोई button नहीं दबाना — बस मेरे सवालों के जवाब दीजिए।
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full space-y-5"
      >
        <button 
          onClick={() => router.push('/permissions/mic')}
          className="w-full h-16 bg-gradient-to-b from-saffron to-saffron-dark text-white rounded-xl font-bold text-xl shadow-btn-saffron flex items-center justify-center hover:scale-[0.98] transition-transform active:scale-95"
        >
          समझ गया — शुरू करें 🪔
        </button>
        
        <button 
          onClick={() => router.push('/permissions/mic')}
          className="w-full h-16 border-2 border-border-default text-text-secondary rounded-xl font-bold text-xl hover:bg-surface-muted transition-colors active:scale-95"
        >
          Skip करें
        </button>
      </motion.div>

    </main>
  )
}
