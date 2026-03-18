'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialIncome({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'Varanasi ke Pandit Rameshwar Sharma Ji pehle aatharah hazaar kama rahe the. Aaj woh traanth hazaar kama rahe hain. Main aapko bhi yahi tarike dikhaata hoon.',
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
        <h2 className="text-[26px] font-bold text-[#2D1B00]">आपकी कमाई कैसे बढ़ेगी?</h2>

        {/* Testimonial card */}
        <div className="bg-white rounded-[16px] shadow-[0_2px_16px_rgba(0,0,0,0.08)] border-l-[5px] border-[#F09942] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] border-2 border-[#F09942] flex items-center justify-center text-xl">🧑‍🦳</div>
            <div>
              <p className="text-[18px] font-bold text-[#2D1B00]">पंडित रामेश्वर शर्मा</p>
              <p className="text-[15px] text-[#9B7B52]">वाराणसी, UP</p>
            </div>
          </div>
          <div className="flex items-end justify-around mb-4">
            <div className="text-center">
              <p className="text-[14px] text-[#9B7B52] mb-1">पहले:</p>
              <p className="text-[24px] font-bold text-[#9B7B52] line-through">₹18,000</p>
            </div>
            <div className="text-[28px]">→</div>
            <div className="text-center">
              <p className="text-[14px] text-[#9B7B52] mb-1">अब:</p>
              <p className="text-[32px] font-bold text-[#15803D]">₹63,000</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 bg-[#DCFCE7] border border-[#15803D] rounded-full px-3 py-1">
            <span className="text-[14px] font-medium text-[#15803D]">✓ HmarePanditJi Verified</span>
          </div>
        </div>

        <p className="text-[20px] font-semibold text-[#6B4F2A]">3 नए तरीकों से यह हुआ:</p>

        {/* 2x2 Tile grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: '🏠', title: 'ऑफलाइन पूजाएं', sub: '(पहले से हैं आप)', isNew: false },
            { icon: '📱', title: 'ऑनलाइन पूजाएं', sub: '(नया मौका)', isNew: true },
            { icon: '🎓', title: 'सलाह सेवा', sub: '(प्रति मिनट)', isNew: true },
            { icon: '🤝', title: 'बैकअप पंडित', sub: '(बिना कुछ किए)', isNew: true },
          ].map((tile, i) => (
            <div key={i} className="relative bg-white border border-[#F0E6D3] rounded-xl p-3 h-[80px] flex flex-col justify-center">
              {tile.isNew && (
                <span className="absolute top-1 right-1.5 text-[10px] font-bold bg-[#F09942] text-white px-1.5 py-0.5 rounded-full">NEW</span>
              )}
              <p className="text-xl mb-0.5">{tile.icon}</p>
              <p className="text-[14px] font-bold text-[#2D1B00] leading-tight">{tile.title}</p>
              <p className="text-[12px] text-[#9B7B52]">{tile.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="और देखें →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
