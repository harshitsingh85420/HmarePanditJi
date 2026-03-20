'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialPayment({ currentDot, onNext, onBack, onSkip }: Props) {
  const timeline = [
    { time: '3:30 PM', label: 'पूजा संपन्न हुई (Dakshina confirmed)', icon: '✅', color: 'text-primary' },
    { time: '3:31 PM', label: 'Processing instant settlement...', icon: '💳', color: 'text-vedic-gold' },
    { time: '3:32 PM', label: 'बैंक खाते में जमा!', icon: '💚', color: 'text-success', bold: true },
  ];

  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip}>
      {/* Headline */}
      <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} className="pb-6">
        <h1 className="text-[32px] font-bold leading-tight text-vedic-brown">पूजा ख़त्म।</h1>
        <h1 className="text-[32px] font-bold leading-tight text-primary">पैसे 2 मिनट में।</h1>
      </motion.div>

      {/* Timeline Card */}
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.15}}
        className="bg-white rounded-xl p-5 border border-vedic-border/50 shadow-card mb-5">
        <div className="space-y-4">
          {timeline.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <span className="text-xl">{item.icon}</span>
                {i < timeline.length - 1 && <div className="w-0.5 h-8 bg-primary/20 mt-1"></div>}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${item.bold ? 'text-success' : 'text-vedic-brown'}`}>{item.time}</p>
                <p className="text-vedic-gold text-sm">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payment Breakdown */}
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.3}}
        className="bg-white rounded-xl p-5 border border-success/20 shadow-card" style={{boxShadow:'0 0 20px rgba(34,197,94,0.1)'}}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-vedic-brown">Payment Summary</h3>
          <span className="bg-success-lt text-success text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Success</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-vedic-gold">Total Dakshina</span>
            <span className="text-vedic-brown font-medium">₹2,735</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-vedic-gold">Platform Fee (15%)</span>
            <span className="text-error font-medium">− ₹410</span>
          </div>
          <div className="h-px bg-vedic-border my-1"></div>
          <div className="flex justify-between items-center">
            <span className="text-vedic-brown font-bold">You Received</span>
            <span className="text-success text-2xl font-bold">₹2,325</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-primary/5 rounded-lg flex items-center gap-2">
          <span className="text-primary">ℹ️</span>
          <p className="text-[11px] text-vedic-gold">15% platform fee for server, marketing & secure transfers.</p>
        </div>
      </motion.div>
    </TutorialShell>
  );
}
