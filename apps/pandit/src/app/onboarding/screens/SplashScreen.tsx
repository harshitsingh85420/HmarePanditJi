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
        {/* Sacred OM — layered glow rings + shimmer */}
        <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
          {/* Outermost ring — faint, slow pulse */}
          <div
            className="absolute rounded-full"
            style={{
              width: 180, height: 180,
              border: '1.5px solid rgba(255,255,255,0.18)',
              animation: 'diyaRingPulse 4s ease-in-out infinite',
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 148, height: 148,
              border: '2px solid rgba(255,255,255,0.28)',
              animation: 'diyaRingPulse 4s ease-in-out 0.5s infinite',
            }}
          />
          {/* Inner glow disc */}
          <div
            className="absolute rounded-full"
            style={{
              width: 118, height: 118,
              background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)',
              animation: 'diyaRingPulse 3s ease-in-out 0.25s infinite',
            }}
          />
          {/* Cardinal dot markers — 8 directions */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/50"
              style={{
                transform: `rotate(${deg}deg) translateY(-82px)`,
                transformOrigin: 'center center',
                animation: `diyaRingPulse 3s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
          {/* OM glyph */}
          <span
            className="relative z-10 text-white font-bold select-none shimmer-om"
            style={{
              fontSize: 96,
              lineHeight: 1,
              fontFamily: 'serif',
              textShadow: '0 0 24px rgba(255,255,255,0.6), 0 0 8px rgba(255,200,80,0.4)',
              animation: 'diyaFlicker 4s ease-in-out infinite',
            }}
          >
            ॐ
          </span>
        </div>

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
        @keyframes diyaFlicker {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          25% { opacity: 1; transform: scale(1.04); }
          50% { opacity: 0.94; transform: scale(1.07); }
          75% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes diyaRingPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.04); }
        }
        @keyframes progressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}
