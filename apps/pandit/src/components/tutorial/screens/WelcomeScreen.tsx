"use client";

import { TutorialScreenProps } from "../types";

export default function WelcomeScreen({ onNext, onSkip, onKeyboard, onRepeat, isMuted, toggleMute }: TutorialScreenProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 shrink-0">
        <div className="flex items-center gap-3">
          <button className="text-slate-300 cursor-not-allowed p-2" disabled>
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <button onClick={toggleMute} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined text-2xl">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
        </div>
        <h1 className="text-base font-bold text-primary tracking-tight">HmarePanditJi</h1>
        <button onClick={onSkip} className="text-primary font-bold text-sm uppercase tracking-wider hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors">
          स्किप
        </button>
      </header>

      {/* Main Content — flex-1 so it fills remaining space */}
      <main className="flex-1 flex flex-col items-center justify-between px-6 py-4 max-w-md mx-auto w-full overflow-hidden">

        {/* Logo illustration */}
        <div className="w-full max-w-[200px] aspect-square relative mt-2 shrink-0">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-40"></div>
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl border-4 border-primary/20 bg-primary/5 flex items-center justify-center">
            <img
              className="w-4/5 h-4/5 object-contain"
              alt="Digital illustration of a traditional Indian priest symbol"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFiO-OpV7CYx-UoRvdlBmYHcZG4tEB1pz4C87vUg58yAUfRo-adVVgrvmtMjLRhQaz4QD4N9s342qS9CktERCd5XwS8xJItnaq6HbUhczQU2RwTW6_7HW76a91jwvVE_rXLaNcP8lKckzYjRZJGrdsfBcAVjXZ7zbzLAp-rSSSGRDWI2qs_UXYam1kqDvqjzYshFZM2_zMPIAskYN-Gep-Y48M26R9e85PYXD6yVzA6g4omkCWQ2TkyHguR_ChKGOMjmEChv7WDilM"
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center mt-3 px-2">
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">HmarePanditJi Tutorial</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Namaste Pandit Ji. HmarePanditJi par aapka bahut‑bahut swagat hai. Janein bolkar humare saath bane rahein.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full mt-3 mb-2">
          <button
            onClick={onNext}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-8 rounded-xl text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined">school</span>
            जानें (Learn)
          </button>
          <button
            onClick={onSkip}
            className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3.5 px-8 rounded-xl text-base transition-colors"
          >
            स्किप करें (Skip)
          </button>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="shrink-0 border-t border-primary/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex justify-around items-center px-4 py-3 max-w-md mx-auto h-[72px]">
          <button onClick={onKeyboard} className="flex flex-col items-center justify-center gap-1 group flex-1">
            <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary text-[22px]">keyboard</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-primary">Keyboard</p>
          </button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <button onClick={onRepeat} className="flex flex-col items-center justify-center gap-1 group flex-1">
            <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary text-[22px]">replay</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-primary">Repeat</p>
          </button>
        </div>
      </footer>
    </div>
  );
}
