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
            // canon frame 33 row: #FFFDF8 on 1.5px #F0DFC4, r16, 14/16 pad, gap 13
            className="min-h-[56px] bg-card border-[1.5px] border-sand rounded-[16px] px-4 py-[14px] flex items-center gap-[13px] shadow-card"
          >
            <span className="w-[46px] h-[46px] rounded-[12px] bg-[#E4F3E9] flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-[24px] leading-none">📞</span>
            </span>
            {/* canon labels this size 17; 18px is the 18sp floor */}
            <span className="text-[18px] font-extrabold text-ink font-hindi">सहायता टीम को कॉल कीजिए</span>
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
// canon frame 25 surface (sindoor radial + lift) on the P0 मदद pill
        className="relative min-h-[56px] px-4 rounded-full flex items-center gap-2 border-2 border-white"
        style={{
          background: 'radial-gradient(circle at 50% 40%,#D8402A,#B23A1A 70%)',
          boxShadow: '0 12px 30px rgba(178,58,26,.4)',
        }}
        aria-label="आपातकालीन सहायता — मदद"
      >
        {!isExpanded && (
          <div className="absolute inset-0 rounded-full bg-[#C2321E]/20 animate-ping motion-reduce:animate-none" />
        )}
<span className="text-white text-[24px] leading-none relative z-10" aria-hidden="true">🆘</span>
        <span className="text-white font-bold text-[16px] font-hindi relative z-10">मदद</span>
      </motion.button>
    </div>
  )
}

export default EmergencySOSFloating
