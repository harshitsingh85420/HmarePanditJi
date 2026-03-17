"use client";

import { TutorialScreenProps } from "../types";
import TutorialLayout from "../TutorialLayout";

export default function TrustAndIdentityScreen(props: TutorialScreenProps) {
  return (
    <TutorialLayout {...props} title="Trust & Identity">
      <div className="flex flex-col items-center px-6 py-8 text-center space-y-8 h-full justify-center pb-24">
        <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative drop-shadow-xl animate-pulse">
            <span className="material-symbols-outlined text-primary text-7xl">shield_person</span>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full border-4 border-background-light dark:border-background-dark">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
        </div>
        
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
            विश्वास और पहचान
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm text-lg">
            Ab baat karte hain vishwas aur aapki pehchan ki. Platform aapki visheshata ko kaise ujagar karta hai.
        </p>
      </div>
    </TutorialLayout>
  );
}
