'use client'

import { useState, useEffect, useRef } from 'react'
import SkipButton from '@/components/part0/SkipButton'
import CTAButton from '@/components/part0/CTAButton'
import { SupportedLanguage } from '@/lib/onboarding-store'
import { LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'

interface VoiceTutorialScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  onComplete: () => void
  onBack?: () => void
}

type DemoState = 'ready' | 'listening' | 'success'

export default function VoiceTutorialScreen({ language, onComplete, onBack }: VoiceTutorialScreenProps) {
  const [demoState, setDemoState] = useState<DemoState>('ready')
  const { isListening } = useVoiceFlow({
    language,
    voiceScript: "यह app आपकी आवाज़ से चलता है। अभी 'हाँ' या 'नहीं' बोलिए।",
    onIntent: (intent) => {
      if (intent === 'YES' || intent === 'NO' || intent === 'FORWARD') {
        setDemoState('success')
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        setDemoState('listening')
      }
    }
  })

  // The state starts loosely as listening visually.
  useEffect(() => {
    if (demoState === 'ready') setDemoState('listening')
  }, [demoState])

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

        {/* Illustration — person holding phone with sound waves */}
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#FEF3C7]" />
          <svg
            viewBox="0 0 180 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 w-full h-full"
            aria-hidden="true"
          >
            {/* Person body */}
            <ellipse cx="90" cy="148" rx="28" ry="14" fill="#F5EDD8" />
            {/* Legs */}
            <path d="M76 148 Q72 162 70 172" stroke="#D4B896" strokeWidth="8" strokeLinecap="round" />
            <path d="M104 148 Q108 162 110 172" stroke="#D4B896" strokeWidth="8" strokeLinecap="round" />
            {/* Torso / kurta */}
            <rect x="72" y="108" width="36" height="42" rx="8" fill="#F5EDD8" />
            {/* Angavastram drape */}
            <path d="M72 114 Q65 120 62 136 L72 134 Q74 122 78 114Z" fill="#F09942" opacity="0.85" />
            {/* Head */}
            <ellipse cx="90" cy="94" rx="16" ry="17" fill="#D4B896" />
            {/* Hair */}
            <path d="M74 90 Q76 78 90 76 Q104 78 106 90" fill="#3A2008" opacity="0.85" />
            {/* Tilak */}
            <ellipse cx="90" cy="82" rx="2" ry="1.5" fill="#DC2626" opacity="0.8" />
            {/* Eyes */}
            <path d="M84 91 Q86 89.5 88 91" stroke="#5C3D1E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M92 91 Q94 89.5 96 91" stroke="#5C3D1E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Smile */}
            <path d="M86 97 Q90 100 94 97" stroke="#8B5A2B" strokeWidth="1" fill="none" strokeLinecap="round" />
            {/* Right arm holding phone up to mouth */}
            <path d="M108 120 Q122 114 126 106" stroke="#D4B896" strokeWidth="8" strokeLinecap="round" />
            {/* Phone held near mouth */}
            <rect x="120" y="88" width="22" height="36" rx="4" fill="#2D1B00" />
            <rect x="122" y="91" width="18" height="26" rx="2" fill="#DBEAFE" />
            {/* Waveform on phone screen */}
            <rect x="124" y="101" width="2" height="4" rx="1" fill="#F09942" opacity="0.9" />
            <rect x="128" y="98" width="2" height="10" rx="1" fill="#F09942" />
            <rect x="132" y="102" width="2" height="4" rx="1" fill="#F09942" opacity="0.8" />
            {/* Left arm resting */}
            <path d="M72 120 Q58 130 56 140" stroke="#D4B896" strokeWidth="8" strokeLinecap="round" />
            {/* Sound wave arcs emanating from phone */}
            <path d="M144 96 Q152 104 144 114" stroke="#F09942" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
            <path d="M150 91 Q162 104 150 119" stroke="#F09942" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
            <path d="M156 86 Q172 104 156 124" stroke="#F09942" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.25" />
          </svg>
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
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
              {demoState === 'listening' && (
                <div className="absolute inset-0 bg-[#F09942] rounded-full animate-ping opacity-25" />
              )}
              <svg viewBox="0 0 48 48" fill="none" className="relative z-10 w-10 h-10" aria-hidden="true">
                <rect x="14" y="4" width="20" height="30" rx="10" fill="#2D1B00" />
                <rect x="17" y="7" width="14" height="22" rx="5" fill="#DBEAFE" />
                <rect x="19" y="18" width="2" height="6" rx="1" fill="#F09942" opacity="0.9" />
                <rect x="23" y="15" width="2" height="12" rx="1" fill="#F09942" />
                <rect x="27" y="19" width="2" height="5" rx="1" fill="#F09942" opacity="0.8" />
                <path d="M12,32 Q12,42 24,42 Q36,42 36,32" stroke="#F09942" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <line x1="24" y1="42" x2="24" y2="46" stroke="#F09942" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[18px] text-[#6B4F2A]">
              {demoState === 'success' ? 'सुन लिया!' : 'हाँ या नहीं बोलकर देखें'}
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
          <p className="font-medium">नीचे का Button दबाएं →</p>
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
