'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { useRegistrationStore } from '@/stores/registrationStore'

export function SessionSaveNotice() {
  const { showSessionSaveNotice, setSessionSaveNotice } = useUIStore()
  const { data } = useRegistrationStore()

  useEffect(() => {
    if (data.currentStep === 'mobile') {
      setSessionSaveNotice(true)
      const timer = setTimeout(() => setSessionSaveNotice(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [data.currentStep, setSessionSaveNotice])

  return (
    <AnimatePresence>
      {showSessionSaveNotice && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-surface-card rounded-card shadow-card p-4 flex items-center gap-3 border-l-4 border-saffron">
            <span className="material-symbols-outlined text-saffron text-2xl">
              save
            </span>
            <div className="flex-1">
              <p className="text-text-primary font-bold text-sm">
                आपका डेटा सुरक्षित है
              </p>
              <p className="text-text-secondary text-xs">
                आप कभी भी वापस आकर जारी रख सकते हैं
              </p>
            </div>
            <button
              onClick={() => setSessionSaveNotice(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
