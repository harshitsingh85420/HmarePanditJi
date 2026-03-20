'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialDualMode({ currentDot, onNext, onBack, onSkip }: Props) {
  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip}>
      {/* Headline */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold leading-tight">
          <span className="block text-vedic-brown">कोई भी Phone,</span>
          <span className="text-primary block">Platform चलेगा।</span>
        </h1>
        <p className="text-vedic-gold text-sm max-w-xs mx-auto">हमारा सिस्टम हर डिवाइस पर समान रूप से काम करता है।</p>
      </motion.div>

      {/* Dual Mode Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { title: 'Smartphone', sub: 'Smart App', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbk-rwAVl5nbvp1ys5qgmC6J9NyXBGYmgy1J9gu3ba0bO6ZimujovKBmctx6Z8hOnU8FUKAWIX4oNtD75JigSiMfRo45CjbDSLvvXlfEfe-IWeq0fzXMe7m8Rz_-r_M7zZuBvQNM5tdeCOIE35tL_VOFWiv6GxRBzaLWXyk5a2AYPFVLeAiR9SbdQbTsqVMp73vDOBMUKaBsWP5dQ-WF8ux_PvmI5-OhQvoihvyco2SHl4Ahlkbs4UVyKIMWxsrx5_IqeVgI4xNdqu' },
          { title: 'Keypad Phone', sub: 'Voice/SMS', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClq3PSB3bl4SISHby2ykk88tcQ8SIcllVSyTGt_-E2TlhTKP93ADkGPRCQduU1VyajCI5q-EmrgjeB49n_dpqfFkzAxEWzftZr5htNcYvaNHbmXIN-LYB9JJqivu-KSz9A_PnmHa0YXz6duOmqFbJGJnDg-mBLlmAko-StG78BZFx_1Y8j37xs6M4Yzb4my1c9SMTStOD9bQTHGqAbnY2yU6ohahu6cQg8YP84Qg0ynbK-Fx2HhhQ46Mpqb8QHI1vHxZbV2Mp9zXdE' },
        ].map((card, i) => (
          <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1*i}}
            className="flex flex-col gap-3 p-4 rounded-xl border border-vedic-border bg-white shadow-card hover:shadow-card-hover transition-all">
            <div className="aspect-[3/4] w-full bg-primary-lt/30 rounded-lg flex items-center justify-center overflow-hidden">
              <img alt={card.title} className="object-cover w-full h-full opacity-90" src={card.img} />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-vedic-brown">{card.title}</p>
              <p className="text-primary text-xs font-medium">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Family Inclusion Card */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
        className="bg-primary/10 p-6 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm">
          👨‍👩‍👧‍👦
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-vedic-brown">Family Inclusion Card</h3>
          <p className="text-xs text-vedic-gold">पूरे परिवार को जोड़ें, चाहे उनके पास कोई भी फोन हो।</p>
        </div>
        <div className="flex gap-2 mt-2">
          {['आवाज', 'संदेश', 'ऐप'].map(tag => (
            <span key={tag} className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase">{tag}</span>
          ))}
        </div>
      </motion.div>
    </TutorialShell>
  );
}
