'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  onExit?: () => void;
}

// Particle component for sparkle effects
interface ParticleProps {
  delay: number;
  x: number;
  y: number;
}

const Particle: React.FC<ParticleProps> = ({ delay, x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0],
      x: x,
      y: y,
    }}
    transition={{
      duration: 1.8,
      delay,
      repeat: Infinity,
      repeatDelay: 2.5,
      ease: 'easeOut',
    }}
    className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
    style={{ left: '50%', top: '50%' }}
  />
);

// Radial pulse wave component
const PulseWave: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0.6, scale: 0.8 }}
    animate={{
      opacity: 0,
      scale: 2.5,
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
    className="absolute inset-0 rounded-full border-2 border-white/30"
  />
);

export default function SplashScreen({ onComplete, onExit }: SplashScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'small' | 'scaling' | 'large' | 'complete'>('small');
  const [showText, setShowText] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: i * 0.15,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
    }));
  }, []);

  useEffect(() => {
    console.log('[SplashScreen] Starting animation sequence');

    // Fade in on mount
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 50);

    // Phase 1: Small OM (1.5s)
    const phase1Timer = setTimeout(() => {
      console.log('[SplashScreen] Transitioning to scaling phase');
      setAnimationPhase('scaling');
    }, 1500);

    // Phase 2: Scaling completes (0.8s later)
    const phase2Timer = setTimeout(() => {
      console.log('[SplashScreen] OM now large, showing text');
      setAnimationPhase('large');
      setShowText(true);
    }, 2300);

    // Phase 3: Complete and navigate (3.5s total)
    const completeTimer = setTimeout(() => {
      console.log('[SplashScreen] Animation complete, calling onComplete');
      setAnimationPhase('complete');
      onComplete();
    }, 3800);

    return () => {
      console.log('[SplashScreen] Cleaning up timers');
      clearTimeout(enterTimer);
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="splash-gradient-enhanced shadow-2xl overflow-hidden min-h-dvh flex flex-col items-center relative w-full"
      >
        {/* Enhanced gradient background with animated mesh */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient orbs */}
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl"
          />
        </div>

        {/* Exit Button - ACC-009 FIX: Larger touch target (56px) */}
        {onExit && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onExit}
            className="absolute top-4 right-4 min-w-[52px] xs:min-w-[56px] min-h-[52px] xs:min-h-[56px] flex items-center justify-center text-white/80 hover:text-white active:opacity-50 z-50 focus:ring-2 focus:ring-white/50 focus:outline-none"
            aria-label="Exit app"
          >
            <svg className="w-6 h-6 xs:w-7 xs:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}

        {/* Top breathing room */}
        <div className="h-20 xs:h-28 sm:h-[140px]"></div>

        {/* Center Content Block */}
        <section className="flex flex-col items-center justify-center flex-grow -mt-4 xs:-mt-6 relative z-10">
          {/* OM Symbol Container with animations */}
          <div className="relative mb-4 xs:mb-5 sm:mb-6">
            {/* Radial pulse waves */}
            <AnimatePresence>
              {animationPhase !== 'small' && (
                <>
                  <PulseWave delay={0} />
                  <PulseWave delay={0.7} />
                  <PulseWave delay={1.4} />
                </>
              )}
            </AnimatePresence>

            {/* Particle sparkles */}
            <AnimatePresence>
              {animationPhase === 'scaling' || animationPhase === 'large' ? (
                <div className="absolute inset-0 pointer-events-none">
                  {particles.map((p) => (
                    <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} />
                  ))}
                </div>
              ) : null}
            </AnimatePresence>

            {/* Glowing aura behind OM */}
            <motion.div
              initial={{ opacity: 0.4, scale: 0.8 }}
              animate={{
                opacity: animationPhase === 'small' ? 0.4 : 0.7,
                scale: animationPhase === 'small' ? 0.8 : 1.3,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-0 bg-amber-300/30 rounded-full blur-2xl"
            />

            {/* The OM Symbol - Animated scale transition */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{
                scale: animationPhase === 'small' ? 0.6 : animationPhase === 'scaling' ? 1 : 1.1,
                opacity: 1,
              }}
              transition={{
                duration: animationPhase === 'scaling' ? 0.8 : 0.3,
                ease: animationPhase === 'scaling' ? 'easeOut' : 'easeInOut',
              }}
              className="relative drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            >
              {/* Traditional Devanagari Om (ॐ) - Unicode U+0950 */}
              <span
                className="text-[72px] xs:text-[84px] sm:text-[96px] md:text-[108px] leading-none font-serif text-white block"
                style={{
                  textShadow: '0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,215,168,0.4)',
                  filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.5))'
                }}
              >
                ॐ
              </span>
            </motion.div>
          </div>

          {/* Text Container - Slides down from top */}
          <AnimatePresence>
            {showText && (
              <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="flex flex-col items-center justify-center"
              >
                {/* English Wordmark */}
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
                  className="font-hind text-3xl xs:text-[36px] sm:text-[40px] md:text-[44px] font-[700] text-white tracking-[0.5px] leading-tight"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.3)'
                  }}
                >
                  HmarePanditJi
                </motion.h1>

                {/* Hindi Wordmark */}
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                  className="font-devanagari text-xl xs:text-[22px] sm:text-[26px] md:text-[28px] font-[500] text-white/90 mt-1 xs:mt-2"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 15px rgba(255,255,255,0.25)'
                  }}
                >
                  हमारे पंडित जी
                </motion.h2>

                {/* Subtle divider line */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
                  className="w-24 xs:w-28 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent mt-3 xs:mt-4"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Loading Area - Progress Bar */}
        <footer className="absolute bottom-10 xs:bottom-[48px] sm:bottom-[56px] w-full flex justify-center px-8">
          <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] h-1 xs:h-1.5 sm:h-2 bg-white/20 rounded-full relative overflow-hidden backdrop-blur-sm">
            {/* Progress Fill Animation with shimmer effect */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.5, ease: 'easeInOut' }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-200 via-white to-amber-200 rounded-full relative"
            >
              {/* Shimmer overlay */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </motion.div>
          </div>
        </footer>
      </motion.main>
    </AnimatePresence>
  );
}
