'use client'

import { motion } from 'framer-motion'

interface SuccessCheckmarkProps {
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
  showCircle?: boolean
  circleColor?: string
  checkColor?: string
}

const sizeMap = {
  sm: { container: 'w-12 h-12', circle: 48, check: 24 },
  md: { container: 'w-20 h-20', circle: 80, check: 40 },
  lg: { container: 'w-32 h-32', circle: 128, check: 64 },
}

/**
 * SuccessCheckmark Component
 * Premium animated checkmark with draw-circle and draw-check animations
 * Used for completion states, success confirmations, and verification
 * 
 * @description UI-020: Completion animation for tutorial and onboarding flows
 * @animation draw-circle: Circle draws itself clockwise
 * @animation draw-check: Checkmark draws after circle completes
 */
export function SuccessCheckmark({
  size = 'md',
  animated = true,
  className = '',
  showCircle = true,
  circleColor = '#1B6D24',
  checkColor = '#1B6D24',
}: SuccessCheckmarkProps) {
  const { container, circle: circleSize, check: checkSize } = sizeMap[size]

  const circleCircumference = Math.PI * circleSize
  const checkPathLength = checkSize * 1.5

  return (
    <div className={`${container} ${className} flex items-center justify-center relative`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-trust-green/20 rounded-full blur-xl">
        {animated && (
          <motion.div
            className="w-full h-full bg-trust-green/30 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* SVG Checkmark */}
      <svg
        width={circleSize}
        height={circleSize}
        viewBox={`0 0 ${circleSize} ${circleSize}`}
        className="relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={circleSize / 2 - 4}
          fill="#E8F5E9"
          stroke={circleColor}
          strokeWidth="3"
        />

        {/* Animated drawing circle */}
        {showCircle && animated ? (
          <motion.circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={circleSize / 2 - 4}
            stroke={circleColor}
            strokeWidth="3"
            fill="none"
            strokeDasharray={circleCircumference}
            initial={{ strokeDashoffset: circleCircumference }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 0.8,
              ease: 'ease-out',
            }}
          />
        ) : showCircle ? (
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={circleSize / 2 - 4}
            stroke={circleColor}
            strokeWidth="3"
            fill="none"
          />
        ) : null}

        {/* Animated checkmark */}
        {animated ? (
          <motion.path
            d={`M ${circleSize * 0.35} ${circleSize * 0.5} L ${circleSize * 0.5} ${circleSize * 0.65} L ${circleSize * 0.7} ${circleSize * 0.35}`}
            stroke={checkColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={checkPathLength}
            initial={{ strokeDashoffset: checkPathLength }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 0.5,
              ease: 'ease-out',
              delay: animated ? 0.6 : 0,
            }}
          />
        ) : (
          <path
            d={`M ${circleSize * 0.35} ${circleSize * 0.5} L ${circleSize * 0.5} ${circleSize * 0.65} L ${circleSize * 0.7} ${circleSize * 0.35}`}
            stroke={checkColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  )
}

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  size: number
  rotation: number
}

interface ConfettiCelebrationProps {
  pieceCount?: number
  duration?: number
  className?: string
  colors?: string[]
}

/**
 * ConfettiCelebration Component
 * Premium confetti animation for major achievements
 * Used for onboarding completion, registration success
 * 
 * @description UI-021: Celebration animation for positive reinforcement
 */
export function ConfettiCelebration({
  pieceCount = 30,
  duration = 3,
  className = '',
  colors = ['#FF8C00', '#FFD700', '#1B6D24', '#FF6B6B', '#4ECDC4'],
}: ConfettiCelebrationProps) {
  const confettiPieces: ConfettiPiece[] = Array.from({ length: pieceCount }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: duration + Math.random() * 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 8,
    rotation: Math.random() * 360,
  }))

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{
            y: -20,
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            y: '100vh',
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

interface CompletionBadgeProps {
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showConfetti?: boolean
  className?: string
}

/**
 * CompletionBadge Component
 * Complete success state with checkmark, title, subtitle, and optional confetti
 * Used for tutorial completion, registration success, milestone achievements
 * 
 * @description UI-022: Comprehensive completion state for positive user feedback
 */
export function CompletionBadge({
  title = 'सफल!',
  subtitle = 'आपका कार्य पूर्ण हुआ',
  size = 'md',
  animated = true,
  showConfetti = true,
  className = '',
}: CompletionBadgeProps) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Confetti */}
      {showConfetti && animated && <ConfettiCelebration />}

      {/* Success Checkmark */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 200,
        }}
      >
        <SuccessCheckmark
          size={size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'lg'}
          animated={animated}
        />
      </motion.div>

      {/* Title */}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-2xl font-bold text-text-primary mt-4 font-devanagari"
        >
          {title}
        </motion.h2>
      )}

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-text-secondary text-lg mt-2 text-center font-devanagari"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

export default SuccessCheckmark
