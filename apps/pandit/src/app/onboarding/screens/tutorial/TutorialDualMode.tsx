'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialDualModeProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialDualMode({
  onNext,
  onSkip,
}: TutorialDualModeProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'चाहे आपके पास smartphone हो या keypad phone — दोनों से काम चलेगा।',
    'Smartphone वाले को app में सब कुछ मिलेगा — video call, chat, alerts।',
    'Keypad phone वाले के पास नई booking आने पर call आएगी — number दबाओ, booking accept करो।',
    'और अगर registration में बेटा या परिवार मदद करे — कोई बात नहीं।',
    'पूजा आपको मिलेगी। पैसे आपके खाते में।',
    'आगे बोलें।',
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      playLine(0)
    }, 400)

    return () => {
      clearTimeout(timer)
      stopListening()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playLine = (index: number) => {
    if (index >= LINES.length) {
      startListeningForResponse()
      return
    }

    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => {
      setTimeout(() => playLine(index + 1), 300)
    })
  }

  const startListeningForResponse = () => {
    startListening({
      language: 'hi-IN',
      onResult: (result) => {
        const intent = detectIntent(result.transcript)
        if (intent === 'FORWARD') {
          handleContinue()
        } else if (intent === 'SKIP') {
          onSkip()
        }
      },
      onError: () => { },
    })
  }

  const handleContinue = () => {
    stopListening()
    speak('बहुत अच्छा।', 'hi-IN', () => {
      setTimeout(onNext, 1000)
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={8} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          Dual Mode
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border-2 border-vedic-border rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">📱</div>
            <p className="font-bold text-vedic-brown mb-2">Smartphone</p>
            <p className="text-vedic-gold text-sm">Full app features</p>
          </div>
          <div className="bg-white border-2 border-vedic-border rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">📞</div>
            <p className="font-bold text-vedic-brown mb-2">Keypad Phone</p>
            <p className="text-vedic-gold text-sm">Call-based booking</p>
          </div>
        </div>
        <div className="bg-primary-lt border-2 border-primary rounded-xl px-6 py-4 mb-8">
          <p className="text-vedic-brown text-center">
            👨‍👩‍👦 परिवार मदद करे — कोई बात नहीं
          </p>
        </div>
        <div className="w-full space-y-4">
          <CTAButton
            label="आगे"
            onClick={handleContinue}
            variant="primary"
            height="tall"
            aria-label="Continue to next tutorial screen"
          />
          <div className="flex justify-center">
            <SkipButton label="Skip करें →" onClick={onSkip} />
          </div>
        </div>
      </main>
    </div>
  )
}
