'use client'

import { useState } from 'react'
import TopBar from '@/components/part0/TopBar'
import ScreenFooter from '@/components/part0/ScreenFooter'
import { SupportedLanguage } from '@/lib/onboarding-store'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'

interface ManualCityScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  onCitySelected: (city: string) => void
  onBack: () => void
}

const CITY_MAP: Record<string, string> = {
  'delhi': 'Delhi', 'dilli': 'Delhi', 'new delhi': 'Delhi',
  'varanasi': 'Varanasi', 'banaras': 'Varanasi', 'kashi': 'Varanasi',
  'patna': 'Patna', 'lucknow': 'Lucknow', 'mumbai': 'Mumbai', 'bombay': 'Mumbai',
  'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
  'chennai': 'Chennai', 'madras': 'Chennai',
  'hyderabad': 'Hyderabad', 'bengaluru': 'Bengaluru', 'bangalore': 'Bengaluru',
  'jaipur': 'Jaipur', 'bhopal': 'Bhopal', 'haridwar': 'Haridwar',
  'ujjain': 'Ujjain', 'mathura': 'Mathura', 'agra': 'Agra',
  'ayodhya': 'Ayodhya', 'prayagraj': 'Prayagraj', 'allahabad': 'Prayagraj',
  'nashik': 'Nashik', 'shirdi': 'Shirdi', 'pune': 'Pune',
  'indore': 'Indore', 'nagpur': 'Nagpur', 'surat': 'Surat',
  'ahmedabad': 'Ahmedabad', 'amritsar': 'Amritsar', 'chandigarh': 'Chandigarh',
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

// Search: filter cities by hindi or english name
const ALL_CITIES_SEARCHABLE = [
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
  { hindi: 'बेंगलुरु', english: 'Bengaluru' },
  { hindi: 'पुणे', english: 'Pune' },
  { hindi: 'अहमदाबाद', english: 'Ahmedabad' },
  { hindi: 'इंदौर', english: 'Indore' },
  { hindi: 'नागपुर', english: 'Nagpur' },
  { hindi: 'अयोध्या', english: 'Ayodhya' },
  { hindi: 'प्रयागराज', english: 'Prayagraj' },
  { hindi: 'मथुरा', english: 'Mathura' },
  { hindi: 'आगरा', english: 'Agra' },
  { hindi: 'नासिक', english: 'Nashik' },
  { hindi: 'सूरत', english: 'Surat' },
  { hindi: 'अमृतसर', english: 'Amritsar' },
  { hindi: 'चंडीगढ़', english: 'Chandigarh' },
]

export default function ManualCityScreen({
  language,
  onLanguageChange,
  onCitySelected,
  onBack,
}: ManualCityScreenProps) {
  const [searchText, setSearchText] = useState('')

  const { isListening } = useVoiceFlow({
    language,
    voiceScript: 'कोई बात नहीं। अपना शहर बताइए। बोल सकते हैं या नीचे से चुन सकते हैं।',
    onIntent: (intent) => {
      if (intent.startsWith('RAW:')) {
        const transcript = intent.replace('RAW:', '')
        const lower = transcript.toLowerCase()
        
        // Match against Hindi and English names directly
        for (const cityObj of ALL_CITIES_SEARCHABLE) {
          if (lower.includes(cityObj.hindi.toLowerCase()) || lower.includes(cityObj.english.toLowerCase())) {
            onCitySelected(cityObj.english)
            return
          }
        }
        
        // Fallback to CITY_MAP (aliases)
        for (const [key, city] of Object.entries(CITY_MAP)) {
          if (lower.includes(key)) {
            onCitySelected(city)
            return
          }
        }
      }
    },
    repromptScript: "कृपया अपने शहर का नाम बोलिए। जैसे 'दिल्ली', 'वाराणसी', 'मुंबई'।",
  })

  // Filter cities based on search text
  const filteredCities = searchText.trim()
    ? ALL_CITIES_SEARCHABLE.filter(c =>
        c.hindi.toLowerCase().includes(searchText.toLowerCase()) ||
        c.english.toLowerCase().includes(searchText.toLowerCase())
      )
    : null

  const handleSearchSubmit = () => {
    if (!searchText.trim()) return
    // Try exact match first
    const lower = searchText.trim().toLowerCase()
    const match = ALL_CITIES_SEARCHABLE.find(
      c => c.english.toLowerCase() === lower || c.hindi === searchText.trim()
    )
    if (match) {
      onCitySelected(match.english)
      return
    }
    // Partial match from CITY_MAP
    for (const [key, city] of Object.entries(CITY_MAP)) {
      if (lower.includes(key) || key.includes(lower)) {
        onCitySelected(city)
        return
      }
    }
    // Use as-is if no match (custom city)
    onCitySelected(searchText.trim())
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />

      <section className="flex-grow px-4 pt-5 flex flex-col gap-5 overflow-y-auto pb-4">
        {/* Title */}
        <div className="text-center space-y-1 animate-fade-in">
          <p className="text-[22px] text-[#9B7B52] font-medium">कोई बात नहीं।</p>
          <h1 className="text-[32px] font-bold leading-tight text-[#2D1B00]">अपना शहर बताइए</h1>
        </div>

        {/* ── Voice input card ── */}
        <div className="relative bg-[#FEF3C7] border-2 border-[#F09942] rounded-[16px] p-5 flex items-center gap-4 shadow-sm animate-fade-up stagger-1" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          {/* Animated mic */}
          <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#F09942] animate-ripple opacity-25" />
            <div className="absolute inset-0 rounded-full bg-[#F09942] animate-ripple-delay opacity-15" />
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

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 text-sm font-medium text-[#9B7B52]/60 animate-fade-up stagger-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="h-px flex-grow bg-[#F0E6D3]" />
          <span className="text-[16px] text-[#9B7B52]">या नीचे से चुनें</span>
          <div className="h-px flex-grow bg-[#F0E6D3]" />
        </div>

        {/* ── Text search bar ── */}
        <div className="relative animate-fade-up stagger-3" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-[#9B7B52]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="अपना शहर लिखें..."
            className="w-full h-[56px] bg-white border-[1.5px] border-[#F0E6D3] rounded-xl pl-12 pr-10 text-[18px] text-[#2D1B00] placeholder-[#9B7B52] focus:outline-none focus:border-[#F09942] transition-colors"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#9B7B52]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Search results ── */}
        {filteredCities !== null && (
          <div className="space-y-2">
            {filteredCities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-[16px] text-[#9B7B52] text-center">
                  &ldquo;{searchText}&rdquo; नहीं मिला
                </p>
                <button
                  onClick={() => onCitySelected(searchText.trim())}
                  className="h-[56px] px-6 bg-[#F09942] text-white rounded-xl text-[18px] font-bold"
                >
                  &ldquo;{searchText}&rdquo; इस्तेमाल करें →
                </button>
              </div>
            ) : (
              filteredCities.map(city => (
                <button
                  key={city.english}
                  onClick={() => onCitySelected(city.english)}
                  className="w-full h-[56px] flex items-center px-4 bg-white border border-[#F0E6D3] rounded-xl text-left hover:border-[#F09942] hover:bg-[#FEF3C7] active:scale-[0.98] transition-all"
                >
                  <span className="text-[#9B7B52] mr-3">📍</span>
                  <span className="text-[18px] font-medium text-[#2D1B00]">{city.hindi}</span>
                  <span className="ml-2 text-[15px] text-[#9B7B52]">({city.english})</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* ── Popular cities (shown when not searching) ── */}
        {filteredCities === null && (
          <div className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#6B4F2A]">लोकप्रिय शहर</h2>
            {[POPULAR_CITIES.slice(0, 6), POPULAR_CITIES.slice(6)].map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {row.map((city, chipIdx) => (
                  <button
                    key={city.english}
                    onClick={() => onCitySelected(city.english)}
                    className="animate-glide-in flex-shrink-0 h-[56px] px-5 bg-white border-[1.5px] border-[#F09942] text-[#F09942] rounded-full font-medium text-[18px] hover:bg-[#FEF3C7] active:scale-[0.96] transition-all"
                    style={{ animationDelay: `${(rowIdx * 6 + chipIdx) * 0.06}s` }}
                  >
                    {city.hindi}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <ScreenFooter isListening={isListening}>
        <></>
      </ScreenFooter>
    </div>
  )
}
