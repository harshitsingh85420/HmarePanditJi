'use client'

import { motion } from 'framer-motion'
import { useVoiceStore } from '@/stores/voiceStore'

interface VoiceOverlayProps {
  currentQuestion: string
  onSwitchToKeyboard: () => void
  onRetryVoice: () => void
}

export function VoiceOverlay({
  currentQuestion,
  onSwitchToKeyboard,
  onRetryVoice,
}: VoiceOverlayProps) {
  const { state, ambientNoiseLevel } = useVoiceStore()

  if (!['listening', 'processing', 'error_1', 'error_2', 'error_3'].includes(state)) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6"
      style={{ backgroundColor: 'rgba(255, 248, 225, 0.92)', backdropFilter: 'blur(8px)' }}
    >
      {/* Top: Close/escape */}
      <div className="w-full flex justify-end">
        {state !== 'error_3' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onSwitchToKeyboard}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-dim"
          >
            <span className="material-symbols-outlined text-text-secondary">close</span>
          </motion.button>
        )}
      </div>

      {/* Center: State-specific content */}
      <div className="flex flex-col items-center gap-8">
        {/* Waveform */}
        {state !== 'error_3' && <WaveformDisplay isActive={state === 'listening'} />}

        {/* State-specific icon for error_3 */}
        {state === 'error_3' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl">
            🙏
          </motion.div>
        )}

        {/* State text */}
        <StateText state={state} />

        {/* Context card */}
        {state !== 'error_3' && <ContextCard question={currentQuestion} />}

        {/* Error_3 specific content */}
        {state === 'error_3' && <Error3Content />}
      </div>

      {/* Bottom: Controls */}
      <BottomControls
        state={state}
        ambientNoise={ambientNoiseLevel}
        onSwitchToKeyboard={onSwitchToKeyboard}
        onRetryVoice={onRetryVoice}
      />
    </motion.div>
  )
}

function WaveformDisplay({ isActive }: { isActive: boolean }) {
  const barHeights = isActive ? [16, 24, 32, 48, 32, 24, 16] : [8, 12, 16, 20, 16, 12, 8]

  return (
    <div className="flex items-end justify-center gap-2 h-16">
      {barHeights.map((height, i) => (
        <motion.div
          key={i}
          className="waveform-bar"
          animate={
            isActive
              ? { height: [height, height * 1.5, height], opacity: [0.7, 1, 0.7] }
              : { height, opacity: 0.5 }
          }
          transition={{ duration: 1.2, repeat: isActive ? Infinity : 0, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ height }}
        />
      ))}
    </div>
  )
}

function StateText({ state }: { state: string }) {
  const textMap: Record<string, string> = {
    listening: 'सुन रहा हूँ... 🎙️',
    processing: 'समझ रहा हूँ...',
    error_1: 'माफ़ कीजिए, फिर से बोलिए 🙏',
    error_2: 'धीरे और साफ़ बोलिए',
    error_3: 'कोई बात नहीं, पंडित जी 🙏',
  }

  return (
    <motion.p
      key={state}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-saffron font-devanagari text-xl font-bold text-center"
    >
      {textMap[state]}
    </motion.p>
  )
}

function ContextCard({ question }: { question: string }) {
  return (
    <div className="w-full max-w-sm bg-surface-card rounded-card p-4 border-l-4 border-primary shadow-card">
      <p className="text-text-secondary text-xs font-label uppercase tracking-wider mb-2">Sawaal:</p>
      <p className="text-text-primary font-devanagari text-base font-medium">{question}</p>
    </div>
  )
}

function Error3Content() {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <p className="text-text-secondary font-devanagari text-base text-center leading-relaxed">
        Kabhi kabhi mic ki jagah ya shor ki wajah se thodi takleef hoti hai.
        Aap type karke bhi bilkul same tarah se registration poori kar sakte hain.
      </p>
      <p className="text-primary font-devanagari text-base font-semibold text-center">
        Kai Pandits isi tarah karte hain.
      </p>

      <div className="w-full bg-surface-card rounded-card-sm p-4 border border-border-default">
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🎙️</span>
            <span className="text-xs text-text-secondary">Namaste</span>
            <span className="material-symbols-outlined text-trust-green text-xl filled">check_circle</span>
          </div>
          <span className="text-text-disabled text-xl font-light">=</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">⌨️</span>
            <span className="text-xs text-text-secondary">Namaste</span>
            <span className="material-symbols-outlined text-trust-green text-xl filled">check_circle</span>
          </div>
        </div>
        <p className="text-trust-green font-bold text-sm text-center mt-3">
          Same result — sirf tarika alag hai.
        </p>
      </div>
    </div>
  )
}

function BottomControls({
  state,
  ambientNoise,
  onSwitchToKeyboard,
  onRetryVoice,
}: {
  state: string
  ambientNoise: number
  onSwitchToKeyboard: () => void
  onRetryVoice: () => void
}) {
  if (state === 'error_3') {
    return (
      <div className="w-full flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSwitchToKeyboard}
          className="w-full h-14 bg-primary-container text-white font-bold rounded-btn flex items-center justify-center gap-2 shadow-btn-saffron"
        >
          <span className="material-symbols-outlined text-xl">keyboard</span>
          Type Karke Aage Badhein
        </motion.button>

        <button onClick={onRetryVoice} className="text-text-disabled text-xs text-center py-2 uppercase tracking-wider">
          Mic phir se try karein
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <AmbientNoiseIndicator level={ambientNoise} />

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSwitchToKeyboard}
        className={`flex items-center gap-2 px-6 py-3 rounded-pill transition-all
                   ${state === 'error_2' ? 'bg-saffron-light text-primary text-base font-semibold' : 'text-text-secondary text-sm'}`}
      >
        <span className="text-lg">⌨️</span>
        <span className="font-label">Type karna chahta hoon</span>
      </motion.button>
    </div>
  )
}

function AmbientNoiseIndicator({ level }: { level: number }) {
  const isHigh = level > 65
  const isMedium = level > 40

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-end gap-0.5">
        {[6, 10, 14].map((h, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full ${isHigh ? 'bg-error' : isMedium ? 'bg-warning-amber' : 'bg-trust-green'}`}
            style={{ height: h }}
          />
        ))}
      </div>
      {isHigh && <p className="text-xs text-warning-amber">Shor zyaada hai</p>}
    </div>
  )
}
