'use client'

import { useState } from 'react'
import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialCTAProps extends TutorialScreenProps {
  onRegisterNow: () => void
  onLater: () => void
}

export default function TutorialCTA({ language, onLanguageChange, currentDot, onBack, onRegisterNow, onLater }: TutorialCTAProps) {
  const [saved, setSaved] = useState(false)

  const handleLater = () => {
    setSaved(true)
    onLater()
  }

  useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: "Bas itna tha parichay. Ab registration shuru kar sakte hain. Bilkul muft, das minute lagenge. 'Haan' bolein ya button dabayein.",
    onIntent: (intent) => {
      if (intent === 'YES' || intent === 'FORWARD') onRegisterNow()
      else if (intent === 'NO' || intent === 'SKIP') handleLater()
    },
    autoListen: false,
  })

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />

      {/* Progress row — all 12 filled */}
      <div className="flex flex-col items-center pt-2">
        <ProgressDots total={12} current={currentDot} />
        <p className="text-[14px] text-[#15803D] font-semibold -mt-1 mb-1">✓ Tutorial पूरा हुआ</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Hero illustration */}
        <div className="relative flex items-center justify-center h-[200px]">
          <div className="absolute w-[200px] h-[200px] rounded-full bg-[#FEF3C7]/30" />
          <div className="absolute blur-xl w-[160px] h-[160px] rounded-full" style={{ background: 'rgba(240,153,66,0.12)' }} />
          <span className="relative z-10 text-[96px] leading-none" style={{ animation: 'gentleFloat 3s ease-in-out infinite' }}>🧘</span>
        </div>

        {/* Headline */}
        <div className="text-center space-y-2">
          <h1 className="text-[32px] font-bold text-[#2D1B00]">Registration शुरू करें?</h1>
          <div className="h-px w-20 bg-[#F0E6D3] mx-auto" />
          <p className="text-[22px] font-semibold text-[#15803D]">बिल्कुल मुफ़्त।</p>
          <p className="text-[20px] text-[#2D1B00]">10 मिनट लगेंगे।</p>
        </div>
      </div>

      {/* Button area */}
      <div className="px-6 pb-4 space-y-3">
        {saved ? (
          /* ── "Come back later" confirmation ── */
          <div className="space-y-3">
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-5 py-4 text-center space-y-1">
              <p className="text-[22px]">🙏</p>
              <p className="text-[18px] font-bold text-[#15803D]">ठीक है, पंडित जी।</p>
              <p className="text-[15px] text-[#166534]">आपकी Progress save हो गई।</p>
              <p className="text-[14px] text-[#4B7A52]">अगली बार App खोलने पर Registration<br />से ही शुरू होगा।</p>
            </div>
            <button
              onClick={onRegisterNow}
              className="w-full flex items-center justify-center text-white font-bold text-lg rounded-xl transition-transform active:scale-[0.98]"
              style={{ height: 56, backgroundColor: '#DC6803' }}
            >
              अभी Register करें →
            </button>
          </div>
        ) : (
          /* ── Normal CTA buttons ── */
          <>
            <button
              onClick={onRegisterNow}
              className="w-full flex items-center justify-center text-white font-bold text-xl rounded-xl outline outline-2 outline-offset-2 outline-[#F09942]/30 transition-transform active:scale-[0.98]"
              style={{
                height: 72,
                backgroundColor: '#DC6803',
                boxShadow: '0 6px 20px rgba(220,104,3,0.45)',
              }}
            >
              ✅ हाँ, Registration शुरू करें →
            </button>
            <button
              onClick={handleLater}
              className="w-full h-14 bg-white border border-[#F0E6D3] text-[#6B4F2A] font-semibold text-lg rounded-xl"
            >
              बाद में करूँगा
            </button>
          </>
        )}

        {/* Helpline */}
        <div className="text-center pt-1">
          <div className="flex items-center justify-center gap-2 text-[#9B7B52]">
            <span>📞</span>
            <span>कोई सवाल?</span>
            <a href="tel:1800000000" className="font-bold text-[#F09942]">1800-HPJ-HELP</a>
            <span>(Toll Free)</span>
          </div>
          <p className="text-[14px] text-[#F09942] mt-0.5">सुबह 8 बजे – रात 10 बजे</p>
        </div>
      </div>

      <style>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
