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
          {/* UI-013 FIX: Larger text and icons for offline banner */}
          <div className="px-6 py-4 flex items-center justify-center gap-3">
            {isOnline ? (
              <>
                <span className="material-symbols-outlined text-trust-green text-[32px]">
                  wifi
                </span>
                <div>
                  <p className="text-[18px] font-bold text-trust-green">
                    आप फिर से ऑनलाइन हैं
                  </p>
                  <p className="text-[16px] text-text-secondary font-medium">
                    कनेक्शन ठीक हो गया
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-warning-amber text-[32px]">
                  wifi_off
                </span>
                <div>
                  <p className="text-[20px] font-bold text-warning-amber">
                    इंटरनेट नहीं है
                  </p>
                  <p className="text-[16px] text-text-secondary font-medium">
                    कनेक्शन ठीक होने पर पुनः प्रयास करें
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
