'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TranscriptEntry {
  id: string
  text: string
  timestamp: Date
  isInterim: boolean
  confidence?: number
}

interface LiveTranscriptWindowProps {
  isVisible?: boolean
  maxEntries?: number
  showTimestamps?: boolean
  showConfidence?: boolean
  autoScroll?: boolean
  className?: string
}

/**
 * LiveTranscriptWindow - Displays real-time speech-to-text transcript updates
 * 
 * Features:
 * - Real-time transcript display with mock data
 * - Interim (gray) vs final (saffron) text differentiation
 * - Auto-scroll to latest transcript
 * - Confidence indicator (optional)
 * - Timestamp display (optional)
 * - WCAG 2.1 AA compliant colors
 */
export function LiveTranscriptWindow({
  isVisible = true,
  maxEntries = 10,
  showTimestamps = true,
  showConfidence = false,
  autoScroll = true,
  className = '',
}: LiveTranscriptWindowProps) {
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const mockDataInterval = useRef<NodeJS.Timeout | null>(null)

  // Mock data for demonstration
  const mockTranscripts = [
    'नमस्ते, मैं एक पुजारी हूं',
    'मैं यजमानों की पूजा करता हूं',
    'मुझे वेदों का ज्ञान है',
    'मैं संस्कृत मंत्रों का उच्चारण करता हूं',
    'आपकी किस प्रकार की सहायता कर सकता हूं?',
    'मैं ऑनलाइन पूजा का आयोजन करता हूं',
    'दक्षिणा स्वीकार करता हूं',
    'कृपया अपनी समस्या बताएं',
  ]

  // Generate mock transcript entries
  useEffect(() => {
    if (!isVisible) return

    let mockIndex = 0

    // Add initial transcript
    addMockTranscript()

    // Continue adding mock transcripts at intervals
    mockDataInterval.current = setInterval(() => {
      addMockTranscript()
    }, 3000)

    function addMockTranscript() {
      const text = mockTranscripts[mockIndex % mockTranscripts.length]
      const confidence = 0.7 + Math.random() * 0.3 // Random confidence between 0.7-1.0

      // First add as interim
      const interimEntry: TranscriptEntry = {
        id: `transcript-${Date.now()}-interim`,
        text,
        timestamp: new Date(),
        isInterim: true,
        confidence,
      }

      setTranscripts((prev) => {
        const updated = [...prev, interimEntry].slice(-maxEntries)
        return updated
      })

      // Then convert to final after 1.5s
      setTimeout(() => {
        setTranscripts((prev) => {
          return prev.map((entry) =>
            entry.id === interimEntry.id
              ? { ...entry, isInterim: false, id: `transcript-${Date.now()}-final` }
              : entry
          )
        })
      }, 1500)

      mockIndex++
    }

    return () => {
      if (mockDataInterval.current) {
        clearInterval(mockDataInterval.current)
      }
    }
  }, [isVisible, maxEntries])

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcripts, autoScroll])

  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // Get confidence color
  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-text-placeholder'
    if (confidence >= 0.9) return 'text-trust-green'
    if (confidence >= 0.7) return 'text-warning-amber'
    return 'text-error-red'
  }

  // Get confidence icon
  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return ''
    if (confidence >= 0.9) return '✅'
    if (confidence >= 0.7) return '⚠️'
    return '❌'
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-surface-card rounded-card shadow-card border-2 border-vedic-border overflow-hidden ${className}`}
      role="region"
      aria-label="Live transcript display"
    >
      {/* Header */}
      <div className="bg-saffron-light px-5 py-4 border-b-2 border-saffron">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-saffron-dk text-[28px]">
              subtitles
            </span>
            <h2 className="text-title-md font-bold text-text-primary">
              लाइव ट्रांसक्रिप्ट
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-saffron-dk"></span>
            </span>
            <span className="text-label-sm font-semibold text-text-secondary">
              लाइव
            </span>
          </div>
        </div>
      </div>

      {/* Transcript Display Area */}
      <div
        ref={scrollRef}
        className="h-[400px] overflow-y-auto bg-surface-base p-5 scroll-smooth"
        role="log"
        aria-live="polite"
        aria-label="Transcript messages"
      >
        <AnimatePresence>
          {transcripts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <span className="text-[64px] mb-4">🎤</span>
              <p className="text-body-lg text-text-secondary font-medium">
                बोलना शुरू करें...
              </p>
              <p className="text-body-sm text-text-placeholder mt-2">
                आपकी बातचीत यहाँ दिखाई देगी
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {transcripts.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`rounded-lg p-4 border-2 transition-all duration-300 ${
                    entry.isInterim
                      ? 'bg-surface-muted border-border-default'
                      : 'bg-saffron-light/30 border-saffron'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {entry.isInterim ? (
                        <div className="w-3 h-3 rounded-full bg-border-default animate-pulse" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-saffron" />
                      )}
                    </div>

                    {/* Transcript text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-body-md break-words ${
                          entry.isInterim
                            ? 'text-text-secondary italic'
                            : 'text-text-primary font-semibold'
                        }`}
                      >
                        {entry.text}
                      </p>

                      {/* Metadata row */}
                      {(showTimestamps || showConfidence) && (
                        <div className="flex items-center gap-4 mt-2">
                          {showTimestamps && (
                            <span className="text-label-xs text-text-placeholder font-medium">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          )}
                          {showConfidence && entry.confidence && (
                            <span
                              className={`text-label-xs font-semibold ${getConfidenceColor(
                                entry.confidence
                              )}`}
                            >
                              {getConfidenceIcon(entry.confidence)}{' '}
                              {Math.round(entry.confidence * 100)}% सटीक
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with stats */}
      <div className="bg-surface-muted px-5 py-3 border-t-2 border-vedic-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-label-sm text-text-secondary font-medium">
              कुल वाक्य: <span className="font-bold text-text-primary">{transcripts.length}</span>
            </span>
            <span className="text-label-sm text-text-secondary font-medium">
              अंतिम: <span className="font-bold text-trust-green">
                {transcripts.filter((t) => !t.isInterim).length}
              </span>
            </span>
            <span className="text-label-sm text-text-secondary font-medium">
              चल रहा: <span className="font-bold text-warning-amber">
                {transcripts.filter((t) => t.isInterim).length}
              </span>
            </span>
          </div>
          <button
            onClick={() => setTranscripts([])}
            className="text-label-sm text-saffron-dk font-semibold hover:text-saffron transition-colors focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2 rounded-btn px-3 py-2"
            aria-label="Clear all transcripts"
          >
            साफ़ करें
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default LiveTranscriptWindow
