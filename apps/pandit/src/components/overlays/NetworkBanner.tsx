'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'

export function NetworkBanner() {
  const { showNetworkBanner, isOnline } = useUIStore()

  return (
    <AnimatePresence>
      {showNetworkBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`overflow-hidden ${isOnline ? 'bg-trust-green-bg' : 'bg-warning-amber-bg'
            }`}
        >
          <div className="px-4 py-2 flex items-center justify-center gap-2">
            {isOnline ? (
              <>
                <span className="material-symbols-outlined text-trust-green text-lg">
                  wifi
                </span>
                <span className="text-sm font-medium text-trust-green">
                  आप फिर से ऑनलाइन हैं
                </span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-warning-amber text-lg">
                  wifi_off
                </span>
                <span className="text-sm font-medium text-warning-amber">
                  इंटरनेट कनेक्शन नहीं है
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
