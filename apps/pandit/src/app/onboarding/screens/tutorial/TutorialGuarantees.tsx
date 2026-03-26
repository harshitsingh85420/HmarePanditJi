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

interface TutorialGuaranteesProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialGuarantees({
  onNext,
  onSkip,
}: TutorialGuaranteesProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [revealedCards, setRevealedCards] = useState<number[]>([])

  const LINES = [
    'यह रहे HmarePanditJi के चार वादे।',
    'एक — सम्मान। Verified badge, izzat बनी रहे, कोई मोलभाव नहीं।',
    'दो — सुविधा। आवाज़ से सब काम, यात्रा की planning अपने आप।',
    'तीन — सुरक्षा। पैसा तय, तुरंत मिलेगा, कोई धोखा नहीं।',
    'चार — समृद्धि। Offline, online, backup — तीन जगह से नया पैसा।',
    'तीन लाख से ज़्यादा पंडिट पहले से जुड़ चुके हैं।',
    'अब Registration की बारी।',
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

    // Reveal cards one by one
    if (index >= 1 && index <= 4) {
      setRevealedCards(prev => {
        if (!prev.includes(index - 1)) {
          return [...prev, index - 1]
        }
        return prev
      })
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
        staggerChildren: 0.15,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
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
    hover: {
      scale: 1.03,
      y: -5,
      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
      transition: { duration: 0.2 },
    },
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.2,
        type: 'spring',
        stiffness: 200,
        duration: 0.6,
      },
    },
  }

  const numberBadgeVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        delay: 0.1,
        type: 'spring',
        stiffness: 200,
      },
    },
  }

  const checkMarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 0.3 + i * 0.15,
        duration: 0.4,
        ease: 'easeInOut',
      },
    }),
  }

  const socialProofVariants = {
    hidden: { opacity: 0, scale: 0.8 },
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

  const crowdVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.8,
      },
    },
  }

  const personVariants = {
    hidden: { scale: 0, y: 20 },
    visible: {
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
      },
    },
  }

  const guarantees = [
    {
      num: 1,
      icon: '🏅',
      title: 'सम्मान (Samman)',
      desc: 'Verified badge, no bargaining',
      gradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100',
      textColor: 'text-amber-700',
    },
    {
      num: 2,
      icon: '🎤',
      title: 'सुविधा (Suwidha)',
      desc: 'Voice-first, auto travel',
      gradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      num: 3,
      icon: '🔒',
      title: 'सुरक्षा (Suraksha)',
      desc: 'Fixed money, instant payment',
      gradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      textColor: 'text-green-700',
    },
    {
      num: 4,
      icon: '💰',
      title: 'समृद्धि (Samriddhi)',
      desc: '3 income streams',
      gradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
      textColor: 'text-purple-700',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={11} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            4 Guarantees
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            HmarePanditJi के वादे
          </motion.p>
        </motion.div>

        {/* Four Guarantee Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 mb-8"
        >
          {guarantees.map((guarantee, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover="hover"
              initial="hidden"
              animate={revealedCards.includes(i) ? 'visible' : 'hidden'}
              className={`bg-gradient-to-br ${guarantee.gradient} ${guarantee.borderColor} border-2 rounded-xl p-4 shadow-sm cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                {/* Number Badge */}
                <motion.div
                  variants={numberBadgeVariants}
                  className={`${guarantee.iconBg} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <span className={`font-bold ${guarantee.textColor} text-sm`}>
                    {guarantee.num}
                  </span>
                </motion.div>

                {/* Icon */}
                <motion.div
                  variants={iconVariants}
                  className="text-3xl flex-shrink-0"
                >
                  {guarantee.icon}
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`font-bold ${guarantee.textColor} mb-1`}>
                    {guarantee.title}
                  </h3>
                  <p className="text-xs text-vedic-brown-2">
                    {guarantee.desc}
                  </p>
                </div>

                {/* Check Mark */}
                <motion.svg
                  custom={i}
                  variants={checkMarkVariants}
                  initial="hidden"
                  animate={revealedCards.includes(i) ? 'visible' : 'hidden'}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`${guarantee.textColor} flex-shrink-0`}
                >
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    variants={checkMarkVariants}
                  />
                </motion.svg>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-br from-primary-lt to-amber-50 border-2 border-primary rounded-2xl p-6 mb-8 text-center"
        >
          <motion.div
            variants={socialProofVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Crowd Animation */}
            <motion.div
              variants={crowdVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-center gap-1 mb-4"
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={personVariants}
                  className="text-2xl"
                >
                  👨‍🏫
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-vedic-brown font-semibold mb-2"
            >
              3,00,000+ पंडिट joined
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="h-0.5 bg-primary w-32 mx-auto my-3"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="text-sm text-vedic-gold"
            >
              आप भी जुड़िए
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Next Step Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="bg-white border-2 border-vedic-border rounded-xl p-4 mb-8 flex items-center gap-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 2.2, type: 'spring' }}
            className="text-4xl"
          >
            📝
          </motion.div>
          <div>
            <p className="font-bold text-vedic-brown text-sm">
              अब Registration की बारी
            </p>
            <p className="text-xs text-vedic-gold">
              बिल्कुल मुफ़्त, 10 मिनट लगेंगे
            </p>
          </div>
        </motion.div>

        {/* Voice Indicator */}
        <div className="h-12 flex items-center justify-center mb-4">
          <VoiceIndicator isListening={isListening} label="बोल रहे हैं..." />
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-4">
          <CTAButton
            label="Registration शुरू करें"
            onClick={handleContinue}
            variant="primary-dk"
            height="tall"
            aria-label="Start registration process"
          />
          <div className="flex justify-center">
            <SkipButton label="Skip करें →" onClick={onSkip} />
          </div>
        </div>
      </main>
    </div>
  )
}
