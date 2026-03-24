'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/uiStore'
import { speakWithSarvam } from '@/lib/sarvam-tts'

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

  return (
    <div className="w-full flex flex-col border-t border-border-default">
      {/* SOS Emergency Button */}
      <motion.button
        onClick={handleSOS}
        whileTap={{ scale: 0.98 }}
        className="w-full h-14 bg-gradient-to-b from-error-red to-error-red-dark text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-2xl material-symbols-filled">
          emergency
        </span>
        <span className="font-label text-[16px] font-devanagari">
          🚨 SOS आपातकालीन सहायता
        </span>
      </motion.button>

      {/* Regular Help Bar */}
      <motion.button
        onClick={handleHelp}
        whileTap={{ scale: 0.98, backgroundColor: '#FFE0B2' }}
        className="w-full h-16 bg-saffron-light flex items-center justify-center gap-2 border-t border-warning-amber-bg"
      >
        <span className="material-symbols-outlined text-saffron text-[20px]">call</span>
        <span className="text-saffron font-label text-[16px] font-medium font-devanagari">
          Sahayata chahiye? Humse baat karein
        </span>
      </motion.button>
    </div>
  )
}
