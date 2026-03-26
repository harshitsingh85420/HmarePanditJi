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

interface TutorialBackupProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialBackup({
  onNext,
  onSkip,
}: TutorialBackupProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [showPayment, setShowPayment] = useState(false)

  const LINES = [
    'यह सुनकर लगेगा — यह कैसे हो सकता है?',
    'मैं समझाता हूँ।',
    'जब कोई booking होती है जिसमें ग्राहक ने backup protection लिया होता है — आपको offer आता है।',
    'क्या आप उस दिन backup पंडित बनेंगे?',
    'आप हाँ कहते हैं। उस दिन free रहते हैं।',
    'अगर मुख्य पंडित ने पूजा कर ली — भी आपको दो हज़ार रुपये मिलेंगे।',
    'अगर मुख्य पंडित cancel किए — तो पूरी booking आपकी और ऊपर से दो हज़ार bonus।',
    'यह पैसा ग्राहक ने booking के समय backup protection की extra payment की थी। वही आपको मिलता है।',
    'दोनों तरफ से फ़ायदा।',
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
      startListeningForResponse()
      return
    }

    setCurrentLine(index)

    // Show steps at appropriate lines
    if (index === 2) setShowSteps(true)
    if (index === 5) setActiveStep(1)
    if (index === 6) {
      setActiveStep(2)
      setShowPayment(true)
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
  const stepVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        type: 'spring',
      },
    },
    active: {
      scale: 1.02,
      boxShadow: '0 4px 12px rgba(240, 153, 66, 0.2)',
      transition: { duration: 0.3 },
    },
  }

  const connectorVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: '100%',
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.2,
      },
    },
  }

  const moneyVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.3,
        type: 'spring',
        stiffness: 200,
      },
    },
  }

  const steps = [
    {
      num: 1,
      title: 'Booking आती है',
      desc: 'Backup protection के साथ',
      icon: '📅',
    },
    {
      num: 2,
      title: 'आप हाँ कहते हैं',
      desc: 'Us din free rehte hain',
      icon: '✅',
    },
    {
      num: 3,
      title: 'Payment मिलता है',
      desc: 'दोनों स्थितियों में',
      icon: '💰',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={5} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            Backup पंडित
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            Extra income का तरीका
          </motion.p>
        </motion.div>

        {/* Skepticism Handler */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-4xl mb-3"
          >
            🤔
          </motion.div>
          <p className="font-bold text-vedic-brown mb-2">
            "यह कैसे हो सकता है?"
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="h-0.5 bg-amber-300 w-24 mx-auto my-3"
          />
          <p className="text-sm text-vedic-gold">
            मैं समझाता हूँ — 3 steps में
          </p>
        </motion.div>

        {/* 3-Step Explanation Flow */}
        <AnimatePresence>
          {showSteps && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative mb-8"
            >
              {/* Connector Line */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary to-success" />

              <div className="space-y-6">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    variants={stepVariants}
                    initial="hidden"
                    animate={i <= activeStep ? 'visible' : 'hidden'}
                    whileHover={i <= activeStep ? 'active' : ''}
                    className={`relative flex items-start gap-4 ${i <= activeStep ? 'opacity-100' : 'opacity-50'}`}
                  >
                    {/* Step Number Circle */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.2 + 0.3, type: 'spring' }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 z-10 ${i <= activeStep
                        ? i === activeStep
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-success text-white'
                        : 'bg-vedic-border text-vedic-gold'
                        }`}
                    >
                      {step.icon}
                    </motion.div>

                    {/* Step Content */}
                    <div className="flex-1 bg-white border-2 border-vedic-border rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-vedic-gold">
                          Step {step.num}
                        </span>
                        {i < activeStep && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-success text-sm"
                          >
                            ✓
                          </motion.span>
                        )}
                      </div>
                      <p className="font-bold text-vedic-brown">
                        {step.title}
                      </p>
                      <p className="text-xs text-vedic-gold mt-1">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Breakdown */}
        <AnimatePresence>
          {showPayment && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="bg-gradient-to-br from-success-lt to-green-50 border-2 border-success rounded-2xl p-6 mb-8"
            >
              <motion.div
                variants={moneyVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="text-center mb-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-success font-bold text-sm mb-2"
                  >
                    ✅ दोनों स्थितियों में payment
                  </motion.p>
                </div>

                <div className="space-y-3">
                  {/* Scenario 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-lg p-3 border-2 border-vedic-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📿</span>
                        <div>
                          <p className="font-bold text-vedic-brown text-sm">
                            Main Pandit ने पूजा की
                          </p>
                          <p className="text-xs text-vedic-gold">
                            Backup protection fee
                          </p>
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: 'spring' }}
                        className="text-right"
                      >
                        <p className="text-lg font-bold text-success">+₹2,000</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Scenario 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-lg p-3 border-2 border-primary"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎉</span>
                        <div>
                          <p className="font-bold text-vedic-brown text-sm">
                            Main Pandit cancel किया
                          </p>
                          <p className="text-xs text-vedic-gold">
                            Full booking + Bonus
                          </p>
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring' }}
                        className="text-right"
                      >
                        <p className="text-lg font-bold text-primary">+₹2,000+</p>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-4 text-center"
                >
                  <p className="text-sm text-vedic-gold mb-2">
                    ग्राहक ने extra payment की थी
                  </p>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                    className="h-0.5 bg-primary w-16 mx-auto my-2"
                  />
                  <p className="font-bold text-vedic-brown text-sm">
                    वही आपको मिलता है
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Win-Win Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-primary-lt border-2 border-primary rounded-xl p-4 mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.7, type: 'spring' }}
            className="text-3xl mb-2"
          >
            🤝
          </motion.div>
          <p className="font-bold text-primary">
            दोनों तरफ से फ़ायदा
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
