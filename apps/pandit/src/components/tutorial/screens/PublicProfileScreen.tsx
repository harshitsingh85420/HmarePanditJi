"use client";

import { TutorialScreenProps } from "../types";

export default function PublicProfileScreen({ onNext, onBack, onSkip, onKeyboard, onRepeat, isMuted, toggleMute, stepIndex }: TutorialScreenProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-md w-full mx-auto relative shadow-2xl">
      <nav className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold">Public Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleMute} className="p-2 hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">{isMuted ? "volume_off" : "volume_up"}</span>
          </button>
          <button onClick={onSkip} className="text-primary font-bold text-sm tracking-wide uppercase">Skip</button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 bg-white dark:bg-slate-900/40 mt-2 border-y border-primary/5">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Profile Completion</p>
              <p className="text-xl font-extrabold">भाग {stepIndex}/15</p>
            </div>
            <p className="text-sm font-medium text-slate-500">Almost there!</p>
          </div>
          <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(stepIndex / 15) * 100}%` }}></div>
          </div>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="size-32 rounded-full border-4 border-primary p-1 bg-background-light dark:bg-background-dark overflow-hidden mb-4">
              <img alt="Pandit Profile" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLGiCNTZk_c4h-Z877ZXKi2Py4znOX7dGPV49QQLwgmMLeRUjoX77QKAFKtMLVyn2RFH-MH1u8a8hg9BGvO11PfQNWJYaEIIk03df2VQ1SxNmYr5EPD7iIj81WUPidSZReMRci0KR31MJXjqjkYJz66YXKVRhc2IfnscPgXruPtdiB1c3bcMyblljonFRUuIozWPVwPh2i0Zn-PBIeOLt1QVObhkMQAtplueiNuBlr20t4tU8ISfNwoxKg4I3bREmfuDOR1ZUzUD0g"/>
            </div>
            <div className="absolute bottom-6 right-2 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-background-dark">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">Pandit Ramesh Sharma</h2>
          <p className="text-primary font-bold">Acharya | 15+ Years Experience</p>
          
          <div className="mt-4 flex gap-4 w-full max-w-sm">
            <button className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">edit</span>
                  Edit Profile
            </button>
            <button className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-6 bg-white dark:bg-slate-900/40 border-y border-primary/5 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center border-r border-primary/10">
            <div className="flex items-center gap-1">
              <span className="text-4xl font-black">4.9</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">480 Reviews</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {[5, 4, 3].map((star, idx) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] font-bold w-2">{star}</span>
                <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: idx === 0 ? '90%' : idx === 1 ? '6%' : '2%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <section className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-primary/5 shadow-sm">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  Expertise &amp; Verified Poojas
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Ganesh Puja', 'Satyanarayan Katha', 'Vivah Sanskar', 'Griha Pravesh'].map((k) => (
                <span key={k} className="px-4 py-2 bg-background-light dark:bg-slate-800 rounded-full text-sm font-bold border border-primary/10">{k}</span>
              ))}
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-black">+4 More</span>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4">
            <section className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-primary/5 shadow-sm">
              <h3 className="font-black text-slate-500 text-xs uppercase tracking-widest mb-3">Education</h3>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">school</span>
                <div>
                  <p className="font-bold">Acharya in Veda</p>
                  <p className="text-sm text-slate-500">Sampurnanand Sanskrit University</p>
                </div>
              </div>
            </section>
            <section className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-primary/5 shadow-sm">
              <h3 className="font-black text-slate-500 text-xs uppercase tracking-widest mb-3">Languages</h3>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">translate</span>
                <div>
                  <p className="font-bold">Hindi, Sanskrit, English</p>
                  <p className="text-sm text-slate-500">Fluent &amp; Ceremonial</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="px-6 py-4 italic text-center text-slate-500 dark:text-slate-400 text-sm">
            "Aapki shiksha, anubhav, visheshtayein... sab kuch profile par dikhega."
        </div>
      </main>

      <footer className="fixed bottom-0 max-w-md mx-auto w-full bg-white dark:bg-slate-950 border-t border-primary/10 px-6 py-3 flex justify-around items-center z-20">
        <button onClick={onKeyboard}>
          <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors text-primary flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>keyboard</span>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase">Keyboard</span>
        </button>

        <div className="relative -top-6">
          <button onClick={onNext} className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform border-4 border-white dark:border-slate-900">
            <span className="material-symbols-outlined text-3xl">play_arrow</span>
          </button>
        </div>
        
        <button onClick={onRepeat}>
          <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors text-slate-400 group-hover:text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">sync</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-primary">Repeat</span>
        </button>
      </footer>
    </div>
  );
}
