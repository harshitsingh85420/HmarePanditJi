'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { requestPushPermission, saveFCMTokenToBackend, isPushSupported } from '@/lib/firebase'

export function NotificationsPermissionScreen() {
  const router = useRouter()
  const { setCurrentStep, markStepComplete, data } = useRegistrationStore()
  const { permission, requestPermission, isSupported } = useNotificationPermission()
  
  const [granted, setGranted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)

  useEffect(() => {
    // Check push notification support
    setPushSupported(isPushSupported())
  }, [])

  useEffect(() => {
    // Pre-education voice
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'क्या आप notification की अनुमति देंगे? जब नई पूजा होगी, हम आपको बताएंगे। हाँ बोलें या नीचे "Enable Notifications" बटन दबाएं।',
        languageCode: 'hi-IN',
        pace: 0.82,
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Update state based on permission
    if (permission === 'granted') {
      setGranted(true)
    }
  }, [permission])

  const handleEnable = async () => {
    setLoading(true)

    try {
      // Request browser notification permission
      const granted = await requestPermission()
      
      if (granted) {
        // Try to get FCM token for push notifications
        if (pushSupported) {
          const fcmToken = await requestPushPermission()
          if (fcmToken) {
            // Save token to backend (mock for now)
            await saveFCMTokenToBackend(fcmToken, data.sessionId)
            console.log('[Notifications] FCM token saved')
          }
        }

        setGranted(true)
        markStepComplete('notification_permission')
        setCurrentStep('notification_permission')

        void speakWithSarvam({
          text: 'बहुत अच्छा! Notifications चालू हो गए।',
          languageCode: 'hi-IN',
        })

        setTimeout(() => {
          router.push('/complete')
        }, 1500)
      } else {
        // Permission denied
        void speakWithSarvam({
          text: 'Notification की अनुमति नहीं मिली। कोई बात नहीं, आप आगे बढ़ सकते हैं।',
          languageCode: 'hi-IN',
        })
        
        // Still proceed - notifications are optional
        handleSkip()
      }
    } catch (error) {
      console.error('[Notifications] Enable failed:', error)
      
      void speakWithSarvam({
        text: 'Notification सेटअप में त्रुटि। कोई बात नहीं, आप आगे बढ़ सकते हैं।',
        languageCode: 'hi-IN',
      })
      
      // Still proceed on error
      handleSkip()
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    setCurrentStep('notification_permission')
    markStepComplete('notification_permission')
    router.push('/complete')
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-16 bg-surface-base">
      {/* Top Bar */}
      <header className="flex items-center gap-2 mb-8">
        <span className="text-2xl text-saffron">ॐ</span>
        <span className="text-lg font-bold text-text-primary">HmarePanditJi</span>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-saffron-light rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <span className="text-4xl">🔔</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          Notifications Enable
        </h1>
        <p className="text-text-secondary text-center mb-8">
          नई पूजा और बुकिंग की जानकारी तुरंत पाएं
        </p>

        {/* Benefits Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface-card rounded-card shadow-card p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-text-primary mb-4">
            आपको क्या मिलेगा:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-trust-green text-xl mt-0.5">
                notifications_active
              </span>
              <div>
                <p className="text-text-primary font-medium">पूजा booking की reminder मिलेगी</p>
                <p className="text-text-secondary text-base">Puja booking reminders</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-trust-green text-xl mt-0.5">
                payment
              </span>
              <div>
                <p className="text-text-primary font-medium">Payment confirmation तुरंत आएगा</p>
                <p className="text-text-secondary text-base">Instant payment confirmation</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-trust-green text-xl mt-0.5">
                message
              </span>
              <div>
                <p className="text-text-primary font-medium">Customer message का reply तुरंत मिलेगा</p>
                <p className="text-text-secondary text-base">Quick customer message replies</p>
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Platform Notice */}
        {!isSupported && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-warning-amber-bg border-2 border-warning-amber rounded-card p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-warning-amber text-2xl">
                info
              </span>
              <div>
                <p className="text-text-primary font-bold mb-1">
                  Notifications supported नहीं हैं
                </p>
                <p className="text-text-secondary text-base">
                  आपका browser या device notifications support नहीं करता। कोई बात नहीं, आप आगे बढ़ सकते हैं।
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* iOS Safari Notice */}
        {!pushSupported && isSupported && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-info-blue-bg border-2 border-info-blue rounded-card p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-info-blue text-2xl">
                info
              </span>
              <div>
                <p className="text-text-primary font-bold mb-1">
                  Push notifications available नहीं
                </p>
                <p className="text-text-secondary text-base">
                  In-app notifications मिलेंगे। Push notifications के लिए Android Chrome use करें।
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {granted && (
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
                <p className="text-success font-bold">Notifications enabled!</p>
                <p className="text-text-secondary text-base">
                  अब आपको सभी updates मिलेंगे
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
              <p className="text-text-primary font-medium">Enabling notifications...</p>
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleEnable}
            disabled={granted || loading || !isSupported}
            className="w-full min-h-[56px] bg-saffron text-white font-bold text-lg rounded-btn shadow-btn-saffron active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">notifications_active</span>
                <span>{granted ? 'Enabled!' : 'Enable Notifications'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full min-h-[56px] text-text-secondary font-medium underline-offset-2 active:opacity-70 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="pb-8 text-center text-base text-text-placeholder">
        आप बाद में सेटिंग्स से कभी भी notifications बंद कर सकते हैं
      </p>
    </main>
  )
}

export default NotificationsPermissionScreen
