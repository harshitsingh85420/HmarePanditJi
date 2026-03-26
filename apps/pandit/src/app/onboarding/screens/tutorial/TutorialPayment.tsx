'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import VoiceIndicator from '@/components/ui/VoiceIndicator'
import { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialPaymentProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialPayment({
  onNext,
  onSkip,
}: TutorialPaymentProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferProgress, setTransferProgress] = useState(0)

  const LINES = [
    'पूजा खत्म हुई। दो मिनट में पैसे बैंक में।',
    'कोई इंतज़ार नहीं। कोई कल देंगे नहीं।',
    'और देखो — platform का share भी screen पर दिखेगा।',
    'छुपा कुछ नहीं।',
    'Screen पर देखें — दक्षिणा, platform का हिस्सा, यात्रा भत्ता — सब साफ़।',
    'और नीचे लिखा है — आपको कितना मिला।',
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
      setShowBreakdown(true)
      startListeningForResponse()
      return
    }

    setCurrentLine(index)

    // Trigger animations at specific lines
    if (index === 0) {
      setTimeout(() => setShowTransfer(true), 1000)
      // Animate transfer progress
      setTimeout(() => {
        const interval = setInterval(() => {
          setTransferProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval)
              return 100
            }
            return prev + 10
          })
        }, 200)
        return () => clearInterval(interval)
      }, 1500)
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const breakdownItemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        type: 'spring',
      },
    },
  }

  const bankCardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.5,
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  const transferLineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  }

  const checkMarkVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 1.8,
        type: 'spring',
        stiffness: 200,
      },
    },
  }

  const breakdownData = [
    { label: 'दक्षिणा', amount: '₹5,000', icon: '🙏' },
    { label: 'Platform Fee (10%)', amount: '-₹500', icon: '📱', isNegative: true },
    { label: 'यात्रा भत्ता', amount: '+₹300', icon: '🚗', isPositive: true },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={6} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            Instant Payment
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            2 मिनट में बैंक में
          </motion.p>
        </motion.div>

        {/* Lightning Bolt Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="text-7xl inline-block"
          >
            ⚡
          </motion.div>
        </motion.div>

        {/* Bank Transfer Visualization */}
        <AnimatePresence>
          {showTransfer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                {/* Temple/Client Side */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-2">🏛️</div>
                  <p className="text-xs text-vedic-gold">Payment Sent</p>
                </motion.div>

                {/* Animated Transfer Line */}
                <div className="flex-1 mx-4 relative h-12">
                  {/* Background line */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-1 bg-vedic-border rounded-full" />
                  </div>

                  {/* Animated progress line */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${transferProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center"
                  >
                    <div className="h-1 bg-gradient-to-r from-primary to-success rounded-full" />
                  </motion.div>

                  {/* Moving money icon */}
                  <motion.div
                    initial={{ x: 0, opacity: 0 }}
                    animate={{ x: '100%', opacity: 1 }}
                    transition={{
                      duration: 2,
                      ease: 'easeInOut',
                    }}
                    className="absolute top-1/2 -translate-y-1/2 text-xl"
                  >
                    💰
                  </motion.div>
                </div>

                {/* Bank Side */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center"
                >
                  <motion.div
                    variants={bankCardVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 shadow-lg"
                  >
                    <div className="text-xs mb-1">BANK</div>
                    <div className="text-lg font-bold">₹</div>
                  </motion.div>
                  <p className="text-xs text-vedic-gold mt-2">Your Account</p>
                </motion.div>
              </div>

              {/* Transfer Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="text-center"
              >
                {transferProgress >= 100 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-2 bg-success-lt border-2 border-success rounded-full px-4 py-2"
                  >
                    <motion.svg
                      variants={checkMarkVariants}
                      initial="hidden"
                      animate="visible"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-success"
                    >
                      <motion.path
                        d="M20 6L9 17l-5-5"
                        variants={checkMarkVariants}
                      />
                    </motion.svg>
                    <span className="text-success font-bold text-sm">
                      Payment Received
                    </span>
                  </motion.div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-primary-lt border-2 border-primary rounded-full px-4 py-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                    />
                    <span className="text-primary font-bold text-sm">
                      Transferring... {transferProgress}%
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Breakdown */}
        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white border-2 border-vedic-border rounded-2xl p-5 mb-8 shadow-sm"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-4 pb-3 border-b border-vedic-border"
              >
                <h3 className="font-bold text-vedic-brown">Payment Breakdown</h3>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl"
                >
                  📊
                </motion.div>
              </motion.div>

              <div className="space-y-3">
                {breakdownData.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={breakdownItemVariants}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm text-vedic-brown-2">
                        {item.label}
                      </span>
                    </div>
                    <motion.span
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={`font-bold ${item.isNegative
                        ? 'text-error'
                        : item.isPositive
                          ? 'text-success'
                          : 'text-vedic-brown'
                        }`}
                    >
                      {item.amount}
                    </motion.span>
                  </motion.div>
                ))}
              </div>

              {/* Total Amount */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-4 pt-4 border-t-2 border-primary"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-vedic-brown text-lg">
                    आपको मिला
                  </span>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="text-right"
                  >
                    <span className="text-3xl font-bold text-success">
                      ₹4,800
                    </span>
                    <p className="text-xs text-success font-semibold">
                      Direct to bank
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transparency Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-success-lt to-green-50 border-2 border-success rounded-xl p-4 mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.4, type: 'spring' }}
            className="text-3xl mb-2"
          >
            🔒
          </motion.div>
          <p className="font-bold text-success">
            छुपा कुछ नहीं — सब साफ़
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
