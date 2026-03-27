'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import SkipButton from '@/components/ui/SkipButton'
import VoiceIndicator from '@/components/ui/VoiceIndicator'
import type { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialOnlineRevenueProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialOnlineRevenue({ onNext, onSkip, onBack }: TutorialOnlineRevenueProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showCards, setShowCards] = useState(false)

  const LINES = [
    'दो बिल्कुल नए तरीके हैं — जो आप शायद अभी तक नहीं जानते।',
    'पहला — घर बैठे पूजा। Video call से पूजा कराइए। दुनिया भर के ग्राहक मिलेंगे — NRI भी।',
    'एक पूजा में दो हज़ार से पाँच हज़ार रुपये।',
    'दूसरा — पंडित से बात। Phone, video, या chat पर धार्मिक सलाह दीजिए।',
    'बीस रुपये से पचास रुपये प्रति मिनट।',
    'उदाहरण के तौर पर — बीस मिनट की एक call में आठ सौ रुपये सीधे आपको।',
    'दोनों मिलाकर — चालीस हज़ार रुपये अलग से हर महीने।',
    'आगे बोलें।',
  ]

  useEffect(() => { const timer = setTimeout(() => { playLine(0) }, 200); return () => { clearTimeout(timer); stopListening(); } }, [])

  const playLine = (index: number) => {
    if (index >= LINES.length) { setShowCards(true); startListeningForResponse(); return; }
    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => { setTimeout(() => playLine(index + 1), 150) })
  }

  const startListeningForResponse = () => {
    setIsListening(true)
    startListening({ language: 'hi-IN', onResult: (result) => {
      const intent = detectIntent(result.transcript)
      if (intent === 'FORWARD' || intent === 'SKIP') handleContinue()
      else if (intent === 'BACK') playLine(0)
    }, onError: () => {} })
  }

  const handleContinue = () => { stopListening(); setIsListening(false); speak('बहुत अच्छा।', 'hi-IN', () => setTimeout(onNext, 600)) }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-vedic-cream flex flex-col">
      <TopBar showBack onBack={onBack} onLanguageChange={onBack} />
      <ProgressDots total={12} current={4} />
      <div className="flex-1 px-4 xs:px-6 py-6 xs:py-8 overflow-y-auto">
        <div className="text-center mb-6 xs:mb-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl xs:text-6xl sm:text-7xl mb-4 xs:mb-6">💻</motion.div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-vedic-brown mb-2 xs:mb-4">ऑनलाइन कमाई</h1>
          <div className="space-y-2 xs:space-y-3">{LINES.map((line, idx) => (<p key={idx} className={`text-sm xs:text-base sm:text-lg text-vedic-brown transition-opacity ${idx === currentLine ? 'opacity-100' : 'opacity-30'}`}>{line}</p>))}</div>
        </div>
        {showCards && (<VoiceIndicator isListening={isListening} />)}
        {showCards && (<div className="grid grid-cols-1 gap-3 xs:gap-4 mt-6 xs:mt-8"><div className="bg-saffron-lt border-2 border-saffron rounded-2xl p-4 xs:p-6"><p className="text-3xl xs:text-4xl mb-2">📹</p><p className="text-base xs:text-lg font-bold">घर बैठे पूजा</p><p className="text-sm xs:text-base text-text-secondary mt-1">Video call से — ₹2000-5000</p></div><div className="bg-saffron-lt border-2 border-saffron rounded-2xl p-4 xs:p-6"><p className="text-3xl xs:text-4xl mb-2">📞</p><p className="text-base xs:text-lg font-bold">पंडित से बात</p><p className="text-sm xs:text-base text-text-secondary mt-1">₹20-50/मिनट — 20 min = ₹800</p></div></div>)}
      </div>
      <div className="px-4 xs:px-6 pb-6 xs:pb-8 pt-4 xs:pt-6 bg-surface-base/90 backdrop-blur-sm border-t border-border-default"><button onClick={handleContinue} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold shadow-btn-saffron active:scale-[0.98]">आगे बढ़ें →</button></div>
      <SkipButton label="Skip" onClick={onSkip} />
    </main>
  )
}
