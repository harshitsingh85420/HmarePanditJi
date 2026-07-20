'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { WaveformVisualizer } from '@/components/voice/WaveformBar'
import { SuccessCheckmark } from '@/components/ui/CompletionBadge'
import { useReduced, still, fadeInUp, stagger, pulse } from '@/lib/motion'

// Canon frame 25 labels the SOS button "दबाकर रखें" — a long-press, so a
// pocket-brush or a stray tap can never dial the help line. HOLD_MS is the
// press duration; the ring fills over exactly this long so the pandit can
// SEE the hold working, not just be told about it.
const HOLD_MS = 1200

export default function EmergencySOS() {
  const router = useRouter()
  const [sosSent, setSosSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [holding, setHolding] = useState(false)
  const reduced = useReduced()

  useEffect(() => {
    // Welcome voice. PERSONA: long-press is not discoverable for a
    // 62-year-old, so the ONE spoken line must teach the gesture itself —
    // the written "दबाकर रखें" under the button carries the same word.
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'घबराएँ नहीं। मदद के लिए बीच का लाल बटन दबाकर रखें।',
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

  // Hold-to-fire. A press that is released early is simply cancelled — no
  // call, no state change. Pointer events cover touch, pen and mouse, and
  // pointercancel (scroll steals the gesture) counts as a release.
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    setHolding(false)
  }
  const startHold = () => {
    if (isLoading || sosSent) return
    setHolding(true)
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null
      setHolding(false)
      void handleSendSOS()
    }, HOLD_MS)
  }
  // never leave a timer armed behind us
  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current) }, [])

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
            <style>{`@keyframes sos-hold-fill{from{transform:scaleY(0)}to{transform:scaleY(1)}}`}</style>
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
              onPointerDown={startHold}
              onPointerUp={clearHold}
              onPointerLeave={clearHold}
              onPointerCancel={clearHold}
              // keyboard parity: Enter/Space fire directly (a key has no
              // "hold" affordance to teach, and the accidental-press risk
              // this guards against is a pocket touch, not a keypress)
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  void handleSendSOS()
                }
              }}
              disabled={isLoading || sosSent}
              aria-label="सहायता बुलाएँ — दबाकर रखें"
              className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center gap-1 shadow-btn transition-transform disabled:opacity-70 disabled:pointer-events-none overflow-hidden select-none ${
                sosSent ? 'bg-leaf-500' : 'bg-saffron-500'
              } text-chandan`}
            >
              {/* hold progress — a ring that fills over exactly HOLD_MS so the
                  gesture is VISIBLE, not just described. Transform/opacity
                  only, and reduced-motion keeps it static. */}
              {holding && !reduced && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white/25 origin-bottom"
                  style={{ animation: `sos-hold-fill ${HOLD_MS}ms linear forwards` }}
                />
              )}
              {sosSent ? (
                <SuccessCheckmark size="lg" animated={true} />
              ) : isLoading ? (
                <WaveformVisualizer barCount={5} height="lg" animated={true} />
              ) : (
                <>
                  <span className="relative text-[44px] leading-none select-none" aria-hidden="true">🆘</span>
                  <span className="relative text-[22px] font-black font-hindi leading-tight">सहायता बुलाएँ</span>
                  {/* canon frame 25: the gesture, in writing, on the button */}
                  <span className="relative text-[14px] font-semibold font-hindi opacity-90">दबाकर रखें</span>
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
