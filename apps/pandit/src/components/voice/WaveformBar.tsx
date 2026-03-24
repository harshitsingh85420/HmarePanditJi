'use client'

import { motion } from 'framer-motion'

interface WaveformBarProps {
  index?: number
  height?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const heightMap = {
  sm: { min: 6, max: 16 },
  md: { min: 8, max: 24 },
  lg: { min: 12, max: 32 },
}

/**
 * WaveformBar Component
 * Animated voice visualization bar for voice states
 * Used in voice indicators, tutorial screens, and voice response cards
 * 
 * @description UI-003: Voice bar animations for elderly user feedback
 */
export function WaveformBar({
  index = 0,
  height = 'md',
  animated = true,
  className = ''
}: WaveformBarProps) {
  const { min, max } = heightMap[height]

  return (
    <motion.div
      className={`waveform-bar ${className}`}
      style={{
        width: '6px',
        borderRadius: '3px',
        background: 'linear-gradient(to top, #904D00, #FF8C00)',
      }}
      animate={animated ? {
        height: [min, max, min],
      } : {}}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay: index * 0.15,
      }}
    />
  )
}

interface WaveformVisualizerProps {
  barCount?: number
  height?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
  gap?: number
}

/**
 * WaveformVisualizer Component
 * Complete voice waveform visualizer with multiple bars
 * Synchronized with TTS for real-time voice feedback
 * 
 * @description Part 0 Tutorial: Voice visualization for Pandit Ji
 */
export function WaveformVisualizer({
  barCount = 5,
  height = 'md',
  animated = true,
  className = '',
  gap = 4,
}: WaveformVisualizerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-${gap} ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <WaveformBar
          key={i}
          index={i}
          height={height}
          animated={animated}
        />
      ))}
    </div>
  )
}

interface VoiceIndicatorProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * VoiceIndicator Component
 * Premium voice state indicator with saffron glow
 * Shows different animations for different voice states
 * 
 * @description UI-019: Enhanced voice feedback for elderly users
 */
export function VoiceIndicator({
  state,
  size = 'md',
  className = ''
}: VoiceIndicatorProps) {
  const sizeMap = {
    sm: { barHeight: 'sm' as const, containerSize: 'w-12 h-12' },
    md: { barHeight: 'md' as const, containerSize: 'w-16 h-16' },
    lg: { barHeight: 'lg' as const, containerSize: 'w-20 h-20' },
  }

  const { barHeight, containerSize } = sizeMap[size]

  if (state === 'idle') {
    return (
      <div className={`${containerSize} ${className} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-saffron text-3xl">mic</span>
      </div>
    )
  }

  if (state === 'listening' || state === 'speaking') {
    return (
      <div className={`${containerSize} ${className} relative`}>
        {/* Saffron glow effect */}
        <div className="absolute inset-0 bg-saffron/20 rounded-full blur-lg saffron-glow-active" />

        {/* Waveform bars */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <WaveformVisualizer
            barCount={5}
            height={barHeight}
            animated={true}
            gap={size === 'sm' ? 2 : 4}
          />
        </div>
      </div>
    )
  }

  if (state === 'processing') {
    return (
      <div className={`${containerSize} ${className} relative`}>
        {/* Pulsing ring */}
        <div className="absolute inset-0 border-4 border-saffron/30 rounded-full animate-ping" />

        {/* Center dots */}
        <div className="relative z-10 w-full h-full flex items-center justify-center gap-1">
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
      </div>
    )
  }

  return null
}

export default WaveformBar
