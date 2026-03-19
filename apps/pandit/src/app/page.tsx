'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRegistrationStore } from '@/stores/registrationStore'
import { STEP_TO_ROUTE } from '@/lib/constants'

export default function RootPage() {
  const router = useRouter()
  const { data } = useRegistrationStore()

  useEffect(() => {
    // Check for in-progress registration
    if (data.completedSteps.length > 0 && data.currentStep !== 'complete') {
      const route = STEP_TO_ROUTE[data.currentStep]
      if (route) {
        // Has incomplete registration - redirect to resume
        router.replace('/resume')
        return
      }
    }
    
    // Fresh user - go to homepage
    router.replace('/identity')
  }, [data, router])

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl">🪔</div>
        <div className="w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin-slow" />
      </div>
    </div>
  )
}
