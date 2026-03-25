'use client'

import { motion } from 'framer-motion'
import { WaveformVisualizer } from './WaveformBar'

interface VoiceIndicatorProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

/**
 * VoiceIndicator Component
 * Premium voice state indicator with saffron glow and waveform animations
 * Shows different animations for different voice states
 * 
 * @description UI-019: Enhanced voice feedback for elderly users
 * @uses WaveformVisualizer - Synchronized voice bars
 * @uses saffron-glow-active - Holy aura effect when listening
 */
export function VoiceIndicator({
  state,
  size = 'md',
  className = '',
  showLabel = true,
}: VoiceIndicatorProps) {
  const sizeMap = {
    sm: { barHeight: 'sm' as const, containerSize: 'w-12 h-12', labelSize: 'text-base' },
    md: { barHeight: 'md' as const, containerSize: 'w-16 h-16', labelSize: 'text-lg' },
    lg: { barHeight: 'lg' as const, containerSize: 'w-20 h-20', labelSize: 'text-xl' },
  }

  const { barHeight, containerSize, labelSize } = sizeMap[size]

  const labels = {
    idle: 'उत्तर देने के लिए माइक दबाएं',
    listening: 'सुन रहे हैं...',
    speaking: 'बोल रहे हैं...',
    processing: 'प्रोसेस कर रहे हैं...',
  }

  if (state === 'idle') {
    return (
      <div className={`${containerSize} ${className} flex items-center justify-center`}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full h-full rounded-full bg-saffron shadow-btn-saffron flex items-center justify-center saffron-glow"
        >
          <span className="material-symbols-outlined text-white text-3xl">mic</span>
        </motion.button>
        {showLabel && (
          <p className={`absolute bottom-[-28px] text-text-secondary font-devanagari ${labelSize}`}>
            {labels.idle}
          </p>
        )}
      </div>
    )
  }

  if (state === 'listening' || state === 'speaking') {
    return (
      <div className={`${containerSize} ${className} relative flex items-center justify-center`}>
        {/* Saffron glow effect - holy aura */}
        <div className="absolute inset-0 bg-saffron/20 rounded-full blur-lg saffron-glow-active" />

        {/* Animated pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-saffron/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Waveform bars */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <WaveformVisualizer
            barCount={5}
            height={barHeight}
            animated={true}
            gap={size === 'sm' ? 2 : 4}
          />
        </div>

        {showLabel && (
          <p className={`absolute bottom-[-28px] text-text-secondary font-devanagari ${labelSize}`}>
            {state === 'listening' ? labels.listening : labels.speaking}
          </p>
        )}
      </div>
    )
  }

  if (state === 'processing') {
    return (
      <div className={`${containerSize} ${className} relative flex items-center justify-center`}>
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-saffron/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center dots */}
        <div className="relative z-10 flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-saffron rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {showLabel && (
          <p className={`absolute bottom-[-28px] text-text-secondary font-devanagari ${labelSize}`}>
            {labels.processing}
          </p>
        )}
      </div>
    )
  }

  return null
}

export default VoiceIndicator
