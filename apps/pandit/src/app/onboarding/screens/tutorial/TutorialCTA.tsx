'use client'

import { useState } from 'react'
import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialCTAProps extends TutorialScreenProps {
  onRegisterNow: () => void
  onLater: () => void
}

/* ──────────────────────────────────────────────
   SVG: Confident Pandit holding a phone
   Traditional attire, temple arch behind him,
   soft warm radial glow — calm & dignified
────────────────────────────────────────────── */
function ReadyPanditIllustration() {
  return (
    <svg
      viewBox="0 0 220 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        {/* Warm radial glow behind figure */}
        <radialGradient id="glowCTA" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#FDBA74" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFFBF5" stopOpacity="0" />
        </radialGradient>
        {/* Subtle skin tone gradient */}
        <radialGradient id="skinGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#E8C49A" />
          <stop offset="100%" stopColor="#C9956A" />
        </radialGradient>
        {/* Phone screen gradient */}
        <linearGradient id="phoneScreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#BFDBFE" />
        </linearGradient>
      </defs>

      {/* ── Ambient glow disc ── */}
      <ellipse cx="110" cy="200" rx="85" ry="28" fill="#F09942" opacity="0.08" />
      <circle cx="110" cy="130" r="100" fill="url(#glowCTA)" />

      {/* ── Temple arch silhouette ── */}
      {/* Outer arch */}
      <path
        d="M30,240 L30,130 Q30,50 110,50 Q190,50 190,130 L190,240"
        stroke="#F0E6D3"
        strokeWidth="3"
        fill="none"
        opacity="0.7"
      />
      {/* Inner arch */}
      <path
        d="M50,240 L50,135 Q50,75 110,75 Q170,75 170,135 L170,240"
        stroke="#F0E6D3"
        strokeWidth="1.5"
        fill="none"
        opacity="0.45"
      />
      {/* Temple shikhara peak */}
      <polygon points="110,28 100,55 120,55" fill="#F0E6D3" opacity="0.65" />
      <polygon points="110,18 106,30 114,30" fill="#F09942" opacity="0.45" />
      {/* Small spire finial */}
      <circle cx="110" cy="16" r="3" fill="#F09942" opacity="0.5" />

      {/* ── Pandit body ── */}
      {/* Dhoti — lower body, ivory white */}
      <path
        d="M80,190 Q75,210 72,240 L148,240 Q145,210 140,190 Z"
        fill="#F5EED8"
        stroke="#E8D9B5"
        strokeWidth="1"
      />
      {/* Dhoti fold lines */}
      <line x1="96" y1="198" x2="92" y2="238" stroke="#E8D9B5" strokeWidth="0.8" opacity="0.7" />
      <line x1="110" y1="196" x2="110" y2="240" stroke="#E8D9B5" strokeWidth="0.8" opacity="0.7" />
      <line x1="124" y1="198" x2="128" y2="238" stroke="#E8D9B5" strokeWidth="0.8" opacity="0.7" />

      {/* Torso / kurta */}
      <rect x="82" y="140" width="56" height="55" rx="6" fill="#FFFBF5" stroke="#F0E6D3" strokeWidth="1" />

      {/* Angavastram (saffron shawl) draped over left shoulder */}
      <path
        d="M82,145 Q68,155 65,175 Q63,185 70,188 Q80,192 85,185 L88,155 Z"
        fill="#F09942"
        opacity="0.9"
      />
      {/* Shawl fold detail */}
      <path
        d="M82,145 Q76,160 74,178"
        stroke="#DC6803"
        strokeWidth="1"
        opacity="0.5"
        fill="none"
      />
      {/* Shawl tail hanging */}
      <path
        d="M65,175 Q60,188 58,200 Q56,210 62,212"
        stroke="#F09942"
        strokeWidth="3"
        fill="none"
        opacity="0.7"
        strokeLinecap="round"
      />

      {/* Janeu (sacred thread) */}
      <path
        d="M90,145 Q104,150 110,165 Q116,180 112,192"
        stroke="#E8C87A"
        strokeWidth="1.2"
        fill="none"
        opacity="0.8"
        strokeDasharray="3,2"
      />

      {/* ── Left arm — open, blessing gesture ── */}
      <path
        d="M82,155 Q66,160 60,178 Q58,185 64,186 Q70,187 74,180 L80,168"
        fill="#D4B896"
        stroke="#C9956A"
        strokeWidth="1"
      />
      {/* Left hand fingers */}
      <path d="M60,182 Q56,178 58,174 Q62,172 64,177" fill="#D4B896" stroke="#C9956A" strokeWidth="0.8" />
      <path d="M64,183 Q60,180 61,176 Q65,174 67,179" fill="#D4B896" stroke="#C9956A" strokeWidth="0.8" />

      {/* ── Right arm — holding a phone ── */}
      <path
        d="M138,155 Q152,158 158,172 Q162,182 156,186 L148,190 L140,175"
        fill="#D4B896"
        stroke="#C9956A"
        strokeWidth="1"
      />
      {/* Phone body */}
      <rect x="148" y="160" width="22" height="38" rx="4" fill="#2D1B00" />
      {/* Phone screen */}
      <rect x="150" y="163" width="18" height="28" rx="2" fill="url(#phoneScreen)" />
      {/* App UI elements on screen — saffron accent */}
      <rect x="152" y="166" width="14" height="4" rx="1" fill="#F09942" opacity="0.8" />
      <rect x="152" y="173" width="10" height="2.5" rx="1" fill="#9CA3AF" opacity="0.6" />
      <rect x="152" y="177" width="12" height="2.5" rx="1" fill="#9CA3AF" opacity="0.6" />
      <rect x="152" y="181" width="8" height="2.5" rx="1" fill="#9CA3AF" opacity="0.5" />
      {/* Small checkmark on screen */}
      <path d="M156,186 L158,188 L162,184" stroke="#15803D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Phone home indicator */}
      <rect x="155" y="194" width="8" height="1.5" rx="0.75" fill="#6B7280" opacity="0.5" />

      {/* ── Head ── */}
      {/* Neck */}
      <rect x="103" y="128" width="14" height="16" rx="4" fill="#D4B896" stroke="#C9956A" strokeWidth="0.8" />

      {/* Face — oval, soft */}
      <ellipse cx="110" cy="115" rx="22" ry="26" fill="url(#skinGrad)" stroke="#C9956A" strokeWidth="0.8" />

      {/* Eyes — gentle, slightly closed for calm look */}
      <path d="M102,111 Q104,109 106,111" stroke="#5C3D1E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M114,111 Q116,109 118,111" stroke="#5C3D1E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Lower eye lids — serene */}
      <path d="M102,111 Q104,113 106,111" stroke="#8B6340" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M114,111 Q116,113 118,111" stroke="#8B6340" strokeWidth="0.6" fill="none" opacity="0.5" />

      {/* Nose */}
      <path d="M109,115 Q107,120 110,122 Q113,120 111,115" fill="#C9956A" opacity="0.4" />

      {/* Gentle smile */}
      <path d="M104,124 Q110,128 116,124" stroke="#8B5A2B" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Tilak */}
      <path d="M109,103 L110,103 L111,103 Q110,107 110,108" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="110" cy="102" rx="2.5" ry="2" fill="#DC2626" opacity="0.85" />

      {/* Shikha (tuft of hair on top) */}
      <path d="M110,90 Q114,84 112,79 Q108,76 106,82 Q104,88 110,90" fill="#4A2C0A" opacity="0.7" />

      {/* Hair — dark, short */}
      <path
        d="M88,108 Q90,92 110,89 Q130,92 132,108"
        fill="#3A2008"
        opacity="0.85"
      />

      {/* ── OM symbol floating at top ── */}
      <text
        x="110"
        y="45"
        textAnchor="middle"
        fontSize="22"
        fill="#F09942"
        opacity="0.55"
        fontFamily="serif"
        fontWeight="bold"
      >
        ॐ
      </text>

      {/* ── Sparkle dots around figure ── */}
      <circle cx="55" cy="105" r="2.5" fill="#F09942" opacity="0.4" />
      <circle cx="52" cy="118" r="1.5" fill="#FDE68A" opacity="0.5" />
      <circle cx="165" cy="100" r="2" fill="#F09942" opacity="0.35" />
      <circle cx="168" cy="115" r="1.5" fill="#FDE68A" opacity="0.45" />
      <circle cx="76" cy="88" r="1.5" fill="#FDE68A" opacity="0.4" />
      <circle cx="144" cy="82" r="2" fill="#F09942" opacity="0.3" />
    </svg>
  )
}

