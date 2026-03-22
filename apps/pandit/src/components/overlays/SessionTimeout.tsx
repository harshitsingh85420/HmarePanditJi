'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'

export function SessionTimeoutSheet() {
  const { showSessionTimeout } = useUIStore()

  return (
    <AnimatePresence>
      {showSessionTimeout && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-surface-card rounded-t-[20px] shadow-2xl p-6 pb-safe"
          >
            <div className="w-10 h-1 bg-border-default rounded-full mx-auto mb-4" />
            
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-4xl text-saffron mb-2">
                timer
              </span>
              <h2 className="text-xl font-bold text-text-primary mb-1">
                सत्र समाप्त होने वाला है
              </h2>
              <p className="text-text-secondary">
                आपकी गतिविधि नहीं मिली है। क्या आप अभी भी यहाँ हैं?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 h-14 bg-saffron text-white font-bold rounded-btn shadow-btn-saffron"
              >
                हाँ, मैं यहाँ हूँ
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 h-14 border-2 border-saffron text-saffron font-bold rounded-btn"
              >
                नहीं, बाद में
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
