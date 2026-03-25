'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialBackupProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialBackup({
  onNext,
  onSkip,
}: TutorialBackupProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'यह सुनकर लगेगा — यह कैसे हो सकता है?',
    'मैं समझाता हूँ।',
    'जब कोई booking होती है जिसमें ग्राहक ने backup protection लिया होता है — आपको offer आता है।',
    'क्या आप उस दिन backup पंडित बनेंगे?',
    'आप हाँ कहते हैं। उस दिन free रहते हैं।',
    'अगर मुख्य पंडित ने पूजा कर ली — भी आपको दो हज़ार रुपये मिलेंगे।',
    'अगर मुख्य पंडित cancel किए — तो पूरी booking आपकी और ऊपर से दो हज़ार bonus।',
    'यह पैसा ग्राहक ने booking के समय backup protection की extra payment की थी। वही आपको मिलता है।',
    'दोनों तरफ से फ़ायदा।',
    'आगे बोलें।',
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      playLine(0)
    }, 500)

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
      <ProgressDots total={12} current={5} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          Backup पंडित
        </h1>
        <div className="text-6xl text-center mb-6">🤝</div>
        <div className="bg-primary-lt border-2 border-primary rounded-xl px-6 py-4 mb-8">
          <p className="text-primary text-center">
            ✅ Backup protection = Extra income
          </p>
          <p className="text-vedic-brown text-center mt-2">
            ₹2,000 bonus per booking
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
