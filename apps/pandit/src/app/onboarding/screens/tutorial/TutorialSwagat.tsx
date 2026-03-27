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
  onBack,
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
    }, 200) // Reduced from 500ms

    return () => {
      clearTimeout(timer)
      stopListening()
    }
  }, [])

  const playLine = (index: number) => {
    if (index >= LINES.length) {
      startListeningForResponse()
      return
    }

    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => {
      if (index < LINES.length - 1) {
        setTimeout(() => playLine(index + 1), 200) // Reduced from 400ms
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
      setTimeout(onNext, 600) // Reduced from 1000ms
    })
  }

  const handleSkip = () => {
    stopListening()
    onSkip()
  }

  return (
    <div className="min-h-screen w-full max-w-[390px] xs:max-w-[430px] mx-auto flex flex-col bg-vedic-cream">
      <TopBar showBack={false} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={1} />
      <main className="flex-1 px-4 xs:px-6 py-6 xs:py-8 flex flex-col items-center justify-center">
        <div className="text-5xl xs:text-6xl mb-4 xs:mb-6">🙏</div>
        <h1 className="text-xl xs:text-2xl font-bold text-vedic-brown text-center mb-3 xs:mb-4">
          स्वागत है
        </h1>
        <div className="bg-primary-lt border border-primary rounded-xl px-4 xs:px-6 py-3 xs:py-4 mb-6 xs:mb-8">
          <p className="text-vedic-brown text-center text-sm xs:text-base sm:text-lg italic">
            "App पंडित के लिए है, पंडित App के लिए नहीं।"
          </p>
        </div>
        <div className="space-y-2 xs:space-y-3">
          {LINES.map((line, idx) => (
            <p key={idx} className={`text-center transition-opacity duration-300 ${idx === currentLine ? 'opacity-100' : 'opacity-30'} text-sm xs:text-base sm:text-lg text-vedic-brown`}>
              {line}
            </p>
          ))}
        </div>
      </main>
      <CTAButton onClick={handleContinue} label="आगे बढ़ें →" />
      <SkipButton label="Skip" onClick={handleSkip} />
    </div>
  )
}
