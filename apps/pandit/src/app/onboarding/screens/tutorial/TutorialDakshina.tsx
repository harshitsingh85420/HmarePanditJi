'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialDakshina({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'Kitni baar hua hai ki aapne do ghante ki pooja ki, aur grahak ne keh diya — do hazaar le lo. Ab nahi hoga. Aap dakshina khud tayy karenge. Koi molbhav nahi.',
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
          <h1 className="text-[34px] font-bold text-[#2D1B00]">अब कोई मोलभाव नहीं।</h1>
        </div>

        {/* Before card */}
        <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-[16px] p-4">
          <p className="text-[16px] font-bold text-[#DC2626] mb-3">❌ पहले:</p>
          {/* Chat bubbles */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-xl">😒</span>
              <div className="bg-white rounded-[12px] rounded-tl-none px-3 py-2 max-w-[70%]">
                <p className="text-[16px] text-[#2D1B00]">&ldquo;1,500 में हो जाएगा?&rdquo;</p>
              </div>
            </div>
            <div className="flex items-end justify-end gap-2">
              <div className="bg-gray-100 rounded-[12px] rounded-tr-none px-3 py-2 max-w-[70%]">
                <p className="text-[16px] italic text-[#9B7B52]">(चुप रह गए...)</p>
              </div>
              <span className="text-xl">😔</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[20px] text-[#9B7B52]">↓</div>

        {/* After card */}
        <div className="bg-[#DCFCE7] border border-[#15803D] rounded-[16px] p-4">
          <p className="text-[16px] font-bold text-[#15803D] mb-3">✅ अब:</p>
          <div className="bg-white rounded-xl p-3">
            <p className="text-[18px] font-bold text-[#2D1B00]">सत्यनारायण पूजा</p>
            <p className="text-[24px] font-bold text-[#15803D] mt-1">आपकी दक्षिणा: ₹2,100</p>
            <p className="text-[14px] text-[#9B7B52]">(पहले से तय)</p>
          </div>
          <p className="text-[15px] text-[#15803D] mt-3 font-medium">ग्राहक को Booking से पहले ही पता है।</p>
        </div>

        <p className="text-[17px] text-[#6B4F2A] text-center leading-relaxed">
          आप दक्षिणा खुद तय करते हैं।<br />
          Platform कभी नहीं बदलेगी।
        </p>
      </div>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="अगला फ़ायदा देखें →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
