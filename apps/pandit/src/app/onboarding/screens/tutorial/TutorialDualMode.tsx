'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialDualMode({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'App ka poora kaam sirf teen baar tap mein hota hai. Booking sweekar karo. Location dekhkar niklo. Aane ke baad kaam poora batao. Bas.',
    onIntent: (intent) => {
      if (intent === 'FORWARD' || intent === 'YES') onNext()
      else if (intent === 'BACK') onBack()
      else if (intent === 'SKIP') onSkip()
    },
  })

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />
      <div className="flex items-center justify-between px-4 pt-2">
        <ProgressDots total={12} current={currentDot} />
        <SkipButton onClick={onSkip} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="text-center">
          <h2 className="text-[28px] font-bold text-[#2D1B00]">पूरा App</h2>
          <p className="text-[28px] font-bold text-[#F09942]">सिर्फ 3 Tap में</p>
        </div>

        {/* Mode cards */}
        <div className="space-y-3">
          <div className="bg-[#FEF3C7] border-2 border-[#F09942] rounded-[16px] p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎙️</span>
              <div>
                <p className="text-[20px] font-bold text-[#2D1B00]">आवाज़ से</p>
                <p className="text-[14px] text-[#9B7B52]">जब हाथ खाली हों</p>
              </div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 w-fit">
              <p className="text-[18px] font-bold text-[#F09942]">बोल कर काम करें</p>
            </div>
          </div>

          <div className="text-center text-[24px] text-[#9B7B52]">या</div>

          <div className="bg-white border border-[#F0E6D3] rounded-[16px] p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⌨️</span>
              <div>
                <p className="text-[20px] font-bold text-[#2D1B00]">Keyboard से</p>
                <p className="text-[14px] text-[#9B7B52]">जब शांत जगह न हो</p>
              </div>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl px-4 py-2 w-fit border border-gray-200">
              <p className="text-[18px] font-bold text-[#2D1B00]">टाइप कर काम करें</p>
            </div>
          </div>
        </div>

        {/* 3-step flow */}
        <div className="bg-white rounded-[16px] shadow-[0_2px_16px_rgba(0,0,0,0.08)] p-5">
          <p className="text-[18px] font-bold text-[#2D1B00] mb-3 text-center">Booking का पूरा सफर</p>
          <div className="space-y-3">
            {[
              { tap: '1', icon: '📲', text: 'Booking Offer आई → हाँ बोलें या Tap करें' },
              { tap: '2', icon: '🗺️', text: 'Location देखें → Cab बुक हो जाती है' },
              { tap: '3', icon: '✅', text: 'पूजा हुई → पूरा हुआ बताएं → पैसे आए' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F09942] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {step.tap}
                </div>
                <span className="text-lg">{step.icon}</span>
                <p className="text-[15px] text-[#2D1B00] flex-1">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="अगला फ़ायदा →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
