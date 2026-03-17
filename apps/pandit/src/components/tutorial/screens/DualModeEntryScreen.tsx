"use client";

import { TutorialScreenProps } from "../types";

export default function DualModeEntryScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col pt-0 max-w-md mx-auto shadow-2xl">
      <nav className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10 w-full max-w-md mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center justify-center p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">प्रशिक्षण मॉड्यूल</span>
            <h2 className="text-lg font-bold leading-tight">भाग {stepIndex}/15</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="flex items-center justify-center p-2 rounded-full hover:bg-primary/10 text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
          <button onClick={onSkip} className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors">
              Skip
          </button>
        </div>
      </nav>

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">कोर्स की प्रगति</p>
          <p className="text-sm font-bold text-primary">{Math.round((stepIndex/15)*100)}% पूर्ण</p>
        </div>
        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
        </div>
      </div>

      <main className="flex-1 flex flex-col p-4 gap-6 max-w-md mx-auto w-full">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Dual-Mode Entry: <br/>Smartphone vs Keypad</h1>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">विभिन्न उपकरणों के लिए पंजीकरण और उपयोग की प्रक्रिया चुनें।</p>
        </header>

        <div className="flex flex-col gap-4">
          <div className="group flex flex-col bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[21/9] relative overflow-hidden bg-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
              <img className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="Smartphone" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq4_ogQvtcwU5WajEyh78YqT0VK-eklIPVVO4p_wBjI2qdMEnnEGuxXWtovz7e92KtWxmhw6Ho_iimhYZgNmbZ5vIfSA295B9r4BliaWT4hp_575kPmyj4QrkHvuERMOLsVTc08ylVIcy0UwxXFNffV-4lum3KfOwvhPeVlaepyD3tyMJVZDOsv4pWeJymUKgwkIee4JiZVQJLyVZZ_NMq6WM3N-2Qnp7jHBnA_F5ylMrctoQdOzdxfkY_XK7KJeYicF61FwWPM-Un"/>
              <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-primary uppercase">
                  Smartphone Mode
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-lg font-bold">Smartphone App UI</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                  स्मार्टफोन वाले पंडित को फुल फंक्शनलिटी मिलेगी। इसमें डैशबोर्ड, रिपोर्ट्स और रीयल-टाइम अपडेट्स शामिल हैं।
              </p>
              <div className="mt-1 flex items-center text-primary font-semibold text-xs gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                  Full Functionality
              </div>
            </div>
          </div>

          <div className="group flex flex-col bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[21/9] relative overflow-hidden bg-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
              <img className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="Keypad Phone" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-0TljRy-W2jhnYEnVdlryE-FyZBuCbYfS_-viwjrf6sU9H-BG-k2KYifG0ekuYbPPbhe7qFdhyGxPGHir7Aqht-XHYtuh2EWmUx4VNlutskX7eMMbjKQo0aWdX8R45jZ2IEASdMQGFhQX0U8KC06pigiyzyD-jQwwFE0X_W3PjbASWk9XGtKHC5-tQdi7NM1gihbhhvSD9Gke7AbCF6jLaLRLTsKVHK6GsOtiRaExXKEzNNDkDa2ZZeM-NckWyBXMP7X0p2csp708"/>
              <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-primary uppercase">
                  IVR Mode
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-lg font-bold">Keypad Phone (IVR)</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                  कीपैड फोन वाले पंडित के लिए IVR कॉल सिस्टम होगा। वॉयस कॉल के माध्यम से डेटा प्रविष्टि संभव है।
              </p>
              <div className="mt-1 flex items-center text-primary font-semibold text-xs gap-1">
                <span className="material-symbols-outlined text-sm">settings_phone</span>
                  Voice Call System
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 items-start pb-8">
          <div className="bg-primary text-white p-2 rounded-lg shrink-0">
            <span className="material-symbols-outlined">record_voice_over</span>
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase mb-1 tracking-wider">वॉयस प्रॉम्प्ट</p>
            <p className="italic text-slate-800 dark:text-slate-200 text-sm">
                "Smartphone wale Pandit ko full functionality milegi. Keypad phone wale Pandit ke liye IVR Call System..."
            </p>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 w-full bg-white dark:bg-slate-900 border-t border-primary/10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mx-auto">
        <div className="flex gap-2 px-4 pb-6 pt-3 max-w-md mx-auto relative">
          <button onClick={onKeyboard}>
            <div className="flex h-8 items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">keyboard</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Keyboard</p>
          </button>
          
          <button onClick={onNext} className="absolute left-1/2 -translate-x-1/2 -top-6 bg-primary text-white size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform border-4 border-white dark:border-slate-900 shrink-0">
            <span className="material-symbols-outlined text-3xl">play_arrow</span>
          </button>
          
          <div className="flex-none flex items-center">
            <div className="w-px h-8 bg-primary/10"></div>
          </div>
          <button onClick={onRepeat}>
            <div className="flex h-8 items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">replay</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Repeat</p>
          </button>
        </div>
      </footer>
    </div>
  );
}
