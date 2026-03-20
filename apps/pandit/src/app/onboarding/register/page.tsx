'use client'

import { useEffect } from 'react'
import { speak } from '@/lib/voice-engine'

export default function RegisterPage() {
  useEffect(() => {
    setTimeout(() => {
      speak(
        'Bahut achha Pandit Ji. Ab registration shuru karte hain. Pehle aapka mobile number chahiye.',
        'hi-IN'
      )
    }, 500)
  }, [])

  return (
    <div className="min-h-screen bg-vedic-cream flex flex-col">
      {/* Top bar */}
      <header className="flex items-center px-4 h-14 border-b border-vedic-border">
        <span className="text-xl text-primary font-bold">ॐ</span>
        <span className="ml-2 text-lg font-semibold text-vedic-brown">HmarePanditJi</span>
      </header>

      {/* Content placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6 animate-gentle-float">📋</div>
        <h1 className="text-2xl font-bold text-vedic-brown mb-3">
          Registration
        </h1>
        <p className="text-vedic-gold text-lg mb-8">
          पंजीकरण यहाँ होगा
        </p>
        <div className="bg-primary-lt border border-primary rounded-card p-4 text-left max-w-sm">
          <p className="text-sm text-vedic-brown-2 font-medium">
            ✅ Tutorial पूरा हो गया
          </p>
          <p className="text-sm text-vedic-gold mt-1">
            Full registration flow coming in next implementation prompt.
          </p>
        </div>
      </div>
    </div>
  )
}