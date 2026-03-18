'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialSwagat({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'Namaste Pandit Ji. HmarePanditJi par aapka swagat hai. Ye platform aapke liye bana hai. Agle do minute mein hum dekhenge ki yeh app aapki aamdani mein kya badlav la sakta hai.',
    onIntent: (intent) => {
      if (intent === 'FORWARD' || intent === 'YES') onNext()
      else if (intent === 'BACK') onBack()
      else if (intent === 'SKIP') onSkip()
    },
  })

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />

      {/* Progress row */}
      <div className="flex items-center justify-between px-4 pt-2">
        <ProgressDots total={12} current={currentDot} />
        <SkipButton onClick={onSkip} />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-6 gap-6">
        {/* Hero illustration */}
        <div className="relative w-full flex justify-center h-[240px]">
          <div className="absolute w-[200px] h-[200px] rounded-full bg-[#FEF3C7] top-4" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[180px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at center, rgba(240,153,66,0.12) 0%, transparent 70%)', filter: 'blur(12px)' }} />
            <span className="text-[96px] leading-none" style={{ animation: 'gentleFloat 3s ease-in-out infinite' }}>🧘</span>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center">
          <p className="text-[40px] font-bold text-[#2D1B00] leading-tight">नमस्ते</p>
          <p className="text-[40px] font-bold text-[#F09942] leading-tight">पंडित जी।</p>
          <p className="text-[22px] text-[#6B4F2A] mt-2">HmarePanditJi पर आपका स्वागत है।</p>
        </div>

        {/* Divider */}
        <div className="w-20 h-px bg-[#F0E6D3]" />

        {/* Mool mantra */}
        <div className="text-center text-[#9B7B52] italic text-[18px]">
          <p>&ldquo;App पंडित के लिए है,</p>
          <p>पंडित App के लिए नहीं।&rdquo;</p>
        </div>
      </div>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="जानें (सिर्फ 2 मिनट) →" onClick={onNext} variant="primary" />
        <CTAButton label="Registration पर सीधे जाएं" onClick={onSkip} variant="ghost" />
      </ScreenFooter>

      <style>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
