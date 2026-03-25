'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialIncomeProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialIncome({
  onNext,
  onSkip,
}: TutorialIncomeProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'सुनिए, वाराणसी के पंडित रामेश्वर शर्मा जी पहले महीने में अठारह हज़ार रुपये कमाते थे।',
    'आज वे तीन नए तरीकों से तिरसठ हज़ार कमा रहे हैं।',
    'मैं आपको भी यही तीन तरीके दिखाता हूँ।',
    'इन चार tiles में से जो समझना हो उसे छू सकते हैं। या आगे बोलकर सब एक-एक देख सकते हैं।',
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
      if (index < LINES.length - 1) {
        setTimeout(() => playLine(index + 1), 300)
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
        if (intent === 'FORWARD') {
          handleContinue()
        } else if (intent === 'SKIP') {
          onSkip()
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

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={2} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          आमदनी में बदलाव
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border-2 border-vedic-border rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">₹</div>
            <p className="text-vedic-gold text-sm">पहले</p>
            <p className="text-2xl font-bold text-vedic-brown">18,000</p>
          </div>
          <div className="bg-primary-lt border-2 border-primary rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">₹</div>
            <p className="text-primary text-sm">अब</p>
            <p className="text-2xl font-bold text-primary">63,000</p>
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
