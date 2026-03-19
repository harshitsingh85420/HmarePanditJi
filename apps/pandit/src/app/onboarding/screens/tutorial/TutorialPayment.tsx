'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialPayment({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'पूजा समाप्त होती है, दो मिनट में पैसा Bank में। Platform का हिस्सा भी Screen पर दिखेगा। छुपा कुछ नहीं।',
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
        <div className="text-center animate-fade-in">
          <p className="text-[32px] font-bold text-[#2D1B00]">पूजा ख़त्म।</p>
          <p className="text-[32px] font-bold text-[#F09942]">पैसे 2 मिनट में।</p>
        </div>

        {/* Timeline card */}
        <div className="bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] rounded-[16px] p-5">
          {[
            { time: '3:30 PM', label: 'पूजा समाप्त हुई', color: '#15803D', size: 'normal' },
            { time: '3:31 PM', label: 'Payment शुरू हुआ', color: '#F09942', size: 'normal' },
            { time: '3:32 PM', label: '✅ ₹2,325 आपके Bank में', color: '#15803D', size: 'large' },
          ].map((row, i) => (
            <div key={i} className={`animate-fade-up stagger-${i + 1}`} style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-4">
                <p className="text-[15px] text-[#9B7B52] w-16 flex-shrink-0">{row.time}</p>
                <div
                  className={`flex-shrink-0 ${row.size === 'large' ? 'animate-heartbeat' : ''}`}
                  style={{ backgroundColor: row.color, ...(row.size === 'large' ? { width: 16, height: 16, borderRadius: '50%' } : { width: 12, height: 12, borderRadius: '50%' }) }}
                />
                <p className={`${row.size === 'large' ? 'text-[26px] font-bold text-[#15803D]' : 'text-[18px] text-[#2D1B00]'}`}>{row.label}</p>
              </div>
              {i < 2 && <div className="ml-[76px] h-4 w-0.5 border-l-2 border-dashed border-[#F0E6D3] my-1" />}
            </div>
          ))}
        </div>

        {/* Breakdown card */}
        <div className="bg-[#DCFCE7] border-l-4 border-[#15803D] rounded-xl p-4 animate-card-reveal" style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
          <p className="text-[14px] text-[#9B7B52] italic mb-2">एक असली उदाहरण:</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-[18px] text-[#2D1B00]">आपकी दक्षिणा:</p>
              <p className="text-[18px] font-bold text-[#2D1B00]">₹2,500</p>
            </div>
            <div className="flex justify-between">
              <p className="text-[16px] text-[#9B7B52]">Platform (15%):</p>
              <p className="text-[18px] font-bold text-[#DC2626]">−₹375</p>
            </div>
            <div className="flex justify-between">
              <p className="text-[18px] text-[#2D1B00]">यात्रा भत्ता:</p>
              <p className="text-[18px] font-bold text-[#15803D]">+₹200</p>
            </div>
            <div className="h-px bg-[#15803D]/20 my-1" />
            <div className="flex justify-between">
              <p className="text-[18px] font-bold text-[#15803D]">आपको मिला:</p>
              <p className="text-[22px] font-bold text-[#15803D]">₹2,325</p>
            </div>
          </div>
        </div>

        <div className="text-center animate-fade-up stagger-4" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <p className="text-[20px] font-semibold text-[#2D1B00]">हर रुपये का हिसाब।</p>
          <p className="text-[18px] text-[#6B4F2A]">कोई छुपाई नहीं।</p>
        </div>
      </div>

      <ScreenFooter isListening={isListening}>
        <CTAButton label="अगला फ़ायदा →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
