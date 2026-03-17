"use client";

import { TutorialScreenProps } from "../types";

interface FinalCTAScreenProps extends TutorialScreenProps {
  onRestart: () => void;
}

export default function FinalCTAScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex, onRestart }: FinalCTAScreenProps) {
  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl font-display">
      <div className="flex items-center justify-between p-4 bg-transparent z-10 w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full bg-slate-200/20 dark:bg-primary/20 hover:bg-primary/30 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <button onClick={toggleMute} className="p-2 rounded-full bg-slate-200/20 dark:bg-primary/20 hover:bg-primary/30 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
        </div>
        <button onClick={onSkip} className="text-primary font-bold text-base hover:opacity-80 uppercase tracking-widest">Skip</button>
      </div>

      <div className="flex flex-col gap-2 p-4 pt-0">
        <div className="flex justify-between items-end">
          <p className="text-primary text-base font-medium">भाग 15/15</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">पूर्णता: 100%</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-primary/20">
          <div className="h-full rounded-full bg-primary" style={{ width: '100%' }}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 relative pb-2">
        <div 
          className="rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-8 min-h-[400px] border border-primary/20 shadow-lg"
          style={{
            background: "linear-gradient(rgba(34, 22, 16, 0.6), rgba(34, 22, 16, 0.8)), url('https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1000&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-full">
            <h2 className="text-white text-3xl font-bold leading-tight mb-2">
                क्या आप रजिस्ट्रेशन शुरू करना चाहेंगे?
            </h2>
            <p className="text-white/80 text-sm italic mt-2">
                "हाँ" बोलें या "बाद में" बोलें
            </p>
          </div>
          
          <div className="flex flex-col w-full gap-4 mt-4">
            <button onClick={onSkip} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95">
              <span className="material-symbols-outlined">check_circle</span>
                  हाँ
            </button>
            <button onClick={onRestart} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-4 px-6 rounded-xl text-lg border border-white/30 transition-transform active:scale-95">
                  बाद में
            </button>
          </div>
        </div>
      </div>


      <div className="fixed bottom-0 mt-auto border-t border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 px-4 pb-6 pt-3 flex items-center justify-around w-full max-w-md mx-auto z-20">
        <button onClick={onKeyboard}>
          <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 group-hover:text-primary">keyboard</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Keyboard</span>
        </button>
        
        <div className="relative -top-6">
          <button className="bg-primary p-4 rounded-full text-white shadow-xl shadow-primary/40 ring-4 ring-white dark:ring-background-dark animate-bounce">
            <span className="material-symbols-outlined text-3xl">mic</span>
          </button>
        </div>
        
        <button onClick={onRepeat}>
          <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 group-hover:text-primary">replay</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Repeat</span>
        </button>
      </div>
    </div>
  );
}
