'use client'

import { motion } from 'framer-motion'

interface DiyaIllustrationProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-48 h-48',
}

/**
 * Diya Illustration - Premium spiritual lamp
 * Matches the HTML reference from identity_confirmation_e_02
 */
export function DiyaIllustration({ className = '', size = 'lg', animated = true }: DiyaIllustrationProps) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Glow effect - matching HTML reference */}
      <div className="absolute inset-0 bg-saffron/20 rounded-full blur-xl">
        {animated && (
          <motion.div
            className="w-full h-full bg-saffron/30 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Diya SVG - premium illustration */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flame with animation - matching HTML reference */}
        {animated ? (
          <motion.g
            animate={{
              scaleY: [1, 1.1, 0.95, 1.05, 1],
              scaleX: [1, 0.95, 1.05, 0.98, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Outer flame */}
            <ellipse cx="50" cy="25" rx="12" ry="18" fill="#FF8C00" opacity="0.9" />
            {/* Middle flame */}
            <ellipse cx="50" cy="25" rx="8" ry="12" fill="#FFD700" opacity="0.8" />
            {/* Inner flame - bright core */}
            <ellipse cx="50" cy="25" rx="4" ry="6" fill="#FFFFFF" opacity="0.6" />
          </motion.g>
        ) : (
          <g>
            <ellipse cx="50" cy="25" rx="12" ry="18" fill="#FF8C00" opacity="0.9" />
            <ellipse cx="50" cy="25" rx="8" ry="12" fill="#FFD700" opacity="0.8" />
            <ellipse cx="50" cy="25" rx="4" ry="6" fill="#FFFFFF" opacity="0.6" />
          </g>
        )}

        {/* Diya body - earthen lamp */}
        <ellipse cx="50" cy="55" rx="35" ry="15" fill="#D4A574" stroke="#8B4513" strokeWidth="2" />
        <path
          d="M15 55 Q15 75 50 75 Q85 75 85 55"
          fill="#C4956A"
          stroke="#8B4513"
          strokeWidth="2"
        />

        {/* Decorative patterns on diya */}
        <path
          d="M20 60 Q35 70 50 60 Q65 70 80 60"
          stroke="#8B4513"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />

        {/* Oil reservoir */}
        <ellipse cx="50" cy="52" rx="20" ry="8" fill="#8B4513" opacity="0.3" />

        {/* Decorative dots around rim */}
        <g>
          <circle cx="25" cy="50" r="1.5" fill="#8B4513" opacity="0.6" />
          <circle cx="35" cy="47" r="1.5" fill="#8B4513" opacity="0.6" />
          <circle cx="50" cy="46" r="1.5" fill="#8B4513" opacity="0.6" />
          <circle cx="65" cy="47" r="1.5" fill="#8B4513" opacity="0.6" />
          <circle cx="75" cy="50" r="1.5" fill="#8B4513" opacity="0.6" />
        </g>
      </svg>
    </div>
  )
}

/**
 * Om Illustration - Sacred Hindu symbol
 * Matches the HTML reference from welcome_s_0.1_animated
 */
export function OmIllustration({ className = '', size = 'lg', animated = true }: Omit<DiyaIllustrationProps, 'size'> & { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Sacred glow - matching HTML reference */}
      <div className="absolute inset-0 bg-gradient-to-br from-saffron/30 to-transparent rounded-full blur-lg">
        {animated && (
          <motion.div
            className="w-full h-full bg-saffron/20 rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </div>

      {/* Om SVG - premium illustration with path animations */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Om symbol - stylized Devanagari ॐ */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={animated ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Upper curve */}
          <motion.path
            d="M25 65 C15 65 10 58 10 50 C10 40 20 35 32 35 C42 35 48 40 48 50 C48 60 40 68 28 68 C22 68 18 65 15 62"
            stroke="url(#omGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : {}}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Middle section */}
          <motion.path
            d="M48 62 C52 62 58 58 58 48 C58 38 52 32 46 32"
            stroke="url(#omGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : {}}
            transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Lower curve extension */}
          <motion.path
            d="M46 32 C40 28 35 28 30 32"
            stroke="url(#omGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : {}}
            transition={{ duration: 1, ease: 'easeInOut', delay: 1 }}
          />

          {/* Top crescent (Chandra-bindu) */}
          <motion.path
            d="M55 28 Q62 22 70 26"
            stroke="url(#omGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : {}}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 1.2 }}
          />

          {/* Top dot (Bindu) */}
          <motion.circle
            cx="62"
            cy="22"
            r="4"
            fill="url(#omGradient)"
            initial={{ scale: 0, opacity: 0 }}
            animate={animated ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 1.8, duration: 0.4 }}
          />

          {/* Right side extension */}
          <motion.path
            d="M65 65 L75 55 M72 62 L82 52"
            stroke="url(#omGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : {}}
            transition={{ duration: 1, ease: 'easeInOut', delay: 1.5 }}
          />
        </motion.g>

        {/* Gradient definition for Om */}
        <defs>
          <linearGradient id="omGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function TempleIllustration({ className = '', size = 'lg', animated = true }: Omit<DiyaIllustrationProps, 'size'> & { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Divine light */}
      <div className="absolute inset-0 bg-gradient-to-t from-saffron/20 to-transparent rounded-full blur-xl">
        {animated && (
          <motion.div
            className="w-full h-full bg-saffron/15 rounded-full"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Temple SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Kalash (top) */}
        <motion.g
          initial={{ y: -10, opacity: 0 }}
          animate={animated ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <circle cx="50" cy="15" r="5" fill="#FFD700" />
          <path d="M47 18 L50 12 L53 18 Z" fill="#FF8C00" />
        </motion.g>

        {/* Temple dome */}
        <motion.path
          d="M30 40 Q50 10 70 40 L70 80 L30 80 Z"
          fill="#D4A574"
          stroke="#8B4513"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* Temple base */}
        <motion.rect
          x="25"
          y="80"
          width="50"
          height="15"
          fill="#C4956A"
          stroke="#8B4513"
          strokeWidth="2"
          initial={{ scaleX: 0 }}
          animate={animated ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: 1 }}
        />

        {/* Decorative arch */}
        <motion.path
          d="M35 75 Q50 50 65 75"
          stroke="#8B4513"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 1, ease: 'easeInOut', delay: 1.2 }}
        />

        {/* Steps */}
        <motion.g
          initial={{ y: 10, opacity: 0 }}
          animate={animated ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <rect x="20" y="95" width="60" height="3" fill="#8B4513" opacity="0.5" />
          <rect x="25" y="92" width="50" height="3" fill="#8B4513" opacity="0.5" />
        </motion.g>
      </svg>
    </div>
  )
}

// Feature Card Icons
export function DakshinaIcon({ className = '', size = 'md', animated = true }: DiyaIllustrationProps) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Coin stack */}
        <motion.ellipse
          cx="50"
          cy="60"
          rx="30"
          ry="10"
          fill="#FFD700"
          stroke="#FF8C00"
          strokeWidth="2"
          initial={{ scaleY: 0 }}
          animate={animated ? { scaleY: 1 } : {}}
          transition={{ duration: 0.5 }}
        />
        <motion.ellipse
          cx="50"
          cy="50"
          rx="30"
          ry="10"
          fill="#FFC700"
          stroke="#FF8C00"
          strokeWidth="2"
          initial={{ y: -20, opacity: 0 }}
          animate={animated ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.ellipse
          cx="50"
          cy="40"
          rx="30"
          ry="10"
          fill="#FFD700"
          stroke="#FF8C00"
          strokeWidth="2"
          initial={{ y: -20, opacity: 0 }}
          animate={animated ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
        {/* Rupee symbol */}
        <motion.path
          d="M35 35 L55 35 M35 45 L55 45 M50 35 L50 55 M50 45 L60 55"
          stroke="#8B4513"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
      </svg>
    </div>
  )
}

