'use client'

import TopBar from '@/components/part0/TopBar'
import ProgressDots from '@/components/part0/ProgressDots'
import SkipButton from '@/components/part0/SkipButton'
import ScreenFooter from '@/components/part0/ScreenFooter'
import CTAButton from '@/components/part0/CTAButton'
import { TutorialScreenProps } from './types'
import { useVoiceFlow } from '@/hooks/useVoiceFlow'
import { SupportedLanguage } from '@/lib/onboarding-store'

export default function TutorialOnlineRevenue({ language, onLanguageChange, currentDot, onNext, onBack, onSkip }: TutorialScreenProps) {
  const { isListening } = useVoiceFlow({
    language: language as SupportedLanguage,
    voiceScript: 'घर बैठे भी आप दो तरीकों से कमा सकते हैं। पहला: Video call से पूजा कराएं, दो हज़ार से पाँच हज़ार तक। दूसरा: Phone या Chat पर सलाह दें, बीस से पचास रुपये प्रति मिनट। उदाहरण: बीस मिनट में आठ सौ रुपये।',
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
        <div className="animate-fade-in">
          <h2 style={{ fontSize: 30, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
            घर बैठे भी कमाई
          </h2>
          <p className="italic" style={{ fontSize: 17, color: '#9B7B52', fontFamily: 'Hind, sans-serif' }}>
            (2 नए तरीके जो आप नहीं जानते)
          </p>
        </div>

        {/* Card 1 — Ghar Baithe Pooja */}
        <div
          className="rounded-2xl animate-fade-up stagger-1"
          style={{
            backgroundColor: '#FEF3C7',
            border: '2px solid #F09942',
            padding: 20,
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          {/* Header row */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 48, height: 48, backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              <span style={{ fontSize: 24 }}>📹</span>
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
                घर बैठे पूजा
              </p>
              <p style={{ fontSize: 16, color: '#6B4F2A', fontFamily: 'Hind, sans-serif' }}>
                Video call से पूजा कराएं
              </p>
            </div>
          </div>
          {/* Body */}
          <p style={{ fontSize: 18, color: '#2D1B00', fontFamily: 'Hind, sans-serif', marginBottom: 12 }}>
            दुनिया भर के ग्राहक मिलेंगे — NRI भी।
          </p>
          {/* Earnings chip */}
          <div
            className="inline-flex items-center rounded-full px-4 py-2 animate-heartbeat"
            style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #15803D' }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: '#15803D', fontFamily: 'Hind, sans-serif' }}>
              ₹2,000 – ₹5,000 प्रति पूजा
            </span>
          </div>
        </div>

        {/* Card 2 — Pandit Se Baat */}
        <div
          className="rounded-2xl animate-fade-up stagger-2"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #F0E6D3',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            padding: 20,
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          {/* Header row */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 48, height: 48, backgroundColor: '#FEF3C7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              <span style={{ fontSize: 24 }}>🎓</span>
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
                पंडित से बात
              </p>
              <p style={{ fontSize: 16, color: '#6B4F2A', fontFamily: 'Hind, sans-serif' }}>
                Phone / Video / Chat पर सलाह दें
              </p>
            </div>
          </div>

          {/* Body */}
          <p style={{ fontSize: 18, color: '#2D1B00', fontFamily: 'Hind, sans-serif', marginBottom: 12 }}>
            आपका ज्ञान अब बिकेगा।
          </p>

          {/* Rate chip */}
          <div
            className="inline-flex items-center rounded-full px-4 py-2 mb-3 animate-heartbeat"
            style={{ backgroundColor: '#DCFCE7', border: '1.5px solid #15803D', animationDelay: '0.4s' }}
          >
            <span style={{ fontSize: 17, fontWeight: 700, color: '#15803D', fontFamily: 'Hind, sans-serif' }}>
              ₹20 – ₹50 प्रति मिनट
            </span>
          </div>

          {/* Worked example — the most important text on screen */}
          <div
            className="rounded-xl animate-pulse-amber"
            style={{ backgroundColor: '#FEF3C7', padding: '10px 14px' }}
          >
            <p style={{ fontSize: 17, fontWeight: 700, color: '#F09942', fontFamily: 'Hind, sans-serif' }}>
              🧮 उदाहरण: 20 मिनट = ₹800 आपको
            </p>
          </div>
        </div>

        {/* Summary row */}
        <div
          className="rounded-xl text-center animate-fade-up stagger-3"
          style={{ backgroundColor: '#FEF3C7', padding: '12px 20px', opacity: 0, animationFillMode: 'forwards' }}
        >
          <p style={{ fontSize: 18, fontWeight: 600, color: '#2D1B00', fontFamily: 'Hind, sans-serif' }}>
            दोनों मिलाकर ₹40,000+ अलग से हर महीने
          </p>
        </div>
      </div>

      <ScreenFooter isListening={isListening}>
        <CTAButton label="अगला फ़ायदा देखें →" onClick={onNext} variant="primary" />
      </ScreenFooter>
    </div>
  )
}
