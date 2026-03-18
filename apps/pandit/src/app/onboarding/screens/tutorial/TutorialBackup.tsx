'use client'

import { useState } from 'react'
import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialBackup({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const [accordionOpen, setAccordionOpen] = useState(true)
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'Yeh sun ke lagega yeh kaise ho sakta hai. Jab koi booking hoti hai, aapko offer aata hai. Aap haan kehte hain. Main Pandit ne pooja kar li — bhi aapko do hazaar. Main Pandit cancel kiya — poori booking plus do hazaar. Dono taraf faayda.',
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
        {/* Hero text */}
        <div className="text-center">
          <p className="text-[28px] font-bold text-[#2D1B00]">बिना कुछ किए</p>
          <p className="text-[44px] font-bold text-[#15803D]">₹2,000?</p>
          <p className="text-[18px] font-semibold text-[#6B4F2A]">हाँ। यह सच है।</p>
        </div>

        {/* Timeline card */}
        <div className="bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] rounded-[16px] p-5 space-y-0">
          {[
            { icon: '📅', color: '#F09942', title: 'कोई पूजा Book हुई', sub: '(Backup Protection के साथ)' },
            { icon: '📲', color: '#F09942', title: 'आपको Offer आया:', sub: "'क्या आप Backup Pandit बनेंगे?'" },
            { icon: '✅', color: '#15803D', title: 'आपने हाँ कहा। उस दिन Free रहे।', sub: '' },
          ].map((step, i) => (
            <div key={i}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: step.color + '20', border: `2px solid ${step.color}` }}>
                  {step.icon}
                </div>
                <div className="pt-1">
                  <p className="text-[18px] font-bold text-[#2D1B00]">{step.title}</p>
                  {step.sub && <p className="text-[15px] text-[#9B7B52] italic">{step.sub}</p>}
                </div>
              </div>
              {i < 2 && <div className="ml-4 h-5 w-0.5 border-l-2 border-dashed border-[#F0E6D3] my-1" />}
            </div>
          ))}
        </div>

        {/* Outcome table */}
        <div className="bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] rounded-[16px] overflow-hidden">
          <div className="flex bg-[#FEF3C7]">
            <div className="flex-1 p-3 text-center border-r border-[#F0E6D3]">
              <p className="text-[15px] font-bold text-[#6B4F2A]">मुख्य Pandit ने पूजा की</p>
            </div>
            <div className="flex-1 p-3 text-center">
              <p className="text-[15px] font-bold text-[#6B4F2A]">मुख्य Pandit Cancel किया</p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 p-5 text-center border-r border-[#F0E6D3]">
              <p className="text-[28px] font-bold text-[#15803D]">₹2,000</p>
              <p className="text-[14px] font-bold text-[#15803D]">(बिना कुछ किए!)</p>
            </div>
            <div className="flex-1 p-5 text-center">
              <p className="text-[20px] font-bold text-[#15803D]">Full Amount</p>
              <p className="text-[16px] font-bold text-[#15803D]">+ ₹2,000 Bonus</p>
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div className="bg-white rounded-[16px] border border-[#F0E6D3] overflow-hidden">
          <button
            onClick={() => setAccordionOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-[16px] font-bold text-[#2D1B00]"
          >
            <span>{accordionOpen ? '▾' : '▸'} यह पैसा कहाँ से आता है?</span>
          </button>
          {accordionOpen && (
            <div className="px-4 pb-4">
              <p className="text-[16px] text-[#6B4F2A]">
                ग्राहक ने Booking के समय Backup Protection की extra payment की थी। वही आपको मिलता है।
              </p>
            </div>
          )}
        </div>
      </div>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="अगला फ़ायदा →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
