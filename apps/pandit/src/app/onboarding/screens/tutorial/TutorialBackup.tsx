'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialBackup({ currentDot, onNext, onBack, onSkip }: Props) {
  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip}>
      {/* Headline */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-[28px] font-bold text-vedic-brown">बिना कुछ किए</h2>
        <div className="inline-block px-4 py-1 rounded-xl bg-success-lt border border-success/20 animate-gentle-float">
          <h1 className="text-success text-[44px] font-extrabold leading-none">₹2,000?</h1>
        </div>
        <p className="text-vedic-gold text-lg font-medium">हाँ। यह सच है।</p>
      </div>

      {/* Timeline Card */}
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
        className="bg-white rounded-xl p-5 shadow-card border border-vedic-border/50 mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-vedic-brown">
          <span>⏱️</span> आपका समयरेखा
        </h3>
        <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20">
          {[
            { step: '1', title: 'आज ही शुरू करें', sub: '₹0 निवेश' },
            { step: '2', title: 'सिस्टम सेटअप', sub: '2 मिनट का समय' },
            { step: '✓', title: 'कमाई शुरू', sub: 'सीधे बैंक में', success: true },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] z-10 shrink-0 ${item.success ? 'bg-success' : 'bg-primary'}`}>
                {item.step}
              </div>
              <div>
                <p className={`text-sm font-bold ${item.success ? 'text-success' : 'text-vedic-brown'}`}>{item.title}</p>
                <p className="text-xs text-vedic-gold">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Comparison Table */}
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.2}}
        className="overflow-hidden rounded-xl border border-vedic-border">
        <div className="grid grid-cols-2 bg-vedic-border/30 text-xs font-bold uppercase tracking-wider text-vedic-gold">
          <div className="p-3 border-r border-vedic-border">बिना बैकअप</div>
          <div className="p-3">बैकअप पंडित के साथ</div>
        </div>
        <div className="grid grid-cols-2 text-sm">
          <div className="p-4 border-r border-vedic-border/50 bg-white">
            <p className="text-vedic-gold/60 line-through">₹0 इनकम</p>
          </div>
          <div className="p-4 bg-success-lt">
            <p className="font-bold text-success">₹2,000+ प्रतिमाह</p>
          </div>
        </div>
      </motion.div>

      {/* Income Grid */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        {[
          { icon: '💰', label: 'दैनिक बचत', value: '₹65' },
          { icon: '📈', label: 'विकास दर', value: '12% वार्षिक' },
          { icon: '🔒', label: 'सुरक्षा', value: '100%' },
          { icon: '🏦', label: 'न्यूनतम शेष', value: '₹0' },
        ].map((item, i) => (
          <motion.div key={i} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:0.1*i+0.3}}
            className="bg-white p-4 rounded-xl border border-vedic-border text-center shadow-sm">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-xs text-vedic-gold mt-1">{item.label}</p>
            <p className="font-bold text-vedic-brown">{item.value}</p>
          </motion.div>
        ))}
      </div>
    </TutorialShell>
  );
}
