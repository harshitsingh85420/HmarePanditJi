'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useNavigationStore } from '@/stores/navigationStore'
import { useRegistrationStore } from '@/stores/registrationStore'
import { getFullLocation } from '@/lib/geocode'

export function LocationPermissionScreen() {
  const router = useRouter()
  const { navigate, setSection } = useNavigationStore()
  const { setCity, setCurrentStep, markStepComplete } = useRegistrationStore()
  
  const [granted, setGranted] = useState(false)
  const [error, setError] = useState<'none' | 'denied' | 'error' | 'timeout'>('none')
  const [loading, setLoading] = useState(false)
  const [cityName, setCityName] = useState('')
  const [stateName, setStateName] = useState('')

  useEffect(() => {
    navigate('/permissions/location', 'part1-registration')
    setSection('part1-registration')
  }, [navigate, setSection])

  useEffect(() => {
    // Pre-education voice BEFORE permission dialog
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'हमें location की अनुमति दें — ताकि हम आपके शहर की पूजाएं दिखा सकें। आपका exact location किसी को नहीं दिखेगा। कृपया "Allow" बोलें या नीचे "Allow" बटन दबाएं।',
        languageCode: 'hi-IN',
        pace: 0.82,
      })
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const handleGrant = async () => {
    setLoading(true)
    setError('none')

    try {
      // Get full location (coordinates + city/state)
      const location = await getFullLocation(10000)

      setCityName(location.city)
      setStateName(location.state)
      setCity(location.city, location.state)
      setGranted(true)

      markStepComplete('location_permission')
      setCurrentStep('location_permission')

      void speakWithSarvam({
        text: `बहुत अच्छा! आपका शहर ${location.city} है। अब हम आगे बढ़ते हैं।`,
        languageCode: 'hi-IN',
      })

      setTimeout(() => {
        router.push('/permissions/notifications')
      }, 2000)
    } catch (err: unknown) {
      setLoading(false)

      const error = err as { name?: string }

      if (error.name === 'PermissionDeniedError') {
        setError('denied')
        void speakWithSarvam({
          text: 'लोकेशन की अनुमति नहीं मिली। कृपया सेटिंग्स में जाकर अनुमति दें।',
          languageCode: 'hi-IN',
        })
      } else if ((err as { name?: string }).name === 'TimeoutError') {
        setError('timeout')
        void speakWithSarvam({
          text: 'लोकेशन लेने में समय लग रहा है। कृपया फिर से कोशिश करें।',
          languageCode: 'hi-IN',
        })
      } else {
        setError('error')
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
    setError('none')
    handleGrant()
  }

  const handleManualEntry = () => {
    // Default to Varanasi for now
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

        {/* Benefits Card */}
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
                <p className="text-text-primary font-medium">आपके शहर की पूजाएं आपको मिलेंगी</p>
                <p className="text-text-secondary text-base">Local pujas in your city</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                route
              </span>
              <div>
                <p className="text-text-primary font-medium">Travel distance optimize होगा</p>
                <p className="text-text-secondary text-base">Optimize travel distance</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-saffron text-xl mt-0.5">
                location_on
              </span>
              <div>
                <p className="text-text-primary font-medium">Booking location automatically set</p>
                <p className="text-text-secondary text-base">Auto-set booking location</p>
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
              <p className="text-trust-green font-bold text-base mb-1">
                आपकी गोपनीयता सुरक्षित है
              </p>
              <p className="text-text-secondary text-base">
                आपका सटीक स्थान कभी भी सार्वजनिक रूप से नहीं दिखाया जाएगा। केवल शहर का नाम उपयोग किया जाएगा।
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error States */}
        {error === 'denied' && (
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
                <p className="text-text-secondary text-base mb-3">
                  कृपया ब्राउज़र सेटिंग्स में जाकर लोकेशन की अनुमति दें।
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="text-saffron text-base font-bold underline-offset-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    फिर से कोशिश करें
                  </button>
                  <button
                    onClick={handleManualEntry}
                    className="text-text-secondary text-base underline-offset-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    शहर मैन्युअल दर्ज करें
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error === 'timeout' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning-amber-bg border-2 border-warning-amber rounded-card p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-warning-amber text-2xl">
                schedule
              </span>
              <div>
                <p className="text-text-primary font-bold mb-1">समय समाप्त</p>
                <p className="text-text-secondary text-base mb-3">
                  लोकेशन लेने में बहुत समय लग रहा है।
                </p>
                <button
                  onClick={handleRetry}
                  className="text-saffron text-base font-bold underline-offset-2 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  फिर से कोशिश करें
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {error === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-error-red-bg border-2 border-error-red rounded-card p-4 mb-6"
          >
            <p className="text-error-red text-base text-center">
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
                <p className="text-text-secondary text-base">
                  {cityName}, {stateName}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface-card rounded-card p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
              <p className="text-text-primary font-medium">Location ले रहे हैं...</p>
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGrant}
            disabled={granted || loading || error === 'denied'}
            className="w-full min-h-[56px] bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Location ले रहे हैं...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">my_location</span>
                <span>{granted ? 'लोकेशन मिल गया' : 'अनुमति दें'}</span>
              </>
            )}
          </button>

          {error === 'denied' ? (
            <button
              onClick={handleRetry}
              className="w-full min-h-[56px] border-2 border-saffron text-saffron font-bold text-lg rounded-btn active:scale-[0.97] focus:ring-2 focus:ring-primary focus:outline-none"
            >
              फिर से कोशिश करें
            </button>
          ) : (
            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full min-h-[56px] text-text-secondary font-medium underline-offset-2 active:opacity-70 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
            >
              बाद में
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="pb-8 text-center text-base text-text-placeholder">
        आप बाद में सेटिंग्स से कभी भी लोकेशन बंद कर सकते हैं
      </p>
    </main>
  )
}

export default LocationPermissionScreen
