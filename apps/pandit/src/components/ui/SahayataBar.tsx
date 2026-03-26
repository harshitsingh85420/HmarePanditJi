'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/uiStore'
import { speakWithSarvam } from '@/lib/sarvam-tts'

const HELPLINE_NUMBER = '+91-1234567890'

/**
 * SahayataBar Component
 * 
 * Features:
 * - "सहायता" text + phone icon
 * - Helpline number on tap
 * - Call button
 * 
 * Accessibility:
 * - All buttons have aria-label
 * - Keyboard navigation support
 * - Focus indicators visible
 * - Screen reader announcements
 */
export function SahayataBar() {
  const router = useRouter()
  const { setHelpSheet } = useUIStore()

  const handleSOS = async () => {
    await speakWithSarvam({
      text: 'SOS सहायता खोली जा रही है।',
      languageCode: 'hi-IN',
    })
    router.push('/emergency-sos')
  }

  const handleHelp = async () => {
    await speakWithSarvam({
      text: 'सहायता केंद्र खोला जा रहा है।',
      languageCode: 'hi-IN',
    })
    setHelpSheet(true)
  }

  const handleCall = async () => {
    await speakWithSarvam({
      text: 'हेल्पलाइन नंबर पर कॉल लगाया जा रहा है।',
      languageCode: 'hi-IN',
    })
    // Open phone dialer with helpline number
    window.location.href = `tel:${HELPLINE_NUMBER}`
  }

  return (
    <div className="w-full flex flex-col border-t border-border-default" role="navigation" aria-label="Help and support">
      {/* SOS Emergency Button */}
      <motion.button
        onClick={handleSOS}
        whileTap={{ scale: 0.98 }}
        className="w-full h-[72px] bg-gradient-to-b from-error-red to-error-red-dark text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-error-red focus:ring-offset-2"
        aria-label="Emergency SOS - Tap for immediate help"
      >
        <span className="material-symbols-outlined text-2xl material-symbols-filled" aria-hidden="true">
          emergency
        </span>
        <span className="font-label text-[16px] font-devanagari">
          🚨 SOS आपातकालीन सहायता
        </span>
      </motion.button>

      {/* Helpline Call Button */}
      <motion.button
        onClick={handleCall}
        whileTap={{ scale: 0.98, backgroundColor: '#E8F5E9' }}
        className="w-full h-[64px] bg-trust-green-bg flex items-center justify-center gap-2 border-t border-trust-green/20 focus:outline-none focus:ring-2 focus:ring-trust-green focus:ring-offset-2"
        aria-label={`Call helpline: ${HELPLINE_NUMBER}`}
      >
        <span className="material-symbols-outlined text-trust-green text-[24px]" aria-hidden="true">call</span>
        <div className="text-left">
          <p className="text-trust-green font-label text-[14px] font-medium">
            हेल्पलाइन नंबर
          </p>
          <p className="text-trust-green font-bold text-[16px] font-mono">
            {HELPLINE_NUMBER}
          </p>
        </div>
      </motion.button>

      {/* Regular Help Bar */}
      <motion.button
        onClick={handleHelp}
        whileTap={{ scale: 0.98, backgroundColor: '#FFE0B2' }}
        className="w-full h-[64px] bg-saffron-light flex items-center justify-center gap-2 border-t border-warning-amber-bg focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2"
        aria-label="Get help - Open help center"
      >
        <span className="material-symbols-outlined text-saffron text-[20px]" aria-hidden="true">help</span>
        <span className="text-saffron font-label text-[16px] font-medium font-devanagari">
          सहायता चाहिए? हमसे बात करें
        </span>
      </motion.button>
    </div>
  )
}
