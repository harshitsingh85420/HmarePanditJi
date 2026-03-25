'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialVideoVerifyProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialVideoVerify({
  onNext,
  onSkip,
}: TutorialVideoVerifyProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'Verified होने का मतलब है — ज़्यादा bookings।',
    'Data यह कहता है — Verified पंडितों को तीन गुना ज़्यादा bookings मिलती हैं।',
    'इसके लिए हर पूजा के लिए सिर्फ दो मिनट का video देना होगा — एक बार।',
    'यह video सिर्फ हमारी admin team देखेगी।',
    'Public नहीं होगी। आपकी privacy safe है।',
    'बस एक और screen बाकी है।',
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
      <ProgressDots total={12} current={10} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          Video Verification
        </h1>
        <div className="text-6xl text-center mb-6">✓</div>
        <div className="bg-gradient-to-br from-primary to-primary-dk rounded-2xl p-6 mb-8 text-white">
          <p className="text-center font-bold text-xl mb-2">Verified Pandit</p>
          <p className="text-center text-white/80 text-sm">HmarePanditJi Trusted</p>
        </div>
        <div className="bg-success-lt border-2 border-success rounded-xl px-6 py-4 mb-8">
          <p className="text-success text-center font-bold">
            📊 3x ज़्यादा Bookings
          </p>
        </div>
        <div className="bg-vedic-brown text-vedic-cream rounded-xl px-6 py-4 mb-8">
          <p className="text-center">
            🔒 Privacy 100% Safe — Admin only
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
