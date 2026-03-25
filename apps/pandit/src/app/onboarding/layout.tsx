'use client'

import { useEffect } from 'react'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Keep screen on during onboarding (Pandit Ji may be in temple with wet hands)
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen')
      } catch (err) {
        // Wake Lock not supported — ignore
      }
    }

    requestWakeLock()

    return () => {
      wakeLock?.release()
    }
  }, [])

  return (
    <div className="screen-always-on min-h-screen bg-vedic-cream">
      {children}
    </div>
  )
}
