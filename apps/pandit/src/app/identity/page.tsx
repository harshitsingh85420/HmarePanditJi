'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRegistrationStore } from '@/stores/registrationStore'

export default function IdentityPage() {
  const router = useRouter()
  const { setCurrentStep, markStepComplete } = useRegistrationStore()

  const handleStartRegistration = () => {
    setCurrentStep('language')
    markStepComplete('language')
    router.push('/onboarding')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      {/* Diya Halo Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] diya-halo rounded-full -z-10" />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-12 pb-32 max-w-lg mx-auto w-full">
        {/* Diya Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 relative"
        >
          <div className="w-48 h-48 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center drop-shadow-[0_0_20px_rgba(255,140,0,0.4)]">
              <span className="text-8xl">🪔</span>
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="font-headline text-4xl font-bold text-primary tracking-tight leading-tight font-devanagari">
            नमस्ते, पंडित जी! 🙏
          </h1>
          <p className="font-body text-xl text-on-surface-variant font-medium leading-[150%]">
            HmarePanditJi aapke liye hai
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-5"
        >
          {/* Card 1: Tey Dakshina */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border-l-4 border-primary flex items-center gap-5">
            <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-3xl">
              💰
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface font-devanagari">तय दक्षिणा</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">
                हर अनुष्ठान के लिए सही और स्पष्ट मूल्य
              </p>
            </div>
          </div>

          {/* Card 2: Saral Voice Control */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border-l-4 border-primary flex items-center gap-5">
            <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-3xl">
              🎙️
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface font-devanagari">सरल वॉइस कंट्रोल</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">
                बोलकर काम करें, टाइपिंग की जरूरत नहीं
              </p>
            </div>
          </div>

          {/* Card 3: Tvarit Bhugtan */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border-l-4 border-primary flex items-center gap-5">
            <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-3xl">
              ⚡
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface font-devanagari">त्वरित भुगतान</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">
                सीधे आपके बैंक खाते में तुरंत ट्रांसफर
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Bottom Action Area */}
      <div className="fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 bg-surface-base/80 backdrop-blur-md pb-8 pt-4 px-6 space-y-4 z-40">
        {/* Joining Free Badge */}
        <div className="flex items-center justify-center gap-2 bg-secondary-container/30 py-3 rounded-full border border-secondary/10">
          <span className="material-symbols-outlined text-secondary filled">check_circle</span>
          <span className="font-label text-on-secondary-container font-semibold tracking-wide">
            Joining free
          </span>
        </div>

        {/* Primary CTA Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStartRegistration}
          className="w-full h-16 bg-gradient-to-b from-primary-container to-primary text-white font-headline text-lg font-bold rounded-2xl shadow-[0px_12px_24px_rgba(144,77,0,0.2)] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3"
        >
          <span>हाँ, मैं पंडित हूँ — Registration शुरू करें</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </motion.button>
      </div>
    </div>
  )
}
