'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { WaveformVisualizer } from '@/components/voice/WaveformBar'
import { SuccessCheckmark } from '@/components/ui/CompletionBadge'
import { useReduced, still, fadeInUp, stagger, pulse } from '@/lib/motion'

export default function EmergencySOS() {
  const router = useRouter()
  const [sosSent, setSosSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const reduced = useReduced()

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
          {/* Reassurance Header — mockup frame 25: घबराएँ नहीं 24/900 */}
          <motion.div variants={item} className="text-center mb-8">
            <h2 className="text-[24px] font-black text-ink mb-1 font-hindi">
              घबराएँ नहीं
            </h2>
            <p className="text-[17px] font-semibold text-softgrey font-hindi">
              हम हर पल आपके साथ हैं 🙏
            </p>
          </motion.div>

          {/* Mockup frame 25: the big circle IS the SOS button — same
              handleSendSOS the old rectangle carried, one tap (hold-to-
              press skipped: reliability for elderly hands) */}
          <motion.div variants={item} className="relative flex items-center justify-center mb-10">
            {/* Pulsing ring (transform-only, honors reduced-motion) */}
            <motion.div
              className="absolute w-52 h-52 bg-saffron-500/20 rounded-full"
              variants={reduced ? still(pulse) : pulse}
              animate="show"
              aria-hidden="true"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSendSOS}
              disabled={isLoading || sosSent}
              className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center gap-1 shadow-btn transition-transform disabled:opacity-70 disabled:pointer-events-none ${
                sosSent ? 'bg-leaf-500' : 'bg-saffron-500'
              } text-chandan`}
            >
              {sosSent ? (
                <SuccessCheckmark size="lg" animated={true} />
              ) : isLoading ? (
                <WaveformVisualizer barCount={5} height="lg" animated={true} />
              ) : (
                <>
                  <span className="text-[44px] leading-none select-none" aria-hidden="true">🆘</span>
                  <span className="text-[22px] font-black font-hindi leading-tight">सहायता बुलाएँ</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Explainer Card (kit accent rail) */}
          <motion.div variants={item} className="mb-6">
            <Card accent="saffron" className="p-6 flex flex-col gap-6">
              {/* Immediate call */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-btn bg-saffron-100 flex items-center justify-center shrink-0">
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
                <div className="w-12 h-12 rounded-btn bg-saffron-100 flex items-center justify-center shrink-0">
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

          {/* Secondary Action — mockup frame 25 row: हमारी सहायता टीम with
              a leaf tile and a call glyph (same handleCallTeam) */}
          <motion.div variants={item}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCallTeam}
              className="w-full bg-card border border-sand rounded-[16px] px-4 min-h-[72px] flex items-center gap-3 shadow-card active:scale-[0.97] transition-transform"
            >
              <span className="w-12 h-12 rounded-[12px] bg-leaf-100 flex items-center justify-center text-[24px] shrink-0 select-none" aria-hidden="true">🎧</span>
              <span className="flex-1 text-left">
                <span className="block text-[17px] font-extrabold text-ink font-hindi">हमारी सहायता टीम</span>
                <span className="block text-[14px] text-softgrey font-hindi">तुरंत कॉल</span>
              </span>
              <span className="text-leaf-500 text-[24px]" aria-hidden="true">📞</span>
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
