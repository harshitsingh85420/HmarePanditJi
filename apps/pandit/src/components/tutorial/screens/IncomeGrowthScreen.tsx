"use client";

import { TutorialScreenProps } from "../types";

export default function IncomeGrowthScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <header className="w-full border-b border-primary/10 bg-background-light dark:bg-background-dark sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full">
          <button onClick={onBack} className="flex items-center justify-center p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={toggleMute} className="flex flex-col items-center gap-1 group">
              <div className="rounded-full bg-primary/10 p-2 group-active:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary">{isMuted ? "volume_off" : "volume_up"}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mute</span>
            </button>
            <button onClick={onSkip} className="flex items-center justify-center px-4 py-1.5 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary/5">
                Skip
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <p className="text-primary font-bold text-sm tracking-tight">Progress</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest">भाग {stepIndex} / 15</p>
            </div>
            <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[6.66%]" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-6 py-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150"></div>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-full shadow-xl border border-primary/5">
                <span className="material-symbols-outlined text-primary text-[80px] leading-none">payments</span>
              </div>
              <div className="absolute -top-2 -right-2 bg-primary text-white p-3 rounded-full shadow-lg">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  आमदनी में वृद्धि
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Income Growth
              </p>
            </div>
            
            <div className="mt-4 px-6 py-4 bg-primary/5 border border-primary/10 rounded-xl max-w-xs italic text-slate-700 dark:text-slate-300">
                "सबसे पहले बात करते हैं आपकी आमदनी की..."
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-primary/10 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary opacity-60">savings</span>
              <span className="text-xs font-semibold text-slate-500">बचत</span>
            </div>
            <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-primary/10 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary opacity-60">account_balance_wallet</span>
              <span className="text-xs font-semibold text-slate-500">आय</span>
            </div>
          </div>
        </div>
      </main>

      <nav className="w-full bg-white dark:bg-slate-900 border-t border-primary/10 pb-6 pt-3 px-4 sticky bottom-0">
        <div className="flex gap-4 max-w-md mx-auto w-full">
          <button onClick={onRepeat} className="flex flex-1 flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-primary hover:bg-primary/5">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>replay</span>
            <p className="text-[11px] font-bold uppercase tracking-wider">Repeat</p>
          </button>
          <button onClick={onKeyboard} className="flex flex-1 flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-slate-500 hover:bg-primary/5">
            <span className="material-symbols-outlined text-2xl">keyboard</span>
            <p className="text-[11px] font-bold uppercase tracking-wider">Keyboard</p>
          </button>
          <button onClick={onNext} className="flex-[1.5] bg-primary text-white flex items-center justify-center gap-2 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90">
              अगला <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
