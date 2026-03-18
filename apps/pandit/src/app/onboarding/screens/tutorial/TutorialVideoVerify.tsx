'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialVideoVerify({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'Har pooja ke liye sirf do minute ka video — ek baar. Phir life mein us pooja ke liye Verified badge. Verified pandits ko teen guna zyada bookings milti hain. Video sirf admin dekhega.',
    onIntent: (intent) => {
      if (intent === 'FORWARD' || intent === 'YES') onNext()
      else if (intent === 'BACK') onBack()
      else if (intent === 'SKIP') onSkip()
    },
  })

  const POOJAS = ['सत्यनारायण कथा ✓', 'विवाह संस्कार ✓', 'गृह प्रवेश ✓', 'श्राद्ध कर्म ✓']

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />
      <div className="flex items-center justify-between px-4 pt-2">
        <ProgressDots total={12} current={currentDot} />
        <SkipButton onClick={onSkip} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="text-center">
          <p className="text-[26px] font-bold text-[#2D1B00]">✅ Verified का मतलब</p>
          <p className="text-[26px] font-bold text-[#F09942]">ज़्यादा Bookings</p>
        </div>

        {/* Profile preview card */}
        <div className="bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-[20px] p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#FEF3C7] border-2 border-[#F09942] flex items-center justify-center text-2xl">🧑</div>
              <div>
                <p className="text-[20px] font-bold text-[#2D1B00]">[आपका नाम]</p>
                <p className="text-[15px] text-[#F09942]">⭐ 4.9 | 234 Reviews</p>
              </div>
            </div>
            <div className="bg-[#DCFCE7] border border-[#15803D] px-2 py-1 rounded-md">
              <p className="text-[10px] font-bold text-[#15803D]">✓ VERIFIED</p>
            </div>
          </div>
          <div className="h-px bg-[#F0E6D3] mb-4" />
          <p className="text-[16px] font-semibold text-[#6B4F2A] mb-2">Verified पूजाएं:</p>
          <div className="flex flex-wrap gap-2">
            {POOJAS.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 h-9 bg-[#FEF3C7] border border-[#F09942] px-3.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#F09942] flex-shrink-0" />
                <p className="text-[16px] text-[#2D1B00]">{p.split(' ✓')[0]}</p>
                <p className="text-[14px] text-[#F09942]">✓</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3× banner */}
        <div className="bg-[#F09942] rounded-xl p-5 text-center">
          <p className="text-[16px] text-white/90">Verified Pandits को</p>
          <p className="text-[64px] font-bold text-white leading-none">3x</p>
          <p className="text-[16px] text-white/90">ज़्यादा Bookings मिलती हैं</p>
          <p className="text-[14px] text-white/70 mt-0.5">Unverified से</p>
        </div>

        {/* Privacy assurance */}
        <div className="text-center space-y-1">
          <p className="text-[18px] font-semibold text-[#2D1B00]">सिर्फ 2 मिनट का Video — एक बार।</p>
          <p className="text-[16px] text-[#9B7B52] italic">Video सिर्फ Admin देखेगा। Public नहीं होगी।</p>
        </div>
      </div>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="आगे देखें → (लगभग हो गया!)" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