export function VoiceIcon({ className = '', size = 'md', animated = true }: DiyaIllustrationProps) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Sound waves */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-12 border-2 border-saffron/30 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={animated ? { scale: 1.5, opacity: [0, 0.5, 0] } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
        {/* Microphone */}
        <motion.rect
          x="35"
          y="30"
          width="30"
          height="40"
          rx="15"
          fill="#FF8C00"
          stroke="#8B4513"
          strokeWidth="2"
          initial={{ scaleY: 0 }}
          animate={animated ? { scaleY: 1 } : {}}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d="M50 70 L50 85 M35 85 L65 85"
          stroke="#8B4513"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
      </svg>
    </div>
  )
}

export function PaymentIcon({ className = '', size = 'md', animated = true }: DiyaIllustrationProps) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Card body */}
        <motion.rect
          x="15"
          y="30"
          width="70"
          height="45"
          rx="8"
          fill="#1B6D24"
          stroke="#0F3D14"
          strokeWidth="2"
          initial={{ scaleX: 0 }}
          animate={animated ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6 }}
        />
        {/* Chip */}
        <motion.rect
          x="25"
          y="40"
          width="20"
          height="15"
          rx="3"
          fill="#FFD700"
          initial={{ opacity: 0 }}
          animate={animated ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        />
        {/* Checkmark */}
        <motion.path
          d="M55 55 L65 65 L80 45"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
      </svg>
    </div>
  )
}

