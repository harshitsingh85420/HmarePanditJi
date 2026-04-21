'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import { SupportedLanguage, ScriptPreference } from '@/lib/onboarding-store'

interface TutorialIncomeProps {
  language: SupportedLanguage
  scriptPreference: ScriptPreference | null
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialIncome({
  language,
  scriptPreference,
  onLanguageChange,
  onBack,
  onNext,
  onSkip,
}: TutorialIncomeProps) {
  const [keyboardMode, setKeyboardMode] = useState(false)
  const isLatin = scriptPreference === 'latin'

  const TITLE = isLatin ? 'Aamdani mein' : 'आमदनी में'
  const SUBTITLE = isLatin ? '3x Badhotri' : '3x बढ़ोतरी'
  const DESCRIPTION = isLatin ? 'Varanasi ke Pandit ji pehle ₹18,000 kamate the. Aaj 3 naye tarikon se ₹63,000 kama rahe hain. Hum aapko bhi yehi 3 tarike dikhayenge.' : 'वाराणसी के पंडित जी पहले ₹18,000 कमाते थे। आज 3 नए तरीकों से ₹63,000 कमा रहे हैं। हम आपको भी यही 3 तरीके दिखाएंगे।'
  const CTA_LABEL = isLatin ? 'Samajh gaya — Aage Badhein 💰' : 'समझ गया — आगे बढ़ें 💰'
  const SKIP_LABEL = isLatin ? 'Skip karein' : 'Skip करें'
  const VOICE_STATUS = isLatin ? 'Playing voice for you...' : 'आपके लिए बोल रहा हूँ...'
  const EMOJI = '💰'

  const { voiceFlowState } = useSarvamVoiceFlow({
    language: 'Hindi',
    script: isLatin ? 'Varanasi ke Pandit ji pehle atharah hazaar rupaye kamate the. Aaj ve teen naye tarikon se satasath hazaar kama rahe hain. Hum aapko bhi yehi teen tarike dikhayenge.' : 'वाराणसी के पंडित जी पहले अठारह हज़ार रुपये कमाते थे। आज वे तीन नए तरीकों से तिरसठ हज़ार कमा रहे हैं। हम आपको भी यही तीन तरीके दिखाएंगे।',
    repromptScript: isLatin ? 'Jaaniye boliye ya Skip boliye' : 'जानें बोलें या Skip बोलें',
    initialDelayMs: 200,
    pauseAfterMs: 1000,
    autoListen: !keyboardMode,
    onIntent: (intentOrRaw) => {
      const lower = intentOrRaw.toLowerCase()
      if (lower.includes('keyboard') || lower.includes('कीबोर्ड') || lower.includes('skip')) {
        setKeyboardMode(true)
        onNext()
        return
      }
      if (lower.includes('aage') || lower.includes('forward') || lower.includes('haan') || lower.includes('yes')) {
        handleContinue()
      }
    },
    onNoiseHigh: () => {
      setKeyboardMode(true)
      onNext()
    },
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({ text: isLatin ? 'Varanasi ke Pandit ji pehle atharah hazaar rupaye kamate the. Aaj ve teen naye tarikon se satasath hazaar kama rahe hain.' : 'वाराणसी के पंडित जी पहले अठारह हज़ार रुपये कमाते थे। आज वे तीन नए तरीकों से तिरसठ हज़ार कमा रहे हैं।', languageCode: 'hi-IN' })
    }, 200)
    return () => { clearTimeout(timer); stopCurrentSpeech() }
  }, [])

  const handleContinue = () => {
    stopCurrentSpeech()
    void speakWithSarvam({
      text: isLatin ? 'Bahut achha.' : 'बहुत अच्छा।',
      languageCode: 'hi-IN',
      onEnd: () => setTimeout(onNext, 600),
    })
  }

  const handleSkip = () => {
    stopCurrentSpeech()
    onSkip()
  }

  return (
    <div className="min-h-screen w-full max-w-[390px] xs:max-w-[430px] mx-auto flex flex-col bg-[#fbf9f3] selection:bg-[#ff8c00]/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff8c00]/5 to-transparent opacity-5" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
          <span className="text-9xl">{EMOJI}</span>
        </div>
      </div>

      {/* Top Bar */}
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} language={language} scriptPreference={scriptPreference} />

      {/* Progress Dots */}
      <ProgressDots total={12} current={2} />

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center px-6 xs:px-8 pt-6 pb-32 max-w-2xl mx-auto w-full">
        {/* Voice Playing Indicator */}
        <motion.div className="flex flex-col items-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="flex items-end justify-center space-x-1.5 h-12 mb-3">
            {[8, 12, 6, 10, 4].map((height, i) => (
              <motion.div key={i} className="w-1 bg-[#ff8c00] rounded-full" animate={{ height: [height, height * 2, height] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }} />
            ))}
          </div>
          <p className="text-[#ff8c00] font-medium text-sm tracking-wide">{VOICE_STATUS}</p>
        </motion.div>

        {/* Content Card */}
        <motion.div className="w-full bg-white rounded-3xl p-6 xs:p-8 shadow-[0px_8px_24px_rgba(144,77,0,0.08)] mb-8 border-l-4 border-[#ff8c00]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <h1 className="font-headline text-2xl xs:text-3xl font-bold text-[#904d00] mb-3 leading-relaxed">
            {TITLE} {SUBTITLE && <span className="text-[#ff8c00]">{SUBTITLE}</span>}
          </h1>
          <p className="text-[#1b1c19] text-base xs:text-lg leading-[180%] font-medium">{DESCRIPTION}</p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div className="w-full space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <button onClick={handleContinue} className="w-full h-16 bg-gradient-to-b from-[#ff8c00] to-[#f89100] text-white rounded-xl font-bold text-xl shadow-lg flex items-center justify-center hover:scale-[0.98] transition-transform active:scale-95">
            {CTA_LABEL}
          </button>
          <button onClick={handleSkip} className="w-full h-16 border-2 border-[#ddc1ae] text-[#564334] rounded-xl font-bold text-xl hover:bg-[#f5f3ee] transition-colors active:scale-95">
            {SKIP_LABEL}
          </button>
        </motion.div>
      </main>

      {/* Decorative Corner */}
      <div className="fixed top-0 right-0 p-4 opacity-10 pointer-events-none z-0">
        <span className="text-6xl text-[#ff8c00]">🕉️</span>
      </div>
    </div>
  )
}
