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

interface TutorialVoiceNavProps {
  language: SupportedLanguage
  onLanguageChange: () => void
  currentDot: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function TutorialVoiceNav({
  onNext,
  onSkip,
}: TutorialVoiceNavProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [demoState, setDemoState] = useState<'idle' | 'listening' | 'success' | 'failure'>('idle')
  const [transcript, setTranscript] = useState('')
  const [showKeyboardFallback, setShowKeyboardFallback] = useState(false)

  const LINES = [
    'यह app आपकी आवाज़ से चलता है। टाइपिंग की कोई ज़रूरत नहीं।',
    'अभी कोशिश कीजिए — हाँ या नहीं बोलिए।',
    'Mic अभी सुन रहा है।',
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
      startListeningForDemo()
      return
    }

    setCurrentLine(index)
    speak(LINES[index], 'hi-IN', () => {
      setTimeout(() => playLine(index + 1), 300)
    })
  }

  const startListeningForDemo = () => {
    setDemoState('listening')
    setTranscript('')
    setIsListening(true)

    startListening({
      language: 'hi-IN',
      onResult: (result) => {
        setTranscript(result.transcript)
        const intent = detectIntent(result.transcript)

        if (intent === 'YES' || intent === 'NO') {
          setDemoState('success')
          setIsListening(false)
          speak('वाह! बिल्कुल सही। आप perfect कर रहे हैं।', 'hi-IN', () => {
            setTimeout(() => {
              setDemoState('idle')
              startListeningForResponse()
            }, 2000)
          })
        } else {
          setDemoState('failure')
          setIsListening(false)
          speak('कोई बात नहीं। फिर कोशिश कीजिए।', 'hi-IN', () => {
            setTimeout(() => {
              setDemoState('idle')
              setTranscript('')
            }, 1500)
          })
        }
      },
      onError: () => {
        setDemoState('failure')
        setIsListening(false)
        setShowKeyboardFallback(true)
      },
    })

    // Auto-timeout after 8 seconds
    setTimeout(() => {
      if (demoState === 'listening') {
        setDemoState('failure')
        setIsListening(false)
        speak('कोई बात नहीं। Keyboard से भी कर सकते हैं।', 'hi-IN', () => {
          setShowKeyboardFallback(true)
        })
      }
    }, 8000)
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
  const waveformVariants = {
    initial: { height: 8 },
    animate: (i: number) => ({
      height: [8, 24, 8],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        delay: i * 0.15,
        ease: 'easeInOut',
      },
    }),
  }

  const pulseRingVariants = {
    initial: { scale: 0.8, opacity: 0.6 },
    animate: {
      scale: [0.8, 1.5],
      opacity: [0.6, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeOut',
      },
    },
  }

  const transcriptVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-vedic-cream">
      <TopBar showBack={true} onLanguageChange={onSkip} />
      <ProgressDots total={12} current={7} />

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-vedic-brown mb-2">
            Voice Navigation
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-vedic-gold"
          >
            बिना टाइपिंग के
          </motion.p>
        </motion.div>

        {/* Microphone Icon with Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative flex justify-center mb-8"
        >
          {/* Pulsing rings when listening */}
          {demoState === 'listening' && (
            <>
              <motion.div
                variants={pulseRingVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 rounded-full border-4 border-primary"
              />
              <motion.div
                variants={pulseRingVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 rounded-full border-4 border-primary"
                style={{ animationDelay: '0.5s' }}
              />
            </>
          )}

          {/* Main mic icon */}
          <motion.div
            animate={
              demoState === 'listening'
                ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }
                : demoState === 'success'
                  ? { scale: 1.2 }
                  : {}
            }
            transition={{
              duration: demoState === 'listening' ? 1 : 0.3,
              repeat: demoState === 'listening' ? Infinity : 0,
            }}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl relative z-10 ${demoState === 'listening'
              ? 'bg-primary text-white shadow-xl'
              : demoState === 'success'
                ? 'bg-success text-white shadow-xl'
                : demoState === 'failure'
                  ? 'bg-error text-white shadow-xl'
                  : 'bg-white border-4 border-vedic-border text-vedic-gold'
              }`}
          >
            🎤
          </motion.div>
        </motion.div>

        {/* Waveform Animation */}
        <AnimatePresence>
          {demoState === 'listening' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-2 h-12 mb-6"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={waveformVariants}
                  initial="initial"
                  animate="animate"
                  className="w-3 bg-gradient-to-t from-primary to-primary-dk rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`border-2 border-dashed rounded-2xl px-6 py-8 mb-8 text-center transition-all duration-300 ${demoState === 'listening'
            ? 'border-primary bg-primary-lt'
            : demoState === 'success'
              ? 'border-success bg-success-lt'
              : demoState === 'failure'
                ? 'border-error bg-error-lt'
                : 'border-vedic-border bg-white'
            }`}
        >
          <AnimatePresence mode="wait">
            {demoState === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-success font-bold text-xl mb-2">
                  ✅ शाबाश! बिल्कुल सही!
                </p>
                {transcript && (
                  <motion.p
                    variants={transcriptVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-vedic-brown-2 text-sm"
                  >
                    आपने बोला: "{transcript}"
                  </motion.p>
                )}
              </motion.div>
            ) : demoState === 'failure' ? (
              <motion.div
                key="failure"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-error font-bold text-xl mb-2">
                  ⚠️ कोई बात नहीं
                </p>
                <p className="text-vedic-gold text-sm">
                  Keyboard से भी कर सकते हैं
                </p>
              </motion.div>
            ) : demoState === 'listening' ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-primary font-bold text-xl mb-2">
                  🎤 सुन रहा हूँ...
                </p>
                <p className="text-vedic-gold text-sm">
                  "हाँ" या "नहीं" बोलें
                </p>
                {transcript && (
                  <motion.p
                    variants={transcriptVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-primary text-sm mt-3 font-medium"
                  >
                    {transcript}
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-vedic-brown text-lg">
                  Voice Navigation से app चलाएं
                </p>
                <p className="text-vedic-gold text-sm mt-2">
                  कोई भी टाइपिंग नहीं चाहिए
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Keyboard Fallback Option */}
        <AnimatePresence>
          {showKeyboardFallback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border-2 border-vedic-border rounded-xl p-4 mb-8 text-center"
            >
              <p className="text-vedic-brown text-sm mb-3">
                Keyboard से जवाब दें:
              </p>
              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDemoState('success')
                    speak('बहुत अच्छा!', 'hi-IN', () => {
                      setTimeout(startListeningForResponse, 1000)
                    })
                  }}
                  className="px-6 py-3 bg-success text-white rounded-xl font-bold"
                >
                  हाँ
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDemoState('success')
                    speak('ठीक है!', 'hi-IN', () => {
                      setTimeout(startListeningForResponse, 1000)
                    })
                  }}
                  className="px-6 py-3 bg-error text-white rounded-xl font-bold"
                >
                  नहीं
                </motion.button>
              </div>
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
            disabled={demoState === 'listening'}
          />
          <div className="flex justify-center">
            <SkipButton label="Skip करें →" onClick={onSkip} />
          </div>
        </div>
      </main>
    </div>
  )
}
