'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSarvamVoiceFlow } from '@/lib/hooks/useSarvamVoiceFlow'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useNavigationStore } from '@/stores/navigationStore'

export default function IdentityConfirmation() {
  const router = useRouter()
  const { navigate, setSection, canNavigateBack, goBack } = useNavigationStore()
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    navigate('/login', 'identity')
    setSection('identity')
  }, [navigate, setSection])

  const handleBack = () => {
    if (canNavigateBack()) {
      const prev = goBack()
      if (prev) router.push(prev)
      else router.push('/')
    } else {
      router.push('/')
    }
  }

  const { isListening } = useSarvamVoiceFlow({
    language: 'Hindi',
    script: 'क्या आप पंडित रामेश्वर शर्मा हैं? हाँ बोलें या नहीं बोलें।',
    autoListen: true,
    listenTimeoutMs: 12000,
    repromptScript: 'कृपया पुष्टि करें — हाँ या नहीं बोलें।',
    repromptTimeoutMs: 12000,
    initialDelayMs: 800,
    pauseAfterMs: 500,
    onIntent: (intent) => {
      const lower = typeof intent === 'string' ? intent.toLowerCase() : ''
      if (lower.includes('haan') || lower.includes('yes') || lower.includes('sahi')) {
        setIsConfirmed(true)
        handleConfirm()
      } else if (lower.includes('nahi') || lower.includes('no')) {
        handleNotMatch()
      } else if (lower.includes('peeche') || lower.includes('wapas') || lower.includes('back')) {
        handleBack()
      }
    },
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'क्या आप पंडित रामेश्वर शर्मा हैं? हाँ बोलें या नहीं बोलें।',
        languageCode: 'hi-IN',
      })
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const handleConfirm = () => {
    void speakWithSarvam({
      text: 'बहुत अच्छा। अब हम आपको लॉगिन कर रहे हैं।',
      languageCode: 'hi-IN',
    })
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  const handleNotMatch = () => {
    void speakWithSarvam({
      text: 'कोई बात नहीं। कृपया अपना मोबाइल नंबर दर्ज करें।',
      languageCode: 'hi-IN',
    })
    setIsConfirmed(false)
    setTimeout(() => {
      router.push('/mobile')
    }, 1500)
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 bg-surface-base">
      {/* Top Bar with Back Button */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="w-[56px] h-[56px] flex items-center justify-center text-saffron rounded-full active:bg-black/5"
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-saffron">ॐ</span>
            <span className="text-lg font-bold text-text-primary">HmarePanditJi</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration - ACC-010 FIX: Larger icon for elderly visibility */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-saffron-light rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <span className="text-[32px]">🧑‍🦳</span>
        </motion.div>

        {/* Title - ACC-010 FIX: Larger text for elderly visibility */}
        <h1 className="text-[28px] font-bold text-text-primary text-center mb-2">
          पहले से पंजीकृत? लॉगिन करें
        </h1>
        <p className="text-text-secondary text-center mb-8">
          क्या यह आपका खाता है?
        </p>

        {/* Identity Card - ACC-010 FIX: Larger text for elderly visibility */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface-card rounded-card shadow-card p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-saffron-light rounded-full flex items-center justify-center">
              <span className="text-[28px]">🧑‍🦳</span>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-text-primary">पंडित रामेश्वर शर्मा</h2>
              <p className="text-[16px] text-text-secondary">वाराणसी, उत्तर प्रदेश</p>
            </div>
          </div>

          <div className="border-t border-border-default pt-4">
            <div className="flex items-center gap-2 text-[16px] text-text-secondary">
              <span className="material-symbols-outlined text-trust-green filled">check_circle</span>
              <span>आधार सत्यापित</span>
            </div>
          </div>
        </motion.div>

        {/* Voice indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-end gap-1 h-6">
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-2" />
              <div className="w-1.5 bg-saffron rounded-full animate-voice-bar-3" />
            </div>
            <span className="text-saffron text-[18px]">सुन रहा हूँ...</span>
          </div>
        )}

        {/* Buttons - ACC-009 FIX: Larger touch targets */}
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full min-h-[56px] bg-saffron text-white font-bold text-[18px] rounded-btn shadow-btn-saffron active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none"
          >
            हाँ, यह मैं हूँ
          </button>
          <button
            onClick={handleNotMatch}
            className="w-full min-h-[56px] border-2 border-saffron text-saffron font-bold text-[18px] rounded-btn active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none"
          >
            नहीं, यह मैं नहीं हूँ
          </button>
        </div>

        {/* Voice hint - ACC-010 FIX: Larger text for elderly visibility */}
        <p className="mt-6 text-center text-[18px] text-text-placeholder">
          🎤 &quot;हाँ&quot;, &quot;नहीं&quot;, या &quot;पीछे जाएं&quot; बोलें
        </p>
      </div>
    </main>
  )
}
