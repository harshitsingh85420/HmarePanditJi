'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { TopBar } from '@/components/ui/TopBar'
import { Button } from '@/components/ui/Button'
import { SahayataBar } from '@/components/ui/SahayataBar'
import { VoiceKeyboardToggle } from '@/components/voice/VoiceKeyboardToggle'
import { VoiceOverlay } from '@/components/voice/VoiceOverlay'
import { ConfirmationSheet } from '@/components/voice/ConfirmationSheet'
import { useVoiceStore } from '@/stores/voiceStore'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useUIStore } from '@/stores/uiStore'

const mobileSchema = z.object({
  mobile: z.string()
    .length(10, 'Mobile number 10 digits ka hona chahiye')
    .regex(/^[6-9]\d{9}$/, 'Valid Indian mobile number dalein'),
})

type MobileForm = z.infer<typeof mobileSchema>

export default function MobileScreen() {
  const router = useRouter()
  const { setMobile, markStepComplete, setCurrentStep } = useRegistrationStore()
  const { state: voiceState, isKeyboardMode } = useVoiceStore()
  const { triggerCelebration } = useUIStore()

  const [transcribedText, setTranscribedText] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<MobileForm>({
    resolver: zodResolver(mobileSchema),
    mode: 'onChange',
  })

  const watchedMobile = watch('mobile', '')

  // Mocking voice behavior until Sarvam is implemented
  const speak = useCallback((text: string) => {
    console.log('Voice Stub Speaking: ', text)
  }, [])

  useEffect(() => {
    setCurrentStep('mobile')
    const timer = setTimeout(() => {
      speak('Kripya apna 10 digit mobile number boliye ya type karein.')
    }, 2000)
    return () => clearTimeout(timer)
  }, [setCurrentStep, speak])

  const handleVoiceConfirm = useCallback(() => {
    if (transcribedText.length === 10) {
      setValue('mobile', transcribedText, { shouldValidate: true })
      setInputValue(transcribedText)
      setShowConfirmation(false)
      
      setTimeout(() => {
        proceedToOTP(transcribedText)
      }, 2000)
    } else {
      setShowConfirmation(false)
      speak('Number 10 digit ka nahi hai. Dobara boliye.')
    }
  }, [transcribedText, setValue, speak])

  const handleVoiceRetry = useCallback(() => {
    setShowConfirmation(false)
    setTranscribedText('')
  }, [])

  const proceedToOTP = (mobile: string) => {
    setMobile(mobile)
    markStepComplete('mobile')
    triggerCelebration('Mobile Number')
    
    setTimeout(() => {
      router.push('/otp')
    }, 1500)
  }

  const onSubmit = handleSubmit((data) => {
    proceedToOTP(data.mobile)
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
    setInputValue(value)
    setValue('mobile', value, { shouldValidate: true })
  }

  const handleSwitchToKeyboard = () => {
    useVoiceStore.getState().switchToKeyboard()
    setTimeout(() => {
      document.getElementById('mobile-input')?.focus()
    }, 100)
  }

  const handleRetryVoice = () => {
    useVoiceStore.getState().switchToVoice()
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      <TopBar currentStep={1} totalSteps={6} />

      <div className="px-5 py-2">
        <span className="inline-flex items-center gap-1.5 text-trust-green text-xs font-label
                        bg-trust-green-bg border border-trust-green-border px-2.5 py-1 rounded-pill">
          <span className="w-1.5 h-1.5 bg-trust-green rounded-full" />
          Save ho raha hai
        </span>
      </div>

      <main className="flex-1 px-5 pt-4 pb-40 overflow-y-auto">
        <p className="text-text-disabled text-xs font-label text-center mb-4">
          Ye number OTP ke liye aur login ke liye use hoga.
        </p>

        <div className="bg-surface-card rounded-card border border-border-default shadow-card p-6">
          <p className="text-text-disabled text-xs font-label mb-3">Step 1 of 6 — Mobile Number</p>
          
          <h1 className="font-devanagari text-title font-bold text-text-primary mb-5">
            आपका मोबाइल नंबर क्या है?
          </h1>

          <div className={`flex items-center rounded-card-sm border-2 overflow-hidden
                          ${watchedMobile.length > 0 ? 'border-saffron' : 'border-border-default'}`}>
            <div className="flex items-center gap-2 px-4 py-4 bg-surface-muted border-r border-border-default">
              <span className="text-xl">🇮🇳</span>
              <span className="font-bold text-text-primary text-lg">+91</span>
            </div>
            
            <input
              id="mobile-input"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="10-digit number"
              className="flex-1 px-4 py-4 bg-transparent border-none outline-none
                        font-bold text-2xl text-text-primary tracking-widest
                        placeholder:text-text-placeholder placeholder:font-normal placeholder:text-base"
            />
          </div>

          <AnimatePresence>
            {errors.mobile && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-error-red text-xs mt-2 font-label"
              >
                {errors.mobile.message}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isKeyboardMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3"
              >
                <span className="inline-flex items-center gap-1.5 text-saffron text-xs font-label
                               bg-saffron-light px-3 py-1.5 rounded-pill">
                  🎙️ Sun raha hoon...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isKeyboardMode && (
          <p className="text-text-placeholder text-xs text-center mt-4 font-label">
            Tip: Ek-ek number clearly boliye
          </p>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <AnimatePresence>
          {watchedMobile.length === 10 && !errors.mobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-5 pb-3"
            >
              <Button onClick={onSubmit} icon="arrow_forward">
                Aage Badhein
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <VoiceKeyboardToggle
          onKeyboardSelect={() => {
            document.getElementById('mobile-input')?.focus()
          }}
        />
        
        <SahayataBar />
      </div>

      <VoiceOverlay
        currentQuestion="Aapka mobile number kya hai?"
        onSwitchToKeyboard={handleSwitchToKeyboard}
        onRetryVoice={handleRetryVoice}
      />

      <ConfirmationSheet
        transcribedText={transcribedText}
        confidence={confidence}
        isVisible={showConfirmation}
        onConfirm={handleVoiceConfirm}
        onRetry={handleVoiceRetry}
        onEdit={handleSwitchToKeyboard}
      />
    </div>
  )
}
