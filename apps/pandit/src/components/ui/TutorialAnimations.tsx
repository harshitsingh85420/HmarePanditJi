'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface EntranceAnimationProps {
  children: ReactNode
  delay?: number
  type?: 'fade-in' | 'slide-up' | 'scale-spring' | 'pin-drop' | 'shimmer'
  className?: string
}

/**
 * EntranceAnimation Component
 * Provides various entrance animations for tutorial screens
 * Synchronized with TTS timing for immersive storytelling
 * 
 * @description UI-023: Tutorial entrance animations for engaging onboarding
 */
export function EntranceAnimation({
  children,
  delay = 0,
  type = 'fade-in',
  className = '',
}: EntranceAnimationProps) {
  const variants = {
    'fade-in': {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.4, delay }
      },
    },
    'slide-up': {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay }
      },
    },
    'scale-spring': {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring' as const,
          damping: 20,
          stiffness: 300,
          delay
        }
      },
    },
    'pin-drop': {
      hidden: { opacity: 0, y: -30, scale: 1.2 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: 'spring' as const,
          damping: 15,
          stiffness: 400,
          delay
        }
      },
    },
    'shimmer': {
      hidden: { opacity: 0, filter: 'blur(4px)' },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.6, delay }
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[type]}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface TutorialHeroIllustrationProps {
  emoji?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  glowColor?: 'saffron' | 'green' | 'gold'
  delay?: number
}

/**
 * TutorialHeroIllustration Component
 * Premium animated hero illustration for tutorial screens
 * Replaces generic emoji with spiritual illustrations
 *
 * @description UI-024: Enhanced tutorial visuals for Pandit Ji engagement
 */
export function TutorialHeroIllustration({
  emoji,
  icon,
  size = 'lg',
  animated = true,
  glowColor = 'saffron',
  delay = 0,
}: TutorialHeroIllustrationProps) {
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  }

  const glowMap = {
    saffron: 'from-saffron/30 to-saffron-light/20',
    green: 'from-trust-green/30 to-trust-green-bg/20',
    gold: 'from-saffron/30 to-saffron-light/20',
  }

  return (
    <EntranceAnimation type="scale-spring" delay={delay}>
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${glowMap[glowColor]} rounded-full blur-xl`}>
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

        {/* Divine light rays */}
        {animated && (
          <>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.div
                key={angle}
                className="absolute w-1 h-16 bg-gradient-to-t from-saffron/20 to-transparent origin-bottom"
                style={{
                  transform: `rotate(${angle}deg) translateY(-${size === 'lg' ? '80' : size === 'md' ? '64' : '48'}px)`,
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </>
        )}

        {/* Center content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {icon ? (
            <span className={`material-symbols-outlined text-${size === 'lg' ? '7xl' : size === 'md' ? '6xl' : '5xl'} text-saffron shimmer-text`}>
              {icon}
            </span>
          ) : (
            <motion.span
              className="text-6xl"
              animate={animated ? {
                y: [0, -8, 0],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {emoji}
            </motion.span>
          )}
        </div>
      </div>
    </EntranceAnimation>
  )
}

interface TutorialTextContentProps {
  title?: string
  subtitle?: string
  description?: string
  highlight?: string
  align?: 'left' | 'center' | 'right'
  delay?: number
  stagger?: boolean
}

/**
 * TutorialTextContent Component
 * Animated text content for tutorial screens
 * Staggered animations for sequential reading flow
 * 
 * @description UI-025: Text animations synchronized with TTS
 */
export function TutorialTextContent({
  title,
  subtitle,
  description,
  highlight,
  align = 'center',
  delay = 0,
  stagger = true,
}: TutorialTextContentProps) {
  const alignMap = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }

  return (
    <div className={`flex flex-col ${alignMap[align]} gap-2`}>
      {title && (
        <EntranceAnimation type="slide-up" delay={delay}>
          <h1 className="text-4xl font-bold leading-tight text-text-primary font-devanagari">
            {title}
          </h1>
        </EntranceAnimation>
      )}

      {subtitle && (
        <EntranceAnimation
          type="slide-up"
          delay={stagger ? delay + 0.15 : delay}
        >
          <h2 className="text-4xl font-bold text-primary leading-tight font-devanagari">
            {subtitle}
          </h2>
        </EntranceAnimation>
      )}

      {description && (
        <EntranceAnimation
          type="fade-in"
          delay={stagger ? delay + 0.3 : delay}
        >
          <p className="text-2xl text-text-primary-2 font-normal mt-2 font-devanagari">
            {description}
          </p>
        </EntranceAnimation>
      )}

      {highlight && (
        <EntranceAnimation
          type="shimmer"
          delay={stagger ? delay + 0.45 : delay}
        >
          <p className="text-2xl italic text-saffron leading-relaxed font-devanagari shimmer-text">
            {highlight}
          </p>
        </EntranceAnimation>
      )}
    </div>
  )
}

export default EntranceAnimation
