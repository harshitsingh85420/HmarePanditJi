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
        "यह App आपकी आवाज़ से चलता है। अभी कोशिश करिए — 'हाँ' या 'नहीं' बोलिए। Mic अभी सुन रहा है।",
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
        <h2 className="text-[30px] font-bold text-[#2D1B00] text-center animate-fade-in">टाइपिंग की ज़रूरत नहीं।</h2>

        {/* Illustration — phone with sound waves */}
        <div className="flex justify-center animate-fade-up stagger-1" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="relative w-[180px] h-[160px] flex items-center justify-center animate-float">
            <div className="absolute inset-0 rounded-full bg-[#FEF3C7] animate-pulse-amber" />
            <svg
              viewBox="0 0 180 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 w-full h-full"
              aria-hidden="true"
            >
              {/* Phone body */}
              <rect x="66" y="28" width="48" height="84" rx="8" fill="#2D1B00" />
              {/* Phone screen */}
              <rect x="69" y="34" width="42" height="64" rx="4" fill="#DBEAFE" />
              {/* App UI on screen */}
              <rect x="73" y="39" width="34" height="6" rx="2" fill="#F09942" opacity="0.85" />
              <rect x="73" y="49" width="26" height="3" rx="1.5" fill="#9CA3AF" opacity="0.5" />
              <rect x="73" y="55" width="22" height="3" rx="1.5" fill="#9CA3AF" opacity="0.4" />
              {/* Waveform bars on screen — voice active */}
              <rect x="75" y="64" width="3" height="8" rx="1.5" fill="#F09942" opacity="0.9" />
              <rect x="81" y="60" width="3" height="16" rx="1.5" fill="#F09942" />
              <rect x="87" y="66" width="3" height="6" rx="1.5" fill="#F09942" opacity="0.9" />
              <rect x="93" y="62" width="3" height="12" rx="1.5" fill="#F09942" opacity="0.8" />
              <rect x="99" y="65" width="3" height="8" rx="1.5" fill="#F09942" opacity="0.7" />
              {/* Phone home indicator */}
              <rect x="82" y="103" width="16" height="2" rx="1" fill="#6B7280" opacity="0.4" />
              {/* Speaker top */}
              <rect x="82" y="31" width="16" height="2" rx="1" fill="#6B7280" opacity="0.5" />

              {/* Sound wave arcs — left side */}
              <path d="M58,65 Q46,80 58,95" stroke="#F09942" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
              <path d="M48,58 Q30,80 48,102" stroke="#F09942" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
              <path d="M40,52 Q18,80 40,108" stroke="#F09942" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />

              {/* Sound wave arcs — right side */}
              <path d="M122,65 Q134,80 122,95" stroke="#F09942" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
              <path d="M132,58 Q150,80 132,102" stroke="#F09942" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
              <path d="M140,52 Q162,80 140,108" stroke="#F09942" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />

              {/* "हाँ" speech bubble */}
              <rect x="108" y="22" width="38" height="22" rx="8" fill="#F09942" />
              <path d="M114,44 L110,50 L120,44" fill="#F09942" />
              <text x="127" y="38" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold" fontFamily="sans-serif">हाँ ✓</text>
            </svg>
          </div>
        </div>
        <p className="text-[18px] text-[#9B7B52] text-center animate-fade-up stagger-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>बोलो → लिखाई हो जाती है</p>

        {/* Instruction */}
        <div className="text-center space-y-2 animate-fade-up stagger-3" style={{ opacity: 0, animationFillMode: 'forwards' }}>
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
        <div className="animate-fade-up stagger-4" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div
            className="w-full h-[104px] border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center gap-2 transition-colors"
            style={{
              backgroundColor: demoState === 'success' ? '#DCFCE7' : '#FEF3C7',
              borderColor: demoState === 'success' ? '#15803D' : '#F09942',
            }}
          >
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
              {demoState === 'listening' && (
                <div className="absolute inset-0 bg-[#F09942] rounded-full animate-ping opacity-25" />
              )}
              <svg viewBox="0 0 48 48" fill="none" className="relative z-10 w-10 h-10" aria-hidden="true">
                <rect x="14" y="4" width="20" height="30" rx="10" fill="#2D1B00" />
                <rect x="17" y="7" width="14" height="22" rx="5" fill="#DBEAFE" />
                {/* Waveform bars */}
                <rect x="19" y="18" width="2" height="6" rx="1" fill="#F09942" opacity="0.9" />
                <rect x="23" y="15" width="2" height="12" rx="1" fill="#F09942" />
                <rect x="27" y="19" width="2" height="5" rx="1" fill="#F09942" opacity="0.8" />
                {/* Stand */}
                <path d="M12,32 Q12,42 24,42 Q36,42 36,32" stroke="#F09942" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <line x1="24" y1="42" x2="24" y2="46" stroke="#F09942" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
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

        <p className="text-[16px] text-[#9B7B52] text-center">अगर बोलने में दिक्कत हो: नीचे का <strong>Button दबाएं →</strong></p>
      </div>

      <ScreenFooter isListening={demoState === 'listening'}>
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
