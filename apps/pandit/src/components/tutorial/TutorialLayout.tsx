"use client";

import { ReactNode } from "react";
import { TutorialScreenProps } from "./types";

interface LayoutProps extends TutorialScreenProps {
  children: ReactNode;
  headerType?: "default" | "transparent" | "none";
  title?: string;
  hideBack?: boolean;
}

export default function TutorialLayout({
  children,
  onNext,
  onBack,
  onSkip,
  onKeyboard,
  onRepeat,
  isMuted,
  toggleMute,
  stepIndex,
  totalSteps,
  headerType = "default",
  title,
  hideBack = false,
}: LayoutProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col relative w-full h-screen overflow-x-hidden max-w-md mx-auto shadow-2xl">
      {headerType !== "none" && (
        <header className={`flex items-center justify-between p-4 ${headerType === "default" ? "bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 border-b border-primary/10" : "bg-transparent z-10"}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              disabled={hideBack || stepIndex === 0}
              className={`flex items-center justify-center p-2 rounded-full transition-colors ${hideBack || stepIndex === 0 ? "text-slate-300 cursor-not-allowed" : "text-primary hover:bg-primary/10"}`}
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <button onClick={toggleMute} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined text-2xl">{isMuted ? "volume_off" : "volume_up"}</span>
            </button>
          </div>
          {title && <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex-1 text-center">{title}</h2>}
          <div className="flex items-center justify-end">
            <button onClick={onSkip} className="text-primary font-bold text-sm tracking-wide uppercase hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors">
              Skip
            </button>
          </div>
        </header>
      )}

      {/* Progress Bar */}
      {stepIndex > 0 && headerType !== "none" && (
        <div className="flex flex-col gap-2 px-6 py-4">
          <div className="flex justify-between items-end">
            <p className="text-primary text-sm font-semibold">भाग {stepIndex}/{totalSteps}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest">Progress: {Math.round((stepIndex / totalSteps) * 100)}%</p>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(stepIndex / totalSteps) * 100}%` }}></div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col w-full overflow-y-auto overflow-x-hidden pb-20">
        {children}
      </main>

      {/* Footer — always at bottom */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-6 pt-3 z-20 sticky bottom-0">
        <div className="flex items-center justify-around max-w-md mx-auto relative h-14">
          {/* Keyboard */}
          <button
            onClick={onKeyboard}
            className="flex flex-col items-center justify-center gap-1 px-4 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-[26px] group-hover:text-primary">keyboard</span>
            <p className="text-[10px] font-bold tracking-widest uppercase">Keyboard</p>
          </button>

          {/* Central play button (for all mid-flow screens) */}
          {stepIndex > 0 && stepIndex < totalSteps && (
            <button
              onClick={onNext}
              className="absolute left-1/2 -translate-x-1/2 -top-7 bg-primary text-white size-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform border-4 border-white dark:border-slate-900 z-10"
            >
              <span className="material-symbols-outlined text-3xl">play_arrow</span>
            </button>
          )}

          {/* Repeat */}
          <button
            onClick={onRepeat}
            className="flex flex-col items-center justify-center gap-1 px-4 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-[26px] group-hover:text-primary">replay</span>
            <p className="text-[10px] font-bold tracking-widest uppercase">Repeat</p>
          </button>
        </div>
      </footer>
    </div>
  );
}
