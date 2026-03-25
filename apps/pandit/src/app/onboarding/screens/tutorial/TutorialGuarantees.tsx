'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialGuaranteesProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialGuarantees({
  onNext,
  onSkip,
}: TutorialGuaranteesProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'यह रहे HmarePanditJi के चार वादे।',
    'एक — सम्मान। Verified badge, izzat बनी रहे, कोई मोलभाव नहीं।',
    'दो — सुविधा। आवाज़ से सब काम, यात्रा की planning अपने आप।',
    'तीन — सुरक्षा। पैसा तय, तुरंत मिलेगा, कोई धोखा नहीं।',
    'चार — समृद्धि। Offline, online, backup — तीन जगह से नया पैसा।',
    'तीन लाख से ज़्यादा पंडिट पहले से जुड़ चुके हैं।',
    'अब Registration की बारी।',
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
      <ProgressDots total={12} current={11} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          4 Guarantees
        </h1>
        <div className="space-y-3 mb-8">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏅</span>
              <div>
                <p className="font-bold text-vedic-brown">सम्मान (Samman)</p>
                <p className="text-vedic-gold text-sm">Verified badge, no bargaining</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎤</span>
              <div>
                <p className="font-bold text-vedic-brown">सुविधा (Suwidha)</p>
                <p className="text-vedic-gold text-sm">Voice-first, auto travel</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔒</span>
              <div>
                <p className="font-bold text-vedic-brown">सुरक्षा (Suraksha)</p>
                <p className="text-vedic-gold text-sm">Fixed money, instant payment</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <p className="font-bold text-vedic-brown">समृद्धि (Samriddhi)</p>
                <p className="text-vedic-gold text-sm">3 income streams</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-primary-lt border-2 border-primary rounded-xl px-6 py-4 mb-8">
          <p className="text-primary text-center font-bold">
            3,00,000+ पंडिट joined
          </p>
        </div>
        <div className="w-full space-y-4">
          <CTAButton
            label="Registration शुरू करें"
            onClick={handleContinue}
            variant="primary-dk"
            height="tall"
            aria-label="Start registration process"
          />
          <div className="flex justify-center">
            <SkipButton label="Skip करें →" onClick={onSkip} />
          </div>
        </div>
      </main>
    </div>
  )
}
