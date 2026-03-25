'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialDakshinaProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialDakshina({
  onNext,
  onSkip,
}: TutorialDakshinaProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'कितनी बार ऐसा हुआ है कि आपने दो घंटे की पूजा की — और ग्राहक ने कह दिया, भैया, तीन हज़ार नहीं, दो हज़ार ले लो।',
    'आप कुछ नहीं बोल पाए।',
    'अब नहीं होगा यह।',
    'आप खुद दक्षिणा तय करेंगे — platform कभी नहीं बदलेगी।',
    'ग्राहक को booking से पहले ही पता होता है — कितना देना है।',
    'मोलभाव खत्म।',
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
    const pause = index === 1 || index === 5 ? 800 : 300
    speak(LINES[index], 'hi-IN', () => {
      setTimeout(() => playLine(index + 1), pause)
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
      <ProgressDots total={12} current={3} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          तय दक्षिणा
        </h1>
        <div className="text-6xl text-center mb-6">💰</div>
        <div className="bg-error-lt border-2 border-error rounded-xl px-6 py-4 mb-8">
          <p className="text-error text-center font-bold">
            ❌ मोलभाव नहीं
          </p>
        </div>
        <div className="bg-success-lt border-2 border-success rounded-xl px-6 py-4 mb-8">
          <p className="text-success text-center font-bold">
            ✅ तय दक्षिणा
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
