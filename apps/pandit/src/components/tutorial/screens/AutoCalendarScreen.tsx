"use client";

import { TutorialScreenProps } from "../types";

export default function AutoCalendarScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark overflow-hidden font-display text-slate-900 dark:text-slate-100">
      <div className="flex items-center bg-background-light dark:bg-background-dark py-4 px-4 pb-2 justify-between border-b border-slate-200 dark:border-primary/10 sticky top-0 z-10 w-full">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex size-10 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button onClick={toggleMute} className="flex size-10 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Automated Calendar</h2>
        <div className="flex w-12 items-center justify-end">
          <button onClick={onSkip} className="text-primary text-base font-bold leading-normal tracking-wide">Skip</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 bg-white dark:bg-primary/5">
        <div className="flex gap-6 justify-between items-center">
          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Progress</p>
          <p className="text-primary text-sm font-bold">{stepIndex}/15</p>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        <h3 className="tracking-tight text-2xl font-bold leading-tight text-center mb-2">Set Your Blackout Dates</h3>
        <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed text-center mb-8 px-2 text-sm italic">
            "Jab aap available na hon, wo dates set kar sakte hain... Double booking ka khatra khatam."
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-4 mb-6">
          <div className="flex items-center justify-between mb-6 px-2">
            <button className="text-slate-500 hover:text-primary"><span className="material-symbols-outlined">chevron_left</span></button>
            <span className="font-bold text-slate-800 dark:text-slate-100">October 2023</span>
            <button className="text-slate-500 hover:text-primary"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            <div className="aspect-square flex items-center justify-center text-sm text-slate-300">25</div>
            <div className="aspect-square flex items-center justify-center text-sm text-slate-300">26</div>
            <div className="aspect-square flex items-center justify-center text-sm text-slate-300">27</div>
            <div className="aspect-square flex items-center justify-center text-sm text-slate-300">28</div>
            <div className="aspect-square flex items-center justify-center text-sm text-slate-300">29</div>
            <div className="aspect-square flex items-center justify-center text-sm text-slate-300">30</div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">1</div>
            
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">2</div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">3</div>
            
            {/* Blackout Date */}
            <div className="aspect-square flex flex-col items-center justify-center text-sm font-bold bg-primary/10 text-primary border border-primary/30 rounded-lg relative overflow-hidden">
                4
                <span className="material-symbols-outlined text-[12px] absolute top-0.5 right-0.5">close</span>
            </div>
            
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">5</div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">6</div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">7</div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">8</div>
            
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">9</div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">10</div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg">11</div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg border-primary text-primary font-bold">12</div>
            <div className="aspect-square flex flex-col items-center justify-center text-sm font-bold bg-primary/10 text-primary border border-primary/30 rounded-lg relative overflow-hidden">
                13
                <span className="material-symbols-outlined text-[12px] absolute top-0.5 right-0.5">close</span>
            </div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800">
                14
            </div>
            <div className="aspect-square flex items-center justify-center text-sm font-medium border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/50">15</div>
          </div>
          
          <div className="flex gap-4 mt-6 border-t border-slate-100 dark:border-slate-700 pt-4 text-xs font-semibold">
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary/10 border border-primary/30 rounded-sm"></div> <span className="text-slate-600 dark:text-slate-400">Blocked</span></div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm"></div> <span className="text-slate-600 dark:text-slate-400">Booked</span></div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-primary/10 px-6 py-3 flex justify-around items-center">
        <button onClick={onKeyboard}>
          <span className="material-symbols-outlined">keyboard</span>
          <span className="text-xs font-medium uppercase tracking-widest">Keyboard</span>
        </button>
        <button onClick={onNext} className="bg-primary text-white size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform absolute -top-6 border-4 border-white dark:border-slate-900">
          <span className="material-symbols-outlined text-3xl">play_arrow</span>
        </button>
        <button onClick={onRepeat}>
          <span className="material-symbols-outlined">replay</span>
          <span className="text-xs font-medium uppercase tracking-widest">Repeat</span>
        </button>
      </nav>
    </div>
  );
}
