"use client";

import { TutorialScreenProps } from "../types";

export default function FixedDakshinaScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col pt-0">
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 w-full max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
        </button>
        <div className="flex gap-4">
          <button onClick={toggleMute} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
          <button onClick={onSkip} className="flex items-center px-4 py-1 rounded-full border border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all">
              SKIP
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
        <div className="mt-4 mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-primary font-bold text-lg">भाग {stepIndex}</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stepIndex} / 15</span>
          </div>
          <div className="w-full h-2 bg-primary/10 dark:bg-primary/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>sell</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              Fixed Dakshina &amp; <br/>Zero Negotiation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
              हर पूजा के लिए पंडित अपनी फिक्स्ड दक्षिणा खुद सेट करते हैं।
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <div className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="relative w-full aspect-square rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 overflow-hidden">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl">payments</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-red-500/80 -rotate-45 rounded-full"></div>
              </div>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Crossed Negotiation</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">No more haggling</p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10">
            <div className="relative w-full aspect-square rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center mb-4 overflow-hidden">
              <span className="material-symbols-outlined text-primary text-6xl">verified</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tick Fixed Price</h3>
            <p className="text-[10px] text-primary/80 dark:text-primary mt-1 uppercase tracking-wider font-semibold">Transparent pricing</p>
          </div>
        </div>

        <div className="mt-auto py-8">
          <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex gap-4 items-center">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                No hidden costs. The amount you see is exactly what the Pandit receives.
            </p>
          </div>
        </div>
      </main>

      <nav className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 pb-8 pt-4 w-full max-w-md mx-auto sticky bottom-0">
        <div className="flex justify-around items-center relative">
          <button onClick={onRepeat} className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary">replay</span>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary">Repeat</span>
          </button>
          
          <button onClick={onNext} className="absolute -top-10 bg-primary text-white size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform border-4 border-white dark:border-slate-900 shrink-0">
            <span className="material-symbols-outlined text-3xl">play_arrow</span>
          </button>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          
          <button onClick={onKeyboard} className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary">keyboard</span>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-primary">Keyboard</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
