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

interface TutorialTravelProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialTravel({
  onNext,
  onSkip,
}: TutorialTravelProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showTravel, setShowTravel] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [animatedPinPosition, setAnimatedPinPosition] = useState({ x: 0, y: 0 })

  const LINES = [
    'Booking confirm होते ही — आपकी पसंद के हिसाब से — train हो, bus हो, या cab — पूरी यात्रा की planning platform कर देगा।',
    'Hotel से खाने तक।',
    'और calendar में जो दिन आप free नहीं हैं — एक बार set करो।',
    'Platform उन दिनों किसी को नहीं भेजेगा। Double booking हो ही नहीं सकती।',
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

    // Show animations at appropriate lines
    if (index === 0) {
      setShowTravel(true)
      // Animate pin moving on map
      const positions = [
        { x: 0, y: 0 },
        { x: 50, y: 20 },
        { x: 100, y: 10 },
        { x: 150, y: 30 },
      ]
      positions.forEach((pos, i) => {
        setTimeout(() => setAnimatedPinPosition(pos), i * 800)
      })
    }
    if (index === 2) setShowCalendar(true)

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

  const travelOptionVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        type: 'spring',
      },
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.2 },
    },
  }

  const calendarDayVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring',
      },
    }),
  }

  const routeLineVariants = {
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

  const travelOptions = [
    { icon: '🚆', label: 'Train', desc: 'AC/Sleeper' },
    { icon: '🚌', label: 'Bus', desc: 'Volvo/AC' },
    { icon: '🚗', label: 'Cab', desc: 'Outstation' },
  ]

  const calendarDays = [
    { day: '1', status: 'busy' },
    { day: '2', status: 'busy' },
    { day: '3', status: 'free' },
    { day: '4', status: 'free' },
    { day: '5', status: 'busy' },
    { day: '6', status: 'free' },
    { day: '7', status: 'free' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={9} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            Travel + Calendar
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            Automatic planning
          </motion.p>
        </motion.div>

        {/* Map Animation with Travel */}
        <AnimatePresence>
          {showTravel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="text-3xl"
                >
                  🗺️
                </motion.div>
                <div>
                  <p className="font-bold text-vedic-brown">Automatic Travel</p>
                  <p className="text-xs text-vedic-gold">Train, Bus, Cab — सब automatic</p>
                </div>
              </div>

              {/* Map Visualization */}
              <div className="relative h-32 bg-white rounded-xl overflow-hidden mb-4">
                {/* Simplified map background */}
                <svg className="w-full h-full" viewBox="0 0 200 120">
                  {/* Route line */}
                  <motion.path
                    d="M 20 60 Q 60 40, 100 60 T 180 50"
                    fill="none"
                    stroke="#F09942"
                    strokeWidth="3"
                    strokeDasharray="8 4"
                    variants={routeLineVariants}
                    initial="hidden"
                    animate="visible"
                  />

                  {/* Animated pin */}
                  <motion.g
                    animate={{
                      x: animatedPinPosition.x + 20,
                      y: animatedPinPosition.y + 50,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  >
                    <text x="0" y="0" fontSize="24">📍</text>
                  </motion.g>

                  {/* Destination markers */}
                  <text x="170" y="55" fontSize="20">🏛️</text>
                </svg>
              </div>

              {/* Travel Options */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-2"
              >
                {travelOptions.map((option, i) => (
                  <motion.div
                    key={i}
                    variants={travelOptionVariants}
                    whileHover="hover"
                    className="bg-white border-2 border-vedic-border rounded-xl p-3 text-center shadow-sm"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                      className="text-2xl mb-1"
                    >
                      {option.icon}
                    </motion.div>
                    <p className="font-bold text-vedic-brown text-xs">
                      {option.label}
                    </p>
                    <p className="text-xs text-vedic-gold">
                      {option.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Integration */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="bg-gradient-to-br from-success-lt to-green-50 border-2 border-success rounded-2xl p-5 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring' }}
                  className="text-3xl"
                >
                  📅
                </motion.div>
                <div>
                  <p className="font-bold text-success">Smart Calendar</p>
                  <p className="text-xs text-vedic-gold">Double booking impossible</p>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white rounded-xl p-4 mb-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div
                      key={i}
                      className="text-center text-xs font-bold text-vedic-gold py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((item, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={calendarDayVariants}
                      initial="hidden"
                      animate="visible"
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold ${item.status === 'busy'
                        ? 'bg-error text-white'
                        : 'bg-success-lt text-success border-2 border-success'
                        }`}
                    >
                      {item.day}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Protection Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-success/10 rounded-lg px-4 py-3 text-center"
              >
                <p className="text-success font-bold text-sm">
                  🔒 Blocked days — No bookings
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3 mb-8"
        >
          {/* Hotel & Food */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white border-2 border-vedic-border rounded-xl p-4 flex items-center gap-3"
          >
            <div className="text-3xl">🏨</div>
            <div>
              <p className="font-bold text-vedic-brown text-sm">Hotel + Food</p>
              <p className="text-xs text-vedic-gold">Platform arranges everything</p>
            </div>
          </motion.div>

          {/* No Double Booking */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-primary-lt border-2 border-primary rounded-xl p-4 flex items-center gap-3"
          >
            <div className="text-3xl">✅</div>
            <div>
              <p className="font-bold text-primary text-sm">No Double Booking</p>
              <p className="text-xs text-vedic-gold">Calendar protects your time</p>
            </div>
          </motion.div>
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
