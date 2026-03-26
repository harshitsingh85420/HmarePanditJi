'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { useEffect } from 'react'

/**
 * NetworkBanner (X-01)
 * 
 * Features:
 * - Online: "Reconnected ✓" (green, 2s)
 * - Offline: "Network chala gaya" (amber, sticky)
 * 
 * Accessibility:
 * - Screen reader announcements
 * - Reduced motion support
 * - High contrast colors
 */
export function NetworkBanner() {
  const { showNetworkBanner, isOnline, dismissNetworkBanner } = useUIStore()

  // Auto-dismiss online banner after 2 seconds
  useEffect(() => {
    if (showNetworkBanner && isOnline) {
      const timer = setTimeout(() => {
        dismissNetworkBanner()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showNetworkBanner, isOnline, dismissNetworkBanner])

  return (
    <AnimatePresence>
      {showNetworkBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`overflow-hidden ${isOnline ? 'bg-trust-green-bg' : 'bg-warning-amber-bg'
            }`}
          role="status"
          aria-live={isOnline ? 'polite' : 'assertive'}
          aria-label={isOnline ? 'Network reconnected' : 'Network offline'}
        >
          <div className="px-6 py-4 flex items-center justify-center gap-3">
            {isOnline ? (
              <>
                <span className="material-symbols-outlined text-trust-green text-[32px]" aria-hidden="true">
                  check_circle
                </span>
                <div>
                  <p className="text-[18px] font-bold text-trust-green">
                    Reconnected ✓
                  </p>
                  <p className="text-[16px] text-text-secondary font-medium">
                    Network connected
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-warning-amber text-[32px]" aria-hidden="true">
                  wifi_off
                </span>
                <div>
                  <p className="text-[20px] font-bold text-warning-amber">
                    Network chala gaya
                  </p>
                  <p className="text-[16px] text-text-secondary font-medium">
                    Kripya wait karein
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
