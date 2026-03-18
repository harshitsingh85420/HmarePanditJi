'use client'

import TopBar from '@/components/part0/TopBar'
import VoiceIndicator from '@/components/part0/VoiceIndicator'
import CTAButton from '@/components/part0/CTAButton'
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'

interface LanguageConfirmScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  detectedCity: string
  onConfirm: () => void
  onChange: () => void
}

export default function LanguageConfirmScreen({
  language,
  onLanguageChange,
  detectedCity,
  onConfirm,
  onChange,
}: LanguageConfirmScreenProps) {
  const { isListening } = useVoiceFlow({
    language,
    voiceScript: `${detectedCity} ke hisaab se hum ${language} set kar rahe hain. Kya yeh theek hai? Haan bolein ya Doosri bolein.`,
    onIntent: (intent) => {
      if (intent === 'YES') onConfirm()
      else if (intent === 'NO' || intent === 'CHANGE') onChange()
    },
    repromptScript: "Kripya 'Haan' ya 'Doosri' bolein, ya neeche button dabayein.",
  })

  const display = LANGUAGE_DISPLAY[language]

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onChange} onLanguageChange={onLanguageChange} />

      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        {/* City chip */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FEF3C7] border border-[#F09942] text-[#9B7B52] text-sm font-medium mb-10">
          <span className="mr-1">📍</span>
          <span>{detectedCity || 'Unknown City'}</span>
        </div>

        {/* Hero language card */}
        <section className="w-full bg-white rounded-[20px] py-10 px-8 flex flex-col items-center shadow-[0_4px_24px_rgba(0,0,0,0.10)]" style={{ animation: 'gentleFloat 3s ease-in-out infinite' }}>
          {/* Script char */}
          <div className="text-[64px] font-bold mb-2 shimmer-text">{display.scriptChar}</div>
          {/* Language name */}
          <h1 className="text-[48px] font-bold leading-tight mb-4 text-[#2D1B00]">{display.nativeName}</h1>
          {/* Divider */}
          <div className="w-20 h-px bg-[#F0E6D3] mb-4" />
          {/* Question */}
          <p className="text-[22px] text-[#6B4F2A] text-center leading-snug">
            क्या इस भाषा में बात करना चाहेंगे?
          </p>
        </section>

        {/* Voice status */}
        <div className="mt-10 flex flex-col items-center">
          <VoiceIndicator isListening={isListening} label="'हाँ' या 'बदलें' बोलें" />
          {!isListening && (
            <p className="text-[#9B7B52] text-sm italic mt-1">&ldquo;&apos;हाँ&apos; या &apos;बदलें&apos; बोलें&rdquo;</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <footer className="p-6 space-y-3 mb-6">
        <CTAButton label="हाँ, यही भाषा सही है" onClick={onConfirm} variant="primary" />
        <CTAButton label="दूसरी भाषा चुनें" onClick={onChange} variant="secondary" />
      </footer>

      <style>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
