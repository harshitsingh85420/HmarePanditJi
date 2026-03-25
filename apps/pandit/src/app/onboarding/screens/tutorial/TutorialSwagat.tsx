'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialSwagatProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialSwagat({
  onNext,
  onSkip,
}: TutorialSwagatProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है।',
    'यह platform आपके लिए ही बना है।',
    'अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है।',
    'हमारा Mool Mantra याद रखिए — App पंडित के लिए है, पंडित App के लिए नहीं।',
    'अगर सीधे Registration करना हो तो Skip बोलें। नहीं तो जानें बोलें।',
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
      if (index < LINES.length - 1) {
        setTimeout(() => playLine(index + 1), 400)
      } else {
        startListeningForResponse()
      }
    })
  }

  const startListeningForResponse = () => {
    startListening({
      language: 'hi-IN',
      onResult: (result) => {
        const intent = detectIntent(result.transcript)
        if (intent === 'SKIP' || intent === 'FORWARD') {
          onNext()
        } else if (intent === 'BACK') {
          playLine(0)
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

  const handleSkip = () => {
    stopListening()
    onSkip()
  }

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={false} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={1} />
      <main className="flex-1 px-6 py-8 flex flex-col items-center justify-center">
        <div className="text-6xl mb-6">🙏</div>
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          स्वागत है
        </h1>
        <div className="bg-primary-lt border border-primary rounded-xl px-6 py-4 mb-8">
          <p className="text-vedic-brown text-center italic">
            "App पंडित के लिए है, पंडित App के लिए नहीं।"
          </p>
        </div>
        <div className="w-full space-y-4">
          <CTAButton
            label="जानें"
            onClick={handleContinue}
            variant="primary"
            height="tall"
            aria-label="Continue to next tutorial screen"
          />
          <div className="flex justify-center">
            <SkipButton label="Skip करें →" onClick={handleSkip} />
          </div>
        </div>
      </main>
    </div>
  )
}
