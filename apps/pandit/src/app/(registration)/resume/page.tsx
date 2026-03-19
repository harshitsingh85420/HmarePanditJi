'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'
import { STEP_TO_ROUTE } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

const STEP_NAMES: Record<string, string> = {
  mobile: 'मोबाइल वेरिफिकेशन',
  otp: 'OTP Verify',
  profile: 'व्यक्तिगत विवरण',
  complete: 'पंजीकरण पूर्ण',
}

export default function ResumePage() {
  const router = useRouter()
  const { data, getCompletionPercentage } = useRegistrationStore()
  const percentage = getCompletionPercentage()

  const handleResume = () => {
    const route = STEP_TO_ROUTE[data.currentStep]
    if (route) router.push(route)
    else router.push('/mobile')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base px-5 pt-12 pb-10 max-w-md mx-auto">
      {/* Diya with progress ring */}
      <div className="flex flex-col items-center mb-8">
        <div className="text-7xl mb-3">🪔</div>
        
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#E5E5EA" strokeWidth="4"/>
            <circle 
              cx="40" cy="40" r="35" 
              fill="none" stroke="#FF8C00" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 35 * percentage / 100} ${2 * Math.PI * 35}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-saffron text-lg">{percentage}%</span>
          </div>
        </div>
      </div>

      {/* Welcome back */}
      <h1 className="font-serif text-3xl font-bold text-text-primary text-center mb-2">
        Wapas Aaye! 🪔
      </h1>
      <p className="text-text-secondary text-center mb-8">
        Aapka registration {percentage}% complete hai.
      </p>

      {/* Step list */}
      <div className="bg-surface-card rounded-card p-5 shadow-card mb-6">
        {['mobile', 'otp', 'profile'].map((step) => {
          const isComplete = data.completedSteps.includes(step as any)
          const isCurrent = data.currentStep === step

          return (
            <div
              key={step}
              className={`flex items-center gap-4 py-3 ${step !== 'profile' ? 'border-b border-border-default' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                              ${isComplete ? 'bg-trust-green-bg' : isCurrent ? 'bg-saffron' : 'bg-surface-muted'}`}>
                {isComplete ? (
                  <span className="material-symbols-outlined text-trust-green text-sm filled">check</span>
                ) : (
                  <span className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-text-disabled'}`}>
                    {['mobile', 'otp', 'profile'].indexOf(step) + 1}
                  </span>
                )}
              </div>
              
              <span className={`font-devanagari font-medium ${
                isCurrent ? 'text-saffron font-bold' : isComplete ? 'text-text-primary' : 'text-text-disabled'
              }`}>
                {STEP_NAMES[step]}
              </span>
              
              {isCurrent && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto text-xs text-saffron font-label"
                >
                  ← Yahaan se shuru
                </motion.span>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-trust-green text-sm text-center font-label mb-8 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm filled">save</span>
        Aaj tak ka pura kaam save hai.
      </p>

      <Button onClick={handleResume} icon="arrow_forward">
        Jahaan Chhodha Wahan Se Shuru Karein 🙏
      </Button>
    </div>
  )
}
