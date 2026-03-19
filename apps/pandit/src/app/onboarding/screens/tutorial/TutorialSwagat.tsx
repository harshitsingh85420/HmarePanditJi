'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

// Pandit seated illustration — flat vector, warm saffron+cream palette
function PanditIllustration() {
  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Warm ambient glow behind figure */}
      <defs>
        <radialGradient id="glowSw" cx="50%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#F5C07A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F5C07A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="140" cy="130" rx="100" ry="90" fill="url(#glowSw)" />

      {/* Aasan (seat) — subtle wooden platform */}
      <rect x="85" y="195" width="110" height="14" rx="6" fill="#E8D5B0" />
      <rect x="90" y="200" width="100" height="6" rx="3" fill="#D4B896" />

      {/* Dhoti — white/cream draped lower garment */}
      <path d="M105 155 Q100 185 95 205 L185 205 Q180 185 175 155 Q155 170 140 168 Q125 170 105 155Z" fill="#F7F0E0" />
      <path d="M108 158 Q106 175 103 195" stroke="#E8D5B0" strokeWidth="1.5" />
      <path d="M172 158 Q174 175 177 195" stroke="#E8D5B0" strokeWidth="1.5" />
      {/* Dhoti fold lines */}
      <path d="M120 175 Q140 180 160 175" stroke="#E0D0BB" strokeWidth="1" />

      {/* Angavastram — saffron upper cloth draped over left shoulder */}
      <path d="M108 120 Q95 130 90 155 L105 155 Q115 135 120 120Z" fill="#F09942" opacity="0.9" />
      <path d="M108 120 Q103 145 102 165" stroke="#DC6803" strokeWidth="1.2" />
      {/* Left arm with angavastram drape */}
      <path d="M108 120 Q95 140 92 160" stroke="#F09942" strokeWidth="6" strokeLinecap="round" />

      {/* Torso — cream dhoti upper body suggestion */}
      <path d="M118 90 Q110 100 108 120 Q130 130 140 130 Q150 130 172 120 Q170 100 162 90 Q150 95 140 95 Q130 95 118 90Z" fill="#F5EDD8" />

      {/* Janeu — sacred thread across chest */}
      <path d="M128 95 Q135 110 142 115 Q148 118 152 108" stroke="#E8C87A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Right arm — gentle mudra/blessing gesture */}
      <path d="M172 120 Q185 130 188 150" stroke="#D4B896" strokeWidth="6" strokeLinecap="round" />
      {/* Hand (right) in mudra — fingers slightly raised */}
      <ellipse cx="188" cy="154" rx="8" ry="6" fill="#D4B896" />
      <path d="M183 150 Q180 145 183 142" stroke="#C4A87A" strokeWidth="2" strokeLinecap="round" />
      <path d="M187 149 Q185 143 188 141" stroke="#C4A87A" strokeWidth="2" strokeLinecap="round" />
      <path d="M192 151 Q191 144 194 143" stroke="#C4A87A" strokeWidth="2" strokeLinecap="round" />

      {/* Left arm extended slightly */}
      <path d="M92 160 Q88 168 90 175" stroke="#D4B896" strokeWidth="6" strokeLinecap="round" />

      {/* Head / face — soft impressionistic oval, no sharp features */}
      <ellipse cx="140" cy="72" rx="26" ry="28" fill="#D4B896" />
      {/* Tilak on forehead */}
      <line x1="140" y1="52" x2="140" y2="59" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="140" cy="51" rx="3" ry="2" fill="#DC2626" />
      {/* Very gentle eye suggestions */}
      <path d="M130 68 Q133 66 136 68" stroke="#8B6A45" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M144 68 Q147 66 150 68" stroke="#8B6A45" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Gentle smile */}
      <path d="M134 78 Q140 82 146 78" stroke="#8B6A45" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Hair / head covering suggestion — clean border */}
      <path d="M115 62 Q125 48 140 46 Q155 48 165 62 Q165 55 155 50 Q148 46 140 45 Q132 46 125 50 Q115 55 115 62Z" fill="#5C3D1A" />

      {/* Floor pattern hint — subtle geometric */}
      <path d="M70 208 L210 208" stroke="#F0E6D3" strokeWidth="1" />
    </svg>
  )
}

export default function TutorialSwagat({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'नमस्ते पंडित जी। HmarePanditJi पर आपका स्वागत है। यह Platform आपके लिए बना है। अगले दो मिनट में हम देखेंगे कि यह App आपकी आमदनी में क्या बदलाव ला सकता है।',
    onIntent: (intent) => {
      if (intent === 'FORWARD' || intent === 'YES') onNext()
      else if (intent === 'BACK') onBack()
      else if (intent === 'SKIP') onSkip()
    },
  })

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <TopBar showBack={false} onLanguageChange={onLanguageChange} />

      {/* Progress + Skip */}
      <div className="flex items-center justify-between px-4 pt-2">
        <ProgressDots total={12} current={currentDot} />
        <SkipButton onClick={onSkip} />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-4 gap-4">
        {/* Hero Illustration — 240px tall, card-reveal entrance */}
        <div
          className="relative w-full max-w-[358px] h-[240px] animate-card-reveal"
          style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
        >
          {/* Saffron glow circle behind illustration */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full animate-pulse-amber"
            style={{ background: 'radial-gradient(circle at center, rgba(245,192,122,0.6) 0%, transparent 70%)' }}
          />
          <div className="animate-float w-full h-full relative z-10">
            <PanditIllustration />
          </div>
        </div>

        {/* Greeting — staggered fade-up */}
        <div className="text-center">
          <p
            className="font-bold leading-tight opacity-0 animate-fade-up stagger-1"
            style={{ fontSize: 40, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}
          >
            नमस्ते
          </p>
          <p
            className="font-bold leading-tight opacity-0 animate-fade-up stagger-2"
            style={{ fontSize: 40, color: '#F09942', fontFamily: 'Hind, sans-serif' }}
          >
            पंडित जी।
          </p>
          <p
            className="mt-2 opacity-0 animate-fade-up stagger-3"
            style={{ fontSize: 22, color: '#6B4F2A', fontFamily: 'Hind, sans-serif' }}
          >
            HmarePanditJi पर आपका स्वागत है।
          </p>
        </div>

        {/* Thin divider */}
        <div
          className="w-20 h-px opacity-0 animate-fade-up stagger-4"
          style={{ backgroundColor: '#F0E6D3' }}
        />

        {/* Mool Mantra — italic, centered, quiet */}
        <div
          className="text-center italic opacity-0 animate-fade-up stagger-5"
          style={{ fontSize: 20, color: '#9B7B52', fontFamily: 'Hind, sans-serif', lineHeight: 1.7 }}
        >
          <p>&ldquo;App पंडित के लिए है,</p>
          <p>पंडित App के लिए नहीं।&rdquo;</p>
        </div>
      </div>

      <ScreenFooter isListening={isListening}>
        <CTAButton label="जानें (सिर्फ 2 मिनट) →" onClick={onNext} variant="primary" />
        <CTAButton label="Registration पर सीधे जाएं" onClick={onSkip} variant="ghost" />
      </ScreenFooter>
    </div>
  )
}
