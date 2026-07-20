'use client'

import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { Header } from '@/components/ui/Header'
import { WaveformVisualizer } from '@/components/voice/WaveformBar'
import { SuccessCheckmark } from '@/components/ui/CompletionBadge'
import { useReduced, still, fadeInUp, stagger } from '@/lib/motion'

// Canon frame 33 labels the SOS button "दबाकर रखें" — a long-press, so a
// pocket-brush or a stray tap can never dial the help line. HOLD_MS is the
// press duration; the ring fills over exactly this long so the pandit can
// SEE the hold working, not just be told about it.
const HOLD_MS = 1200

// Canon's SOS button carries `animation:g-sos 1.8s ease-out infinite`, which
// animates BOX-SHADOW (0 0 0 0 → 0 0 0 30px). Standing law allows transform
// and opacity only, so the identical outward pulse is drawn by a separate
// halo element scaling 1 → 1.29 (210px → 270px = the 30px canon spread) and
// fading out. Visually the same ring; cheap on an A12.
const halo: Variants = {
  show: {
    scale: [1, 1.29],
    opacity: [0.5, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeOut' },
  },
}

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
  //
  // This is also why canon's SECOND bottom row ("परिवार को सूचना · जगह के
  // साथ SMS") is not drawn: the app collects no family contact and has no
  // SMS sender, so that row would be a false safety promise.
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
    <div
      className="h-[100dvh] flex flex-col max-w-[430px] mx-auto text-ink"
      // canon frame 33 screen bg
      style={{ background: 'radial-gradient(120% 60% at 50% 30%,#FFF4EC,#FFF9EE 60%)' }}
    >
      <Header festive title="आपातकालीन सहायता" showBack onBack={() => router.back()} />

      {/* canon frame 33 body: padding 20px 24px 26px, hero centred with the
          bottom action rows pinned under it */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center px-6 pt-5 pb-[26px]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full flex-1 flex flex-col items-center"
        >
          <style>{`@keyframes sos-hold-fill{from{transform:scaleY(0)}to{transform:scaleY(1)}}`}</style>

          {/* hero — canon gap:26px between the reassurance block and the button */}
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-[26px]">
            {/* Reassurance — canon 24/900 #341A13 over 17/600 #8A6F5C, mt 5px */}
            <motion.div variants={item} className="text-center">
              <div className="text-[24px] font-black text-ink font-hindi leading-tight">
                घबराएँ नहीं
              </div>
              {/* canon 17px → 18px (18sp floor) */}
              <div className="text-[18px] font-semibold text-softgrey font-hindi mt-[5px]">
                हम हर पल आपके साथ हैं 🙏
              </div>
            </motion.div>

            {/* canon SOS button: 210px circle, radial sindoor gradient,
                0 12px 30px rgba(178,58,26,.4) */}
            <motion.div variants={item} className="relative flex items-center justify-center">
              {/* the g-sos outward pulse, transform/opacity only */}
              <motion.span
                aria-hidden="true"
                className="absolute w-[210px] h-[210px] rounded-full bg-[#C2321E]"
                variants={reduced ? still(halo) : halo}
                animate="show"
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
                className="relative z-10 w-[210px] h-[210px] rounded-full flex flex-col items-center justify-center gap-2 transition-transform disabled:opacity-70 disabled:pointer-events-none overflow-hidden select-none"
                style={{
                  background: sosSent
                    ? 'radial-gradient(circle at 50% 40%,#2A9159,#1E7A46 70%)'
                    : 'radial-gradient(circle at 50% 40%,#D8402A,#B23A1A 70%)',
                  boxShadow: sosSent
                    ? '0 12px 30px rgba(30,122,70,.4)'
                    : '0 12px 30px rgba(178,58,26,.4)',
                  color: '#FFF6E9',
                }}
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
                    {/* canon glyph 56px */}
                    <span className="relative text-[56px] leading-none select-none" aria-hidden="true">🆘</span>
                    {/* canon 24/900 */}
                    <span className="relative text-[24px] font-black font-hindi leading-tight">सहायता बुलाएँ</span>
                    {/* canon 14/600 opacity .9 → 18px (18sp floor) */}
                    <span className="relative text-[18px] font-semibold font-hindi opacity-90">दबाकर रखें</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* canon bottom rows — column, gap 11px. Only the one TRUE row. */}
          <motion.div variants={item} className="w-full flex flex-col gap-[11px]">
            <button
              type="button"
              onClick={handleCallTeam}
              className="w-full bg-card border-[1.5px] border-sand rounded-[16px] px-4 py-[14px] flex items-center gap-[13px] text-left active:scale-[0.97] transition-transform"
            >
              <span
                className="w-[46px] h-[46px] rounded-[12px] bg-[#E4F3E9] flex items-center justify-center text-[24px] shrink-0 select-none"
                aria-hidden="true"
              >
                🎧
              </span>
              <span className="flex-1">
                {/* canon 17/800 → 20px, and 14 → 18px (18sp floor) */}
                <span className="block text-[20px] font-extrabold text-ink font-hindi leading-tight">हमारी सहायता टीम</span>
                <span className="block text-[18px] text-softgrey font-hindi mt-[2px]">तुरंत कॉल</span>
              </span>
              <span className="text-[24px] text-[#1E7A46]" aria-hidden="true">📞</span>
            </button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
