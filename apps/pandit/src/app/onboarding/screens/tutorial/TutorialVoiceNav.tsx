'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import SkipButton from '@/components/ui/SkipButton'
import VoiceIndicator from '@/components/ui/VoiceIndicator'
import type { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialVoiceNavProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialVoiceNav({ onNext, onSkip, onBack }: TutorialVoiceNavProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)

  const LINES = [
    'बस बोलिए — "नई पूजा बुक करें"।',
    'या "आज की कमाई दिखाओ"।',
    'सब कुछ आवाज़ से होगा।',
    'बिल्कुल आसान।',
    'आगे बोलें।',
  ]

  useEffect(() => { const timer = setTimeout(() => { playLine(0) }, 200); return () => { clearTimeout(timer); stopListening(); } }, [])
  const playLine = (index: number) => {
    if (index >= LINES.length) { startListeningForResponse(); return; }
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
      <ProgressDots total={12} current={7} />
      <div className="flex-1 px-4 xs:px-6 py-6 xs:py-8 overflow-y-auto">
        <div className="text-center mb-6 xs:mb-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl xs:text-6xl sm:text-7xl mb-4 xs:mb-6">🎤</motion.div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-vedic-brown mb-2 xs:mb-4">वॉइस नेविगेशन</h1>
          <div className="space-y-2 xs:space-y-3">{LINES.map((line, idx) => (<p key={idx} className={`text-sm xs:text-base sm:text-lg text-vedic-brown transition-opacity ${idx === currentLine ? 'opacity-100' : 'opacity-30'}`}>{line}</p>))}</div>
        </div>
        <VoiceIndicator isListening={isListening} />
        <div className="bg-saffron-lt border-2 border-saffron rounded-2xl p-4 xs:p-6 mt-6 xs:mt-8"><p className="text-base xs:text-lg font-bold text-text-primary mb-2">उदाहरण:</p><ul className="text-sm xs:text-base text-text-secondary space-y-2"><li>• "नई पूजा बुक करें"</li><li>• "आज की कमाई दिखाओ"</li><li>• "प्रोफाइल खोलें"</li></ul></div>
      </div>
      <div className="px-4 xs:px-6 pb-6 xs:pb-8 pt-4 xs:pt-6 bg-surface-base/90 backdrop-blur-sm border-t border-border-default"><button onClick={handleContinue} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold shadow-btn-saffron active:scale-[0.98]">आगे बढ़ें →</button></div>
      <SkipButton label="Skip" onClick={onSkip} />
    </main>
  )
}
