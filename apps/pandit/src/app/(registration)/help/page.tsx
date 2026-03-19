'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useRegistrationStore } from '@/stores/registrationStore'
import { STEP_TO_ROUTE } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

const BUSINESS_HOURS = { start: 8, end: 22 } // 8 AM to 10 PM
const WHATSAPP_NUMBER = '919XXXXXXXXX'  // Replace with actual number

function isTeamOnline(): boolean {
  const hour = new Date().getHours()
  return hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end
}

const FAQ_ITEMS = [
  {
    icon: 'mic_off',
    title: 'Mic kaam nahi kar raha',
    content: [
      'Phone ki Settings > Apps > HmarePanditJi > Permissions mein jaayein',
      'Microphone permission ON karein',
      'App wapas kholein',
    ],
  },
  {
    icon: 'sms_failed',
    title: 'OTP nahi mila',
    content: [
      'SMS inbox check karein',
      'DND on hai to off karein',
      '"Call karke OTP bolein" option use karein',
    ],
  },
  {
    icon: 'id_card',
    title: 'Aadhaar verification mein dikkat',
    content: [
      'OTP usi mobile par aayega jo Aadhaar se linked hai',
      'UIDAI website se mobile number update karein',
      'DigiLocker se Aadhaar use karein',
    ],
  },
]

export default function HelpScreen() {
  const router = useRouter()
  const { data, getCompletionPercentage } = useRegistrationStore()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const teamOnline = isTeamOnline()
  const percentage = getCompletionPercentage()

  const handleBack = () => {
    const route = STEP_TO_ROUTE[data.currentStep]
    if (route) router.push(route)
    else router.back()
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      <header className="sticky top-0 z-50 bg-surface-base shadow-top-bar">
        <div className="flex items-center justify-between px-5 h-14">
          <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-text-secondary">close</span>
          </button>
          <h1 className="font-serif text-lg font-bold text-saffron-dark">Sahayata 🙏</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 pt-6 pb-10 overflow-y-auto">
        <h2 className="font-serif text-2xl font-bold text-saffron-dark mb-2">
          Sahayata — Hum Yahaan Hain 🙏
        </h2>
        <p className="text-text-secondary font-devanagari mb-6">
          Aapko koi bhi mushkil ho — hum madad karenge.
        </p>

        <div className={`bg-surface-card rounded-card p-5 mb-5 border-2
                        ${teamOnline ? 'border-trust-green/30' : 'border-error-red/20'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.span
                  className={`w-2.5 h-2.5 rounded-full ${teamOnline ? 'bg-trust-green' : 'bg-error-red'}`}
                  animate={teamOnline ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className={`font-bold text-base ${teamOnline ? 'text-trust-green' : 'text-error-red'}`}>
                  {teamOnline ? 'Team abhi online hai' : 'Team abhi offline hai'}
                </span>
              </div>
              <p className="text-text-secondary text-sm font-label">
                {teamOnline ? 'Avg wait: 1 min' : 'Kal subah 8 baje se available'}
              </p>
            </div>
            <span className="material-symbols-outlined text-saffron text-4xl filled">support_agent</span>
          </div>

          <div className="flex flex-col gap-3">
            {teamOnline ? (
              <Button icon="call" iconPosition="left">
                Abhi Call Karein
              </Button>
            ) : (
              <Button icon="schedule" iconPosition="left">
                Callback Request Karein
              </Button>
            )}
            
            <Button
              variant="outline"
              icon="chat"
              iconPosition="left"
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
            >
              WhatsApp par Chat Karein
            </Button>
          </div>
        </div>

        <div className="bg-surface-card rounded-card p-5 mb-5 shadow-card">
          <h3 className="font-bold text-text-primary mb-3">Aapka Registration</h3>
          <div className="h-2 bg-surface-dim rounded-pill overflow-hidden mb-2">
            <div className="h-full bg-saffron rounded-pill" style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-text-secondary text-sm mb-3">{percentage}% complete</p>
          <button
            onClick={handleBack}
            className="text-saffron text-sm font-label flex items-center gap-1"
          >
            Wapas Registration Mein Jaayein →
          </button>
        </div>

        <h3 className="font-bold text-text-primary mb-3">Aksar Pooche Jaane Wale Sawaal</h3>
        <div className="bg-surface-card rounded-card shadow-card overflow-hidden">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full flex items-center gap-3 p-4 text-left
                           ${i > 0 ? 'border-t border-border-default' : ''}`}
              >
                <div className="p-2 bg-saffron/5 rounded-lg">
                  <span className="material-symbols-outlined text-saffron-dark text-xl">{item.icon}</span>
                </div>
                <span className="flex-1 font-bold text-text-primary">{item.title}</span>
                <span className="material-symbols-outlined text-text-disabled">
                  {openFaq === i ? 'expand_less' : 'chevron_right'}
                </span>
              </button>
              
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 bg-surface-muted"
                  >
                    <ol className="list-decimal pl-4 space-y-2 pt-2">
                      {item.content.map((step, j) => (
                        <li key={j} className="text-text-secondary text-sm font-devanagari">{step}</li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
