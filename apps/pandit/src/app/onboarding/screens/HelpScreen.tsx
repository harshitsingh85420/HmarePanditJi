'use client'

import TopBar from '@/components/part0/TopBar'
import { SupportedLanguage } from '@/lib/onboarding-store'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'

interface HelpScreenProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  onBack: () => void
}

export default function HelpScreen({ language, onLanguageChange, onBack }: HelpScreenProps) {
  useVoiceFlow({
    language,
    voiceScript: 'कोई बात नहीं। हमारी Team से बात करें। यह बिल्कुल Free है। पीछे जाना हो तो "पीछे" बोलें।',
    onIntent: (intent) => {
      if (intent === 'BACK' || intent === 'NO') {
        onBack()
      }
    }
  })

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={false} onLanguageChange={onLanguageChange} />

      <div className="flex-1 flex flex-col items-center px-6 pt-6 gap-6">
        {/* Two-figure illustration: Pandit ↔ Support Agent */}
        <div className="flex items-center justify-center w-full max-w-[280px] h-[140px] animate-fade-in animate-float">
          <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
            <defs>
              <radialGradient id="helpGlow" cx="50%" cy="60%" r="50%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFFBF5" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="280" height="140" rx="16" fill="url(#helpGlow)" />

            {/* ── Left figure: Pandit ── */}
            {/* Body */}
            <rect x="28" y="62" width="30" height="46" rx="5" fill="#F5EDD8" />
            {/* Saffron angavastram */}
            <path d="M28,68 Q22,75 24,92 L34,88 Q32,76 28,68Z" fill="#F09942" opacity="0.9" />
            {/* Head */}
            <ellipse cx="43" cy="50" rx="14" ry="15" fill="#D4B896" />
            {/* Tilak */}
            <ellipse cx="43" cy="38" rx="2" ry="1.5" fill="#DC2626" opacity="0.85" />
            {/* Eyes */}
            <path d="M38,48 Q40,46.5 42,48" stroke="#5C3D1E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M44,48 Q46,46.5 48,48" stroke="#5C3D1E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Smile */}
            <path d="M39,54 Q43,57 47,54" stroke="#8B5A2B" strokeWidth="1" fill="none" strokeLinecap="round" />
            {/* Hair */}
            <path d="M30,44 Q31,37 43,36 Q55,37 56,44" fill="#3A2008" opacity="0.8" />
            {/* Left arm + hand waving */}
            <path d="M28,72 Q18,78 15,88" stroke="#D4B896" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="13" cy="91" rx="5" ry="4" fill="#D4B896" />
            {/* Pandit label */}
            <text x="43" y="120" textAnchor="middle" fontSize="9" fill="#9B7B52" fontFamily="sans-serif">पंडित जी</text>

            {/* ── Center: Speech / phone connecting both ── */}
            {/* Phone icon between them */}
            <rect x="120" y="50" width="40" height="56" rx="7" fill="#2D1B00" />
            <rect x="123" y="55" width="34" height="42" rx="4" fill="#DBEAFE" />
            {/* Chat bubbles on screen */}
            <rect x="126" y="59" width="18" height="8" rx="3" fill="#F09942" opacity="0.9" />
            <rect x="130" y="71" width="22" height="8" rx="3" fill="#DCFCE7" />
            <path d="M130,79 L128,84 L136,79" fill="#DCFCE7" />
            <rect x="126" y="83" width="16" height="8" rx="3" fill="#F09942" opacity="0.85" />
            <path d="M142,83 L144,88 L138,83" fill="#F09942" opacity="0.85" />
            {/* Phone home bar */}
            <rect x="133" y="101" width="14" height="2" rx="1" fill="#6B7280" opacity="0.4" />

            {/* Arrow lines from pandit to phone and from phone to agent */}
            <path d="M58,82 L118,82" stroke="#F09942" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" opacity="0.7" />
            <path d="M162,82 L218,82" stroke="#F09942" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" opacity="0.7" />
            {/* Arrow tips */}
            <path d="M116,78 L122,82 L116,86" stroke="#F09942" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            <path d="M220,78 L226,82 L220,86" stroke="#F09942" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

            {/* ── Right figure: Support Agent ── */}
            {/* Body */}
            <rect x="222" y="62" width="30" height="46" rx="5" fill="#EFF6FF" />
            {/* Blue accent shirt/uniform */}
            <path d="M252,68 Q258,75 256,92 L246,88 Q248,76 252,68Z" fill="#3B82F6" opacity="0.7" />
            {/* Head */}
            <ellipse cx="237" cy="50" rx="14" ry="15" fill="#C8A882" />
            {/* Eyes */}
            <path d="M232,48 Q234,46.5 236,48" stroke="#5C3D1E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M238,48 Q240,46.5 242,48" stroke="#5C3D1E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Smile */}
            <path d="M233,54 Q237,57 241,54" stroke="#8B5A2B" strokeWidth="1" fill="none" strokeLinecap="round" />
            {/* Hair */}
            <path d="M224,44 Q225,37 237,36 Q249,37 250,44" fill="#5C3D1A" opacity="0.7" />
            {/* Headset */}
            <path d="M226,44 Q225,36 237,35 Q249,36 248,44" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" />
            <rect x="222" y="44" width="5" height="8" rx="2.5" fill="#3B82F6" opacity="0.8" />
            <rect x="253" y="44" width="5" height="8" rx="2.5" fill="#3B82F6" opacity="0.8" />
            {/* Mic boom */}
            <path d="M224,50 Q220,55 222,60" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="221" cy="61" r="2" fill="#3B82F6" opacity="0.8" />
            {/* Right arm waving back */}
            <path d="M252,72 Q262,78 265,88" stroke="#C8A882" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="267" cy="91" rx="5" ry="4" fill="#C8A882" />
            {/* Agent label */}
            <text x="237" y="120" textAnchor="middle" fontSize="9" fill="#9B7B52" fontFamily="sans-serif">Team HPJ</text>
          </svg>
        </div>

        <div className="text-center animate-fade-in">
          <h1 className="text-[32px] font-bold text-[#2D1B00]">कोई बात नहीं।</h1>
          <p className="text-[20px] text-[#9B7B52] mt-1">हम मदद के लिए यहाँ हैं।</p>
        </div>

        <div className="w-full h-px bg-[#F0E6D3]" />

        {/* Phone card */}
        <button
          onClick={() => window.open('tel:1800000000')}
          className="w-full h-[72px] bg-[#F09942] rounded-[16px] shadow-[0_4px_12px_rgba(240,153,66,0.35)] flex items-center px-5 gap-4 animate-fade-up stagger-1"
          style={{ opacity: 0, animationFillMode: 'forwards' }}
        >
          <span className="text-2xl">📞</span>
          <div className="text-left">
            <p className="text-[20px] font-bold text-white">हमारी Team से बात करें</p>
            <p className="text-[15px] text-white/85">1800-HPJ-HELP | बिल्कुल Free</p>
          </div>
        </button>

        {/* WhatsApp card */}
        <button
          onClick={() => window.open('https://wa.me/911800000000')}
          className="w-full h-[64px] rounded-[16px] flex items-center px-5 gap-4 animate-fade-up stagger-2"
          style={{ backgroundColor: '#25D366', opacity: 0, animationFillMode: 'forwards' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <div className="text-left">
            <p className="text-white font-bold text-lg">WhatsApp पर लिखें</p>
            <p className="text-white/85 text-sm">Message भेजें, जवाब आएगा</p>
          </div>
        </button>

        {/* Or divider */}
        <p className="text-[#9B7B52] text-sm">─── या ───</p>

        <button onClick={onBack} className="text-[#9B7B52] text-[16px] font-medium underline">
          वापस जाएं / खुद करें
        </button>

        <p className="text-[14px] text-center text-[#9B7B52]">सुबह 8 बजे – रात 10 बजे</p>
      </div>
    </div>
  )
}
