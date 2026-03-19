'use client'

import { useEffect, useRef, useCallback } from 'react'
import { LANGUAGE_DISPLAY, SupportedLanguage } from '@/lib/onboarding-store'
import { speak, LANGUAGE_TO_BCP47 } from '@/lib/voice-engine'

interface LanguageSetScreenProps {
  language: SupportedLanguage
  onComplete: () => void
}

export default function LanguageSetScreen({ language, onComplete }: LanguageSetScreenProps) {
  // completedRef prevents double-firing when React StrictMode mounts twice in dev
  const completedRef = useRef(false)
  // Stable callback ref so the effect doesn't re-run if parent re-renders
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    if (completedRef.current) return

    const bcp47 = LANGUAGE_TO_BCP47[language] ?? 'hi-IN'
    const nativeName = LANGUAGE_DISPLAY[language].nativeName

    const speakTimer = setTimeout(() => {
      speak(`बहुत अच्छा! अब हम आपसे ${nativeName} में बात करेंगे।`, bcp47)
    }, 300)

    const timer = setTimeout(() => {
      completedRef.current = true
      onCompleteRef.current()
    }, 2800)

    return () => {
      clearTimeout(speakTimer)
      clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const nativeName = LANGUAGE_DISPLAY[language].nativeName

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Soft radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(240,153,66,0.08) 0%, transparent 70%)' }}
      />

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => {
          const colors = ['#F09942', '#FFD700', '#FFFFFF', '#15803D']
          const color = colors[i % colors.length]
          const angle = (i / 20) * Math.PI * 2
          const r = 80 + (i % 5) * 20
          const x = Math.cos(angle) * r + 50
          const y = Math.sin(angle) * r + 50
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: color,
                left: `${x}%`,
                top: `${y}%`,
                animation: `confettiFall ${2 + (i % 3)}s linear ${(i * 0.15) % 1.5}s infinite`,
              }}
            />
          )
        })}
      </div>

      {/* Animated checkmark */}
      <div className="relative w-20 h-20 mb-10">
        <svg fill="none" height="80" viewBox="0 0 80 80" width="80">
          <circle
            cx="40" cy="40" r="38"
            stroke="#15803D" strokeWidth="4"
            className="draw-circle"
          />
          <path
            d="M24 40L35 51L56 30"
            stroke="#15803D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5"
            className="draw-check"
          />
        </svg>
      </div>

      {/* Text content */}
      <div className="text-center animate-text">
        <h1 className="text-[40px] font-bold text-[#2D1B00] mb-4 leading-tight">
          बहुत अच्छा!
        </h1>
        <p className="text-[22px] text-[#6B4F2A] leading-relaxed">
          अब हम आपसे <strong>{nativeName}</strong> में बात करेंगे।
        </p>
      </div>

      <style>{`
        .draw-circle {
          stroke-dasharray: 252;
          stroke-dashoffset: 252;
          animation: drawCircle 0.8s ease-out forwards;
        }
        .draw-check {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawCheck 0.5s ease-out 0.8s forwards;
        }
        .animate-text {
          opacity: 0;
          animation: blurFadeIn 1s ease-out 1.2s forwards;
        }
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }
        @keyframes blurFadeIn {
          0% { opacity: 0; filter: blur(8px); transform: translateY(10px); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
