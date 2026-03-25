'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialVoiceNavProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialVoiceNav({
  onNext,
  onSkip,
}: TutorialVoiceNavProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [demoState, setDemoState] = useState<'idle' | 'listening' | 'success'>('idle')

  const LINES = [
    'यह app आपकी आवाज़ से चलता है। टाइपिंग की कोई ज़रूरत नहीं।',
    'अभी कोशिश कीजिए — हाँ या नहीं बोलिए।',
    'Mic अभी सुन रहा है।',
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
      startListeningForDemo()
      return
    }

    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => {
      setTimeout(() => playLine(index + 1), 300)
    })
  }

  const startListeningForDemo = () => {
    setDemoState('listening')
    startListening({
      language: 'hi-IN',
      onResult: () => {
        setDemoState('success')
        speak('वाह! बिल्कुल सही। आप perfect कर रहे हैं।', 'hi-IN', () => {
          setTimeout(() => {
            setDemoState('idle')
          }, 2000)
        })
      },
      onError: () => { },
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
      <ProgressDots total={12} current={7} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          Voice Navigation
        </h1>
        <div className="text-6xl text-center mb-6">🎤</div>
        <div className={`border-2 border-dashed rounded-xl px-6 py-8 mb-8 text-center ${demoState === 'listening' ? 'border-primary bg-primary-lt' : 'border-vedic-border bg-white'
          }`}>
          {demoState === 'success' ? (
            <p className="text-success font-bold text-xl">✅ शाबाश! बिल्कुल सही!</p>
          ) : demoState === 'listening' ? (
            <p className="text-primary font-bold text-xl">🎤 सुन रहा हूँ...</p>
          ) : (
            <p className="text-vedic-brown">"हाँ" या "नहीं" बोलकर देखें</p>
          )}
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
