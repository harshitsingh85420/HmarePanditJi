'use client'

import { useState, useEffect, useRef } from 'react'
import SkipButton from '@/components/part0/SkipButton'
import CTAButton from '@/components/part0/CTAButton'
import { SupportedLanguage } from '@/lib/onboarding-store'
import { speak, startListening, stopListening, LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'

interface VoiceTutorialScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  onComplete: () => void
  onBack?: () => void
}

type DemoState = 'ready' | 'listening' | 'success'

export default function VoiceTutorialScreen({ language, onComplete, onBack }: VoiceTutorialScreenProps) {
  const [demoState, setDemoState] = useState<DemoState>('ready')
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'
    const ttsTimer = setTimeout(() => {
      speak(
        "Yeh app aapki aawaz se chalta hai. Abhi 'haan' ya 'nahi' boliye. Mic abhi sun raha hai.",
        bcp47,
        () => startDemo()
      )
    }, 500)

    return () => {
      clearTimeout(ttsTimer)
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
        if (cleanupRef.current) cleanupRef.current()
        setTimeout(() => {
          onComplete()
        }, 2500)
      },
      onError: (err) => {
        setDemoState('ready')
        if (err === 'NOT_SUPPORTED' || err === 'not-allowed') {
          // If the browser doesn't have mic permission, just show success so it doesn't get stuck
          setDemoState('success')
          setTimeout(() => {
            onComplete()
          }, 2500)
        } else {
          // Only retry once on timeout, don't loop infinitely
          setTimeout(() => setDemoState('ready'), 2000)
        }
      },
    })
    cleanupRef.current = cleanup
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      {/* Top bar with back + skip */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-[#F0E6D3]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0E6D3] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B4F2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <span className="text-xl text-[#F09942] font-bold">ॐ</span>
          <span className="text-lg font-semibold text-[#2D1B00]">HmarePanditJi</span>
        </div>
        <SkipButton label="छोड़ें" onClick={onComplete} />
      </header>

      <div className="flex-1 flex flex-col items-center px-6 pt-6 gap-6">
        {/* Label */}
        <p className="text-[22px] font-semibold text-[#9B7B52] text-center">एक ज़रूरी बात</p>

        {/* Illustration */}
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#FEF3C7]" />
          <div className="absolute inset-2 rounded-full border-[3px] border-[#F09942]/20 animate-ping" />
          <div className="absolute inset-4 rounded-full border-[3px] border-[#F09942]/10 animate-ping" style={{ animationDelay: '0.5s' }} />
          <span className="relative z-10 text-6xl">🎤</span>
        </div>

        {/* Instruction */}
        <div className="text-center space-y-3">
          <p className="text-[20px] text-[#2D1B00]">जब यह दिखे:</p>
          <div className="inline-flex items-center gap-2 bg-[#FEF3C7] border border-[#F09942] rounded-full px-4 py-2">
            <div className="flex items-end gap-1 h-4">
              <div className="voice-bar" />
              <div className="voice-bar" style={{ animationDelay: '0.2s' }} />
              <div className="voice-bar" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm text-[#9B7B52] font-medium">सुन रहा हूँ...</span>
          </div>
          <p className="text-[28px] font-bold text-[#2D1B00]">तब बोलिए।</p>
        </div>

        <div className="w-full h-px bg-[#F0E6D3]" />

        {/* Interactive demo box */}
        <div className="w-full">
          <div
            className="w-full h-[104px] bg-[#FEF3C7] border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center gap-2 relative"
            style={{ borderColor: demoState === 'success' ? '#15803D' : '#F09942' }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#F09942] rounded-full animate-ping opacity-30 scale-125" />
              <span className="relative text-[44px]">🎤</span>
            </div>
            <p className="text-[18px] text-[#6B4F2A]">
              {demoState === 'listening' ? 'सुन रहा हूँ...' : 'हाँ या नहीं बोलकर देखें'}
            </p>
          </div>

          {demoState === 'success' && (
            <div
              className="mt-3 mx-auto px-6 py-3 bg-[#DCFCE7] border border-[#15803D] rounded-full text-center w-fit"
              style={{ animation: 'scaleSpring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
            >
              <span className="text-[20px] font-bold text-[#15803D]">✅ शाबाश! बिल्कुल सही!</span>
            </div>
          )}
        </div>

        {/* Fallback note */}
        <div className="text-center text-[#9B7B52] text-[16px]">
          <p>अगर बोलने में दिक्कत हो:</p>
          <p className="font-medium">⌨️ Keyboard हमेशा नीचे है</p>
        </div>
      </div>

      <footer className="p-6">
        <CTAButton label="समझ गया, आगे चलें →" onClick={onComplete} variant="primary" />
      </footer>

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
