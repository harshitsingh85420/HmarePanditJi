'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

const TILES = [
  { icon: '🏠', title: 'ऑफलाइन पूजाएं', sub: '(पहले से हैं आप)', isNew: false },
  { icon: '📱', title: 'ऑनलाइन पूजाएं', sub: '(नया मौका)', isNew: true },
  { icon: '🎓', title: 'सलाह सेवा', sub: '(प्रति मिनट)', isNew: true },
  { icon: '🤝', title: 'बैकअप पंडित', sub: '(बिना कुछ किए)', isNew: true },
]

export default function TutorialIncome({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'वाराणसी के पंडित रामेश्वर शर्मा जी पहले अठारह हज़ार कमा रहे थे। आज वह तिरसठ हज़ार कमा रहे हैं। हम आपको भी यही तरीके दिखाएंगे।',
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
        {/* Screen title */}
        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
          आपकी कमाई कैसे बढ़ेगी?
        </h2>

        {/* Testimonial card — the hero element */}
        <div
          className="bg-white rounded-2xl overflow-hidden animate-card-reveal"
          style={{
            borderLeft: '5px solid #F09942',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
            padding: '20px 20px 20px 24px',
            animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards'
          }}
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0"
              style={{ backgroundColor: '#FEF3C7', border: '2px solid #F09942' }}
            >
              {/* Illustrated pandit avatar */}
              <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                <circle cx="24" cy="18" r="10" fill="#D4B896" />
                <path d="M15 40 Q15 28 24 28 Q33 28 33 40" fill="#F09942" />
                <path d="M14 22 Q24 44 34 22" fill="#F7F0E0" />
                <line x1="24" y1="10" x2="24" y2="14" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
                पंडित रामेश्वर शर्मा
              </p>
              <p style={{ fontSize: 15, color: '#9B7B52', fontFamily: 'Hind, sans-serif' }}>वाराणसी, UP</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t mb-4" style={{ borderColor: '#F0E6D3' }} />

          {/* Income before/after — the focal point */}
          <div className="flex items-end justify-around mb-4">
            {/* BEFORE column */}
            <div className="text-center">
              <p style={{ fontSize: 14, color: '#9B7B52', fontFamily: 'Hind, sans-serif', marginBottom: 4 }}>पहले:</p>
              <p
                className="line-through"
                style={{ fontSize: 24, fontWeight: 400, color: '#B0A090', fontFamily: 'Hind, sans-serif' }}
              >
                ₹18,000
              </p>
              <p style={{ fontSize: 14, color: '#B0A090' }}>/महीना</p>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: 28, color: '#F09942' }}>→</div>

            {/* AFTER column — larger, bold, green */}
            <div className="text-center">
              <p style={{ fontSize: 14, fontWeight: 600, color: '#6B4F2A', fontFamily: 'Hind, sans-serif', marginBottom: 4 }}>अब:</p>
              <p
                style={{ fontSize: 32, fontWeight: 700, color: '#15803D', fontFamily: 'Hind, sans-serif' }}
              >
                ₹63,000
              </p>
              <p style={{ fontSize: 16, color: '#15803D' }}>/महीना</p>
            </div>
          </div>

          {/* Verified badge */}
          <div
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 animate-heartbeat"
            style={{ backgroundColor: '#DCFCE7', border: '1px solid #15803D' }}
          >
            <span style={{ fontSize: 14, color: '#15803D' }}>✓</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#15803D', fontFamily: 'Hind, sans-serif' }}>
              HmarePanditJi Verified
            </span>
          </div>
        </div>

        {/* Section subtitle */}
        <p style={{ fontSize: 20, fontWeight: 600, color: '#6B4F2A', fontFamily: 'Hind, sans-serif' }}>
          3 नए तरीकों से यह हुआ:
        </p>

        {/* 2×2 income tile grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {TILES.map((tile, i) => (
            <div
              key={i}
              className={`relative rounded-xl flex flex-col justify-center animate-fade-up stagger-${i + 1}`}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #F0E6D3',
                padding: '14px 16px',
                height: 80,
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              {tile.isNew && (
                <span
                  className="absolute top-1 right-1.5 rounded-full"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    backgroundColor: '#F09942',
                    color: '#FFFFFF',
                    padding: '2px 6px',
                  }}
                >
                  NEW
                </span>
              )}
              <p style={{ fontSize: 20, marginBottom: 2 }}>{tile.icon}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif', lineHeight: 1.2 }}>
                {tile.title}
              </p>
              <p style={{ fontSize: 12, color: '#9B7B52', fontFamily: 'Hind, sans-serif' }}>{tile.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <ScreenFooter isListening={isListening}>
        <CTAButton label="और देखें →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
