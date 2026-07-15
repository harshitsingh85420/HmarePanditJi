'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import TopBar from '@/components/ui/TopBar'
import { WaveformVisualizer } from '@/components/voice/WaveformBar'
import { SuccessCheckmark } from '@/components/ui/CompletionBadge'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function EmergencySOS() {
  const router = useRouter()
  const [sosSent, setSosSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Welcome voice for SOS feature
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'आप सुरक्षित हैं, हम आपके साथ हैं। आपातकालीन स्थिति में SOS बटन दबाएं।',
        languageCode: 'hi-IN',
        pace: 0.85,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // L2 TRUTHFUL-STATE (safety): there is NO emergency backend
  // (/api/emergency/send-sos was never built), so this screen must NEVER
  // claim an SOS was "sent" or that family/control-room were notified.
  // The one real emergency action a phone can guarantee offline is placing
  // a call — so SOS immediately connects the pandit to the 24/7 help line
  // and says exactly that. HELP_LINE is the single real number.
  const HELP_LINE = 'tel:+918934095599'

  const handleSendSOS = async () => {
    setIsLoading(true)
    // Best-effort location capture for the pandit's own reference on the
    // call — logged only; we do not pretend it was transmitted anywhere.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => console.log('[SOS] Location (for the call):', position.coords.latitude, position.coords.longitude),
        (error) => console.warn('[SOS] Location unavailable:', error?.message),
      )
    }
    // Speak the truth, then connect the real call.
    await speakWithSarvam({
      text: 'आपको अभी सहायता टीम से फ़ोन पर जोड़ा जा रहा है। कृपया लाइन पर बने रहें।',
      languageCode: 'hi-IN',
    })
    setSosSent(true)
    setIsLoading(false)
    window.location.href = HELP_LINE
  }

  const handleCallTeam = () => {
    void speakWithSarvam({
      text: 'सहायता टीम से संपर्क किया जा रहा है।',
      languageCode: 'hi-IN',
    })
    window.location.href = HELP_LINE
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      {/* Sacred Gradient Backdrop - Using CSS class instead of inline style */}
      <div className="fixed inset-0 bg-sacred pointer-events-none -z-10" />

      {/* Subtle Amber Glow Background Element */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[150%] h-[400px] bg-gradient-to-b from-primary-container/10 to-transparent rounded-[100%] blur-3xl -z-10" />

      {/* Top Bar */}
      <TopBar
        showBack
        onBack={() => router.back()}
      />

      {/* Page Title */}
      <div className="text-center py-4">
        <h1 className="font-serif text-xl font-bold text-saffron font-devanagari shimmer-text">
          आपातकालीन सहायता
        </h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8 pt-4 flex flex-col items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Reassurance Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="font-serif text-2xl font-bold text-text-primary mb-2 font-devanagari">
              आप सुरक्षित हैं, हम आपके साथ हैं
            </h2>
            <div className="h-1 w-20 bg-saffron mx-auto rounded-full opacity-40" />
          </motion.div>

          {/* Hero SOS Illustration with Pulse Animation */}
          <motion.div variants={itemVariants} className="relative flex items-center justify-center mb-12">
            {/* Pulsing background with saffron glow */}
            <div className="sos-pulse absolute w-48 h-48 bg-saffron/20 rounded-full saffron-glow-active" />

            {/* Main SOS icon with shimmer */}
            <div className="relative z-10 w-40 h-40 bg-surface-card rounded-full flex items-center justify-center shadow-card-saffron">
              {sosSent ? (
                <SuccessCheckmark size="lg" animated={true} />
              ) : isLoading ? (
                <WaveformVisualizer barCount={5} height="lg" animated={true} />
              ) : (
                <span className="material-symbols-outlined text-7xl text-saffron material-symbols-filled shimmer-text">
                  emergency
                </span>
              )}
            </div>
          </motion.div>

          {/* Explainer Card (Bento Style) */}
          <motion.div
            variants={itemVariants}
            className="bg-surface-card rounded-3xl p-6 mb-6 shadow-card border-l-4 border-saffron"
          >
            {/* Location Feature */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-saffron-light flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-3xl text-saffron material-symbols-filled">
                  location_on
                </span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-text-primary mb-1 font-devanagari">
                  तुरंत कॉल
                </h3>
                <p className="text-text-secondary text-base leading-relaxed font-devanagari">
                  बटन दबाते ही आप हमारी सहायता टीम से सीधे फ़ोन पर जुड़ जाते हैं — कॉल पर अपनी स्थिति और स्थान बता सकते हैं।
                </p>
              </div>
            </div>

            {/* Family Alert Feature */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-saffron-light flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-3xl text-saffron material-symbols-filled">
                  family_restroom
                </span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-text-primary mb-1 font-devanagari">
                  24/7 सहायता
                </h3>
                <p className="text-text-secondary text-base leading-relaxed font-devanagari">
                  हमारी सहायता टीम चौबीसों घंटे उपलब्ध है — किसी भी असुरक्षा या दुर्घटना की स्थिति में तुरंत जुड़ें।
                </p>
              </div>
            </div>
          </motion.div>

          {/* Primary Action - SOS Button */}
          <motion.div variants={itemVariants} className="w-full mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSendSOS}
              disabled={isLoading || sosSent}
              className={`w-full h-20 bg-gradient-to-b from-saffron to-saffron-dark text-white rounded-2xl flex items-center justify-center gap-4 shadow-btn-saffron active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sosSent ? 'bg-gradient-to-b from-trust-green to-trust-green-dark' : ''}`}
            >
              <span className="material-symbols-outlined text-4xl material-symbols-filled">
                {sosSent ? 'check_circle' : 'emergency'}
              </span>
              <span className="font-serif text-2xl font-bold tracking-wide font-devanagari">
                {sosSent ? 'सहायता टीम से जुड़ रहे हैं…' : 'सहायता के लिए कॉल करें'}
              </span>
            </motion.button>
          </motion.div>

          {/* Secondary Action - Call Team */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCallTeam}
              className="w-full h-16 bg-surface-muted text-text-secondary rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border-2 border-transparent hover:border-saffron/30"
            >
              <span className="material-symbols-outlined text-2xl">call</span>
              <span className="font-label text-xl font-semibold font-devanagari">
                📞 Team se baat karein
              </span>
            </motion.button>
          </motion.div>

          {/* Information Note */}
          <motion.footer
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <p className="text-text-placeholder text-base px-10 font-devanagari">
              यह सुविधा 24/7 सक्रिय है। किसी भी दुर्घटना या असुरक्षा की स्थिति में इसका उपयोग करें।
            </p>
          </motion.footer>
        </motion.div>
      </main>
    </div>
  )
}
