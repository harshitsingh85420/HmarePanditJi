'use client'

import { useEffect } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative"
      style={{ background: 'linear-gradient(180deg, #F09942 0%, #F5C07A 50%, #FFFBF5 100%)' }}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4">
        <span
          className="text-white font-bold select-none"
          style={{ fontSize: 80, lineHeight: 1, animation: 'glowPulse 3s ease-in-out infinite' }}
        >
          ॐ
        </span>
        <h1 className="text-white font-bold text-[28px]" style={{ fontFamily: 'sans-serif' }}>
          HmarePanditJi
        </h1>
        <p className="text-white/80 text-[18px]">हमारे पंडित जी</p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 flex flex-col items-center gap-2">
        <div className="w-[120px] h-[3px] rounded-full bg-white/25 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/90"
            style={{ animation: 'progressFill 2.8s ease-out forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes progressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}
