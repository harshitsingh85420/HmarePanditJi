'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { useReduced, still, fadeInUp, stagger, pulse } from '@/lib/motion'

export default function EmergencySOSPage() {
  const router = useRouter()

  // SSR FIX: Use safe store hook that doesn't throw during SSR
  const { setSection } = useSafeNavigationStore()

  const [sosSent, setSosSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const reduced = useReduced()

  useEffect(() => {
    setSection('emergency-sos')
  }, [setSection])

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

  const handleSendSOS = async () => {
    setIsLoading(true)

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // No SOS backend exists yet — do something REAL instead of a fake
          // "message sent": speak the truth and connect the call immediately.
          console.log('[SOS] Location:', latitude, longitude)

          await speakWithSarvam({
            text: 'आपकी जगह मिल गई। टीम को फ़ोन लगाया जा रहा है, लाइन पर बने रहें।',
            languageCode: 'hi-IN',
          })

          setSosSent(true)
          setIsLoading(false)
          window.location.href = 'tel:+918934095599'
        },
        (error) => {
          console.error('[SOS] Location error:', error)
          void speakWithSarvam({
            text: 'स्थान प्राप्त नहीं हो सका। कृपया location permissions चेक करें।',
            languageCode: 'hi-IN',
          })
          setIsLoading(false)
        }
      )
    } else {
      void speakWithSarvam({
        text: 'Location supported नहीं है।',
        languageCode: 'hi-IN',
      })
      setIsLoading(false)
    }
  }

  const handleCallTeam = () => {
    void speakWithSarvam({
      text: 'टीम से संपर्क किया जा रहा है।',
      languageCode: 'hi-IN',
    })
    // In production: Open phone dialer or initiate VoIP call
    window.location.href = 'tel:+918934095599'
  }

  const container = reduced ? still(stagger(0.12)) : stagger(0.12)
  const item = reduced ? still(fadeInUp) : fadeInUp

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header festive title="आपातकालीन सहायता" showBack onBack={() => router.back()} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col items-center justify-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-md flex flex-col"
        >
          {/* Reassurance Header */}
          <motion.div variants={item} className="text-center mb-8">
            <h2 className="text-[24px] font-bold text-ink mb-2 font-hindi">
              आप सुरक्षित हैं, हम आपके साथ हैं
            </h2>
            <div className="h-1 w-20 bg-saffron-500 mx-auto rounded-full opacity-50" />
          </motion.div>

          {/* Hero SOS Illustration with Pulse Animation */}
          <motion.div variants={item} className="relative flex items-center justify-center mb-10">
            {/* Pulsing ring (transform-only, honors reduced-motion) */}
            <motion.div
              className="absolute w-48 h-48 bg-saffron-500/20 rounded-full"
              variants={reduced ? still(pulse) : pulse}
              animate="show"
              aria-hidden="true"
            />
            {/* Main SOS icon */}
            <div className="relative z-10 w-40 h-40 bg-card rounded-full flex items-center justify-center shadow-btn">
              <span className="text-[64px] leading-none select-none" aria-hidden="true">🆘</span>
            </div>
          </motion.div>

          {/* Explainer Card — TRUTHFUL: this screen connects a real phone call
              (there is no SOS backend), so it must never claim a location was
              transmitted or that family/control-room were notified. */}
          <motion.div variants={item} className="mb-6">
            <Card accent="saffron" className="p-6 flex flex-col gap-6">
              {/* Immediate call */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-btn bg-saffron-50 flex items-center justify-center shrink-0">
                  <span className="text-[28px] leading-none" aria-hidden="true">📞</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-ink mb-1 font-hindi">
                    तुरंत कॉल
                  </h3>
                  <p className="text-softgrey text-[16px] leading-relaxed font-hindi">
                    बटन दबाते ही आप हमारी सहायता टीम से सीधे फ़ोन पर जुड़ जाते हैं — कॉल पर अपनी स्थिति और स्थान बता सकते हैं।
                  </p>
                </div>
              </div>

              {/* 24/7 support */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-btn bg-saffron-50 flex items-center justify-center shrink-0">
                  <span className="text-[28px] leading-none" aria-hidden="true">🛟</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-ink mb-1 font-hindi">
                    चौबीसों घंटे सहायता
                  </h3>
                  <p className="text-softgrey text-[16px] leading-relaxed font-hindi">
                    हमारी सहायता टीम चौबीसों घंटे उपलब्ध है — किसी भी असुरक्षा या दुर्घटना की स्थिति में तुरंत जुड़ें।
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Primary Action — SOS/Call button (retokened in place: no kit
              Button so the safety action gains no haptic/spinner surprise). */}
          <motion.div variants={item} className="w-full mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSendSOS}
              disabled={isLoading || sosSent}
              className={`w-full min-h-[80px] rounded-btn flex items-center justify-center gap-4 shadow-btn active:scale-[0.97] transition-transform disabled:opacity-60 disabled:pointer-events-none ${sosSent ? 'bg-leaf-500' : 'bg-saffron-500'} text-chandan`}
            >
              <span className="text-[36px] leading-none" aria-hidden="true">
                {sosSent ? '✅' : '🆘'}
              </span>
              <span className="text-[24px] font-bold font-hindi">
                {sosSent ? 'सहायता टीम से जुड़ रहे हैं…' : 'सहायता के लिए कॉल करें'}
              </span>
            </motion.button>
          </motion.div>

          {/* Secondary Action — Call Team */}
          <motion.div variants={item}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCallTeam}
              className="w-full min-h-[56px] bg-[#F8E3D2] text-saffron-700 rounded-btn flex items-center justify-center gap-3 active:scale-[0.97] transition-transform"
            >
              <span className="text-[24px] leading-none" aria-hidden="true">📞</span>
              <span className="text-[20px] font-semibold font-hindi">
                टीम से बात करें
              </span>
            </motion.button>
          </motion.div>

          {/* Information Note */}
          <motion.footer variants={item} className="mt-8 text-center">
            <p className="text-softgrey text-[16px] px-8 font-hindi">
              यह सुविधा चौबीसों घंटे सक्रिय है। किसी भी दुर्घटना या असुरक्षा की स्थिति में इसका उपयोग करें।
            </p>
          </motion.footer>
        </motion.div>
      </main>
    </div>
  )
}
