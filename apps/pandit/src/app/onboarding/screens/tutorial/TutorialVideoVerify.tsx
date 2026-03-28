'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import SkipButton from '@/components/ui/SkipButton'
import VoiceIndicator from '@/components/ui/VoiceIndicator'
import type { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialVideoVerifyProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialVideoVerify({ onNext, onSkip, onBack }: TutorialVideoVerifyProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [showCards, setShowCards] = useState(false)
  const [keyboardMode, setKeyboardMode] = useState(false)
  const isMountedRef = useState(true)[0]

  const LINES = ['हर पंडित जी का वीडियो सत्यापन।', 'भरोसेमंद और प्रमाणित।', 'ग्राहक देखें — आपकी योग्यता।', 'विश्वास बढ़ेगा — बुकिंग बढ़ेगी।', 'आगे बोलें।']

  const { isListening, isSpeaking, voiceFlowState } = useSarvamVoiceFlow({
    language: 'Hindi',
    script: currentLine < LINES.length ? LINES[currentLine] : 'आगे बोलें या Skip बोलें',
    repromptScript: 'आगे बोलें या Skip बोलें',
    initialDelayMs: 200,
    pauseAfterMs: 800,
    autoListen: currentLine >= LINES.length && !keyboardMode,
    onIntent: (intentOrRaw) => {
      if (!isMountedRef) return;
      const lower = intentOrRaw.toLowerCase();
      if (lower.includes('keyboard') || lower.includes('कीबोर्ड') || lower.includes('skip')) { setKeyboardMode(true); handleContinue(); return; }
      if (lower.includes('aage') || lower.includes('forward') || lower.includes('haan') || lower.includes('yes')) { handleContinue(); }
      else if (lower.includes('peeche') || lower.includes('back')) { playLine(0); }
    },
    onNoiseHigh: () => { setKeyboardMode(true); handleContinue(); },
  });

  useEffect(() => { const timer = setTimeout(() => { playLine(0) }, 200); return () => { clearTimeout(timer); stopCurrentSpeech(); } }, [])
  const playLine = (index: number) => { if (index >= LINES.length) { setShowCards(true); return; } setCurrentLine(index); void speakWithSarvam({ text: LINES[index], languageCode: 'hi-IN', onEnd: () => { setTimeout(() => playLine(index + 1), 300) } }) }
  const handleContinue = () => { stopCurrentSpeech(); void speakWithSarvam({ text: 'बहुत अच्छा।', languageCode: 'hi-IN', onEnd: () => setTimeout(onNext, 600) }) }

  return (
    <main className="w-full min-h-dvh max-w-[390px] xs:max-w-[430px] mx-auto bg-vedic-cream flex flex-col">
      <TopBar showBack onBack={onBack} onLanguageChange={onBack} />
      <ProgressDots total={12} current={10} />
      <div className="flex-1 px-4 xs:px-6 py-6 xs:py-8 overflow-y-auto">
        <div className="text-center mb-6 xs:mb-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl xs:text-6xl sm:text-7xl mb-4 xs:mb-6">🎥</motion.div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-vedic-brown mb-2 xs:mb-4">वीडियो सत्यापन</h1>
          <div className="space-y-2 xs:space-y-3">{LINES.map((line, idx) => (<p key={idx} className={`text-sm xs:text-base sm:text-lg text-vedic-brown transition-opacity ${idx === currentLine ? 'opacity-100 font-semibold' : 'opacity-30'}`}>{line}</p>))}</div>
        </div>
        <VoiceIndicator isListening={isListening} />
        {showCards && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-success-lt border-2 border-success rounded-2xl p-4 xs:p-6 text-center"><div className="text-4xl xs:text-5xl mb-2">✅</div><p className="font-bold text-success">प्रमाणित पंडित</p><p className="text-sm text-text-secondary mt-1">ग्राहकों का भरोसा</p></motion.div>)}
      </div>
      <div className="px-4 xs:px-6 pb-6 xs:pb-8 pt-4 xs:pt-6 bg-surface-base/90 backdrop-blur-sm border-t border-border-default"><button onClick={handleContinue} className="w-full min-h-[52px] xs:min-h-[56px] sm:min-h-[72px] bg-saffron text-white rounded-2xl text-lg xs:text-xl sm:text-2xl font-bold shadow-btn-saffron active:scale-[0.98]">आगे बढ़ें →</button></div>
      <SkipButton label="Skip" onClick={onSkip} />
    </main>
  )
}
