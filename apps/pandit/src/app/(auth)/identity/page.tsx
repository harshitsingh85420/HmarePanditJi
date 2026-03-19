'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/ui/TopBar'

export default function IdentityConfirmationScreen() {
  const router = useRouter()

  const handleStartRegistration = () => {
    // According to navigation config: /identity -> /permissions/mic
    router.push('/permissions/mic')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base relative overflow-hidden">
      <TopBar showLanguage={true} state="with-back" />
      
      {/* Diya Halo Background */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255, 140, 0, 0.15) 0%, rgba(255, 253, 247, 0) 70%)' }}
      />

      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-12 pb-32 max-w-lg mx-auto w-full relative overflow-hidden">
        
        {/* Diya Image */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-10 relative"
        >
          <div className="w-48 h-48 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(255,140,0,0.4)]" 
                alt="Watercolor illustration of a glowing diya" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCJ2fC8kUZBd5S9H5OcTtkd9QTXEAbCWXgEw9DBKmc7vkFsSih7SuyOifMAdx1oa8-__NH2htu0GZfB5YXPeGK1RsUJSYL1a-8WyEzSmv2J9N_MFv04YxZgXS32JE1oF-UGYBSX17SMriIVzV4krg9KgC-Bwi433wNcCiVHaodE9XxB5-bQFlZe-TyVTZmc5rrKldekGasp-YeBgFJ-lKqMOO2As7TxCGClPmJDt7mGngsHeQEIHU0_JXNAavMIOiWvjSelc8bVg5E"
              />
            </div>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="font-serif text-4xl font-bold text-saffron tracking-tight leading-tight font-devanagari">
            नमस्ते, पंडित जी! 🙏
          </h1>
          <p className="font-body text-xl text-text-secondary font-medium leading-[150%]">
            HmarePanditJi aapke liye hai
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-5"
        >
          <FeatureCard 
            icon="💰" 
            title="तय दक्षिणा" 
            desc="हर अनुष्ठान के लिए सही और स्पष्ट मूल्य" 
          />
          <FeatureCard 
            icon="🎙️" 
            title="सरल वॉइस कंट्रोल" 
            desc="बोलकर काम करें, टाइपिंग की जरूरत नहीं" 
          />
          <FeatureCard 
            icon="⚡" 
            title="त्वरित भुगतान" 
            desc="सीधे आपके बैंक खाते में तुरंत ट्रांसफर" 
          />
        </motion.div>
      </main>

      {/* Bottom Action Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', delay: 0.6 }}
        className="fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 bg-surface-base/80 backdrop-blur-md pb-safe pt-4 px-6 space-y-4 z-40"
      >
        <div className="flex items-center justify-center gap-2 bg-trust-green-bg py-3 rounded-full border border-trust-green-border">
          <span className="material-symbols-outlined text-trust-green filled">check_circle</span>
          <span className="font-label text-trust-green text-sm font-semibold tracking-wide">Joining free</span>
        </div>
        
        <button 
          onClick={handleStartRegistration}
          className="w-full h-16 bg-gradient-to-b from-saffron to-saffron-dark text-white font-serif text-lg font-bold rounded-2xl shadow-btn-saffron active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3"
        >
          <span className="font-devanagari">हाँ, मैं पंडित हूँ — Registration शुरू करें</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </motion.div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0px_8px_24px_rgba(144,77,0,0.04)] border-l-4 border-saffron flex items-center gap-5">
      <div className="w-14 h-14 bg-saffron-tint rounded-xl flex items-center justify-center text-3xl">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-lg font-bold text-text-primary font-devanagari">{title}</h3>
        <p className="font-body text-text-secondary leading-relaxed font-devanagari">{desc}</p>
      </div>
    </div>
  )
}
