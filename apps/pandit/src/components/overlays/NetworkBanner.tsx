'use client'

import { motion } from 'framer-motion'

interface NetworkBannerProps {
  isOnline: boolean
}

export function NetworkBanner({ isOnline }: NetworkBannerProps) {
  return (
    <motion.div
      initial={{ y: -44 }}
      animate={{ y: 0 }}
      exit={{ y: -44 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-14 left-0 right-0 z-40 h-11 flex items-center justify-between px-5
                 ${isOnline ? 'bg-trust-green' : 'bg-warning-amber'}`}
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-white text-xl">
          {isOnline ? 'wifi' : 'signal_wifi_off'}
        </span>
        <p className="text-white text-sm font-medium font-devanagari">
          {isOnline 
            ? 'Internet wapas aa gayi ✅'
            : 'Internet nahi hai — koi baat nahi, sab save hai'
          }
        </p>
      </div>
      
      {!isOnline && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <span className="material-symbols-outlined text-white text-xl">sync</span>
        </motion.div>
      )}
    </motion.div>
  )
}
