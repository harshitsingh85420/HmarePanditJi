'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

const GUARANTEES = [
  { icon: '🏅', title: 'सम्मान', sub: 'Verified Badge · Zero मोलभाव' },
  { icon: '🎧', title: 'सुविधा', sub: 'Voice Navigation · Auto Travel' },
  { icon: '🔒', title: 'सुरक्षा', sub: 'Fixed Income · Instant Payment' },
  { icon: '💰', title: 'समृद्धि', sub: '4 Income Streams · Backup Earnings' },
]

export default function TutorialGuarantees({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'यह रहे चार वादे। सम्मान, सुविधा, सुरक्षा, समृद्धि। तीन लाख से ज़्यादा पंडित पहले से जुड़ चुके हैं। अब Registration की बारी।',
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
        <div className="animate-fade-in">
          <p className="text-[22px] text-[#9B7B52] font-normal">HmarePanditJi की</p>
          <p className="text-[36px] font-bold text-[#2D1B00]">4 गारंटी</p>
        </div>

        {/* Guarantee cards */}
        <div className="space-y-3">
          {GUARANTEES.map((g, i) => (
            <div
              key={i}
              className={`bg-white border-l-[6px] border-[#F09942] rounded-r-xl shadow-sm h-[80px] flex items-center px-4 gap-4 animate-fade-up stagger-${i + 1}`}
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-xl flex-shrink-0">
                {g.icon}
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#2D1B00]">{g.title}</p>
                <p className="text-[15px] text-[#9B7B52]">{g.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof strip */}
        <div
          className="bg-[#FEF3C7]/50 border border-[#F09942]/20 rounded-full px-5 py-3.5 flex items-center gap-3 animate-fade-up stagger-6"
          style={{ opacity: 0, animationFillMode: 'forwards' }}
        >
          <span className="text-[24px]">🤝</span>
          <div>
            <p className="text-[18px] font-semibold text-[#2D1B00]">3,00,000+ पंडित पहले से जुड़े हैं</p>
            <p className="text-[14px] text-[#F09942] font-medium">★★★★★ 4.9 / 5 — 12,000+ Reviews</p>
          </div>
        </div>
      </div>

      <ScreenFooter isListening={isListening}>
        <CTAButton label="Registration शुरू करें →" onClick={onNext} variant="primary-dk" />
      </ScreenFooter>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
