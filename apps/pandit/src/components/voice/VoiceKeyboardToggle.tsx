'use client'

import { motion } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'

interface VoiceKeyboardToggleProps {
  onVoiceSelect?: () => void
  onKeyboardSelect?: () => void
}

export function VoiceKeyboardToggle({
  onVoiceSelect,
  onKeyboardSelect,
}: VoiceKeyboardToggleProps) {
  const { isKeyboardMode, switchToKeyboard, switchToVoice } = useVoiceStore()

  const handleVoice = () => {
    switchToVoice()
    onVoiceSelect?.()
  }

  const handleKeyboard = () => {
    switchToKeyboard()
    onKeyboardSelect?.()
  }

  return (
    <div className="w-full h-14 bg-surface-card border-t border-border-default flex">
      {/* Voice Side */}
      <motion.button
        onClick={handleVoice}
        whileTap={{ scale: 0.97 }}
        className={`flex-1 flex items-center justify-center gap-2 text-lg font-label font-medium
                   border-b-2 transition-colors duration-200
                   ${!isKeyboardMode
            ? 'text-saffron-container border-saffron-container bg-saffron-light'
            : 'text-text-secondary border-transparent bg-white'
          }`}
      >
        <span className={`material-symbols-outlined text-lgl ${!isKeyboardMode ? 'filled' : ''}`}>
          mic
        </span>
        <span>Bolne ke liye tapein</span>
        {!isKeyboardMode && (
          <motion.span
            className="w-2 h-2 rounded-full bg-saffron-container"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Divider */}
      <div className="w-px bg-border-default my-3" />

      {/* Keyboard Side */}
      <motion.button
        onClick={handleKeyboard}
        whileTap={{ scale: 0.97 }}
        className={`flex-1 flex items-center justify-center gap-2 text-lg font-label font-medium
                   border-b-2 transition-colors duration-200
                   ${isKeyboardMode
            ? 'text-saffron-container border-saffron-container bg-saffron-light'
            : 'text-text-secondary border-transparent bg-white'
          }`}
      >
        <span className="material-symbols-outlined text-lgl">keyboard</span>
        <span>Type karein</span>
      </motion.button>
    </div>
  )
}
