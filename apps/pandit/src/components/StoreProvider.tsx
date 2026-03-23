'use client'

import { ReactNode, useEffect, useState } from 'react'

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Stores use Zustand persist middleware with automatic hydration
    setIsReady(true)
  }, [])

  if (!isReady) {
    // Return a minimal placeholder during initial render
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl">🪔</div>
          <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin-slow" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
