'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialDakshina({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'अब कोई मोलभाव नहीं होगा। आप दक्षिणा खुद तय करेंगे। Platform कभी नहीं बदलेगी। ग्राहक को Booking से पहले ही पता है कि आपकी दक्षिणा कितनी है।',
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
        {/* Headline + ✕ illustration */}
        <div className="text-center animate-fade-in">
          <h2 style={{ fontSize: 34, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
            अब कोई मोलभाव नहीं।
          </h2>
          {/* Hands + X illustration */}
          <div className="flex items-center justify-center mt-3 animate-float">
            <svg viewBox="0 0 140 80" fill="none" className="w-36 h-20">
              {/* Left hand offering money */}
              <g transform="translate(8,28)">
                <ellipse cx="24" cy="32" rx="22" ry="12" fill="#D4B896" />
                <rect x="10" y="20" width="28" height="16" rx="4" fill="#D4B896" />
                {/* Fingers */}
                <rect x="12" y="12" width="6" height="12" rx="3" fill="#D4B896" />
                <rect x="20" y="10" width="6" height="14" rx="3" fill="#D4B896" />
                <rect x="28" y="11" width="6" height="13" rx="3" fill="#D4B896" />
                <rect x="36" y="14" width="5" height="10" rx="2.5" fill="#D4B896" />
                {/* Coins (₹) */}
                <ellipse cx="24" cy="18" rx="8" ry="5" fill="#F0D060" />
                <text x="20" y="21" fontSize="7" fill="#DC6803" fontWeight="bold">₹</text>
              </g>
              {/* Right hand — palm out, STOP gesture */}
              <g transform="translate(95,18)">
                <rect x="5" y="20" width="30" height="20" rx="4" fill="#D4B896" />
                <rect x="7" y="8" width="6" height="16" rx="3" fill="#D4B896" />
                <rect x="15" y="5" width="6" height="18" rx="3" fill="#D4B896" />
                <rect x="23" y="6" width="6" height="17" rx="3" fill="#D4B896" />
                <rect x="31" y="9" width="5" height="14" rx="2.5" fill="#D4B896" />
              </g>
              {/* Large red ✕ — the dominant element */}
              <text x="55" y="50" fontSize="38" fontWeight="900" fill="#DC2626" textAnchor="middle">✕</text>
            </svg>
          </div>
        </div>

        {/* BEFORE card — pain scenario */}
        <div
          className="rounded-2xl overflow-hidden animate-fade-up stagger-1"
          style={{
            backgroundColor: '#FEE2E2',
            border: '1.5px solid #DC2626',
            padding: '16px 20px',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, color: '#DC2626', marginBottom: 10, fontFamily: 'Hind, sans-serif' }}>
            ❌ पहले:
          </p>
          {/* Customer speech bubble */}
          <div
            className="rounded-xl rounded-bl-none shadow-sm mb-2"
            style={{ backgroundColor: '#FFFFFF', padding: '10px 14px' }}
          >
            <p style={{ fontSize: 14, fontWeight: 700, color: '#6B4F2A', marginBottom: 3 }}>😒 ग्राहक:</p>
            <p style={{ fontSize: 18, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
              &ldquo;1,500 में हो जाएगा?&rdquo;
            </p>
          </div>
          {/* Pandit response — sad, resigned */}
          <div
            className="rounded-xl rounded-br-none ml-10 shadow-sm"
            style={{ backgroundColor: '#F5E8E8', padding: '10px 14px' }}
          >
            <p style={{ fontSize: 14, fontWeight: 700, color: '#6B4F2A', marginBottom: 3 }}>😔 आप:</p>
            <p
              className="italic"
              style={{ fontSize: 18, color: '#9B7B52', fontFamily: 'Hind, sans-serif' }}
            >
              (चुप रह गए...)
            </p>
          </div>
        </div>

        {/* Connector arrow */}
        <div className="flex justify-center">
          <span style={{ fontSize: 20, color: '#9B7B52' }}>↓</span>
        </div>

        {/* AFTER card — dignified solution */}
        <div
          className="rounded-2xl animate-fade-up stagger-2"
          style={{
            backgroundColor: '#DCFCE7',
            border: '1.5px solid #15803D',
            padding: '16px 20px',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, color: '#15803D', marginBottom: 10, fontFamily: 'Hind, sans-serif' }}>
            ✅ अब:
          </p>
          {/* Nested price card */}
          <div
            className="rounded-xl"
            style={{
              backgroundColor: '#FFFFFF',
              padding: '14px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 600, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
              सत्यनारायण पूजा
            </p>
            <div className="border-t my-2" style={{ borderColor: '#F0E6D3' }} />
            <div className="flex items-baseline justify-between">
              <p style={{ fontSize: 16, color: '#9B7B52', fontFamily: 'Hind, sans-serif' }}>आपकी दक्षिणा:</p>
              <div className="flex items-baseline gap-1">
                <p style={{ fontSize: 26, fontWeight: 700, color: '#15803D', fontFamily: 'Hind, sans-serif' }}>₹2,100</p>
                <p style={{ fontSize: 15, color: '#9B7B52', fontFamily: 'Hind, sans-serif' }}>(पहले से तय)</p>
              </div>
            </div>
          </div>
          <p className="mt-3" style={{ fontSize: 16, color: '#6B4F2A', fontFamily: 'Hind, sans-serif' }}>
            ग्राहक को Booking से पहले ही पता है।
          </p>
        </div>

        {/* Reassurance text */}
        <div className="text-center pb-2">
          <p style={{ fontSize: 20, fontWeight: 600, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
            आप दक्षिणा खुद तय करते हैं।
          </p>
          <p style={{ fontSize: 18, color: '#6B4F2A', fontFamily: 'Hind, sans-serif' }}>
            Platform कभी नहीं बदलेगी।
          </p>
        </div>
      </div>

      <ScreenFooter isListening={isListening}>
        <CTAButton label="अगला फ़ायदा देखें →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
