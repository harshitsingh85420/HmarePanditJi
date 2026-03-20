'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

const GUARANTEES = [
  { icon: '🏅', title: 'सम्मान', sub: 'Verified Badge, Zero Negotiation' },
  { icon: '🎧', title: 'सुविधा', sub: 'Voice Nav, Auto Travel' },
  { icon: '🔒', title: 'सुरक्षा', sub: 'Fixed Income, Instant Payment' },
  { icon: '💰', title: 'समृद्धि', sub: '4 Income Streams, Backup Earnings' },
];

export default function TutorialGuarantees({ currentDot, onNext, onBack, onSkip }: Props) {
  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip} nextLabel="Registration शुरू करें →">
      {/* Headline */}
      <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mb-8">
        <h2 className="text-[22px] text-vedic-gold leading-tight">HmarePanditJi की</h2>
        <h1 className="text-[36px] font-bold text-vedic-brown leading-tight">4 गारंटी</h1>
      </motion.section>

      {/* Guarantee Cards Stack */}
      <section className="space-y-4 mb-6">
        {GUARANTEES.map((g, i) => (
          <motion.div
            key={i}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className="bg-white p-4 rounded-r-xl shadow-sm flex items-center gap-4 border-l-[6px] border-primary"
          >
            <div className="text-2xl bg-primary-lt p-3 rounded-full shrink-0">{g.icon}</div>
            <div>
              <h3 className="text-lg font-bold text-vedic-brown">{g.title}</h3>
              <p className="text-sm text-vedic-gold">{g.sub}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Social Proof Strip */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
        className="flex justify-center">
        <div className="bg-primary-lt/50 border border-primary/20 rounded-full py-2 px-4 flex items-center justify-center gap-2">
          <span className="flex -space-x-2">
            {['bg-vedic-gold', 'bg-primary', 'bg-vedic-brown-2'].map((c, i) => (
              <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-white`}></div>
            ))}
          </span>
          <p className="text-xs font-semibold text-vedic-brown">3,00,000+ पंडित पहले से जुड़े हैं</p>
        </div>
      </motion.div>
    </TutorialShell>
  );
}
