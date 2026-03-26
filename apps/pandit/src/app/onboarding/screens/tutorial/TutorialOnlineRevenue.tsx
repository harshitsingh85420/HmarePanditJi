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

interface TutorialOnlineRevenueProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialOnlineRevenue({
  onNext,
  onSkip,
}: TutorialOnlineRevenueProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [showCalculation, setShowCalculation] = useState(false)
  const [displayAmount, setDisplayAmount] = useState(0)

  const LINES = [
    'दो बिल्कुल नए तरीके हैं — जो आप शायद अभी तक नहीं जानते।',
    'पहला — घर बैठे पूजा। Video call से पूजा कराइए। दुनिया भर के ग्राहक मिलेंगे — NRI भी।',
    'एक पूजा में दो हज़ार से पाँच हज़ार रुपये।',
    'दूसरा — पंडित से बात। Phone, video, या chat पर धार्मिक सलाह दीजिए।',
    'बीस रुपये से पचास रुपये प्रति मिनट।',
    'उदाहरण के तौर पर — बीस मिनट की एक call में आठ सौ रुपये सीधे आपको।',
    'दोनों मिलाकर — चालीस हज़ार रुपये अलग से हर महीने।',
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
      setShowCards(true)
      startListeningForResponse()
      return
    }

    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => {
      // Trigger calculation animation at line 6
      if (index === 5) {
        setTimeout(() => setShowCalculation(true), 500)
      }
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

  // Animate counter from 0 to target
  useEffect(() => {
    if (showCalculation) {
      const targetAmount = 40000
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = targetAmount / steps
      const intervalTime = duration / steps

      let current = 0
      const interval = setInterval(() => {
        current += increment
        if (current >= targetAmount) {
          setDisplayAmount(targetAmount)
          clearInterval(interval)
        } else {
          setDisplayAmount(Math.floor(current))
        }
      }, intervalTime)

      return () => clearInterval(interval)
    }
  }, [showCalculation])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.3,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.03,
      y: -5,
      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
      transition: { duration: 0.2 },
    },
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.3,
        type: 'spring',
        stiffness: 200,
        duration: 0.6,
      },
    },
  }

  const moneyCounterVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5,
        type: 'spring',
        stiffness: 200,
      },
    },
  }

  const revenueStreams = [
    {
      icon: '🏠',
      title: 'घर बैठे पूजा',
      desc: 'Video call से पूजा',
      range: '₹2,000 - ₹5,000',
      subtext: 'per pooja',
      gradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      icon: '💬',
      title: 'पंडित से बात',
      desc: 'धार्मिक सलाह',
      range: '₹20 - ₹50',
      subtext: 'per minute',
      gradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={4} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            ऑनलाइन कमाई
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            दो नए तरीके
          </motion.p>
        </motion.div>

        {/* Dual Revenue Cards */}
        <AnimatePresence>
          {showCards && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 mb-8"
            >
              {revenueStreams.map((stream, i) => (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`bg-gradient-to-br ${stream.gradient} ${stream.borderColor} border-2 rounded-2xl p-5 shadow-sm`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon with animation */}
                    <motion.div
                      variants={iconVariants}
                      className={`${stream.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}
                    >
                      {stream.icon}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-bold text-vedic-brown text-lg mb-1">
                        {stream.title}
                      </h3>
                      <p className="text-vedic-gold text-sm mb-3">
                        {stream.desc}
                      </p>

                      {/* Income Range with animation */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.2 }}
                        className="bg-white/70 rounded-lg px-3 py-2 inline-block"
                      >
                        <p className={`font-bold text-lg ${i === 0 ? 'text-blue-600' : 'text-purple-600'}`}>
                          {stream.range}
                        </p>
                        <p className="text-xs text-vedic-gold">
                          {stream.subtext}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Income Calculation Animation */}
        <AnimatePresence>
          {showCalculation && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="bg-gradient-to-br from-primary-lt to-amber-50 border-2 border-primary rounded-2xl p-6 mb-8 text-center"
            >
              <motion.div
                variants={moneyCounterVariants}
                initial="hidden"
                animate="visible"
              >
                <p className="text-vedic-gold text-sm mb-2">
                  उदाहरण: 20 मिनट की call
                </p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl mb-3"
                >
                  💰
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-vedic-brown text-sm mb-3"
                >
                  ₹40 × 20 मिनट =
                </motion.p>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                  className="text-5xl font-bold text-primary mb-2"
                >
                  ₹{displayAmount.toLocaleString('hi-IN')}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-success font-semibold text-sm"
                >
                  ✅ हर महीने अलग से
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-white border-2 border-vedic-border rounded-xl p-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.7, type: 'spring' }}
              className="text-2xl"
            >
              🌍
            </motion.div>
            <div>
              <p className="font-bold text-vedic-brown text-sm">
                worldwide ग्राहक
              </p>
              <p className="text-xs text-vedic-gold">
                NRI सहित सभी जगह से
              </p>
            </div>
          </div>
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
