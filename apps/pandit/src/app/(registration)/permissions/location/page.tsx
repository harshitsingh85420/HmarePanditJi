'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useNavigationStore } from '@/stores/navigationStore'
import { useRegistrationStore } from '@/stores/registrationStore'

export default function LocationPermissionScreen() {
  const router = useRouter()
  const { navigate, setSection } = useNavigationStore()
  const { setCity, setCurrentStep, markStepComplete } = useRegistrationStore()
  const [granted, setGranted] = useState(false)
  const [error, setError] = useState('')
  const [cityName, setCityName] = useState('')
  const [stateName, setStateName] = useState('')

  useEffect(() => {
    navigate('/permissions/location', 'part1-registration')
    setSection('part1-registration')
  }, [navigate, setSection])

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'हमें आपकी लोकेशन की अनुमति दें — ताकि हम आपके शहर की पूजाएं दिखा सकें। हाँ बोलें या नीचे बटन दबाएं।',
        languageCode: 'hi-IN',
        speaker: 'meera',
        pace: 0.82,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleGrant = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      
      // Get location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Reverse geocoding (in production, use proper API)
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              )
              const data = await response.json()
              
              const city = data.address?.city || data.address?.town || data.address?.village || 'Varanasi'
              const state = data.address?.state || 'Uttar Pradesh'
              
              setCityName(city)
              setStateName(state)
              setCity(city, state)
              setGranted(true)
              
              markStepComplete('location_permission')
              setCurrentStep('location_permission')
              
              void speakWithSarvam({
                text: `बहुत अच्छा! आपका शहर ${city} है। अब हम आगे बढ़ते हैं।`,
                languageCode: 'hi-IN',
              })
              
              setTimeout(() => {
                router.push('/permissions/notifications')
              }, 2000)
            } catch {
              // Fallback to manual entry
              setGranted(true)
              setCity('Varanasi', 'Uttar Pradesh')
              router.push('/permissions/notifications')
            }
          },
          (err) => {
            setError('location_error')
            void speakWithSarvam({
              text: 'लोकेशन नहीं मिल पाया। कृपया सेटिंग्स में जाकर अनुमति दें।',
              languageCode: 'hi-IN',
            })
          },
          { timeout: 10000 }
        )
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('location_denied')
        void speakWithSarvam({
          text: 'लोकेशन की अनुमति नहीं मिली। कृपया सेटिंग्स में जाकर अनुमति दें।',
          languageCode: 'hi-IN',
        })
      } else {
        setError('location_error')
        void speakWithSarvam({
          text: 'लोकेशन में त्रुटि। कृपया फिर से कोशिश करें।',
          languageCode: 'hi-IN',
        })
      }
    }
  }

  const handleSkip = () => {
    // Default to Varanasi
    setCity('Varanasi', 'Uttar Pradesh')
    markStepComplete('location_permission')
    setCurrentStep('location_permission')
    router.push('/permissions/notifications')
  }

  const handleRetry = () => {
    setError('')
    handleGrant()
  }

  const handleManualEntry = () => {
    // In production, show a bottom sheet for manual city entry
    setCity('Varanasi', 'Uttar Pradesh')
    router.push('/permissions/notifications')
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
          <span className="text-6xl">📍</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          लोकेशन की अनुमति
        </h1>
        <p className="text-text-secondary text-center mb-8">
          आपके शहर की पूजाएं खोजने के लिए
        </p>

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface-card rounded-card shadow-card p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-text-primary mb-4">
            क्यों चाहिए लोकेशन:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                temple_hindu
              </span>
              <div>
                <p className="text-text-primary font-medium">स्थानीय पूजाएं</p>
                <p className="text-text-secondary text-sm">आपके शहर की पूजाएं दिखाएं</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                language
              </span>
              <div>
                <p className="text-text-primary font-medium">भाषा चयन</p>
                <p className="text-text-secondary text-sm">आपकी लोकेशन के आधार पर</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                navigation
              </span>
              <div>
                <p className="text-text-primary font-medium">यात्रा योजना</p>
                <p className="text-text-secondary text-sm">पूजा स्थल तक मार्गदर्शन</p>
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-trust-green-bg border-2 border-trust-green-border rounded-card p-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-trust-green text-2xl">
              security
            </span>
            <div>
              <p className="text-trust-green font-bold text-sm mb-1">
                आपकी गोपनीयता सुरक्षित है
              </p>
              <p className="text-text-secondary text-xs">
                आपका सटीक स्थान कभी भी सार्वजनिक रूप से नहीं दिखाया जाएगा। केवल शहर का नाम उपयोग किया जाएगा।
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error === 'location_denied' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning-amber-bg border-2 border-warning-amber rounded-card p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-warning-amber text-2xl">
                location_off
              </span>
              <div>
                <p className="text-text-primary font-bold mb-1">लोकेशन ब्लॉक है</p>
                <p className="text-text-secondary text-sm mb-3">
                  कृपया ब्राउज़र सेटिंग्स में जाकर लोकेशन की अनुमति दें।
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="text-saffron text-sm font-bold underline-offset-2"
                  >
                    फिर से कोशिश करें
                  </button>
                  <button
                    onClick={handleManualEntry}
                    className="text-text-secondary text-sm underline-offset-2"
                  >
                    शहर मैन्युअल दर्ज करें
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error === 'location_error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-error-red-bg border-2 border-error-red rounded-card p-4 mb-6"
          >
            <p className="text-error-red text-sm text-center">
              लोकेशन प्राप्त करने में त्रुटि। कृपया फिर से कोशिश करें।
            </p>
          </motion.div>
        )}

        {/* Success State */}
        {granted && cityName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success-lt border-2 border-success rounded-card p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-success text-2xl">
                check_circle
              </span>
              <div>
                <p className="text-success font-bold">लोकेशन मिल गया!</p>
                <p className="text-text-secondary text-sm">
                  {cityName}, {stateName}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGrant}
            disabled={granted || error === 'location_denied'}
            className="w-full h-16 bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">my_location</span>
            <span>{granted ? 'लोकेशन मिल गया' : 'हाँ, अनुमति दें'}</span>
          </button>

          {error === 'location_denied' ? (
            <button
              onClick={handleRetry}
              className="w-full h-14 border-2 border-saffron text-saffron font-bold text-lg rounded-btn active:scale-[0.97]"
            >
              फिर से कोशिश करें
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="w-full h-14 text-text-secondary font-medium underline-offset-2 active:opacity-70"
            >
              बाद में चालू करूँगा
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="pb-8 text-center text-xs text-text-placeholder">
        आप बाद में सेटिंग्स से कभी भी लोकेशन बंद कर सकते हैं
      </p>
    </main>
  )
}
