"use client";

import { TutorialScreenProps } from "../types";

export default function EaseOfUseScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased max-w-md mx-auto w-full">
      <header className="flex items-center justify-between px-4 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 border-b border-primary/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
          </button>
          <button onClick={toggleMute} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
        </div>
        <div className="flex items-center">
          <button onClick={onSkip} className="text-primary font-bold text-sm uppercase tracking-wider px-3 py-1 hover:bg-primary/10 rounded-lg">Skip</button>
        </div>
      </header>

      <div className="flex flex-col gap-2 p-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">प्रगति (Progress)</span>
          <span className="text-primary font-bold text-sm">भाग {stepIndex}/15</span>
        </div>
        <div className="w-full h-2.5 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm aspect-square relative mb-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/5 animate-pulse"></div>
          <div className="absolute inset-8 rounded-full border-2 border-primary/10"></div>
          <div className="absolute inset-16 rounded-full border-2 border-primary/20"></div>
          
          <div className="relative z-0 grid grid-cols-2 gap-6 p-8">
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-primary/5 transform -rotate-6">
              <span className="material-symbols-outlined text-primary text-4xl mb-2">calendar_month</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Calendar</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-primary/5 transform rotate-12 translate-y-4">
              <span className="material-symbols-outlined text-primary text-4xl mb-2">commute</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Travel</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-6 bg-primary text-white rounded-3xl shadow-2xl shadow-primary/20 col-span-2 transform -translate-y-2">
              <span className="material-symbols-outlined text-white text-5xl mb-1">mic</span>
              <span className="text-xs font-medium">Voice Assistant</span>
            </div>
          </div>
        </div>

        <div className="text-center max-w-xs mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              रोज़मर्रा के काम में सुविधा
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              अब बात करते हैं आपकी रोज़मर्रा की सुविधा की।
          </p>
        </div>
      </main>

      <div className="h-24"></div>

      <footer className="fixed bottom-0 w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-stretch h-20 px-4">
          <button onClick={onRepeat} className="flex-1 flex flex-col items-center justify-center gap-1 group">
            <div className="flex items-center justify-center h-10 w-16 rounded-full group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">replay</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 group-hover:text-primary uppercase tracking-tighter">Repeat</span>
          </button>
          
          <button onClick={onNext} className="flex-1 flex items-center justify-center group active:scale-95 transition-transform">
            <div className="size-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 text-white border-2 border-white dark:border-slate-800">
              <span className="material-symbols-outlined text-3xl">play_arrow</span>
            </div>
          </button>
          
          <button onClick={onKeyboard} className="flex-1 flex flex-col items-center justify-center gap-1 group">
            <div className="flex items-center justify-center h-10 w-16 rounded-full group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">keyboard</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 group-hover:text-primary uppercase tracking-tighter">Keyboard</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
