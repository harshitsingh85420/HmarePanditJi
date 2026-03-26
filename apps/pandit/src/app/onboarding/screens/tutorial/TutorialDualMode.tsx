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

interface TutorialDualModeProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialDualMode({
  onNext,
  onSkip,
}: TutorialDualModeProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [activeDevice, setActiveDevice] = useState<'smartphone' | 'keypad' | null>(null)

  const LINES = [
    'चाहे आपके पास smartphone हो या keypad phone — दोनों से काम चलेगा।',
    'Smartphone वाले को app में सब कुछ मिलेगा — video call, chat, alerts।',
    'Keypad phone वाले के पास नई booking आने पर call आएगी — number दबाओ, booking accept करो।',
    'और अगर registration में बेटा या परिवार मदद करे — कोई बात नहीं।',
    'पूजा आपको मिलेगी। पैसे आपके खाते में।',
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
      setShowComparison(true)
      startListeningForResponse()
      return
    }

    setCurrentLine(index)

    // Highlight devices at appropriate lines
    if (index === 1) setActiveDevice('smartphone')
    if (index === 2) setActiveDevice('keypad')

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const deviceVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
      },
    },
    active: {
      scale: 1.03,
      y: -5,
      boxShadow: '0 12px 24px rgba(240, 153, 66, 0.3)',
      borderColor: '#F09942',
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  const checkMarkVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
      },
    },
  }

  const smartphoneFeatures = [
    { icon: '📱', text: 'Full app experience' },
    { icon: '📹', text: 'Video call पूजा' },
    { icon: '💬', text: 'Chat support' },
    { icon: '🔔', text: 'Instant alerts' },
  ]

  const keypadFeatures = [
    { icon: '📞', text: 'Call से booking' },
    { icon: '🔢', text: 'Number दबाकर accept' },
    { icon: '✅', text: 'Simple process' },
    { icon: '💰', text: 'Same payment' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={8} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            Dual Mode
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            किसी भी phone से काम करें
          </motion.p>
        </motion.div>

        {/* Device Comparison */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {/* Smartphone Card */}
              <motion.div
                variants={deviceVariants}
                animate={activeDevice === 'smartphone' ? 'active' : 'visible'}
                whileHover="hover"
                className={`bg-white border-2 ${activeDevice === 'smartphone' ? 'border-primary' : 'border-vedic-border'
                  } rounded-2xl p-4 shadow-sm transition-all duration-300`}
              >
                {/* Phone Illustration */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-5xl text-center mb-3"
                >
                  📱
                </motion.div>

                <h3 className="font-bold text-vedic-brown text-center mb-3">
                  Smartphone
                </h3>

                {/* Features List */}
                <div className="space-y-2">
                  {smartphoneFeatures.map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={featureVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <motion.span
                        variants={checkMarkVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="text-success text-sm"
                      >
                        ✓
                      </motion.span>
                      <span className="text-xs text-vedic-brown-2">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Keypad Phone Card */}
              <motion.div
                variants={deviceVariants}
                animate={activeDevice === 'keypad' ? 'active' : 'visible'}
                whileHover="hover"
                className={`bg-white border-2 ${activeDevice === 'keypad' ? 'border-primary' : 'border-vedic-border'
                  } rounded-2xl p-4 shadow-sm transition-all duration-300`}
              >
                {/* Phone Illustration */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-5xl text-center mb-3"
                >
                  📞
                </motion.div>

                <h3 className="font-bold text-vedic-brown text-center mb-3">
                  Keypad Phone
                </h3>

                {/* Features List */}
                <div className="space-y-2">
                  {keypadFeatures.map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={featureVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <motion.span
                        variants={checkMarkVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="text-success text-sm"
                      >
                        ✓
                      </motion.span>
                      <span className="text-xs text-vedic-brown-2">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Family Help Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-br from-primary-lt to-amber-50 border-2 border-primary rounded-2xl p-6 mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1.2, type: 'spring' }}
            className="text-5xl mb-4"
          >
            👨‍👩‍👦
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="font-bold text-vedic-brown mb-2"
          >
            परिवार मदद करे — कोई बात नहीं
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
            className="text-sm text-vedic-gold"
          >
            बेटा/बेटी registration में help कर सकते हैं
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <span className="text-2xl">📿</span>
            <span className="text-sm text-vedic-brown-2">
              पूजा आपको मिलेगी
            </span>
            <span className="text-2xl">💰</span>
            <span className="text-sm text-vedic-brown-2">
              पैसे आपके खाते में
            </span>
          </motion.div>
        </motion.div>

        {/* Equal Opportunity Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
          className="bg-success-lt border-2 border-success rounded-xl p-4 text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.4, type: 'spring' }}
            className="text-3xl mb-2"
          >
            ⚖️
          </motion.div>
          <p className="font-bold text-success">
            दोनों के लिए बराबर अवसर
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
