'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSafeRegistrationStore, useSafeUIStore, useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import TopBar from '@/components/TopBar'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { TempleIllustration } from '@/components/illustrations/PremiumIcons'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      type: 'spring' as const,
      stiffness: 100
    }
  }
}

export default function RegistrationCompletePage() {
  const router = useRouter()

  // SSR FIX: Use safe store hooks that don't throw during SSR
  const { data, setCurrentStep, markStepComplete } = useSafeRegistrationStore()
  const { triggerCelebration } = useSafeUIStore()
  const { setSection } = useSafeNavigationStore()
  const [showConfetti, setShowConfetti] = useState(true)
  const [celebrationPlayed, setCelebrationPlayed] = useState(false)

  useEffect(() => {
    setSection('registration-complete')
    setCurrentStep('complete')
    markStepComplete('complete')

    // ISSUE 10 FIX: Trigger celebration with confetti
    triggerCelebration('Registration Complete')
  }, [setSection, setCurrentStep, markStepComplete, triggerCelebration])

  useEffect(() => {
    // Play celebration sound and voice
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'बधाई हो पंडित जी! आपका पंजीकरण सफलतापूर्वक पूर्ण हो गया है।',
        languageCode: 'hi-IN',
        pace: 0.9,
      })
      setCelebrationPlayed(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleContinueToDashboard = () => {
    void speakWithSarvam({
      text: 'अब आप डैशबोर्ड पर जा रहे हैं।',
      languageCode: 'hi-IN',
    })
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  const completionItems = [
    { icon: 'verified_user', label: 'पहचान सत्यापित', color: 'text-trust-green' },
    { icon: 'phone_android', label: 'मोबाइल नंबर', color: 'text-saffron' },
    { icon: 'location_on', label: 'स्थान सत्यापित', color: 'text-indigo-600' },
    { icon: 'badge', label: 'प्रोफ़ाइल पूर्ण', color: 'text-purple-600' },
  ]

  const nextSteps = [
    {
      icon: 'edit_calendar',
      title: 'अपनी उपलब्धता सेट करें',
      description: 'कब आप पूजा के लिए उपलब्ध हैं',
      color: 'bg-saffron-light',
      iconColor: 'text-saffron',
    },
    {
      icon: 'calendar_today',
      title: 'बुकिंग देखें',
      description: 'आने वाली पूजा बुकिंग प्रबंधित करें',
      color: 'bg-trust-green-bg',
      iconColor: 'text-trust-green',
    },
    {
      icon: 'account_balance_wallet',
      title: 'भुगतान सेटअप',
      description: 'अपना बैंक खाता जोड़ें',
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
  ]

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      {/* Sacred Gradient Backdrop - Using CSS class instead of inline style */}
      <div className="fixed inset-0 bg-sacred pointer-events-none -z-10" />

      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50"
          >
            {[...Array(20)].map((_, i) => {
              const colors = ['#FF8C00', '#FFD700', '#1B6D24', '#FF6B6B']
              const randomColor = colors[Math.floor(Math.random() * 4)]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -50 }}
                  animate={{
                    opacity: 1,
                    y: [0, typeof window !== 'undefined' ? window.innerHeight + 50 : 800],
                    rotate: [0, 360 * 2],
                    x: [0, Math.sin(i) * 50],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.1,
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-20px`,
                  }}
                >
                  <div className={`w-full h-full rounded-full ${randomColor === '#FF8C00' ? 'bg-saffron' :
                    randomColor === '#FFD700' ? 'bg-saffron' :
                      randomColor === '#1B6D24' ? 'bg-trust-green' :
                        'bg-error-red'
                    }`} />
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8 pt-4 overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          {/* Success Icon with shimmer and glow */}
          <motion.div variants={itemVariants} className="mb-6 flex justify-center relative">
            <TempleIllustration size="lg" animated={true} />

            {/* Animated ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-trust-green/30"
              animate={{
                scale: [1, 1.2, 1.3],
                opacity: [1, 0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-3xl font-bold text-text-primary text-center mb-2 font-devanagari"
          >
            बधाई हो पंडित जी! 🎉
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-text-secondary text-lg text-center mb-8 font-devanagari"
          >
            आपका पंजीकरण सफलतापूर्वक पूर्ण हो गया है
          </motion.p>

          {/* Registration Summary Card */}
          <motion.div
            variants={itemVariants}
            className="bg-surface-card rounded-2xl p-6 shadow-card mb-6"
          >
            <h2 className="font-bold text-lg text-text-primary mb-4 font-devanagari">
              आपने पूरा किया:
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {completionItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 p-3 bg-surface-muted rounded-xl"
                >
                  <span className={`material-symbols-outlined text-xl ${item.color}`}>
                    {item.icon}
                  </span>
                  <span className="text-text-secondary text-[16px] font-devanagari">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* User Info */}
            <div className="mt-4 pt-4 border-t border-border-default">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-saffron-light flex items-center justify-center">
                  <span className="material-symbols-outlined text-saffron">person</span>
                </div>
                <div>
                  <p className="font-bold text-text-primary font-devanagari">
                    {data.name || 'पंडित जी'}
                  </p>
                  <p className="text-text-secondary text-[16px] font-devanagari">
                    {data.city || 'शहर'}, {data.state || 'राज्य'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Steps Card */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="font-bold text-lg text-text-primary mb-4 font-devanagari">
              आगे क्या करें:
            </h2>

            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.15 }}
                  className={`${step.color} rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                    <span className={`material-symbols-outlined text-xl ${step.iconColor}`}>
                      {step.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${step.iconColor} font-devanagari`}>
                      {step.title}
                    </h3>
                    <p className="text-text-secondary text-[16px] font-devanagari">
                      {step.description}
                    </p>
                  </div>
                  <span className={`material-symbols-outlined ${step.iconColor}`}>
                    arrow_forward
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleContinueToDashboard}
              className="w-full h-16 bg-gradient-to-b from-saffron to-saffron-dark text-white font-bold rounded-xl shadow-btn-saffron flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span className="font-devanagari text-lg">डैशबोर्ड पर जाएं</span>
              <span className="material-symbols-outlined">dashboard</span>
            </motion.button>
          </motion.div>

          {/* Help Section */}
          <motion.footer
            variants={itemVariants}
            className="mt-8 mb-4 text-center"
          >
            <p className="text-text-secondary text-[16px] mb-3 font-devanagari">
              कोई सहायता चाहिए?
            </p>
            <div className="flex items-center justify-center gap-2 text-saffron">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              <span className="font-bold text-saffron font-devanagari">
                +91 1800-PANDIT
              </span>
            </div>
            <p className="text-text-placeholder text-[16px] mt-2 font-devanagari">
              हम 24/7 उपलब्ध हैं
            </p>
          </motion.footer>
        </motion.div>
      </main >
    </div >
  )
}
