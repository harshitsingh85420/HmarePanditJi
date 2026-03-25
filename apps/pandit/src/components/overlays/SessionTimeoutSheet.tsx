'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'

const TIMEOUT_SECONDS = 5 * 60

export function SessionTimeoutSheet() {
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS)
  const { setSessionTimeout } = useUIStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = (secondsLeft / TIMEOUT_SECONDS) * 100

  const handleStillHere = () => {
    setSessionTimeout(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
      >
        <div className="bg-surface-card rounded-t-[20px] shadow-sheet px-6 py-5">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-border-default rounded-pill" />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-saffron text-2xl">schedule</span>
            <p className="text-text-primary font-devanagari font-semibold text-lg">
              Kya aap abhi bhi yahaan hain?
            </p>
          </div>

          <p className="text-text-secondary font-devanagari text-base mb-4">
            {minutes}:{String(seconds).padStart(2, '0')} mein screen band ho jaayegi.
            Aapka kaam save hai — wapas aayein to continue.
          </p>

          <div className="h-1 bg-surface-dim rounded-pill overflow-hidden mb-5">
            <motion.div
              className="h-full bg-saffron rounded-pill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStillHere}
            className="w-full min-h-[56px] bg-primary-container text-white font-bold rounded-btn flex items-center justify-center shadow-btn-saffron focus:ring-2 focus:ring-primary focus:outline-none"
          >
            Haan, main yahaan hoon
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
