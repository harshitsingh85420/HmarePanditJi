'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useRegistrationStore } from '@/stores/registrationStore'

// Stagger animation variants
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
  const { data } = useRegistrationStore()

  // Check if user has an in-progress registration
  useEffect(() => {
    if (data.completedSteps.length > 0 && data.currentStep !== 'complete') {
      // Could redirect to /onboarding/register to resume
    }
  }, [data])

  const handlePanditEntry = () => {
    router.push('/identity')
  }

  const handleCustomerEntry = () => {
    // Navigate to customer flow (separate app/website)
    window.location.href = 'https://hmarepanditji.com/customer'
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      {/* Sacred Gradient Backdrop - from HTML reference */}
      <div
        className="fixed top-0 right-0 w-full h-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle at top right, rgba(255,140,0,0.12) 0%, rgba(255,253,247,0) 55%)'
        }}
      />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-surface-base">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="font-serif text-xl font-bold text-primary tracking-tight">
            HmarePanditJi 🪔
          </h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm text-primary transition-transform active:scale-90">
            <span className="material-symbols-outlined">language</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-12 pt-4 flex flex-col">
        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <motion.h2
            variants={itemVariants}
            className="font-headline text-3xl font-bold text-on-surface leading-tight mb-4 font-devanagari text-center"
          >
            पंडित जी का वक्त पूजा में लगे, बाकी सब हम सँभालेंगे
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-primary font-medium text-lg font-devanagari text-center"
          >
            आपकी आध्यात्मिक यात्रा का डिजिटल साथी
          </motion.p>
        </motion.section>

        {/* CTA Cards - Bento Style Stack */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-grow flex flex-col gap-6"
        >
          {/* Card 1: Customer (Indigo Tint) - from HTML */}
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
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl" />
            </motion.button>
          </motion.div>

          {/* Card 2: Pandit (Primary Elevated) - from HTML */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePanditEntry}
              className="w-full relative overflow-hidden p-8 rounded-3xl bg-surface-container-lowest shadow-[0px_8px_24px_rgba(144,77,0,0.08)] flex flex-col items-center justify-center text-center border-l-4 border-primary active:scale-[0.98] transition-all"
            >
              {/* Badge - from HTML */}
              <div className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Joining free
              </div>

              <div className="mb-4 text-5xl">🪔</div>
              <h2 className="text-2xl font-bold text-on-surface font-devanagari mb-6">
                क्या आप एक पंडित हैं?
              </h2>

              {/* Primary Saffron Button - from HTML */}
              <button className="w-full h-14 bg-gradient-to-b from-primary-container to-tertiary-container text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 px-6 active:scale-95 transition-transform">
                <span className="font-bold text-lg">Pandit Ke Roop Mein Judein 🪔</span>
              </button>

              <p className="mt-4 text-on-surface-variant text-sm font-devanagari">
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
            <span className="text-on-surface-variant font-devanagari">पहले से जुड़े हैं?</span>
            <a className="text-primary font-bold decoration-primary/30 underline underline-offset-4" href="/onboarding/register">
              Login
            </a>
          </div>

          {/* Help & Support Section - from HTML */}
          <div className="flex flex-col items-center bg-surface-container-low w-full py-4 rounded-2xl gap-1">
            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
              Help & Support
            </span>
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              <span className="font-bold text-lg">+91 1800-PANDIT</span>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  )
}
