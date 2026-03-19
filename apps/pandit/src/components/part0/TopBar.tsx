'use client'

import { useState, useEffect } from 'react'
import { isGlobalMicMuted, setGlobalMicMuted, subscribeToMicMute, subscribeToTranscript, subscribeToError } from '@/lib/voice-engine'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  onLanguageChange?: () => void
}

export default function TopBar({ showBack = false, onBack, onLanguageChange }: TopBarProps) {
  const [micMuted, setMicMuted] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [micError, setMicError] = useState<string | null>(null)

  useEffect(() => {
    // Initial sync
    setMicMuted(isGlobalMicMuted)

    // Subscribe to external changes
    const unsub = subscribeToMicMute(() => {
      setMicMuted(isGlobalMicMuted)
    })
    
    // Subscribe to transcript for visual feedback
    const unsubTranscript = subscribeToTranscript((t) => {
      setTranscript(t)
      setMicError(null)
      setTimeout(() => setTranscript(null), 4000)
    })

    const unsubError = subscribeToError((e) => {
      // Ignore routine timeouts or aborts if we're auto-listening, only show harsh errors 
      if (e === 'ERROR: no-speech' || e === 'ERROR: aborted' || e.includes('MIC MUTED')) return
      setMicError(e)
      setTimeout(() => setMicError(null), 5000)
    })

    return () => {
      unsub()
      unsubTranscript()
      unsubError()
    }
  }, [])

  const toggleMic = () => {
    setGlobalMicMuted(!micMuted)
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 h-14 bg-[#FFFBF5] border-b border-[#F0E6D3] sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="w-10 h-14 flex items-center justify-center text-[#9B7B52]"
            aria-label="Go back"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xl text-[#F09942] font-bold">ॐ</span>
          <span className="text-lg font-semibold text-[#2D1B00]">HmarePanditJi</span>
        </div>
      </div>
      <div className="flex items-center">
        {/* Mic Toggle Button */}
        <button
          onClick={toggleMic}
          className="w-12 h-14 flex items-center justify-center text-[#9B7B52] transition-colors"
          aria-label={micMuted ? 'Turn Microphone On' : 'Turn Microphone Off'}
        >
          {micMuted ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="1" y1="1" x2="23" y2="23" stroke="#DC2626" />
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
              <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4m-4 0h8" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2m7 9v4m-4 0h8" />
            </svg>
          )}
        </button>

        {/* Language Button */}
        <button
          onClick={onLanguageChange}
          className="w-12 h-14 flex items-center justify-center text-[#9B7B52]"
          aria-label="Change language"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 000 20" />
            <path d="M2 12h20" />
          </svg>
        </button>
      </div>
    </header>

    {/* Global Transcript Feedback Overlay */}
    {transcript && (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] animate-fade-in pointer-events-none w-11/12 max-w-[400px]">
        <div className="bg-[#2D1B00]/80 backdrop-blur-md border border-[#F09942]/30 text-white px-5 py-3 rounded-2xl shadow-lg flex flex-col gap-1 items-center justify-center">
          <p className="text-xs text-[#F09942] uppercase font-bold tracking-widest text-center">🎤 माइक ने सुना:</p>
          <p className="text-lg font-medium text-center">&ldquo;{transcript}&rdquo;</p>
        </div>
      </div>
    )}

    {/* Mic Error Overlay */}
    {micError && (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-fade-in pointer-events-none w-11/12 max-w-[400px]">
        <div className="bg-red-900/90 backdrop-blur-md border border-red-500/50 text-white px-4 py-2 rounded-xl shadow-lg flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-center">⚠️ Mic Issue: {micError}</p>
        </div>
      </div>
    )}
    </>
  )
}
