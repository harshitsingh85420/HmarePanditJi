"use client";

import { TutorialScreenProps } from "../types";

export default function VideoVerificationScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col pt-0 max-w-md mx-auto shadow-2xl relative">
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 justify-between border-b border-primary/10 sticky top-0 z-10 w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button onClick={toggleMute} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Video Verification</h2>
        <div className="flex w-12 items-center justify-end">
          <button onClick={onSkip} className="text-primary text-base font-bold leading-normal tracking-wide">Skip</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full pb-24">
        <div className="flex flex-col gap-3 p-6 bg-primary/5">
          <div className="flex gap-6 justify-between items-end">
            <div>
              <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">Verification Progress</p>
              <p className="text-primary text-sm font-semibold leading-normal">भाग {stepIndex}/15</p>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{Math.round((stepIndex/15)*100)}% Complete</p>
          </div>
          <div className="rounded-full bg-primary/20 h-3 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
          </div>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="mb-6 relative inline-block">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-5xl">videocam</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-background-light dark:border-background-dark rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">check</span>
            </div>
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-bold leading-tight mb-2">Pooja-Specific Verification</h3>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
              Har us pooja ke liye aapka video verify hota hai jo aap karte hain.
          </p>
        </div>

        <div className="px-6 pb-10 space-y-4">
          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-primary/10 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">temple_hindu</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Vivah Pooja</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Wedding Ceremony</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-sm">verified</span> Verified
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-primary/10 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">home</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Griha Pravesh</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">House Warming</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-sm">verified</span> Verified
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-between shadow-sm opacity-80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-500 dark:text-slate-400">Satyanarayan Pooja</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Upcoming Verification</p>
              </div>
            </div>
            <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm shadow-primary/20">
                START
            </button>
          </div>
        </div>
      </main>

      <nav className="fixed w-full max-w-md mx-auto bottom-0 border-t border-primary/10 bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <button onClick={onKeyboard}>
          <span className="material-symbols-outlined text-2xl">keyboard</span>
          <p className="text-xs font-medium leading-normal tracking-wide uppercase">Keyboard</p>
        </button>
        <div className="relative -top-6">
          <button onClick={onNext} className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform border-4 border-white dark:border-slate-900">
            <span className="material-symbols-outlined text-3xl">play_arrow</span>
          </button>
        </div>
        <button onClick={onRepeat}>
          <span className="material-symbols-outlined text-2xl">replay</span>
          <p className="text-xs font-medium leading-normal tracking-wide uppercase">Repeat</p>
        </button>
      </nav>
    </div>
  );
}
