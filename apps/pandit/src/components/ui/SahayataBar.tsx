'use client'

import { motion } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'

export function SahayataBar() {
  const { setHelpSheet } = useUIStore()

  return (
    <motion.button
      onClick={() => setHelpSheet(true)}
      whileTap={{ scale: 0.98, backgroundColor: '#FFE0B2' }}
      className="w-full h-11 bg-saffron-light flex items-center justify-center gap-2
                 border-t border-warning-amber-bg"
    >
      <span className="material-symbols-outlined text-saffron text-lg">call</span>
      <span className="text-saffron font-label text-sm font-medium">
        Sahayata chahiye? Humse baat karein
      </span>
    </motion.button>
  )
}