'use client'

import { motion } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'

export function SahayataBar() {
  const { setHelpSheet } = useUIStore()

  return (
    <motion.button
      onClick={() => setHelpSheet(true)}
      whileTap={{ scale: 0.98, backgroundColor: '#FFE0B2' }}
      // CRITICAL FIX: Increased from h-11 (44px) to h-16 (64px) for elderly accessibility
      className="w-full h-16 bg-saffron-light flex items-center justify-center gap-2
                 border-t border-warning-amber-bg"
    >
      <span className="material-symbols-outlined text-saffron text-[20px]">call</span>
      <span className="text-saffron font-label text-[16px] font-medium">
        Sahayata chahiye? Humse baat karein
      </span>
    </motion.button>
  )
}
