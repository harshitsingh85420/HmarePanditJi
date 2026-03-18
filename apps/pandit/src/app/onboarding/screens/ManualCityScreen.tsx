'use client'

import TopBar from '@/components/part0/TopBar'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { SupportedLanguage } from '@/lib/onboarding-store'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'

interface ManualCityScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  onCitySelected: (city: string) => void
  onBack: () => void
}

const CITY_MAP: Record<string, string> = {
  'delhi': 'Delhi', 'dilli': 'Delhi',
  'varanasi': 'Varanasi', 'banaras': 'Varanasi', 'kashi': 'Varanasi',
  'patna': 'Patna', 'lucknow': 'Lucknow', 'mumbai': 'Mumbai', 'bombay': 'Mumbai',
  'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
  'chennai': 'Chennai', 'madras': 'Chennai',
  'hyderabad': 'Hyderabad', 'bengaluru': 'Bengaluru', 'bangalore': 'Bengaluru',
  'jaipur': 'Jaipur', 'bhopal': 'Bhopal', 'haridwar': 'Haridwar',
  'ujjain': 'Ujjain', 'mathura': 'Mathura', 'agra': 'Agra',
}

const POPULAR_CITIES = [
  { hindi: 'दिल्ली', english: 'Delhi' },
  { hindi: 'वाराणसी', english: 'Varanasi' },
  { hindi: 'पटना', english: 'Patna' },
  { hindi: 'लखनऊ', english: 'Lucknow' },
  { hindi: 'मुंबई', english: 'Mumbai' },
  { hindi: 'जयपुर', english: 'Jaipur' },
  { hindi: 'कोलकाता', english: 'Kolkata' },
  { hindi: 'भोपाल', english: 'Bhopal' },
  { hindi: 'हरिद्वार', english: 'Haridwar' },
  { hindi: 'उज्जैन', english: 'Ujjain' },
  { hindi: 'चेन्नई', english: 'Chennai' },
  { hindi: 'हैदराबाद', english: 'Hyderabad' },
]

export default function ManualCityScreen({
  language,
  onLanguageChange,
  onCitySelected,
  onBack,
}: ManualCityScreenProps) {
  const { isListening } = useVoiceFlow({
    language,
    voiceScript: 'Koi baat nahi. Apna shehar bataiye. Bol sakte hain ya neeche se chun sakte hain.',
    onIntent: (intent) => {
      if (intent.startsWith('RAW:')) {
        const transcript = intent.replace('RAW:', '')
        const lower = transcript.toLowerCase()
        for (const [key, city] of Object.entries(CITY_MAP)) {
          if (lower.includes(key)) {
            onCitySelected(city)
            return
          }
        }
      }
    },
    repromptScript: "Kripya apna shehar ka naam boliye. Jaise 'Delhi', 'Varanasi', 'Mumbai'.",
  })

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />

      <section className="flex-grow px-6 pt-6 flex flex-col gap-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <p className="text-[22px] text-[#9B7B52] font-medium">कोई बात नहीं।</p>
          <h1 className="text-[32px] font-bold leading-tight text-[#2D1B00]">अपना शहर बताइए</h1>
        </div>

        {/* Voice input card */}
        <div className="relative bg-[#FEF3C7] border-2 border-[#F09942] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 bg-[#F09942] rounded-full animate-ping opacity-30" />
            <div className="absolute inset-0 bg-[#F09942] rounded-full animate-ping opacity-20" style={{ animationDelay: '0.4s' }} />
            <div className="relative bg-[#F09942] rounded-full p-2.5 z-10">
              <svg fill="none" height="24" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-bold text-[#2D1B00]">अपना शहर बोलें</span>
            <span className="text-[16px] text-[#9B7B52]">जैसे: &apos;वाराणसी&apos; या &apos;दिल्ली&apos;</span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 text-sm font-medium text-[#9B7B52]/60">
          <div className="h-[1px] flex-grow bg-[#F0E6D3]" />
          <span>या नीचे से चुनें</span>
          <div className="h-[1px] flex-grow bg-[#F0E6D3]" />
        </div>

        {/* Popular cities */}
        <div className="space-y-3">
          <h2 className="text-[16px] font-semibold text-[#6B4F2A]">लोकप्रिय शहर</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.english}
                onClick={() => onCitySelected(city.english)}
                className="px-5 py-2.5 bg-white border border-[#F09942] text-[#F09942] rounded-full font-medium text-base hover:bg-[#FEF3C7] transition-colors"
              >
                {city.hindi}
              </button>
            ))}
          </div>
        </div>
      </section>

      <ScreenFooter isListening={isListening} onKeyboardToggle={() => {}}>
        <CTAButton label="आगे बढ़ें →" onClick={() => {}} variant="ghost" />
      </ScreenFooter>
    </div>
  )
}
