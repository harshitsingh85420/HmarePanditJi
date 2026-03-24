'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useNavigationStore } from '@/stores/navigationStore'
import { useRegistrationStore } from '@/stores/registrationStore'

export default function MicPermissionScreen() {
  const router = useRouter()
  const { navigate, setSection } = useNavigationStore()
  const { setCurrentStep, markStepComplete } = useRegistrationStore()
  const [granted, setGranted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    navigate('/permissions/mic', 'part1-registration')
    setSection('part1-registration')
  }, [navigate, setSection])

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'यह ऐप आपकी आवाज़ से चलता है। कृपया माइक्रोफ़ोन की अनुमति दें। हाँ बोलें या नीचे बटन दबाएं।',
        languageCode: 'hi-IN',
        pace: 0.82,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleGrant = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setGranted(true)
      markStepComplete('mic_permission')
      setCurrentStep('mic_permission')
      void speakWithSarvam({
        text: 'बहुत अच्छा! माइक्रोफ़ोन चालू है। अब हम आगे बढ़ते हैं।',
        languageCode: 'hi-IN',
      })
      setTimeout(() => {
        router.push('/permissions/location')
      }, 1500)
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('mic_denied')
        void speakWithSarvam({
          text: 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया सेटिंग्स में जाकर अनुमति दें।',
          languageCode: 'hi-IN',
        })
      } else {
        setError('mic_error')
        void speakWithSarvam({
          text: 'माइक्रोफ़ोन में त्रुटि। कृपया फिर से कोशिश करें।',
          languageCode: 'hi-IN',
        })
      }
    }
  }

  const handleSkip = () => {
    setCurrentStep('mic_permission')
    router.push('/permissions/location')
  }

  const handleRetry = () => {
    setError('')
    handleGrant()
  }

  const handleGoToSettings = () => {
    // On mobile, this would open app settings
    void speakWithSarvam({
      text: 'ब्राउज़र की सेटिंग्स में जाएं और माइक्रोफ़ोन की अनुमति दें।',
      languageCode: 'hi-IN',
    })
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 bg-surface-base">
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-saffron-light rounded-full flex items-center justify-center mb-8 mx-auto"
        >
          <span className="text-6xl">🎤</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          माइक्रोफ़ोन की अनुमति
        </h1>
        <p className="text-text-secondary text-center mb-8">
          यह ऐप आपकी आवाज़ से चलता है
        </p>

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface-card rounded-card shadow-card p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-text-primary mb-4">
            आपको क्यों चाहिए:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                voice
              </span>
              <div>
                <p className="text-text-primary font-medium">आवाज़ से पंजीकरण</p>
                <p className="text-text-secondary text-base">टाइपिंग की ज़रूरत नहीं</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                support_agent
              </span>
              <div>
                <p className="text-text-primary font-medium">वॉइस असिस्टेंट</p>
                <p className="text-text-secondary text-base">हर कदम पर मदद</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                quickreply
              </span>
              <div>
                <p className="text-text-primary font-medium">तेज़ प्रतिक्रिया</p>
                <p className="text-text-secondary text-base">बस बोलें और आगे बढ़ें</p>
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Error State */}
        {error === 'mic_denied' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning-amber-bg border-2 border-warning-amber rounded-card p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-warning-amber text-2xl">
                mic_off
              </span>
              <div>
                <p className="text-text-primary font-bold mb-1">माइक्रोफ़ोन ब्लॉक है</p>
                <p className="text-text-secondary text-base mb-3">
                  कृपया ब्राउज़र सेटिंग्स में जाकर माइक्रोफ़ोन की अनुमति दें।
                </p>
                <button
                  onClick={handleGoToSettings}
                  className="text-saffron text-base font-bold underline-offset-2 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  सेटिंग्स खोलें →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {error === 'mic_error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-error-red-bg border-2 border-error-red rounded-card p-4 mb-6"
          >
            <p className="text-error-red text-base text-center">
              माइक्रोफ़ोन में त्रुटि। कृपया फिर से कोशिश करें।
            </p>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGrant}
            disabled={error === 'mic_denied'}
            className="w-full min-h-[56px] bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <span className="material-symbols-outlined">mic</span>
            <span>{error === 'mic_denied' ? 'सेटिंग्स खोलें' : 'हाँ, अनुमति दें'}</span>
          </button>

          {error === 'mic_denied' ? (
            <button
              onClick={handleRetry}
              className="w-full min-h-[56px] border-2 border-saffron text-saffron font-bold text-lg rounded-btn active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none"
            >
              फिर से कोशिश करें
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="w-full min-h-[56px] text-text-secondary font-medium underline-offset-2 active:opacity-70 focus:ring-2 focus:ring-primary focus:outline-none"
            >
              बाद में चालू करूँगा
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="pb-8 text-center text-base text-text-placeholder">
        आप बाद में सेटिंग्स से कभी भी माइक्रोफ़ोन बंद कर सकते हैं
      </p>
    </main>
  )
}
