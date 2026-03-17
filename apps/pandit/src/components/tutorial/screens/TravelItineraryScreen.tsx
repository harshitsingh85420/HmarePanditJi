"use client";

import { TutorialScreenProps } from "../types";
import TutorialLayout from "../TutorialLayout";

export default function TravelItineraryScreen(props: TutorialScreenProps) {
  return (
    <TutorialLayout {...props} title="Automated Travel Itinerary">
      <div className="flex flex-col items-center px-6 py-8 text-center space-y-8 h-full justify-center pb-24">
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-6xl">map</span>
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
            Automated Travel Itinerary
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm">
            Booking confirm hote hi, aapki preferences ke hisaab se detailed travel plan ban jayega. GPS based updates customer ko bhi jayenge.
        </p>

        <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-primary/10 flex items-center gap-4 mt-8">
            <div className="bg-primary/10 p-3 rounded-full shrink-0">
                <span className="material-symbols-outlined text-primary">directions_car</span>
            </div>
            <div className="flex-1 text-left">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Optimal Route Generated</h4>
                <p className="text-xs text-slate-500">Saves 15 mins travel time</p>
            </div>
            <span className="material-symbols-outlined text-green-500">check_circle</span>
        </div>
      </div>
    </TutorialLayout>
  );
}
