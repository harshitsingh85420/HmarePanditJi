'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialOnlineRevenueProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialOnlineRevenue({
  onNext,
  onSkip,
}: TutorialOnlineRevenueProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const LINES = [
    'दो बिल्कुल नए तरीके हैं — जो आप शायद अभी तक नहीं जानते।',
    'पहला — घर बैठे पूजा। Video call से पूजा कराइए। दुनिया भर के ग्राहक मिलेंगे — NRI भी।',
    'एक पूजा में दो हज़ार से पाँच हज़ार रुपये।',
    'दूसरा — पंडित से बात। Phone, video, या chat पर धार्मिक सलाह दीजिए।',
    'बीस रुपये से पचास रुपये प्रति मिनट।',
    'उदाहरण के तौर पर — बीस मिनट की एक call में आठ सौ रुपये सीधे आपको।',
    'दोनों मिलाकर — चालीस हज़ार रुपये अलग से हर महीने।',
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
      <ProgressDots total={12} current={4} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          ऑनलाइन कमाई
        </h1>
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-white border-2 border-vedic-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📱</span>
              <p className="font-bold text-vedic-brown">घर बैठे पूजा</p>
            </div>
            <p className="text-vedic-gold text-sm">₹2,000 - ₹5,000 per pooja</p>
          </div>
          <div className="bg-white border-2 border-vedic-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💬</span>
              <p className="font-bold text-vedic-brown">पंडित से बात</p>
            </div>
            <p className="text-vedic-gold text-sm">₹20 - ₹50 per minute</p>
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
