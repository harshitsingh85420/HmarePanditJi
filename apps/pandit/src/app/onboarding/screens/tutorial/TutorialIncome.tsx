'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialIncome({ currentDot, onNext, onBack, onSkip }: Props) {
  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip}>
      {/* Title Section */}
      <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mb-6">
        <h1 className="text-[26px] font-bold text-vedic-brown leading-tight">आपकी कमाई कैसे बढ़ेगी?</h1>
      </motion.section>

      {/* Hero Card - Testimonial */}
      <motion.section initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
        className="bg-white rounded-2xl shadow-card p-5 border-l-[5px] border-primary relative overflow-hidden mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-lt overflow-hidden border-2 border-primary shrink-0">
            <img alt="Avatar" className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSo_KYSZRJeR5u1TGHZfoolrxzas4w5huWmkX2bvViEsWqkblH4QEQS05ELhpvXJtxPKaYTfcnAhJOfQn9EupsUiBevBKDbPXlUsiNjmDRKqgFe6C12Pqj4zhh2v2roR8Qnz4VzGqMefYfurZg2fHGDpSWYlbZ5RegbZa3K3CtIdAT8e_byFvqmlc2g1eGNcq2eoBz-V4zxJFFZ8z_h_c5Nljl1R7ZHRPZtUE7V6yWQR2RzpgIC5EBZ-C88DkKHi7raXqXEgY3soQ8" />
          </div>
          <div>
            <h3 className="font-bold text-vedic-brown">पंडित रामेश्वर शर्मा</h3>
            <p className="text-sm text-vedic-gold">वाराणसी, UP</p>
          </div>
        </div>
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-sm text-vedic-gold mb-1">पहले:</p>
            <span className="text-lg text-vedic-gold/60 line-through">₹18,000</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-vedic-gold mb-1">अब:</p>
            <span className="text-3xl font-bold text-success block animate-glow-pulse">₹63,000</span>
          </div>
        </div>
        <div className="inline-flex items-center px-3 py-1 bg-success-lt border border-success/20 rounded-full">
          <span className="text-success text-xs font-bold">✓ HmarePanditJi Verified</span>
        </div>
      </motion.section>

      {/* 3 New Methods Grid */}
      <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
        <h2 className="text-[18px] font-semibold text-vedic-gold mb-4">3 नए तरीकों से यह हुआ:</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🏠', label: 'Offline Pooja', delay: 0.1, badge: null },
            { icon: '📱', label: 'Online Pooja', delay: 0.2, badge: 'NEW' },
            { icon: '🎓', label: 'Consultancy', delay: 0.3, badge: 'NEW' },
            { icon: '👥', label: 'Backup Pandit', delay: 0.4, badge: 'NEW' },
          ].map((item, i) => (
            <motion.div key={i} initial={{y:15,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:item.delay}}
              className="bg-white p-4 rounded-xl shadow-sm border border-vedic-border flex flex-col items-center justify-center relative">
              {item.badge && (
                <span className="absolute -top-2 -right-1 bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{item.badge}</span>
              )}
              <span className="text-3xl mb-2">{item.icon}</span>
              <p className="text-sm font-bold text-vedic-brown text-center">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </TutorialShell>
  );
}
