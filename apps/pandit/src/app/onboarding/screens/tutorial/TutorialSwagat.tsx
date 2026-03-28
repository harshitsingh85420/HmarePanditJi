'use client'

import { useEffect, useState } from 'react'
import { speakWithSarvam, stopCurrentSpeech } from '@/lib/sarvam-tts'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'
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
  const [keyboardMode, setKeyboardMode] = useState(false)
  const isMountedRef = useState(true)[0]

  const LINES = [
    'नमस्ते पंडित जी। HmarePanditJi पर आपका बहुत-बहुत स्वागत है।',
    'यह platform आपके लिए ही बना है।',
    'अगले दो मिनट में हम देखेंगे कि यह app आपकी आमदनी में क्या बदलाव ला सकता है।',
    'हमारा Mool Mantra याद रखिए — App पंडित के लिए है, पंडित App के लिए नहीं।',
    'अगर सीधे Registration करना हो तो Skip बोलें। नहीं तो जानें बोलें।',
  ]

  // Voice flow for tutorial playback
  const { isListening, isSpeaking, voiceFlowState } = useSarvamVoiceFlow({
    language: 'Hindi',
    script: currentLine < LINES.length ? LINES[currentLine] : 'अगर सीधे Registration करना हो तो Skip बोलें। नहीं तो जानें बोलें।',
    repromptScript: 'जानें बोलें या Skip बोलें',
    initialDelayMs: 200,
    pauseAfterMs: 1000,
    autoListen: currentLine >= LINES.length && !keyboardMode,
    onIntent: (intentOrRaw) => {
      if (!isMountedRef) return;

      const lower = intentOrRaw.toLowerCase();

      // Check for keyboard fallback
      if (lower.includes('keyboard') || lower.includes('कीबोर्ड') || lower.includes('skip')) {
        setKeyboardMode(true);
        onNext();
        return;
      }

      // Check for forward/yes
      if (lower.includes('jaane') || lower.includes('aage') || lower.includes('forward') || lower.includes('haan') || lower.includes('yes')) {
        handleContinue();
      }
      // Check for back
      else if (lower.includes('peeche') || lower.includes('back') || lower.includes('pichla')) {
        playLine(0);
      }
    },
    onNoiseHigh: () => {
      setKeyboardMode(true);
      onNext();
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      playLine(0)
    }, 200)

    return () => {
      clearTimeout(timer)
      stopCurrentSpeech()
    }
  }, [])

  const playLine = (index: number) => {
    if (index >= LINES.length) {
      return;
    }

    setCurrentLine(index)
    void speakWithSarvam({
      text: LINES[index],
      languageCode: 'hi-IN',
      onEnd: () => {
        if (index < LINES.length - 1) {
          setTimeout(() => playLine(index + 1), 400)
        }
      },
    })
  }

  const handleContinue = () => {
    stopCurrentSpeech()
    void speakWithSarvam({
      text: 'बहुत अच्छा।',
      languageCode: 'hi-IN',
      onEnd: () => {
        setTimeout(onNext, 600)
      },
    })
  }

  const handleSkip = () => {
    stopCurrentSpeech()
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
        <div className="space-y-2 xs:space-y-3 w-full max-w-sm">
          {LINES.map((line, idx) => (
            <p
              key={idx}
              className={`text-sm xs:text-base sm:text-lg text-vedic-brown text-center transition-opacity ${idx === currentLine ? 'opacity-100 font-semibold' : 'opacity-40'
                }`}
            >
              {line}
            </p>
          ))}
        </div>
      </main>
      <div className="px-4 xs:px-6 pb-6 xs:pb-8 pt-4 xs:pt-4">
        <CTAButton
          label="आगे बढ़ें →"
          onClick={handleContinue}
          disabled={voiceFlowState === 'speaking' || voiceFlowState === 'listening'}
        />
        <SkipButton label="Skip — सीधे Registration" onClick={handleSkip} />
      </div>
    </div>
  )
}
