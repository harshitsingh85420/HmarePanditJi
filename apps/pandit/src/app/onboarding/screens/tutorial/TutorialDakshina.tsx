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

interface TutorialDakshinaProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialDakshina({
  onNext,
  onSkip,
}: TutorialDakshinaProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [highlightedCard, setHighlightedCard] = useState<'before' | 'after' | null>(null)

  const LINES = [
    'कितनी बार ऐसा हुआ है कि आपने दो घंटे की पूजा की — और ग्राहक ने कह दिया, भैया, तीन हज़ार नहीं, दो हज़ार ले लो।',
    'आप कुछ नहीं बोल पाए।',
    'अब नहीं होगा यह।',
    'आप खुद दक्षिणा तय करेंगे — platform कभी नहीं बदलेगी।',
    'ग्राहक को booking से पहले ही पता होता है — कितना देना है।',
    'मोलभाव खत्म।',
    'आगे बोलें।',
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      playLine(0)
    }, 500)

    return () => {
      clearTimeout(timer)
      stopListening()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playLine = (index: number) => {
    if (index >= LINES.length) {
      setShowCards(true)
      startListeningForResponse()
      return
    }

    setCurrentLine(index)

    // Emotional pauses for dramatic effect
    const pause = index === 1 || index === 5 ? 1000 : 400

    speak(LINES[index], 'hi-IN', () => {
      setTimeout(() => playLine(index + 1), pause)
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
      transition: { duration: 0.2 },
    },
  }

  const crossMarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  }

  const checkMarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  }

  const highlightVariants: Variants = {
    initial: { scale: 1 },
    highlight: {
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0 rgba(21, 128, 61, 0)',
        '0 0 20px rgba(21, 128, 61, 0.5)',
        '0 0 0 rgba(21, 128, 61, 0)',
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={3} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            तय दक्षिणा
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            आपकी मेहनत, आपकी कीमत
          </motion.p>
        </motion.div>

        {/* Emotional Narrative Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            {/* Sad emoji animation */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              className="text-6xl text-center mb-4"
            >
              😔
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-transparent via-error to-transparent mb-4"
            />
          </div>
        </motion.div>

        {/* Before/After Cards */}
        <AnimatePresence>
          {showCards && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 mb-8"
            >
              {/* Before Card - Problem */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-error-lt border-2 border-error rounded-2xl p-5 relative overflow-hidden"
              >
                <motion.div
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute top-0 left-0 w-2 h-full bg-error"
                />
                <div className="flex items-center gap-3 mb-3">
                  <motion.svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-error"
                  >
                    <motion.line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                      variants={crossMarkVariants}
                    />
                    <motion.line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                      variants={crossMarkVariants}
                    />
                  </motion.svg>
                  <p className="font-bold text-error text-lg">पहले</p>
                </div>
                <p className="text-vedic-brown text-sm leading-relaxed">
                  ग्राहक मोलभाव करता था
                </p>
                <p className="text-error font-semibold text-sm mt-2">
                  ❌ मोलभाव नहीं
                </p>
              </motion.div>

              {/* After Card - Solution */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                onAnimationComplete={() => setHighlightedCard('after')}
                className="bg-success-lt border-2 border-success rounded-2xl p-5 relative overflow-hidden"
              >
                <motion.div
                  variants={highlightVariants}
                  animate="highlight"
                  className="absolute inset-0 bg-success/5"
                />
                <motion.div
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="absolute top-0 left-0 w-2 h-full bg-success"
                />
                <div className="flex items-center gap-3 mb-3">
                  <motion.svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-success"
                  >
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      variants={checkMarkVariants}
                    />
                  </motion.svg>
                  <p className="font-bold text-success text-lg">अब</p>
                </div>
                <p className="text-vedic-brown text-sm leading-relaxed">
                  आप दक्षिणा तय करेंगे
                </p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="text-success font-bold text-base mt-3 py-2 px-4 bg-success/10 rounded-lg text-center"
                >
                  ✅ मोलभाव खत्म
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key Benefit Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="bg-gradient-to-r from-primary-lt to-amber-50 border-2 border-primary rounded-2xl p-5 mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
            className="text-4xl mb-3"
          >
            💰
          </motion.div>
          <p className="text-vedic-brown font-semibold mb-2">
            ग्राहक को booking से पहले पता
          </p>
          <p className="text-primary font-bold text-lg">
            कितना देना है
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
