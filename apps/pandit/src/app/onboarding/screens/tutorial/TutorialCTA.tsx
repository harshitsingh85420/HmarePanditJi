'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { speak, startListening, stopListening, detectIntent } from '@/lib/voice-engine'
import TopBar from '@/components/ui/TopBar'
import ProgressDots from '@/components/ui/ProgressDots'
import CTAButton from '@/components/ui/CTAButton'
import SkipButton from '@/components/ui/SkipButton'
import VoiceIndicator from '@/components/ui/VoiceIndicator'
import type { SupportedLanguage } from '@/lib/onboarding-store'

interface TutorialCTAProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onRegisterNow: () => void
  onLater: () => void
}

export default function TutorialCTA({
  onNext,
  onSkip,
  onRegisterNow,
  onLater,
}: TutorialCTAProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [decisionMade, setDecisionMade] = useState<'none' | 'yes' | 'later'>('none')
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([])

  const LINES = [
    'बस इतना था HmarePanditJi का परिचय।',
    'अब आप registration शुरू कर सकते हैं — बिल्कुल मुफ़्त, दस मिनट लगेंगे।',
    'क्या आप अभी शुरू करना चाहेंगे? हाँ बोलें या नीचे button दबाएं।',
    'अगर कोई सवाल हो — screen पर helpline number है — बिल्कुल free।',
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

  // Generate confetti pieces
  useEffect(() => {
    if (showConfetti) {
      const colors = ['#F09942', '#DC6803', '#15803D', '#166534', '#DC2626', '#F59E0B', '#7C3AED']
      const pieces = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      }))
      setConfettiPieces(pieces)
    }
  }, [showConfetti])

  const playLine = (index: number) => {
    if (index >= LINES.length) {
      startListeningForDecision()
      return
    }

    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => {
      setTimeout(() => playLine(index + 1), 300)
    })
  }

  const startListeningForDecision = () => {
    setIsListening(true)
    startListening({
      language: 'hi-IN',
      onResult: (result) => {
        const intent = detectIntent(result.transcript)
        if (intent === 'YES') {
          handleYes()
        } else if (intent === 'NO' || intent === 'SKIP') {
          handleLater()
        }
      },
      onError: () => {
        setIsListening(false)
      },
    })
  }

  const handleYes = useCallback(() => {
    setDecisionMade('yes')
    setShowConfetti(true)
    stopListening()
    setIsListening(false)
    speak('बहुत अच्छा! अब हम registration शुरू करते हैं।', 'hi-IN', () => {
      setTimeout(onRegisterNow, 2000)
    })
  }, [onRegisterNow])

  const handleLater = useCallback(() => {
    setDecisionMade('later')
    stopListening()
    setIsListening(false)
    speak('ठीक है। जब भी तैयार हों, app खोलें और Registration button दबाएं।', 'hi-IN', () => {
      setTimeout(onLater, 1500)
    })
  }, [onLater])

  const handleContinue = () => {
    handleYes()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const benefitVariants = {
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

  const checkMarkVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (i: number) => ({
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 200,
      },
    }),
  }

  const confettiVariants = {
    hidden: { y: -20, opacity: 0, rotate: 0 },
    animate: {
      y: 800,
      opacity: [1, 1, 0],
      rotate: [0, 360, 720],
      x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
      transition: {
        duration: 2.5,
        delay: 0,
        ease: 'easeOut',
      },
    },
  }

  const celebrationEmojiVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        type: 'spring' as const,
        stiffness: 200,
      },
    },
    animate: {
      y: [0, -20, 0],
      rotate: [0, -10, 10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  }

  const helplineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5,
        duration: 0.4,
      },
    },
  }

  const benefits = [
    { text: 'Fixed Dakshina - no bargaining' },
    { text: 'Instant Payment - 2 min to bank' },
    { text: '3 Income Streams' },
    { text: 'Travel + Calendar - automatic' },
    { text: 'Voice Navigation - no typing' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream relative overflow-hidden">
      {/* Confetti Layer */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                variants={confettiVariants}
                initial="hidden"
                animate="animate"
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: `${piece.x}%`,
                  top: '-20px',
                  width: '10px',
                  height: '20px',
                  backgroundColor: piece.color,
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={12} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            अब आप तैयार हैं!
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            चलिए शुरू करते हैं
          </motion.p>
        </motion.div>

        {/* Celebration Emoji */}
        <motion.div
          variants={celebrationEmojiVariants}
          initial="hidden"
          animate="animate"
          className="text-center mb-8"
        >
          <motion.div
            animate={showConfetti ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: showConfetti ? Infinity : 0 }}
            className="text-7xl inline-block"
          >
            🎉
          </motion.div>
        </motion.div>

        {/* Benefits Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-2 border-vedic-border rounded-2xl p-6 mb-8 shadow-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 pb-3 border-b border-vedic-border"
          >
            <h3 className="font-bold text-vedic-brown text-lg">आपको मिलेगा:</h3>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl"
            >
              🎁
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={benefitVariants}
                className="flex items-center gap-3"
              >
                <motion.span
                  variants={checkMarkVariants}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  className="text-success text-lg flex-shrink-0"
                >
                  ✓
                </motion.span>
                <span className="text-sm text-vedic-brown-2">
                  {benefit.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Helpline Number */}
        <motion.div
          variants={helplineVariants}
          initial="hidden"
          animate="visible"
          className="bg-vedic-brown text-vedic-cream rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="text-3xl"
            >
              📞
            </motion.div>
            <div className="text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-sm font-bold mb-1"
              >
                कोई सवाल?
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-xs text-primary font-semibold"
              >
                Helpline: 1800-XXX-XXXX (Free)
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Decision Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="w-full space-y-4 mb-8"
        >
          <CTAButton
            label="हाँ, Registration शुरू करें"
            onClick={handleContinue}
            variant="primary-dk"
            height="tall"
            disabled={decisionMade !== 'none'}
            aria-label="Start registration now"
          />

          <CTAButton
            label="बाद में करूँगा"
            onClick={handleLater}
            variant="secondary"
            height="tall"
            disabled={decisionMade !== 'none'}
            aria-label="Do registration later"
          />

          <div className="flex justify-center pt-2">
            <SkipButton label="Skip करें →" onClick={onSkip} />
          </div>
        </motion.div>

        {/* Success Message after Yes */}
        <AnimatePresence>
          {decisionMade === 'yes' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-gradient-to-br from-success-lt to-green-50 border-2 border-success rounded-2xl p-6 text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-5xl mb-4"
              >
                ✅
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-bold text-success text-lg mb-2"
              >
                बहुत अच्छा!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-vedic-brown-2"
              >
                Registration शुरू हो रहा है...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Later Message */}
        <AnimatePresence>
          {decisionMade === 'later' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-primary-lt border-2 border-primary rounded-2xl p-6 text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-5xl mb-4"
              >
                👍
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-bold text-primary text-lg mb-2"
              >
                ठीक है!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-vedic-brown-2"
              >
                जब भी तैयार हों, app खोलें
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Indicator */}
        <div className="h-12 flex items-center justify-center mb-4">
          <VoiceIndicator isListening={isListening} label="बोल रहे हैं..." />
        </div>
      </main>
    </div>
  )
}
