'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialTravel({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'Booking confirm hote hi, train, hotel, khaana — sab platform plan kar dega. Aur jo din free nahi, woh block ho jayega. Double booking ho hi nahi sakti.',
    onIntent: (intent) => {
      if (intent === 'FORWARD' || intent === 'YES') onNext()
      else if (intent === 'BACK') onBack()
      else if (intent === 'SKIP') onSkip()
    },
  })

  const SEPTEMBER_GRID = [
    null, null, null, null, null, true, true,
    false, false, false, false, false, false, false,
    false, 'BLOCK', 'BLOCK', false, false, false, false,
  ]

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />
      <div className="flex items-center justify-between px-4 pt-2">
        <ProgressDots total={12} current={currentDot} />
        <SkipButton onClick={onSkip} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <h2 className="text-[30px] font-bold text-[#2D1B00]">यात्रा की चिंता</h2>
          <p className="text-[30px] font-bold text-[#15803D]">हम करते हैं।</p>
        </div>

        {/* Auto Travel card */}
        <div className="bg-[#FEF3C7] border-2 border-[#F09942] rounded-[16px] p-4">
          <p className="text-[16px] font-bold text-[#6B4F2A] mb-3">⚡ Auto Travel Planner</p>
          <div className="space-y-2">
            {[
              { icon: '🚕', label: 'Cab', value: 'Auto Book' },
              { icon: '🚂', label: 'Train (दूर के लिए)', value: 'Best Seat' },
              { icon: '🏨', label: 'Hotel (रात रुकने पर)', value: 'Check Out → Auto' },
              { icon: '🍽️', label: 'खाना', value: 'Order Reminder' },
            ].map((row, i) => (
              <div key={i} className="bg-white rounded-xl flex items-center h-11 px-3 gap-3">
                <span className="text-xl">{row.icon}</span>
                <span className="text-[16px] text-[#2D1B00] flex-1">{row.label}</span>
                <span className="text-[14px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-[16px] shadow-[0_2px_16px_rgba(0,0,0,0.08)] p-4">
          <p className="text-[16px] font-bold text-[#2D1B00] mb-3">📅 Auto Block Calendar</p>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="h-7 flex items-center justify-center">
                <span className="text-[11px] font-bold" style={{ color: '#F09942' }}>{d}</span>
              </div>
            ))}
          </div>
          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1">
            {SEPTEMBER_GRID.map((cell, i) => {
              const dateNum = i - 3 // adjust offset
              if (cell === null) return <div key={i} />
              if (cell === 'BLOCK') {
                return (
                  <div key={i} className="h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                    <span className="text-[16px] font-bold text-[#DC2626]">✕</span>
                  </div>
                )
              }
              return (
                <div key={i} className="h-9 rounded-md flex items-center justify-center bg-gray-50">
                  <span className="text-[11px] text-[#2D1B00]">{dateNum + 4}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-[15px] text-center text-[#9B7B52] italic">एक बार Set करो। Double Booking हो ही नहीं सकती।</p>
        </div>
      </div>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="अगला फ़ायदा →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
