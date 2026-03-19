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

  // Check if user has an in-progress registration — redirect to last step
  useEffect(() => {
    if (data.currentStep && data.currentStep !== 'language' && data.completedSteps.length > 0) {
      // Logic for returning users later
    }
  }, [data])

  const handlePanditEntry = () => {
    router.push('/identity')
  }

  const handleCustomerEntry = () => {
    // Navigate to customer flow (out of scope for Pandit registration)
    window.location.href = 'https://hmarepanditji.com/customer'
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      {/* Sunrise gradient backdrop */}
      <div 
        className="fixed top-0 right-0 w-full h-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle at top right, rgba(255,140,0,0.12) 0%, rgba(255,253,247,0) 55%)'
        }}
      />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-surface-base shadow-top-bar">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="font-serif text-xl font-bold text-saffron-dark font-devanagari">
            HmarePanditJi 🪔
          </h1>
          <button className="text-text-secondary text-sm font-label px-3 py-1 rounded-pill hover:bg-saffron-light transition-colors">
            हिन्दी
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-8 pb-32 flex flex-col">
        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.p variants={itemVariants} className="text-xs font-label uppercase tracking-[1.5px] text-saffron-dark mb-3 text-center">
            🕉️ India Ka Apna Pandit Platform
          </motion.p>
          
          <motion.h2 
            variants={itemVariants}
            className="font-serif text-2xl font-bold text-text-primary leading-tight mb-3 text-center font-devanagari"
          >
            पंडित जी का वक्त पूजा में लगे, बाकी सब हम सँभालेंगे
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-text-secondary text-base text-center font-devanagari">
            Bookings, dakshina, aur travel —{' '}
            <span className="text-saffron font-semibold">sab aapki awaaz se</span>
          </motion.p>
        </motion.section>

        {/* CTA Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5"
        >
          {/* Customer Card */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCustomerEntry}
              className="w-full rounded-[20px] p-6 flex items-center justify-between
                         bg-indigo-tint border border-indigo-border"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-4xl mb-1">🙏</span>
                <h3 className="font-serif text-xl font-bold text-indigo-text font-devanagari">मुझे पंडित चाहिए</h3>
                <p className="text-sm text-indigo-text/70">Book a verified Pandit for any ritual</p>
              </div>
              <div className="bg-indigo-tint/80 p-3 rounded-full border border-indigo-border">
                <span className="material-symbols-outlined text-indigo-text">chevron_right</span>
              </div>
            </motion.button>
          </motion.div>

          {/* Pandit Card — PRIORITY */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePanditEntry}
              className="w-full rounded-[28px] p-8 flex flex-col bg-white relative overflow-hidden"
              style={{ 
                boxShadow: '0px 6px 20px rgba(255,140,0,0.18), 0px 2px 4px rgba(0,0,0,0.06)',
                border: '1.5px solid #FFB300'
              }}
            >
              {/* Golden glow decorative element */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-saffron/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 text-left">
                {/* Top row: icon + badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-saffron/5 p-4 rounded-2xl">
                    <span className="text-4xl" style={{ filter: 'drop-shadow(0 0 8px rgba(255,140,0,0.5))' }}>🪔</span>
                  </div>
                  
                  <span className="bg-trust-green-bg text-trust-green text-xs font-bold px-3 py-1 rounded-pill 
                                   flex items-center gap-1 border border-trust-green-border">
                    <span className="material-symbols-outlined text-sm filled">check_circle</span>
                    Joining bilkul free
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-text-primary mb-2 font-devanagari">
                  मैं पंडित हूँ
                </h3>
                <p className="text-text-secondary text-base mb-6 leading-relaxed">
                  Join as a partner Pandit and manage your sacred services with ease.
                </p>

                {/* CTA Button inside card */}
                <div className="w-full h-14 bg-saffron rounded-btn flex items-center justify-center gap-2
                               shadow-btn-saffron">
                  <span className="text-white font-bold text-base">Pandit Ke Roop Mein Judein 🪔</span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 py-3 px-4 bg-surface-dim rounded-btn flex items-center justify-center gap-4"
        >
          {['✓ 10,000+ Pandits joined', '₹0 joining fee', '⚡ Instant payment'].map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-text-secondary text-xs font-label">
              {i > 0 && <span className="text-border-warm">·</span>}
              {item}
            </span>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto pb-safe">
        <div className="flex flex-col items-center gap-2 pb-6 bg-gradient-to-t from-surface-base to-transparent pt-8">
          <a href="/login" className="text-text-secondary text-sm font-label">
            Pehle se Pandit hain? <span className="text-saffron font-semibold">Login karein →</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
