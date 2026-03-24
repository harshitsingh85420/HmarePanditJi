'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { speakWithSarvam } from '@/lib/sarvam-tts'
import { PanditIllustration } from '@/components/illustrations/PremiumIcons'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function HomePage() {
  const router = useRouter()
  const { data, setReferralCode } = useRegistrationStore()
  const { navigate, setSection } = useNavigationStore()

  useEffect(() => {
    navigate('/', 'homepage')
    setSection('homepage')
  }, [navigate, setSection])

  useEffect(() => {
    const timer = setTimeout(() => {
      void speakWithSarvam({
        text: 'नमस्ते। HmarePanditJi में आपका स्वागत है।',
        languageCode: 'hi-IN',
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handlePanditEntry = () => {
    router.push('/onboarding')
  }

  const handleCustomerEntry = () => {
    window.location.href = 'https://hmarepanditji.com/customer'
  }

  const handleResumeRegistration = () => {
    if (data.completedSteps.length > 0 && data.currentStep !== 'complete') {
      router.push('/mobile')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      {/* Sacred Gradient Backdrop - Using CSS class instead of inline style */}
      <div className="fixed inset-0 bg-sacred pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-surface-base">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="font-serif text-lg font-bold text-saffron tracking-tight flex items-center gap-2">
            <span className="text-2xl shimmer-text">ॐ</span>
            <span className="shimmer-text">HmarePanditJi</span>
            <span className="text-xl">🪔</span>
          </h1>
          <button className="w-[56px] h-[56px] flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm text-saffron transition-transform active:scale-90">
            <span className="material-symbols-outlined">language</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-12 pt-4 flex flex-col">
        {/* Hero Section with Premium Pandit Illustration */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          {/* Premium Pandit Illustration with shimmer and glow */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6 relative">
            {/* Diya halo effect behind illustration */}
            <div className="absolute inset-0 diya-halo rounded-full blur-xl -z-10" />
            <div className="shimmer-text">
              <PanditIllustration size="lg" animated={true} />
            </div>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="font-headline text-2xl font-bold text-text-primary leading-tight mb-4 font-devanagari text-center"
          >
            पंडित जी का वक्त पूजा में लगे, बाकी सब हम सँभालेंगे
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-saffron font-medium text-lg font-devanagari text-center"
          >
            आपकी आध्यात्मिक यात्रा का डिजिटल साथी
          </motion.p>
        </motion.section>

        {/* Resume Registration (if in progress) */}
        {data.completedSteps.length > 0 && data.currentStep !== 'complete' && (
          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleResumeRegistration}
            className="w-full mb-6 p-4 bg-trust-green-bg border border-trust-green-border rounded-2xl flex items-center justify-between shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-trust-green">schedule</span>
              <div className="text-left">
                <p className="text-trust-green font-bold text-lg">पंजीकरण जारी रखें</p>
                <p className="text-text-secondary text-lgs">{data.completedSteps.length} चरण पूरे हुए</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-trust-green">arrow_forward</span>
          </motion.button>
        )}

        {/* CTA Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-grow flex flex-col gap-6"
        >
          {/* Card 1: Customer (Indigo Tint) - Matching homepage_e_01 reference */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCustomerEntry}
              className="w-full relative overflow-hidden p-8 rounded-3xl bg-indigo-50/60 border border-indigo-100/50 shadow-sm flex flex-col items-center justify-center text-center active:scale-[0.98] transition-all"
            >
              <div className="mb-4 text-5xl">🙏</div>
              <h2 className="text-2xl font-bold text-indigo-900 font-devanagari mb-2">
                मुझे पंडित चाहिए
              </h2>
              <p className="text-indigo-700/80 text-sm">Find verified priests for your rituals</p>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl" />
            </motion.button>
          </motion.div>

          {/* Card 2: Pandit (Primary Elevated) - Matching homepage_e_01 reference */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePanditEntry}
              className="w-full relative overflow-hidden p-8 rounded-3xl bg-surface-container-lowest shadow-[0px_8px_24px_rgba(144,77,0,0.08)] flex flex-col items-center justify-center text-center border-l-4 border-saffron active:scale-[0.98] transition-all"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-trust-green-bg text-trust-green px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-trust-green" />
                Joining free
              </div>

              <div className="mb-4 text-5xl shimmer-text">🪔</div>
              <h2 className="text-2xl font-bold text-text-primary font-devanagari mb-6">
                क्या आप एक पंडित हैं?
              </h2>

              <button className="w-full h-14 bg-gradient-to-b from-primary-container to-tertiary-container text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 px-6 active:scale-95 transition-transform">
                <span className="font-bold text-lg">Pandit Ke Roop Mein Judein 🪔</span>
              </button>

              <p className="mt-4 text-text-secondary text-sm font-devanagari">
                पंजीकरण में मात्र २ मिनट लगेंगे
              </p>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Footer Section */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-devanagari">पहले से जुड़े हैं?</span>
            <a className="text-saffron font-bold decoration-saffron/30 underline underline-offset-4 min-h-[56px] min-w-[56px] flex items-center justify-center" href="/login">
              लॉगिन करें
            </a>
          </div>

          {/* Help & Support Section */}
          <div className="flex flex-col items-center bg-surface-muted w-full py-4 rounded-2xl gap-1">
            <span className="text-lgs text-text-secondary uppercase tracking-widest font-bold">
              Help & Support
            </span>
            <div className="flex items-center gap-2 text-saffron">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              <span className="font-bold text-lg">+91 1800-PANDIT</span>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  )
}
