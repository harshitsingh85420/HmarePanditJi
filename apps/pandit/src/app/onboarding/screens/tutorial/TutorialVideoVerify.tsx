'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import VoiceIndicator from '@/components/ui/VoiceIndicator'
import type { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialVideoVerifyProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialVideoVerify({
  onNext,
  onSkip,
}: TutorialVideoVerifyProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const [badgeComplete, setBadgeComplete] = useState(false)

  const LINES = [
    'Verified होने का मतलब है — ज़्यादा bookings।',
    'Data यह कहता है — Verified पंडितों को तीन गुना ज़्यादा bookings मिलती हैं।',
    'इसके लिए हर पूजा के लिए सिर्फ दो मिनट का video देना होगा — एक बार।',
    'यह video सिर्फ हमारी admin team देखेगी।',
    'Public नहीं होगी। आपकी privacy safe है।',
    'बस एक और screen बाकी है।',
    'आगे बोलें।',
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      playLine(0)
    }, 400)

    return () => {
      clearTimeout(timer)
      stopListening()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playLine = (index: number) => {
    if (index >= LINES.length) {
      startListeningForResponse()
      return
    }

    setCurrentLine(index)

    // Show badge animation at line 0
    if (index === 0) {
      setShowBadge(true)
      setTimeout(() => setBadgeComplete(true), 500)
    }

    speak(LINES[index], 'hi-IN', () => {
      setTimeout(() => playLine(index + 1), 400)
    })
  }

  const startListeningForResponse = () => {
    setIsListening(true)
    startListening({
      language: 'hi-IN',
      onResult: (result) => {
        const intent = detectIntent(result.transcript)
        if (intent === 'FORWARD') {
          handleContinue()
        } else if (intent === 'SKIP') {
          onSkip()
        }
      },
      onError: () => {
        setIsListening(false)
      },
    })
  }

  const handleContinue = () => {
    stopListening()
    setIsListening(false)
    speak('बहुत अच्छा।', 'hi-IN', () => {
      setTimeout(onNext, 1000)
    })
  }

  // Animation variants
  const badgeContainerVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.2,
        duration: 0.8,
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  const checkMarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 0.6,
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  }

  const ringVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
      },
    },
  }

  const shineVariants = {
    initial: { x: '-100%', opacity: 0 },
    animate: {
      x: '100%',
      opacity: [0, 1, 0],
      transition: {
        delay: 1,
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 2,
      },
    },
  }

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  }

  const privacyShieldVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5,
        type: 'spring',
      },
    },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={10} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            Video Verification
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            ज़्यादा bookings का राज़
          </motion.p>
        </motion.div>

        {/* Animated Verified Badge */}
        <AnimatePresence>
          {showBadge && (
            <motion.div
              variants={badgeContainerVariants}
              initial="hidden"
              animate="visible"
              className="relative flex justify-center mb-8"
            >
              {/* Outer glow ring */}
              <motion.div
                variants={ringVariants}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary-dk/20 blur-xl"
              />

              {/* Main badge */}
              <motion.div
                variants={badgeVariants}
                className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary to-primary-dk flex items-center justify-center shadow-2xl"
              >
                {/* Shine effect */}
                <motion.div
                  variants={shineVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />

                {/* Check mark */}
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  />
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={checkMarkVariants}
                    initial="hidden"
                    animate="visible"
                  />
                </svg>

                {/* Verified text */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-8 text-center"
                >
                  <p className="text-primary font-bold text-sm">Verified</p>
                  <p className="text-vedic-gold text-xs">Pandit</p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Card */}
        <motion.div
          variants={statsVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-primary-lt to-amber-50 border-2 border-primary rounded-2xl p-6 mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-5xl mb-4"
          >
            📊
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-vedic-brown font-semibold mb-3"
          >
            Verified पंडितों को मिलती है
          </motion.p>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            className="mb-2"
          >
            <span className="text-6xl font-bold text-primary">3x</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-success font-bold text-lg"
          >
            ✅ ज़्यादा Bookings
          </motion.p>
        </motion.div>

        {/* Privacy Assurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mb-8"
        >
          <div className="bg-vedic-brown text-vedic-cream rounded-2xl p-6 text-center">
            <motion.div
              variants={privacyShieldVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="text-5xl mb-4 inline-block"
            >
              🔒
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="font-bold text-lg mb-2"
            >
              Privacy 100% Safe
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.6, duration: 0.4 }}
              className="h-0.5 bg-primary w-24 mx-auto my-3"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-sm text-vedic-cream/80 mb-4"
            >
              Video सिर्फ admin team देखेगी
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="bg-primary/20 rounded-lg px-4 py-3"
            >
              <p className="text-xs text-primary font-semibold">
                ❌ Public नहीं होगी
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Video Requirement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
          className="bg-white border-2 border-vedic-border rounded-xl p-4 mb-8 flex items-center gap-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 2.4, type: 'spring' }}
            className="text-4xl"
          >
            📹
          </motion.div>
          <div>
            <p className="font-bold text-vedic-brown text-sm">
              2 minute का video
            </p>
            <p className="text-xs text-vedic-gold">
              हर पूजा के लिए — एक बार
            </p>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6 }}
          className="bg-primary-lt border-2 border-primary rounded-xl p-4 text-center mb-8"
        >
          <p className="text-primary font-semibold text-sm">
            बस एक और screen बाकी है
          </p>
        </motion.div>

        {/* Voice Indicator */}
        <div className="h-12 flex items-center justify-center mb-4">
          <VoiceIndicator isListening={isListening} label="बोल रहे हैं..." />
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-4">
          <CTAButton
            label="आगे"
            onClick={handleContinue}
            variant="primary"
            height="tall"
            aria-label="Continue to next tutorial screen"
          />
          <div className="flex justify-center">
            <SkipButton label="Skip करें →" onClick={onSkip} />
          </div>
        </div>
      </main>
    </div>
  )
}
