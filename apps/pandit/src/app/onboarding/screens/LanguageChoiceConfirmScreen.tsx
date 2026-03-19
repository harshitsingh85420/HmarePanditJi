'use client'

import TopBar from '@/components/part0/TopBar'
import VoiceIndicator from '@/components/part0/VoiceIndicator'
import CTAButton from '@/components/part0/CTAButton'
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'

interface LanguageChoiceConfirmScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  pendingLanguage: SupportedLanguage
  onConfirm: () => void
  onReject: () => void
}

export default function LanguageChoiceConfirmScreen({
  language,
  onLanguageChange,
  pendingLanguage,
  onConfirm,
  onReject,
}: LanguageChoiceConfirmScreenProps) {
  const { isListening } = useVoiceFlow({
    language,
    voiceScript: `आपने ${pendingLanguage} कही। सही है? हाँ या नहीं बोलें।`,
    onIntent: (intent) => {
      if (intent === 'YES') onConfirm()
      else if (intent === 'NO' || intent === 'CHANGE') onReject()
    },
  })

  const display = LANGUAGE_DISPLAY[pendingLanguage]

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onReject} onLanguageChange={onLanguageChange} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Language name */}
        <div className="text-center">
          <p className="text-[56px] font-bold text-[#F09942] leading-tight">{display.nativeName}</p>
          <p className="text-[24px] text-[#9B7B52] mt-1">{display.latinName}</p>
        </div>

        {/* Divider */}
        <div className="w-[60px] h-px bg-[#F0E6D3]" />

        {/* Question */}
        <h2 className="text-[26px] font-semibold text-[#2D1B00] text-center">
          क्या यही भाषा सही है?
        </h2>

        <VoiceIndicator isListening={isListening} label="'हाँ' या 'नहीं' बोलें" />
      </div>

      <footer className="p-6 space-y-3 mb-6">
        <CTAButton label="हाँ, यही भाषा चाहिए" onClick={onConfirm} variant="primary" />
        <CTAButton label="नहीं, फिर से चुनूँगा" onClick={onReject} variant="secondary" />
      </footer>
    </div>
  )
}
