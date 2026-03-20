'use client';
import React from 'react';
import { motion } from 'framer-motion';
import TutorialShell from './TutorialShell';

interface Props { currentDot: number; onNext: () => void; onBack: () => void; onSkip: () => void; language?: string; onLanguageChange?: () => void; }

export default function TutorialVideoVerify({ currentDot, onNext, onBack, onSkip }: Props) {
  return (
    <TutorialShell currentDot={currentDot} onNext={onNext} onBack={onBack} onSkip={onSkip} nextLabel="आगे देखें → (लगभग हो गया!)">
      {/* Headline */}
      <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mb-6">
        <h1 className="text-[26px] font-bold leading-tight text-vedic-brown">
          ✅ Verified का मतलब<br/>
          <span className="text-primary">ज़्यादा Bookings</span>
        </h1>
      </motion.section>

      {/* Profile Preview Card */}
      <motion.section initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
        className="mb-6 animate-gentle-float">
        <div className="bg-white rounded-3xl p-5 border border-primary-lt shadow-card relative" style={{boxShadow:'0 10px 25px -5px rgba(240,153,66,0.15)'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-lt overflow-hidden border-2 border-primary shrink-0">
              <img alt="Pandit Profile" className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSbpbUlg0rliNCgrMKEO5xxY_mdVdGE5Al4Fl4K8RPXGutDABuxvX_m9lNVde4NflE3DwZdvcuQcFmCfVHt_oUTTQJ3VGaHKQ60pC7HTkLmE3J5y0gFujqpm96WJatiYFMPqrdG7GXgBzcfNA80E47xYIwHbZKJQpYyFqg1Og-lS2_2KePSiKJwhWqM5BEq2aGjwX9gMPwnozIK3VyuBb8O6V87p2TcS0un1mNXLR75hZ2Zl2P-SqIohT_NGlr89DgoJjG1ncJcuQF" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-vedic-brown">पंडित राज शर्मा</h2>
                <span className="bg-success text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  ✓ VERIFIED
                </span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <span className="text-sm font-bold">4.9</span>
                <span className="text-primary">⭐</span>
                <span className="text-vedic-gold text-xs ml-1">(245 रीव्यू)</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-vedic-gold uppercase tracking-wider">Verified पूजाएं:</p>
            <div className="flex flex-wrap gap-2">
              {['🕉️ सत्यनारायण कथा', '🏠 गृह प्रवेश', '🔥 महामृत्युंजय जाप'].map(p => (
                <span key={p} className="bg-primary-lt text-primary px-3 py-1.5 rounded-lg text-xs font-bold border border-primary-lt flex items-center gap-1">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Banner */}
      <motion.section initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.3}}>
        <div className="bg-primary rounded-2xl p-6 text-white flex items-center gap-6 shadow-cta">
          <div className="text-5xl font-black">3x</div>
          <div className="text-lg font-bold leading-tight">
            ज़्यादा Bookings <br/> मिलती हैं
          </div>
        </div>
      </motion.section>
    </TutorialShell>
  );
}
