"use client";

import { TutorialScreenProps } from "../types";
import TutorialLayout from "../TutorialLayout";

export default function SummaryScreen(props: TutorialScreenProps) {
  const guarantees = [
    { icon: "diversity_3",   title: "सम्मान",   desc: "Honoring traditions... verified badge, high ratings, zero negotiation." },
    { icon: "task_alt",      title: "सुविधा",   desc: "Hassle‑free service... voice-first nav, IVR, auto-itinerary." },
    { icon: "verified_user", title: "सुरक्षा",  desc: "Secure bookings... fixed income, instant payment, fair penalty." },
    { icon: "auto_awesome",  title: "समृद्धि",  desc: "Spiritual growth... offline + online, multiple income streams." },
  ];

  return (
    <TutorialLayout {...props} title="4 Guarantees">
      <div className="flex flex-col items-center px-6 py-6 h-full pb-24 space-y-6">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100 text-center">
            HmarePanditJi<br/>4 Guarantees
        </h1>
        
        <div className="grid grid-cols-2 gap-4 w-full">
            {guarantees.map((g, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-primary shadow-sm flex flex-col items-start text-left gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">{g.icon}</span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{g.title}</h3>
                    <p className="text-[10px] text-slate-500">{g.desc}</p>
                </div>
            ))}
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-center italic text-sm px-4 mt-4">
            "Ab aapko yad dilate hain HmarePanditJi ke 4 guarantees..."
        </p>
      </div>
    </TutorialLayout>
  );
}
