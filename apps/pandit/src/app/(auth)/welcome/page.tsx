'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { useVoiceStore } from '@/stores/voiceStore'
import TopBar from '@/components/TopBar'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { startListeningWithSarvam, type VoiceEngineConfig } from '@/lib/voice-engine'
import { OmIllustration } from '@/components/illustrations/PremiumIcons'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.5 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const welcomeScript = [
  {
    text: 'नमस्ते पंडित जी! HmarePanditJi में आपका हार्दिक स्वागत है।',
    delay: 800,
  },
  {
    text: 'यह ऐप आपको पूजा और यज्ञ के लिए बुकिंग प्रबंधित करने में मदद करेगा।',
    delay: 5000,
  },
  {
    text: 'आप अपनी उपलब्धता सेट कर सकते हैं, बुकिंग देख सकते हैं, और भुगतान प्राप्त कर सकते हैं।',
    delay: 9000,
  },
  {
    text: 'चलिए शुरू करते हैं।',
    delay: 13000,
  },
]

export default function WelcomePage() {
  const router = useRouter()
  const { setSection } = useNavigationStore()
  const { setCurrentStep } = useRegistrationStore()
  const { transcribedText, resetErrors } = useVoiceStore()
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [userReady, setUserReady] = useState(false)

  useEffect(() => {
    setSection('welcome')
    setCurrentStep('welcome')
  }, [setSection, setCurrentStep])

  // Play welcome script sequentially
  useEffect(() => {
    if (currentScriptIndex >= welcomeScript.length) {
      setIsPlaying(false)
      // After script completes, ask user if they're ready
      setTimeout(() => {
        void speakWithSarvam({
          text: 'क्या आप आगे बढ़ने के लिए तैयार हैं?',
          languageCode: 'hi-IN',
        })
      }, 500)
      return
    }

    const script = welcomeScript[currentScriptIndex]
    const timer = setTimeout(() => {
      if (isPlaying) {
        void speakWithSarvam({
          text: script.text,
          languageCode: 'hi-IN',
          pace: 0.85,
        })
        setCurrentScriptIndex((prev) => prev + 1)
      }
    }, script.delay - (currentScriptIndex > 0 ? welcomeScript[currentScriptIndex - 1].delay : 0))

    return () => clearTimeout(timer)
  }, [currentScriptIndex, isPlaying])

  const handleVoiceResponse = () => {
    if (isListening || isPlaying) return

    resetErrors()
    setIsListening(true)

    const config: VoiceEngineConfig = {
      language: 'hi-IN',
      inputType: 'yes_no',
      isElderly: true,
      useSarvam: true,
      confidenceThreshold: 0.55,
      onStateChange: (state) => {
        if (state === 'IDLE' || state === 'SUCCESS' || state === 'FAILURE') {
          setIsListening(false)
        }
      },
      onResult: (result) => {
        const answer = result.transcript.toLowerCase()

        if (answer.includes('haan') || answer.includes('yes') || answer.includes('taiyar') || answer.includes('theek')) {
          setUserReady(true)
          void speakWithSarvam({
            text: 'बहुत अच्छे! चलिए आगे बढ़ते हैं।',
            languageCode: 'hi-IN',
          })
          setTimeout(() => {
            router.push('/mobile')
          }, 1500)
        } else if (answer.includes('nahi') || answer.includes('no') || answer.includes('ruk')) {
          void speakWithSarvam({
            text: 'कोई बात नहीं। जब आप तैयार हों, बस "हाँ" कहें या बटन दबाएं।',
            languageCode: 'hi-IN',
          })
        }

        setIsListening(false)
      },
      onError: (error) => {
        console.warn('[Welcome] Voice error:', error)
        setIsListening(false)

        if (error === 'KEYBOARD_FALLBACK') {
          setUserReady(true)
          router.push('/mobile')
        }
      },
    }

    const cleanup = startListeningWithSarvam(config)

    return () => cleanup()
  }

  const handleManualContinue = () => {
    setUserReady(true)
    void speakWithSarvam({
      text: 'चलिए आगे बढ़ते हैं।',
      languageCode: 'hi-IN',
    })
    setTimeout(() => {
      router.push('/mobile')
    }, 1000)
  }

  const handleReplay = () => {
    setCurrentScriptIndex(0)
    setIsPlaying(true)
    setUserReady(false)

    setTimeout(() => {
      void speakWithSarvam({
        text: welcomeScript[0].text,
        languageCode: 'hi-IN',
        pace: 0.85,
      })
    }, 300)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      {/* Sacred Gradient Backdrop - Using CSS class instead of inline style */}
      <div className="fixed inset-0 bg-sacred pointer-events-none -z-10" />

      {/* Top Bar */}
      <TopBar
        showBack
        onBack={() => router.back()}
      />

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8 pt-4 flex flex-col">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col"
        >
          {/* Illustration with shimmer and glow effects - matching welcome_s_0.1_animated */}
          <motion.div variants={itemVariants} className="mb-8 flex justify-center relative">
            {/* Radial glow backdrop */}
            <div className="absolute inset-0 bg-gradient-radial from-saffron/20 to-transparent rounded-full blur-2xl animate-glow" />
            <div className="shimmer-text">
              <OmIllustration size="lg" animated={true} />
            </div>
          </motion.div>

          {/* Heading - matching welcome_s_0.1_animated */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-[40px] font-bold text-text-primary text-center mb-1 font-devanagari leading-tight"
          >
            नमस्ते
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="font-serif text-[40px] font-bold text-saffron text-center mb-4 font-devanagari leading-tight"
          >
            पंडित जी।
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-text-secondary text-[22px] text-center mb-8 font-devanagari"
          >
            HmarePanditJi पर आपका स्वागत है।
          </motion.p>

          {/* Divider & Mool Mantra */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
            <div className="w-20 h-[2px] bg-saffron/20 mb-4" />
            <p className="text-[20px] italic text-text-secondary leading-relaxed font-devanagari text-center">
              App पंडित के लिए है,<br />
              और पंडित App के लिए नहीं।
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-center gap-2">
              {welcomeScript.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${index < currentScriptIndex
                    ? 'w-12 bg-saffron'
                    : index === currentScriptIndex
                      ? 'w-12 bg-saffron/50 animate-pulse'
                      : 'w-2 bg-border-default'
                    }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Voice Response Card */}
          {!userReady && (
            <motion.div
              variants={itemVariants}
              className="bg-surface-card rounded-2xl p-6 shadow-card mb-6"
            >
              <div className="flex flex-col items-center">
                {/* Voice Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVoiceResponse}
                  disabled={isListening || isPlaying}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all saffron-glow-active ${isPlaying
                    ? 'bg-surface-muted cursor-not-allowed'
                    : isListening
                      ? 'bg-saffron-light animate-pulse'
                      : 'bg-saffron shadow-btn-saffron'
                    }`}
                >
                  {isPlaying ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 bg-saffron rounded-full"
                          animate={{
                            height: [8, 24, 8],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.12,
                          }}
                        />
                      ))}
                    </div>
                  ) : isListening ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 bg-saffron-dark rounded-full"
                          animate={{
                            height: [8, 20, 8],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-white">mic</span>
                  )}
                </motion.button>

                <p className="text-text-secondary text-center font-devanagari">
                  {isPlaying
                    ? 'कृपया सुनें...'
                    : isListening
                      ? 'सुन रहे हैं...'
                      : 'उत्तर देने के लिए माइक दबाएं'}
                </p>

                {/* Transcribed text (if any) */}
                {transcribedText && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-saffron font-medium text-center font-devanagari"
                  >
                    आपने कहा: &quot;{transcribedText}&quot;
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* Manual Buttons - matching welcome_s_0.1_animated */}
          {!userReady && (
            <motion.div variants={itemVariants} className="w-full max-w-sm space-y-6 mb-12">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleManualContinue}
                disabled={isPlaying}
                className="w-full h-16 bg-saffron text-white text-[22px] font-bold rounded-2xl shadow-lg shadow-saffron/20 active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50"
              >
                जानें (सिर्फ 2 मिनट) →
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleReplay}
                disabled={isPlaying}
                className="w-full text-text-secondary text-[18px] underline decoration-1 underline-offset-4 disabled:opacity-50"
              >
                पंजीकरण पर सीधे जाएं
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Bottom Interaction Bar - matching welcome_s_0.1_animated */}
      <footer className="px-6 py-6 flex items-center justify-between bg-white/50 backdrop-blur-sm border-t border-saffron/20">
        <div className="flex items-center gap-3">
          {/* Animated Voice Bars */}
          <div className="flex items-end gap-1 h-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-saffron rounded-full"
                animate={{
                  height: [8, 24, 8],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-text-secondary font-medium font-devanagari">
            {isPlaying ? 'बोल रहे हैं...' : 'सुन रहा हूँ...'}
          </span>
        </div>
        <button className="p-2 rounded-xl bg-saffron/10 text-text-secondary" data-purpose="keyboard-toggle">
          <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <rect height="12" rx="2" ry="2" width="18" x="3" y="4"></rect>
            <line x1="7" x2="7" y1="8" y2="8"></line>
            <line x1="11" x2="11" y1="8" y2="8"></line>
            <line x1="15" x2="15" y1="8" y2="8"></line>
            <line x1="17" x2="17" y1="8" y2="8"></line>
            <line x1="7" x2="7" y1="12" y2="12"></line>
            <line x1="10" x2="10" y1="12" y2="12"></line>
            <line x1="14" x2="14" y1="12" y2="12"></line>
            <line x1="17" x2="17" y1="12" y2="12"></line>
            <line x1="7" x2="17" y1="16" y2="16"></line>
          </svg>
        </button>
      </footer>
    </div>
  )
}