/**
 * Premium Pandit Illustration - For Welcome and Hero sections
 * Replaces generic Material Icons with bespoke spiritual illustration
 * Matches the HTML reference from welcome_s_0.1_animated
 */
export function PanditIllustration({ className = '', size = 'lg', animated = true }: Omit<DiyaIllustrationProps, 'size'> & { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Divine glow - matching HTML reference */}
      <div className="absolute inset-0 bg-gradient-to-br from-saffron/30 to-saffron-light/20 rounded-full blur-xl">
        {animated && (
          <motion.div
            className="w-full h-full bg-saffron/20 rounded-full"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Pandit figure with tilak - premium illustration */}
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none">
        {/* Aureole/Divine light behind head */}
        <motion.circle
          cx="50"
          cy="40"
          r="30"
          fill="url(#divineGlow)"
          initial={{ opacity: 0 }}
          animate={animated ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
        />

        {/* Head */}
        <motion.circle
          cx="50"
          cy="45"
          r="20"
          fill="#F5D5B8"
          stroke="#8B4513"
          strokeWidth="1.5"
          initial={{ scale: 0 }}
          animate={animated ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        {/* Tilak on forehead - sacred mark */}
        <motion.g
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <path
            d="M45 38 Q50 33 55 38"
            stroke="#FF8C00"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="50" cy="40" r="2" fill="#FF8C00" />
        </motion.g>

        {/* Eyes */}
        <motion.g
          initial={{ scaleY: 0 }}
          animate={animated ? { scaleY: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <ellipse cx="44" cy="46" rx="2.5" ry="1.5" fill="#3E2723" />
          <ellipse cx="56" cy="46" rx="2.5" ry="1.5" fill="#3E2723" />
        </motion.g>

        {/* Gentle smile */}
        <motion.path
          d="M46 52 Q50 55 54 52"
          stroke="#8B4513"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        />

        {/* Body/Robes - saffron colored */}
        <motion.path
          d="M25 65 Q50 60 75 65 L80 95 L20 95 Z"
          fill="#FF8C00"
          stroke="#8B4513"
          strokeWidth="1.5"
          initial={{ y: -20, opacity: 0 }}
          animate={animated ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* Folded hands (Namaste gesture) - welcoming */}
        <motion.g
          initial={{ scale: 0 }}
          animate={animated ? { scale: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          <ellipse cx="45" cy="70" rx="8" ry="5" fill="#F5D5B8" stroke="#8B4513" strokeWidth="1" />
          <ellipse cx="55" cy="70" rx="8" ry="5" fill="#F5D5B8" stroke="#8B4513" strokeWidth="1" />
        </motion.g>

        {/* Mala beads - sacred thread */}
        <motion.path
          d="M35 65 Q50 80 65 65"
          stroke="#8B4513"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        />

        {/* Janeu - sacred thread across chest */}
        <motion.path
          d="M30 68 Q50 75 70 68"
          stroke="#DAA520"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
        />

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="divineGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}
