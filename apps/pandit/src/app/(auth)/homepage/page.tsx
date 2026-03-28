'use client'

// SSR FIX: Disable static generation for pages using Zustand stores
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Homepage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen bg-surface-base overflow-hidden">
      {/* Sacred Gradient Background */}
      <div className="fixed inset-0 sacred-gradient -z-10" />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col px-6 pb-12 pt-4">

        {/* Top Bar */}
        <nav className="flex justify-between items-center w-full mb-10">
          <div className="flex items-center gap-2">
            <span className="font-serif text-primary text-xl font-bold tracking-tight">
              HmarePanditJi 🪔
            </span>
          </div>
          <button
            onClick={() => router.push('/language-list')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm text-primary transition-transform active:scale-90"
          >
            <span className="material-symbols-outlined">language</span>
          </button>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-serif text-3xl font-bold text-on-surface leading-tight mb-4 font-devanagari"
          >
            पंडित जी का वक्त पूजा में लगे,<br />
            बाकी सब हम सँभालेंगे
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-primary font-medium text-lg font-devanagari"
          >
            आपकी आध्यात्मिक यात्रा का डिजिटल साथी
          </motion.p>
        </header>

        {/* Main Cards */}
        <main className="flex-grow flex flex-col gap-6">

          {/* Card 1: Customer (Indigo Tint) */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden p-8 rounded-3xl bg-indigo-50/60 border border-indigo-100/50 shadow-sm flex flex-col items-center justify-center text-center active:scale-[0.98] transition-all"
          >
            <div className="mb-4 text-5xl">🙏</div>
            <h2 className="text-2xl font-bold text-indigo-900 font-devanagari mb-2">
              मुझे पंडित चाहिए
            </h2>
            <p className="text-indigo-700/80 text-sm">
              Find verified priests for your rituals
            </p>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl" />
          </motion.div>

          {/* Card 2: Pandit (Primary Elevated) */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden p-8 rounded-3xl bg-surface-container-lowest shadow-[0px_8px_24px_rgba(144,77,0,0.08)] flex flex-col items-center justify-center text-center border-l-4 border-primary active:scale-[0.98] transition-all"
          >
            {/* Badge */}
            <div className="absolute top-4 right-4 bg-success-lt text-success px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              Joining free
            </div>

            <div className="mb-4 text-5xl">🪔</div>
            <h2 className="text-2xl font-bold text-on-surface font-devanagari mb-6">
              क्या आप एक पंडित हैं?
            </h2>

            {/* Primary Saffron Button */}
            <button
              onClick={() => router.push('/mobile')}
              className="w-full h-14 bg-gradient-to-b from-primary-container to-tertiary-container text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 px-6 active:scale-95 transition-transform"
            >
              Pandit Ke Roop Mein Judein 🪔
            </button>

            <p className="mt-4 text-on-surface-variant text-sm font-devanagari">
              पंजीकरण में मात्र २ मिनट लगेंगे
            </p>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant font-devanagari">पहले से जुड़े हैं?</span>
            <a className="text-primary font-bold decoration-primary/30 underline underline-offset-4" href="#">
              Login
            </a>
          </div>

          {/* Help & Support */}
          <div className="flex flex-col items-center bg-surface-container-low w-full py-4 rounded-2xl gap-1">
            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
              Help & Support
            </span>
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              <span className="font-bold text-lg">+91 1800-PANDIT</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
