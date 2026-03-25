'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialTravelProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialTravel({
  onNext,
  onSkip,
}: TutorialTravelProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'Booking confirm होते ही — आपकी पसंद के हिसाब से — train हो, bus हो, या cab — पूरी यात्रा की planning platform कर देगा।',
    'Hotel से खाने तक।',
    'और calendar में जो दिन आप free नहीं हैं — एक बार set करो।',
    'Platform उन दिनों किसी को नहीं भेजेगा। Double booking हो ही नहीं सकती।',
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
      <ProgressDots total={12} current={9} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          Travel + Calendar
        </h1>
        <div className="text-6xl text-center mb-6">🚗📅</div>
        <div className="space-y-4 mb-8">
          <div className="bg-white border-2 border-vedic-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚆</span>
              <div>
                <p className="font-bold text-vedic-brown">Travel Planning</p>
                <p className="text-vedic-gold text-sm">Train, Bus, Cab — सब automatic</p>
              </div>
            </div>
          </div>
          <div className="bg-success-lt border-2 border-success rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <p className="font-bold text-success">Calendar</p>
                <p className="text-vedic-brown-2 text-sm">Double booking impossible</p>
              </div>
            </div>
          </div>
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