export default function TutorialCTA({ language, onLanguageChange, currentDot, onBack, onRegisterNow, onLater }: TutorialCTAProps) {
  const [saved, setSaved] = useState(false)

  const handleLater = () => {
    setSaved(true)
    onLater()
  }

  useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: "बस इतना था परिचय। अब Registration शुरू कर सकते हैं। बिल्कुल मुफ़्त, दस मिनट लगेंगे। 'हाँ' बोलें या Button दबाएं।",
    onIntent: (intent) => {
      if (intent === 'YES' || intent === 'FORWARD') onRegisterNow()
      else if (intent === 'NO' || intent === 'SKIP') handleLater()
    },
    autoListen: false,
  })

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={true} onBack={onBack} onLanguageChange={onLanguageChange} />

      {/* Progress row — all 12 filled */}
      <div className="flex flex-col items-center pt-2">
        <ProgressDots total={12} current={currentDot} />
        <p className="text-[14px] text-[#15803D] font-semibold -mt-1 mb-1">✓ Tutorial पूरा हुआ</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {/* Hero illustration — pandit with phone + temple arch */}
        <div
          className="relative flex items-center justify-center animate-float"
          style={{ width: 200, height: 220 }}
        >
          <ReadyPanditIllustration />
        </div>

        {/* Headline */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-[32px] font-bold text-[#2D1B00] leading-tight">
            Registration शुरू करें?
          </h1>
          <div className="h-px w-20 bg-[#F0E6D3] mx-auto" />
          <p className="text-[22px] font-semibold text-[#15803D]">बिल्कुल मुफ़्त।</p>
          <p className="text-[20px] text-[#2D1B00]">10 मिनट लगेंगे।</p>
        </div>
      </div>

      {/* Button area */}
      <div className="px-6 pb-4 space-y-3">
        {saved ? (
          /* ── "Come back later" confirmation ── */
          <div className="space-y-3">
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-5 py-4 text-center space-y-1">
              <p className="text-[22px]">🙏</p>
              <p className="text-[18px] font-bold text-[#15803D]">ठीक है, पंडित जी।</p>
              <p className="text-[15px] text-[#166534]">आपकी Progress save हो गई।</p>
              <p className="text-[14px] text-[#4B7A52]">
                अगली बार App खोलने पर Registration<br />से ही शुरू होगा।
              </p>
            </div>
            <button
              onClick={onRegisterNow}
              className="w-full flex items-center justify-center text-white font-bold text-lg rounded-xl transition-transform active:scale-[0.98]"
              style={{ height: 56, backgroundColor: '#DC6803' }}
            >
              अभी Register करें →
            </button>
          </div>
        ) : (
          /* ── Normal CTA buttons ── */
          <>
            <button
              onClick={onRegisterNow}
              className="w-full flex items-center justify-center text-white font-bold text-xl rounded-xl transition-transform active:scale-[0.98] animate-cta-glow"
              style={{
                height: 72,
                backgroundColor: '#DC6803',
                boxShadow: '0 6px 20px rgba(220,104,3,0.45)',
              }}
            >
              ✅ हाँ, Registration शुरू करें →
            </button>
            <button
              onClick={handleLater}
              className="w-full h-14 bg-white border border-[#F0E6D3] text-[#6B4F2A] font-semibold text-lg rounded-xl"
            >
              बाद में करूँगा
            </button>
          </>
        )}

        {/* Helpline */}
        <div className="text-center pt-1">
          <div className="flex items-center justify-center gap-2 text-[#9B7B52]">
            <span>📞</span>
            <span>कोई सवाल?</span>
            <a href="tel:1800000000" className="font-bold text-[#F09942]">1800-HPJ-HELP</a>
            <span>(Toll Free)</span>
          </div>
          <p className="text-[14px] text-[#F09942] mt-0.5">सुबह 8 बजे – रात 10 बजे</p>
        </div>
      </div>
    </div>
  )
}
