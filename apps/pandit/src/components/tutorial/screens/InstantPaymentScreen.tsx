"use client";

import { TutorialScreenProps } from "../types";

export default function InstantPaymentScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 max-w-md mx-auto w-full border-b border-primary/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
          </button>
          <button onClick={toggleMute} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
        </div>
        <button onClick={onSkip} className="text-primary font-bold text-base px-2 uppercase shadow-sm">Skip</button>
      </header>

      <main className="flex-1 flex flex-col px-6 py-4 max-w-md mx-auto w-full">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex justify-between items-end">
            <p className="text-slate-900 dark:text-slate-100 text-lg font-semibold">भाग {stepIndex}/15</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{Math.round((stepIndex/15)*100)}% Complete</p>
          </div>
          <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">check_circle</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">₹1500.00 Credited</h1>
          <p className="text-primary font-medium">Instant Payment &amp; Transparent Earnings</p>
        </div>

        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <span className="font-medium">Dakshina</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">₹1,200.00</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">commute</span>
                <span className="font-medium">Travel</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">₹200.00</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <span className="font-medium">Commission</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">₹100.00</span>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="text-lg font-bold">Total Payout</span>
              <span className="text-xl font-extrabold text-primary">₹1,500.00</span>
            </div>
          </div>
        </div>

        <div className="mt-auto py-8">
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex gap-4 items-start">
            <span className="material-symbols-outlined text-primary">record_voice_over</span>
            <p className="text-sm italic text-slate-600 dark:text-slate-400">
                "Jaise hi pooja ya call samapt hoti hai, payment turant aapke bank account mein credit ho jata hai."
            </p>
          </div>
        </div>
      </main>

      <nav className="sticky bottom-0 w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex gap-4">
        <button onClick={onKeyboard}>
          <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-primary">keyboard</span>
          </div>
          <p className="text-xs font-semibold text-primary block">Keyboard</p>
        </button>
        <button onClick={onNext} className="mx-2 bg-primary text-white size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform shrink-0 self-center border-2 border-white dark:border-slate-800">
          <span className="material-symbols-outlined text-3xl">play_arrow</span>
        </button>
        <button onClick={onRepeat}>
          <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">replay</span>
          </div>
          <p className="text-xs font-medium text-slate-500 group-hover:text-primary">Repeat</p>
        </button>
      </nav>
    </div>
  );
}
