'use client'

import { useEffect, useState } from 'react'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialCTAProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onRegisterNow: () => void
  onLater: () => void
}

export default function TutorialCTA({
  onNext,
  onSkip,
  onRegisterNow,
  onLater,
}: TutorialCTAProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [decisionMade, setDecisionMade] = useState<'none' | 'yes' | 'later'>('none')

  const LINES = [
    'बस इतना था HmarePanditJi का परिचय।',
    'अब आप registration शुरू कर सकते हैं — बिल्कुल मुफ़्त, दस मिनट लगेंगे।',
    'क्या आप अभी शुरू करना चाहेंगे? हाँ बोलें या नीचे button दबाएं।',
    'अगर कोई सवाल हो — screen पर helpline number है — बिल्कुल free।',
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
      startListeningForDecision()
      return
    }

    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => {
      setTimeout(() => playLine(index + 1), 300)
    })
  }

  const startListeningForDecision = () => {
    startListening({
      language: 'hi-IN',
      onResult: (result) => {
        const intent = detectIntent(result.transcript)
        if (intent === 'YES') {
          handleYes()
        } else if (intent === 'NO' || intent === 'SKIP') {
          handleLater()
        }
      },
      onError: () => { },
    })
  }

  const handleYes = () => {
    setDecisionMade('yes')
    stopListening()
    speak('बहुत अच्छा! अब हम registration शुरू करते हैं।', 'hi-IN', () => {
      setTimeout(onRegisterNow, 1500)
    })
  }

  const handleLater = () => {
    setDecisionMade('later')
    stopListening()
    speak('ठीक है। जब भी तैयार हों, app खोलें और Registration button दबाएं।', 'hi-IN', () => {
      setTimeout(onLater, 1500)
    })
  }

  const handleContinue = () => {
    handleYes()
  }

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={12} />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-vedic-brown text-center mb-4">
          अब आप तैयार हैं!
        </h1>
        <div className="text-6xl text-center mb-6">🎉</div>
        <div className="bg-white border-2 border-vedic-border rounded-xl p-6 mb-8">
          <p className="font-bold text-vedic-brown mb-4 text-center">आपको मिलेगा:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-vedic-brown-2 text-sm">Fixed Dakshina - no bargaining</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-vedic-brown-2 text-sm">Instant Payment - 2 min to bank</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-vedic-brown-2 text-sm">3 Income Streams</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-vedic-brown-2 text-sm">Travel + Calendar - automatic</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-vedic-brown-2 text-sm">Voice Navigation - no typing</span>
            </div>
          </div>
        </div>
        <div className="bg-vedic-brown text-vedic-cream rounded-xl px-6 py-4 mb-8">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">📞</span>
            <div className="text-center">
              <p className="text-sm font-bold">कोई सवाल?</p>
              <p className="text-xs text-primary">Helpline: 1800-XXX-XXXX (Free)</p>
            </div>
          </div>
        </div>
        <div className="w-full space-y-4">
          <CTAButton
            label="हाँ, Registration शुरू करें"
            onClick={handleContinue}
            variant="primary-dk"
            height="tall"
            disabled={decisionMade !== 'none'}
            aria-label="Start registration now"
          />
          <CTAButton
            label="बाद में करूँगा"
            onClick={handleLater}
            variant="secondary"
            height="tall"
            disabled={decisionMade !== 'none'}
            aria-label="Do registration later"
          />
          <div className="flex justify-center pt-2">
            <SkipButton label="Skip करें →" onClick={onSkip} />
          </div>
        </div>
      </main>
    </div>
  )
}
