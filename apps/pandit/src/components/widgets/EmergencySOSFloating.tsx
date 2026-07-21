'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { speakWithSarvam } from '@/lib/sarvam-tts'

interface EmergencySOSFloatingProps {
  isVisible?: boolean
}

export function EmergencySOSFloating({ isVisible = true }: EmergencySOSFloatingProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSOSPress = async () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
    await speakWithSarvam({
      text: 'मदद का बटन दबाया गया। क्या आप वाकई किसी मुसीबत में हैं?',
      languageCode: 'hi-IN',
      pace: 0.85,
    })
    router.push('/emergency')
  }

  const handleExpand = async () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      await speakWithSarvam({
        text: 'आपातकालीन सहायता उपलब्ध है।',
        languageCode: 'hi-IN',
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
      {/* Expanded quick-action: call the support team. There is NO "call
          family" affordance — the app collects no family contact, so a
          button labelled "call family" would be a false safety promise
          (it would only dial support anyway). One honest action. */}
      <AnimatePresence>
        {isExpanded && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // L2: real, dialable help line
              window.location.href = 'tel:+918934095599'
              speakWithSarvam({ text: 'सहायता टीम से संपर्क किया जा रहा है।', languageCode: 'hi-IN' })
            }}
            className="min-h-[56px] px-4 bg-card rounded-btn shadow-card flex items-center gap-3 border-l-4 border-leaf-500"
          >
            <div className="w-10 h-10 rounded-btn bg-leaf-100 flex items-center justify-center shrink-0">
              <span className="text-[22px] leading-none" aria-hidden="true">📞</span>
            </div>
            <span className="font-bold text-ink font-hindi">सहायता टीम को कॉल करें</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main help button. Walk पP0 #11: at rest this showed "SOS" — three
          roman letters a Devanagari-only pandit cannot read as "help". Now
          it always shows 🆘 + "मदद" so it is recognisable at a glance, in
          any state. */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isExpanded ? handleSOSPress : handleExpand}
        className="relative min-h-[56px] px-4 bg-danger rounded-full shadow-lg flex items-center gap-2 border-2 border-white"
        aria-label="आपातकालीन सहायता — मदद"
      >
        {!isExpanded && (
          <div className="absolute inset-0 rounded-full bg-danger/20 animate-ping motion-reduce:animate-none" />
        )}
        <span className="text-white text-[24px] leading-none relative z-10" aria-hidden="true">🆘</span>
        <span className="text-white font-bold text-[16px] font-hindi relative z-10">मदद</span>
      </motion.button>
    </div>
  )
}

export default EmergencySOSFloating
