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

interface TutorialIncomeProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialIncome({
  onNext,
  onSkip,
}: TutorialIncomeProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showIncomeTiles, setShowIncomeTiles] = useState(false)

  const LINES = [
    'सुनिए, वाराणसी के पंडित रामेश्वर शर्मा जी पहले महीने में अठारह हज़ार रुपये कमाते थे।',
    'आज वे तीन नए तरीकों से तिरसठ हज़ार कमा रहे हैं।',
    'मैं आपको भी यही तीन तरीके दिखाता हूँ।',
    'इन चार tiles में से जो समझना हो उसे छू सकते हैं। या आगे बोलकर सब एक-एक देख सकते हैं।',
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
      setShowIncomeTiles(true)
      startListeningForResponse()
      return
    }

    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => {
      if (index < LINES.length - 1) {
        setTimeout(() => playLine(index + 1), 300)
      } else {
        startListeningForResponse()
      }
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
        } else if (intent === 'BACK') {
          playLine(0)
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  const tileVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.4,
        type: 'spring',
        stiffness: 200,
      },
    }),
    hover: {
      scale: 1.05,
      y: -8,
      boxShadow: '0 12px 24px rgba(240, 153, 66, 0.3)',
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  }

  const testimonialVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const incomeData = [
    { label: 'पहले', amount: '18,000', suffix: '₹', color: 'vedic-gold', bg: 'bg-white' },
    { label: 'अब', amount: '63,000', suffix: '₹', color: 'primary', bg: 'bg-primary-lt' },
  ]

  const incomeTiles = [
    { icon: '🏠', title: 'Fixed Dakshina', desc: 'मोलभाव खत्म' },
    { icon: '📱', title: 'Online Revenue', desc: 'घर बैठे पूजा' },
    { icon: '🤝', title: 'Backup Pandit', desc: 'Extra income' },
    { icon: '⚡', title: 'Instant Payment', desc: '2 min में bank' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={2} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            आमदनी में बदलाव
          </h1>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          variants={testimonialVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 mb-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
              👨‍🏫
            </div>
            <div>
              <p className="font-bold text-vedic-brown">पंडित रमेश शर्मा</p>
              <p className="text-xs text-vedic-gold">वाराणसी</p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p className="text-sm text-vedic-brown-2 italic leading-relaxed">
              "HmarePanditJi ने मेरी कमाई तीन गुना कर दी। पहले जहाँ मैं 18 हज़ार कमाता था,
              आज 63 हज़ार कमा रहा हूँ।"
            </p>
          </motion.div>
        </motion.div>

        {/* Income Comparison Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {incomeData.map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`${item.bg} border-2 ${item.color === 'primary' ? 'border-primary' : 'border-vedic-border'} rounded-2xl p-5 text-center shadow-sm`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 200 }}
                className="text-3xl mb-2"
              >
                {item.suffix}
              </motion.div>
              <p className={`text-sm mb-1 ${item.color === 'primary' ? 'text-primary font-semibold' : 'text-vedic-gold'}`}>
                {item.label}
              </p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className={`text-2xl font-bold ${item.color === 'primary' ? 'text-primary' : 'text-vedic-brown'}`}
              >
                {item.amount}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* Income Tiles - Interactive */}
        <AnimatePresence>
          {showIncomeTiles && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-sm text-vedic-gold mb-4"
              >
                इनमें से कोई भी छूएं:
              </motion.p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-3"
              >
                {incomeTiles.map((tile, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={tileVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-white border-2 border-vedic-border rounded-xl p-4 cursor-pointer shadow-sm"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                      className="text-3xl mb-2 text-center"
                    >
                      {tile.icon}
                    </motion.div>
                    <p className="font-bold text-vedic-brown text-sm text-center">
                      {tile.title}
                    </p>
                    <p className="text-xs text-vedic-gold text-center mt-1">
                      {tile.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
