"use client";

import { TutorialScreenProps } from "../types";

export default function OnlineStreamsScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
      <header className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-primary/10 max-w-md w-full mx-auto">
        <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
        </button>
        <div className="flex items-center gap-4">
          <button onClick={toggleMute} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
          <button onClick={onSkip} className="text-primary font-bold text-base px-2">Skip</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-6 pb-24">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">भाग {stepIndex}/15</h2>
            <p className="text-primary text-sm font-medium">{stepIndex} of 15 steps</p>
          </div>
          <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-slate-100">Do naye income streams</h1>
        
        <div className="flex flex-col gap-4">
          <div className="group relative flex flex-col sm:flex-row items-stretch gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-md border border-primary/5">
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">Ghar Baithe Pooja</p>
                <p className="text-primary font-semibold text-sm">Potential Income: ₹2000-5000</p>
              </div>
              <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold w-fit">
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                <span>Learn More</span>
              </button>
            </div>
            <div className="w-full sm:w-32 aspect-video sm:aspect-square bg-center bg-no-repeat bg-cover rounded-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD2HSSd1ZWrAvy-boLPo6KqU8Dz3VzRXCoe-hLOXFO2wXNQixd2Tbr5aQ4REDqshDTmkqvx1qsXsIqpn5O0SOcYPbhHuCLurDAgcKB-r8tPAPtmQ-ZLbzoBNi02N_9B7gt6b0DEgyOEtPOLZjfpsSpbWw96J8uKweXM_dVwHQVgyCxgPHjJTjZcSiqlIUuRww14kxA_nuOXeXOYbHkh3G9v1xhrGHPb686g-HXtV1lKQp51LjHI5qFfzyQu-7vd9a6FVm8flPJ3svq6")' }}>
            </div>
          </div>

          <div className="group relative flex flex-col sm:flex-row items-stretch gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-md border border-primary/5">
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">Pandit Se Baat</p>
                <p className="text-primary font-semibold text-sm">Potential Income: ₹20-50/min</p>
              </div>
              <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold w-fit">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                <span>Consult Now</span>
              </button>
            </div>
            <div className="w-full sm:w-32 aspect-video sm:aspect-square bg-center bg-no-repeat bg-cover rounded-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCyej6OYTSemdQ7p0AU5gKxqnis6XDPAoOHyaeACKhgVPaDHDy56V3Fi90v3ZAzNFtKi_J2arI54fGJJhSdY-Mje0FLY8u5VpyJCOdzXkn4ZVPpiEBaN1D_bM5pm_vw4wx6j4qJGUcNQZHbORxvmX7TnsEUQKItrS8VopbO25FZsJU4VK2tw28xV5bZyRPzkcfN9tYotwJzoCeX3IM0HwAUcv4e6A-defmOvgNeqhQeuAiSPUiN_BUxJie4d7gtpJgeNzu2pvWXQOIu")' }}>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-primary/10 px-6 py-3 flex justify-around items-center">
        <button onClick={onKeyboard}>
          <span className="material-symbols-outlined">keyboard</span>
          <span className="text-xs font-medium">Keyboard</span>
        </button>
        <button onClick={onNext} className="bg-primary text-white size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform absolute -top-6">
          <span className="material-symbols-outlined text-3xl">play_arrow</span>
        </button>
        <button onClick={onRepeat}>
          <span className="material-symbols-outlined">history</span>
          <span className="text-xs font-medium">Repeat</span>
        </button>
      </nav>
    </div>
  );
}
