'use client'

import { useState, useEffect, useRef } from 'react'
import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { speak, startListening, stopListening, LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'
import { SupportedLanguage } from '@/lib/onboarding-store'

type DemoState = 'ready' | 'listening' | 'success'

export default function TutorialVoiceNav({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const [demoState, setDemoState] = useState<DemoState>('ready')
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'
    const t = setTimeout(() => {
      speak(
        "Yeh app aapki aawaz se chalta hai. Abhi koshish kariye — 'haan' ya 'nahi' boliye. Mic abhi sun raha hai.",
        bcp47,
        () => startDemo()
      )
    }, 500)
    return () => {
      clearTimeout(t)
      cleanupRef.current?.()
      stopListening()
    }
  }, [language])

  const startDemo = () => {
    setDemoState('listening')
    const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'
    const cleanup = startListening({
      language: bcp47,
      listenTimeoutMs: 15000,
      onResult: () => {
        setDemoState('success')
        cleanup()
        setTimeout(() => {
          setDemoState('ready')
          startDemo()
        }, 2000)
      },
      onError: () => {
        setDemoState('ready')
        setTimeout(startDemo, 1500)
      },
    })
    cleanupRef.current = cleanup
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />
      <div className="flex items-center justify-between px-4 pt-2">
        <ProgressDots total={12} current={currentDot} />
        <SkipButton onClick={onSkip} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <h2 className="text-[30px] font-bold text-[#2D1B00] text-center">टाइपिंग की ज़रूरत नहीं।</h2>

        {/* Illustration */}
        <div className="flex justify-center">
          <div className="relative w-[160px] h-[160px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#FEF3C7]" />
            <div className="absolute inset-2 rounded-full border-2 border-[#F09942]/20 animate-ping" />
            <div className="absolute inset-4 rounded-full border-2 border-[#F09942]/10 animate-ping" style={{ animationDelay: '0.5s' }} />
            <span className="relative z-10 text-[64px]">🎤</span>
          </div>
        </div>
        <p className="text-[18px] text-[#9B7B52] text-center">बोलो → लिखाई हो जाती है</p>

        {/* Instruction */}
        <div className="text-center space-y-2">
          <p className="text-[20px] text-[#2D1B00]">जब यह दिखे:</p>
          <div className="inline-flex items-center gap-2 bg-[#FEF3C7] border border-[#F09942] rounded-full px-4 py-2">
            <div className="flex items-end gap-1 h-4">
              <div className="voice-bar" />
              <div className="voice-bar" style={{ animationDelay: '0.2s' }} />
              <div className="voice-bar" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm text-[#9B7B52]">सुन रहा हूँ...</span>
          </div>
          <p className="text-[28px] font-bold text-[#2D1B00]">तब बोलिए।</p>
        </div>

        {/* Interactive demo */}
        <div>
          <div
            className="w-full h-[104px] border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center gap-2 transition-colors"
            style={{
              backgroundColor: demoState === 'success' ? '#DCFCE7' : '#FEF3C7',
              borderColor: demoState === 'success' ? '#15803D' : '#F09942',
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#F09942] rounded-full animate-ping opacity-25 scale-125" />
              <span className="relative text-[44px]">🎤</span>
            </div>
            <p className="text-[18px] text-[#6B4F2A]">
              {demoState === 'listening' ? 'सुन रहा हूँ...' : 'हाँ या नहीं बोलकर देखें'}
            </p>
          </div>
          {demoState === 'success' && (
            <div
              className="mt-3 px-6 py-3 bg-[#DCFCE7] border border-[#15803D] rounded-full text-center mx-auto w-fit"
              style={{ animation: 'scaleSpring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
            >
              <span className="text-[20px] font-bold text-[#15803D]">✅ शाबाश! बिल्कुल सही!</span>
            </div>
          )}
        </div>

        <p className="text-[16px] text-[#9B7B52] text-center">अगर बोलने में दिक्कत हो: <strong>⌨️ Keyboard हमेशा नीचे है</strong></p>
      </div>

      <ScreenFooter isListening={demoState === 'listening'} onKeyboardToggle={() => {}}>
        <CTAButton label="अगला फ़ायदा देखें →" onClick={onNext} variant="primary" />
      </ScreenFooter>

      <style>{`
        @keyframes scaleSpring {
          0% { transform: scale(0.9); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
