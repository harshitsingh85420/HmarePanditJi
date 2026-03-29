'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSafeRegistrationStore, useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import { speakWithSarvam } from '@/lib/sarvam-tts'

const STEP_LABELS: Record<string, { title: string; subtitle: string; icon: string }> = {
  mobile: {
    title: 'Mobile Number',
    subtitle: 'मोबाइल नंबर',
    icon: 'phone',
  },
  otp: {
    title: 'OTP Verification',
    subtitle: 'OTP सत्यापन',
    icon: 'security',
  },
  profile: {
    title: 'Profile Details',
    subtitle: 'प्रोफ़ाइल विवरण',
    icon: 'person',
  },
}

// BUG-027 FIX: Calculate the NEXT incomplete step based on actual registration flow
// Profile page goes directly to /dashboard, so permissions are NOT part of the core flow
function getNextIncompleteStep(data: any): string | null {
  const { completedSteps } = data;

  // Check in order: mobile → otp → profile
  if (!completedSteps.includes('mobile')) {
    return 'mobile';
  }

  if (!completedSteps.includes('otp')) {
    return 'otp';
  }

  if (!completedSteps.includes('profile')) {
    return 'profile';
  }

  // BUG-025 FIX: All main steps complete - return null to indicate fully registered
  return null;
}

export default function ResumeRegistrationScreen() {
  const router = useRouter()

  // SSR FIX: Use safe store hooks that don't throw during SSR
  const { data, reset } = useSafeRegistrationStore()
  const { navigate, setSection } = useSafeNavigationStore()

  useEffect(() => {
    navigate('/resume', 'part1-registration')
    setSection('part1-registration')
  }, [navigate, setSection])

  // BUG-025 FIX: Calculate next incomplete step dynamically
  const nextStep = getNextIncompleteStep(data);

  // BUG-025 FIX: If fully registered, redirect to dashboard immediately
  useEffect(() => {
    if (nextStep === null) {
      // User has completed all registration steps - redirect to dashboard
      router.push('/dashboard')
      return
    }

    const stepInfo = STEP_LABELS[nextStep] || { title: 'Registration', subtitle: 'पंजीकरण', icon: 'edit' }
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: `स्वागत है। आपका ${stepInfo.title} अधूरा है। क्या आप जारी रखना चाहेंगे?`,
        languageCode: 'hi-IN',
        speaker: 'ratan',
        pace: 0.82,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [nextStep, router])

  // BUG-025 FIX: Safe step info lookup with fallback
  const stepInfo = nextStep ? (STEP_LABELS[nextStep] || { title: 'Registration', subtitle: 'पंजीकरण', icon: 'edit' }) : { title: 'Complete', subtitle: 'पूर्ण', icon: 'check_circle' }

  const handleContinue = () => {
    // BUG-025 FIX: Route to the NEXT incomplete step (no permissions in flow)
    const routes: Record<string, string> = {
      mobile: '/mobile',
      otp: '/otp',
      profile: '/profile',
    }
    const route = routes[nextStep ?? 'mobile']
    router.push(route)
  }

  // BUG-026 FIX: Reset registration and redirect to onboarding (not /identity which doesn't exist)
  const handleStartOver = () => {
    reset()
    router.push('/onboarding')
  }

  const completedCount = data.completedSteps.filter((s: string) => ['mobile', 'otp', 'profile'].includes(s)).length
  const totalSteps = 3
  const progressPercent = Math.round((completedCount / totalSteps) * 100)

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 bg-surface-base">
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-saffron-light rounded-full flex items-center justify-center mb-8 mx-auto"
        >
          <span className="text-6xl">📋</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-saffron text-center mb-2">
          पंजीकरण जारी रखें
        </h1>
        <p className="text-text-secondary text-center mb-8">
          आपने {completedCount} में से {totalSteps} चरण पूरे किए
        </p>

        {/* Progress Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface-card rounded-card shadow-card p-6 mb-6"
        >
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium text-saffron">प्रगति</span>
              <span className="text-lg font-bold text-saffron">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-surface-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-saffron"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Next step */}
          <div className="bg-saffron-tint rounded-card-sm p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-saffron rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">
                {stepInfo.icon}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-text-secondary text-lgs font-medium">अगला चरण:</p>
              <p className="text-saffron font-bold text-lg">{stepInfo.title}</p>
              <p className="text-text-secondary text-lg">{stepInfo.subtitle}</p>
            </div>
            <span className="material-symbols-outlined text-saffron">arrow_forward</span>
          </div>
        </motion.div>

        {/* Completed steps */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-card rounded-card shadow-card p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-saffron mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-trust-green filled">check_circle</span>
            पूरे हुए चरण
          </h2>
          <div className="space-y-3">
            {data.completedSteps
              .filter((step: string) => ['mobile', 'otp', 'profile'].includes(step))
              .map((step: string) => {
                const stepInfo = STEP_LABELS[step]
                if (!stepInfo) return null
                return (
                  <div
                    key={step}
                    className="flex items-center gap-3 p-3 bg-trust-green-bg rounded-card-sm"
                  >
                    <span className="material-symbols-outlined text-trust-green text-lgl">
                      check_circle
                    </span>
                    <div>
                      <p className="text-saffron font-medium text-lg">{stepInfo.title}</p>
                      <p className="text-text-secondary text-lgs">{stepInfo.subtitle}</p>
                    </div>
                  </div>
                )
              })}
            {completedCount === 0 && (
              <p className="text-text-secondary text-lg text-center py-4">
                अभी कोई चरण पूरा नहीं हुआ
              </p>
            )}
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">play_arrow</span>
            <span>जारी रखें</span>
          </button>

          <button
            onClick={handleStartOver}
            className="w-full h-14 text-text-secondary font-medium underline-offset-2 active:opacity-70"
          >
            नए सिरे से शुरू करें
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="pb-8 text-center text-lg text-text-placeholder" suppressHydrationWarning>
        Session ID: {data.sessionId?.slice(-8) || ''}
      </p>
    </main>
  )
}
