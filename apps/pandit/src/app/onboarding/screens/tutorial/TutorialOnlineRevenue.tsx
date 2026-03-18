'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialOnlineRevenue({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'Do bilkul naye tarike. Pehla — Ghar Baithe Pooja. Video call se do hazaar se paanch hazaar ek pooja. Doosra — Pandit Se Baat. Bees minute ki call mein aath sau rupe.',
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
        <div>
          <h2 className="text-[30px] font-bold text-[#2D1B00]">घर बैठे भी कमाई</h2>
          <p className="text-[17px] italic text-[#9B7B52]">(2 नए तरीके जो आप नहीं जानते)</p>
        </div>

        {/* Card 1 */}
        <div className="bg-[#FEF3C7] border-2 border-[#F09942] rounded-[16px] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">🎥</div>
            <p className="text-[22px] font-bold text-[#2D1B00]">घर बैठे पूजा</p>
          </div>
          <p className="text-[17px] text-[#6B4F2A] mb-3">
            Video call से पूजा कराएं। दुनिया भर के ग्राहक मिलेंगे — NRI भी।
          </p>
          <div className="inline-flex items-center bg-white border border-[#15803D] rounded-full px-4 py-1">
            <p className="text-[18px] font-bold text-[#15803D]">₹2,000 – ₹5,000 प्रति पूजा</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#F0E6D3] rounded-[16px] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center text-2xl">🎓</div>
            <p className="text-[22px] font-bold text-[#2D1B00]">पंडित से बात</p>
          </div>
          <p className="text-[17px] text-[#6B4F2A] mb-3">
            Phone / Video / Chat पर सलाह दें। आपका ज्ञान अब बिकेगा।
          </p>
          <div className="inline-flex items-center bg-[#DCFCE7] border border-[#15803D] rounded-full px-3 py-1 mb-3">
            <p className="text-[15px] font-bold text-[#15803D]">₹20 – ₹50 प्रति मिनट</p>
          </div>
          {/* Worked example */}
          <div className="bg-[#FEF3C7] rounded-xl p-3">
            <p className="text-[17px] font-bold text-[#F09942]">उदाहरण: 20 मिनट = ₹800 आपको</p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="bg-[#FEF3C7] border border-dashed border-[#F09942] rounded-xl p-3 text-center">
          <p className="text-[18px] font-semibold text-[#2D1B00]">
            दोनों मिलाकर <strong className="text-[#F09942]">₹40,000+</strong> अलग से हर महीने
          </p>
        </div>
      </div>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="अगला फ़ायदा →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
