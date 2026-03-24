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
import { DiyaIllustration } from '@/components/illustrations/PremiumIcons'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function IdentityConfirmationPage() {
  const router = useRouter()
  const { setSection } = useNavigationStore()
  const { transcribedText, resetErrors } = useVoiceStore()
  const [isListening, setIsListening] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    setSection('identity-confirmation')
  }, [setSection])

  useEffect(() => {
    // Welcome voice intro on mount
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'नमस्ते। क्या आप भारतीय नागरिक हैं? यह पुष्टि करें कि आपकी पहचान सही है।',
        languageCode: 'hi-IN',
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleVoiceInput = () => {
    if (isListening) return

    resetErrors()
    setIsListening(true)

    const config: VoiceEngineConfig = {
      language: 'hi-IN',
      inputType: 'yes_no',
      isElderly: true,
      useSarvam: true,
      confidenceThreshold: 0.6,
      onStateChange: (state) => {
        console.log('[Identity] Voice state:', state)
        if (state === 'IDLE' || state === 'SUCCESS' || state === 'FAILURE') {
          setIsListening(false)
        }
      },
      onResult: (result) => {
        console.log('[Identity] Voice result:', result)
        const answer = result.transcript.toLowerCase()

        if (answer.includes('haan') || answer.includes('yes') || answer.includes('correct')) {
          setConfirmed(true)
          void speakWithSarvam({
            text: 'धन्यवाद। आपकी पहचान की पुष्टि हो गई है। अब आगे बढ़ते हैं।',
            languageCode: 'hi-IN',
          })
          setTimeout(() => {
            router.push('/language')
          }, 1500)
        } else if (answer.includes('nahi') || answer.includes('no') || answer.includes('galat')) {
          void speakWithSarvam({
            text: 'कोई बात नहीं। कृपया सही जानकारी दें या सहायता के लिए संपर्क करें।',
            languageCode: 'hi-IN',
          })
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }

        setIsListening(false)
      },
      onError: (error) => {
        console.warn('[Identity] Voice error:', error)
        setIsListening(false)

        if (error === 'KEYBOARD_FALLBACK') {
          // Show keyboard options
          setConfirmed(true)
          router.push('/language')
        }
      },
    }

    const cleanup = startListeningWithSarvam(config)

    return () => {
      cleanup()
    }
  }

  const handleManualConfirm = () => {
    setConfirmed(true)
    void speakWithSarvam({
      text: 'धन्यवाद। आपकी पहचान की पुष्टि हो गई है।',
      languageCode: 'hi-IN',
    })
    setTimeout(() => {
      router.push('/language')
    }, 1000)
  }

  const handleManualDeny = () => {
    void speakWithSarvam({
      text: 'कोई बात नहीं।',
      languageCode: 'hi-IN',
    })
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      {/* Sacred Gradient Backdrop - Using CSS class instead of inline style */}
      <div className="fixed inset-0 bg-sacred pointer-events-none -z-10" />

      {/* Diya halo effect behind main content - matching identity_confirmation_e_02 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] diya-halo rounded-full -z-10 blur-3xl" />

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
          {/* Icon/Illustration with shimmer effect and glow */}
          <motion.div variants={itemVariants} className="mb-10 flex justify-center relative">
            {/* Glow effect behind diya */}
            <div className="absolute inset-0 bg-saffron/20 rounded-full blur-xl" />
            <div className="shimmer-text">
              <DiyaIllustration size="lg" animated={true} />
            </div>
          </motion.div>

          {/* Heading - matching identity_confirmation_e_02 */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-4xl font-bold text-primary tracking-tight leading-tight text-center mb-3 font-devanagari"
          >
            नमस्ते, पंडित जी! 🙏
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-text-secondary text-xl font-medium leading-relaxed text-center mb-12 font-devanagari"
          >
            HmarePanditJi आपके लिए है
          </motion.p>

          {/* Voice Input Card */}
          <motion.div
            variants={itemVariants}
            className="bg-surface-card rounded-2xl p-6 shadow-card mb-6"
          >
            <div className="flex flex-col items-center">
              {/* Voice Button with saffron-glow-active */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all saffron-glow-active ${isListening
                  ? 'bg-saffron-light animate-pulse'
                  : 'bg-saffron shadow-btn-saffron'
                  }`}
              >
                {isListening ? (
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
                {isListening ? 'सुन रहे हैं...' : 'उत्तर देने के लिए माइक दबाएं'}
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

          {/* Feature Cards - Bento style matching identity_confirmation_e_02 */}
          <motion.div variants={itemVariants} className="w-full space-y-5 mb-6">
            {/* Dakshina Feature */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border-l-4 border-primary flex items-center gap-5">
              <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-3xl shimmer-text">
                💰
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-text-primary">तय दक्षिणा</h3>
                <p className="text-text-secondary leading-relaxed">हर अनुष्ठान के लिए सही और स्पष्ट मूल्य</p>
              </div>
            </div>

            {/* Voice Control Feature */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border-l-4 border-primary flex items-center gap-5">
              <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-3xl shimmer-text">
                🎙️
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-text-primary">सरल वॉइस कंट्रोल</h3>
                <p className="text-text-secondary leading-relaxed">बोलकर काम करें, टाइपिंग की जरूरत नहीं</p>
              </div>
            </div>

            {/* Payment Feature */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border-l-4 border-primary flex items-center gap-5">
              <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-3xl shimmer-text">
                ⚡
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-text-primary">त्वरित भुगतान</h3>
                <p className="text-text-secondary leading-relaxed">सीधे आपके बैंक खाते में तुरंत ट्रांसफर</p>
              </div>
            </div>
          </motion.div>

          {/* Joining Free Badge */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 bg-secondary-container/30 py-3 rounded-full border border-secondary/10 mb-4">
            <span className="material-symbols-outlined text-secondary material-symbols-filled">check_circle</span>
            <span className="font-label text-on-secondary-container font-semibold tracking-wide">Joining free</span>
          </motion.div>

          {/* Primary CTA Button */}
          <motion.button
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            onClick={handleManualConfirm}
            className="w-full h-16 bg-gradient-to-b from-primary-container to-primary text-white font-headline text-lg font-bold rounded-2xl shadow-[0px_12px_24px_rgba(144,77,0,0.2)] active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <span>हाँ, मैं पंडित हूँ — Registration शुरू करें</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}
