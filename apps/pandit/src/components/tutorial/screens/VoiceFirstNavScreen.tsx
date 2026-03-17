"use client";

import { TutorialScreenProps } from "../types";

export default function VoiceFirstNavScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased max-w-md mx-auto shadow-2xl">
      <div className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark">
        <button onClick={onBack} className="flex size-12 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <button onClick={toggleMute} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">{isMuted ? "volume_off" : "volume_up"}</span>
            <span>Mute</span>
          </button>
          <button onClick={onSkip} className="flex items-center px-4 py-2 text-primary font-bold text-sm hover:bg-primary/5 rounded-xl">
              Skip
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="flex justify-between items-end">
          <p className="text-slate-900 dark:text-slate-100 text-lg font-semibold">भाग {stepIndex}/15</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Progress: {Math.round((stepIndex/15)*100)}%</p>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center space-y-8">
        <div className="relative">
          <div className="absolute -inset-8 bg-primary/20 rounded-full blur-2xl"></div>
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/40 animate-pulse">
            <span className="material-symbols-outlined text-6xl">mic</span>
          </div>
        </div>
        
        <div className="space-y-4 max-w-md">
          <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-extrabold leading-tight">
              App chale aapki awaaz se.
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              App aapki aawaz se chalta hai... upar button dabakar aap meri awaaz band kar sakte hain.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 border-2 border-primary overflow-hidden flex items-center justify-center">
              <span className="text-2xl">🇮🇳</span>
            </div>
            <span className="text-xs font-bold text-primary">Hindi</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-16 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              <span className="text-2xl">🇺🇸</span>
            </div>
            <span className="text-xs font-bold">English</span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-8 pt-4 w-full sticky bottom-0">
        <div className="flex gap-4 max-w-md mx-auto relative">
          <button onClick={onKeyboard}>
            <span className="material-symbols-outlined text-[28px]">keyboard</span>
            <p className="text-xs font-bold tracking-wide uppercase">Keyboard</p>
          </button>
          
          <button onClick={onNext} className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform border-4 border-white dark:border-slate-900">
            <span className="material-symbols-outlined text-3xl">play_arrow</span>
          </button>
          
          <button onClick={onRepeat}>
            <span className="material-symbols-outlined text-[28px]">replay</span>
            <p className="text-xs font-bold tracking-wide uppercase">Repeat</p>
          </button>
        </div>
      </div>
    </div>
  );
}
