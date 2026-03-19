'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialDualMode({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'कोई भी Phone हो — Smartphone या Keypad — Platform चलेगा। और अगर Registration में मदद चाहिए, बेटा या परिवार साथ आ सकता है। पूजा आपको मिलेगी, पैसा आपके खाते में।',
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
        {/* Headline — two lines */}
        <div className="text-center animate-fade-in">
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
            कोई भी Phone,
          </h2>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#F09942', fontFamily: 'Hind, sans-serif' }}>
            Platform चलेगा।
          </p>
        </div>

        {/* Two phone comparison cards side by side */}
        <div className="flex gap-3 animate-fade-up stagger-1" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          {/* Smartphone card — featured, saffron border */}
          <div
            className="flex-1 rounded-2xl p-4 animate-float"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #F09942',
              boxShadow: '0 4px 12px rgba(240,153,66,0.15)',
              minHeight: 180,
            }}
          >
            <div className="text-center mb-2">
              <span style={{ fontSize: 32 }}>📱</span>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif', marginTop: 6 }}>
                Smartphone
              </p>
            </div>
            <div className="border-t mb-2" style={{ borderColor: '#F0E6D3' }} />
            {['Video Call', 'Chat', 'Voice Alerts', 'Maps'].map((f) => (
              <p key={f} style={{ fontSize: 15, color: '#6B4F2A', fontFamily: 'Hind, sans-serif', padding: '3px 0' }}>
                <span style={{ color: '#F09942', marginRight: 4 }}>✓</span>{f}
              </p>
            ))}
          </div>

          {/* Keypad Phone card — secondary, subtler */}
          <div
            className="flex-1 rounded-2xl p-4"
            style={{
              backgroundColor: '#FFFBF5',
              border: '1.5px solid #F0E6D3',
              minHeight: 180,
            }}
          >
            <div className="text-center mb-2">
              <span style={{ fontSize: 32 }}>📞</span>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#6B4F2A', fontFamily: 'Hind, sans-serif', marginTop: 6 }}>
                Keypad Phone
              </p>
            </div>
            <div className="border-t mb-2" style={{ borderColor: '#F0E6D3' }} />
            {[
              { text: 'Call आएगी', muted: false },
              { text: '1 = हाँ', muted: false },
              { text: '2 = ना', muted: false },
              { text: 'बस!', muted: true },
            ].map((f, i) => (
              <p key={i} style={{ fontSize: 15, color: f.muted ? '#9B7B52' : '#6B4F2A', fontFamily: 'Hind, sans-serif', padding: '3px 0', fontStyle: f.muted ? 'italic' : 'normal' }}>
                <span style={{ color: '#9B7B52', marginRight: 4 }}>✓</span>{f.text}
              </p>
            ))}
          </div>
        </div>

        {/* Family Inclusion card — the core message, equally prominent */}
        <div
          className="rounded-2xl animate-fade-up stagger-2"
          style={{
            backgroundColor: '#FEF3C7',
            border: '1.5px solid #F09942',
            padding: 20,
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 36 }}>👨‍👩‍👦</span>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif', lineHeight: 1.3 }}>
                बेटा या परिवार Registration में
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif', lineHeight: 1.3 }}>
                मदद कर सकते हैं।
              </p>
              <p className="mt-2" style={{ fontSize: 16, color: '#6B4F2A', fontFamily: 'Hind, sans-serif', lineHeight: 1.5 }}>
                पूजा आपको मिलेगी, पैसे आपके खाते में।
              </p>
            </div>
          </div>
        </div>
      </div>

      <ScreenFooter isListening={isListening}>
        <CTAButton label="अगला फ़ायदा देखें →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
