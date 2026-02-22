import React from 'react';
import Link from 'next/link';

export default function MuhuratExplorerCalendar() {
  return (
    <>
      {/* Generated from UI muhurat_explorer_calendar */}
      <main className="flex flex-1 flex-col lg:flex-row p-4 lg:p-8 gap-6">
<aside className="w-full lg:w-72 flex flex-col gap-6">
<div className="flex flex-col gap-2 p-2">
<h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Muhurat Explorer</h1>
<p className="text-slate-500 dark:text-slate-400 text-sm">Find auspicious timings for your sacred events.</p>
</div>
<nav className="flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20" href="/">
<span className="material-symbols-outlined">calendar_month</span>
<span className="font-medium">Calendar</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/">
<span className="material-symbols-outlined">book_online</span>
<span className="font-medium">My Bookings</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/">
<span className="material-symbols-outlined">person_search</span>
<span className="font-medium">Pandit Search</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/">
<span className="material-symbols-outlined">auto_awesome</span>
<span className="font-medium">Spiritual Guide</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="/">
<span className="material-symbols-outlined">settings</span>
<span className="font-medium">Settings</span>
</a>
</nav>
<div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20">
<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Pro Tip</p>
<p className="text-sm text-slate-600 dark:text-slate-300">Golden dates are highly auspicious (Sarvartha Siddhi Yoga).</p>
</div>
</aside>
<section className="flex-1 flex flex-col gap-6">
<div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-4">
<h2 className="text-2xl font-bold font-display">December 2024</h2>
<div className="flex gap-1">
<button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
<div className="flex gap-2 bg-slate-100 dark:bg-white/10 p-1 rounded-lg">
<button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-background-dark shadow-sm">Month</button>
<button className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500">Week</button>
</div>
</div>
<div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden">
<div className="bg-slate-50 dark:bg-background-dark/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Sun</div>
<div className="bg-slate-50 dark:bg-background-dark/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Mon</div>
<div className="bg-slate-50 dark:bg-background-dark/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Tue</div>
<div className="bg-slate-50 dark:bg-background-dark/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Wed</div>
<div className="bg-slate-50 dark:bg-background-dark/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Thu</div>
<div className="bg-slate-50 dark:bg-background-dark/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Fri</div>
<div className="bg-slate-50 dark:bg-background-dark/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Sat</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 text-slate-400">24</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 text-slate-400">25</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 text-slate-400">26</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 text-slate-400">27</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 text-slate-400">28</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 text-slate-400">29</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 text-slate-400">30</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">1</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">2</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">3</span>
<div className="mt-2 flex flex-col gap-1">
<div className="bg-primary/10 text-[10px] px-1.5 py-0.5 rounded text-primary font-medium">4 Pujas</div>
</div>
</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">4</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">5</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">6</span>
<div className="mt-2 flex flex-col gap-1">
<div className="bg-primary/10 text-[10px] px-1.5 py-0.5 rounded text-primary font-medium">2 Pujas</div>
</div>
</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-b border-slate-100 dark:border-white/5">7</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">8</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">9</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">10</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">11</span>
<div className="mt-2 flex flex-col gap-1">
<div className="bg-primary/10 text-[10px] px-1.5 py-0.5 rounded text-primary font-medium">5 Pujas</div>
</div>
</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">12</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">13</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-b border-slate-100 dark:border-white/5">14</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">15</div>
<div className="bg-primary/10 dark:bg-primary/20 min-h-[100px] p-2 border-2 border-primary ring-inset ring-primary shadow-[inset_0_0_20px_rgba(242,158,13,0.1)] transition-all">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-background-dark font-bold">16</span>
<div className="mt-2 flex flex-col gap-1">
<div className="bg-primary/30 text-[10px] px-1.5 py-0.5 rounded text-background-dark dark:text-primary font-bold">8 Pujas Today</div>
</div>
</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">17</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">18</span>
<div className="mt-2 flex flex-col gap-1">
<div className="bg-primary/10 text-[10px] px-1.5 py-0.5 rounded text-primary font-medium">3 Pujas</div>
</div>
</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">19</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-white/5">20</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-b border-slate-100 dark:border-white/5">21</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-slate-100 dark:border-white/5">22</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-slate-100 dark:border-white/5">23</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-slate-100 dark:border-white/5">24</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-slate-100 dark:border-white/5">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">25</span>
<div className="mt-2 flex flex-col gap-1">
<div className="bg-primary/10 text-[10px] px-1.5 py-0.5 rounded text-primary font-medium">6 Pujas</div>
</div>
</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-slate-100 dark:border-white/5">26</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2 border-r border-slate-100 dark:border-white/5">27</div>
<div className="bg-white dark:bg-background-dark min-h-[100px] p-2">28</div>
</div>
</div>
</section>
<aside className="w-full lg:w-96 flex flex-col gap-6">
<div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-6">
<div className="flex items-center justify-between">
<h3 className="text-xl font-bold font-display">Puja List for Dec 16</h3>
<span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-bold uppercase tracking-wider">Auspicious</span>
</div>
<div className="space-y-4">
<div className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-white/5 group">
<div className="flex items-start justify-between gap-4 mb-3">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">favorite</span>
</div>
<div>
<p className="font-bold text-lg">Wedding</p>
<div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
<span className="material-symbols-outlined text-base">schedule</span>
<span>7:00 AM - 12:00 PM</span>
</div>
</div>
</div>
</div>
<button className="w-full py-2.5 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-background-dark transition-all">
                                Search Pandits
                            </button>
</div>
<div className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-white/5 group">
<div className="flex items-start justify-between gap-4 mb-3">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">house</span>
</div>
<div>
<p className="font-bold text-lg">Griha Pravesh</p>
<div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
<span className="material-symbols-outlined text-base">schedule</span>
<span>9:00 AM - 11:00 AM</span>
</div>
</div>
</div>
</div>
<button className="w-full py-2.5 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-background-dark transition-all">
                                Search Pandits
                            </button>
</div>
<div className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-white/5 group">
<div className="flex items-start justify-between gap-4 mb-3">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">child_care</span>
</div>
<div>
<p className="font-bold text-lg">Namkaran Sanskar</p>
<div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
<span className="material-symbols-outlined text-base">schedule</span>
<span>10:30 AM - 1:00 PM</span>
</div>
</div>
</div>
</div>
<button className="w-full py-2.5 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-background-dark transition-all">
                                Search Pandits
                            </button>
</div>
<div className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-white/5 group">
<div className="flex items-start justify-between gap-4 mb-3">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">precision_manufacturing</span>
</div>
<div>
<p className="font-bold text-lg">Vahan Puja</p>
<div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
<span className="material-symbols-outlined text-base">schedule</span>
<span>3:00 PM - 5:00 PM</span>
</div>
</div>
</div>
</div>
<button className="w-full py-2.5 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-background-dark transition-all">
                                Search Pandits
                            </button>
</div>
</div>
<button className="w-full py-4 bg-slate-100 dark:bg-white/10 rounded-xl text-slate-500 font-medium text-sm flex items-center justify-center gap-2">
                        View 4 more pujas <span className="material-symbols-outlined text-sm">expand_more</span>
</button>
</div>
<div className="bg-gradient-to-br from-primary/30 to-primary/5 rounded-2xl p-6 border border-primary/20 relative overflow-hidden group">
<div className="relative z-10">
<h4 className="text-lg font-bold font-display mb-2">Panchang Insights</h4>
<p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Today's Tithi: Shukla Paksha Dashami. Nakshatra: Revati.</p>
<a className="text-sm font-bold text-primary flex items-center gap-1" href="/">Detailed View <span className="material-symbols-outlined text-base">arrow_forward</span></a>
</div>
<span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-primary/10 rotate-12 group-hover:rotate-0 transition-transform duration-500">brightness_high</span>
</div>
</aside>
</main>
    </>
  );
}
