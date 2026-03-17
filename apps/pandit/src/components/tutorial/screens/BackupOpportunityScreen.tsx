"use client";

import { TutorialScreenProps } from "../types";

export default function BackupOpportunityScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased max-w-md mx-auto shadow-2xl">
      <div className="flex items-center p-4 justify-between border-b border-primary/10 sticky top-0 bg-background-light dark:bg-background-dark z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
          </button>
          <button onClick={toggleMute} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Backup Pandit</h2>
        <div className="flex w-20 items-center justify-end">
          <button onClick={onSkip} className="text-primary text-base font-bold leading-normal tracking-wide hover:opacity-80">Skip</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 mt-2">
        <div className="flex justify-between items-end">
          <p className="text-slate-900 dark:text-slate-100 text-base font-semibold">भाग {stepIndex}/15</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Progress: {Math.round((stepIndex/15)*100)}%</p>
        </div>
        <div className="rounded-full bg-primary/20 h-2.5 w-full overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-24">
        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 w-full max-w-md border border-primary/10">
          <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-bold leading-snug text-center mb-4">
              Jab bhi koi booking hoti hai...
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-center text-sm mb-8 italic">
              "Jab bhi koi booking hoti hai jisme customer ne backup protection liya hai..."
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3 group">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-primary/5 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <img className="w-full h-full object-cover" alt="Priests" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjGHBNMqnMVgrr-K9-BQp3TbQYnFLFxW9mgGauHYviqYHu6hGDB98TYGb1TBSoqx59J5m7CSljAZdTd1Ti8PdclK7jwqmSOo87QMjUOUWJ54ni_GvAU3gUNHG0Hb9cQdoftcuOPPHgCyxzMUB5clFtuN1H3fh28kvLeumfcJt6xOn3n2ZzUdK6pr6dxwC16Bd696ZYfQn5-Lbg3J6RWwBxmVXQ3srZwSQ3nYCHFG-lKsgnzY-a7XseOb6THuXf3Ie7x1vnR9Mw7YqZ"/>
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">Main Performs</p>
                <p className="text-primary text-xs font-semibold mt-1">Backup gets ₹2000</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 group">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-primary/5 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <img className="w-full h-full object-cover" alt="Backup Priest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD_XVyiFwWT4_PbsJKsOHZSc264Z_Xk9t5a8iQDEQFAp3BtrRFboLLng67HfWq4gcPANTJyR-UmGtw1C0ZnSnH-p77pO1_n-GXHIkzfQGHercNe0InxvcTzhVLd7KZGEiaQ1EANdmsZpuaFmZc8F-dTB4HFsWY3ovI1yBweowv7gtwZk1nAj3BN2SwJhqyIyXBTpmKfZxpcUF3ibvola1lWXpltMjOmYOtcg4xcLXVpC6TqAny58_Li5u7cUnwN1LrIbv01CVg59-c"/>
                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                  <span className="material-symbols-outlined text-sm">emergency_home</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">Main Cancels</p>
                <p className="text-primary text-xs font-semibold mt-1">Full + Bonus</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 w-full flex gap-2 border-t border-primary/10 bg-white dark:bg-slate-900 px-6 pb-6 pt-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <button onClick={onRepeat} className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all hover:bg-primary/5">
          <div className="text-slate-700 dark:text-slate-300 flex h-8 items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">replay</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Repeat</p>
        </button>
        
        <button onClick={onNext} className="bg-primary text-white size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform absolute left-1/2 -translate-x-1/2 -top-6 border-4 border-white dark:border-slate-900">
          <span className="material-symbols-outlined text-3xl">play_arrow</span>
        </button>

        <div className="flex items-center">
          <div className="h-8 w-px bg-primary/10"></div>
        </div>
        
        <button onClick={onKeyboard} className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all hover:bg-primary/5">
          <div className="text-primary flex h-8 items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">keyboard</span>
          </div>
          <p className="text-primary text-xs font-semibold uppercase tracking-wider">Keyboard</p>
        </button>
      </div>
    </div>
  );
}
