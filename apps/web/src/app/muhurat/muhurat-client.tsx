"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, parseISO, isValid } from "date-fns";

export default function MuhuratClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse date from URL or default to today
  const urlDate = searchParams.get("date");
  const initialDate = urlDate && isValid(parseISO(urlDate)) ? parseISO(urlDate) : new Date();

  // State for the currently viewed month (calendar view)
  const [currentDate, setCurrentDate] = useState(initialDate);

  // Selected date highlights
  const selectedDate = initialDate;

  const handleDateSelect = (day: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(day, "yyyy-MM-dd"));
    router.push(`/muhurat?${params.toString()}`);
    // setCurrentDate(day); // Keep calendar on current month view
  };

  // Mock data generation for calendar
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });

  // Add padding days for start of month
  const startDay = getDay(currentMonthStart);
  const paddingDays = Array(startDay).fill(null);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Mock function to determine if a day has pujas (for visual similarity)
  const getPujaCount = (day: Date) => {
    const dayNum = day.getDate();
    // Randomly assign puja counts to match the design aesthetics roughly
    if ([3, 6, 11, 16, 18, 25].includes(dayNum)) return Math.floor(Math.random() * 5) + 3;
    return 0;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1440px] mx-auto p-4 lg:p-8 min-h-screen">
      {/* ── Left Sidebar ── */}
      <aside className="w-full lg:w-72 flex flex-col gap-6">
        <div className="flex flex-col gap-2 p-2">
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Muhurat Explorer</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Find auspicious timings for your sacred events.</p>
        </div>

        <nav className="flex flex-col gap-1">
          <Link href="/muhurat" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f29e0d]/10 text-[#f29e0d] border border-[#f29e0d]/20">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-medium">Calendar</span>
          </Link>
          <Link href="/dashboard/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">book_online</span>
            <span className="font-medium">My Bookings</span>
          </Link>
          <Link href="/search" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">person_search</span>
            <span className="font-medium">Pandit Search</span>
          </Link>
          <Link href="/astrology" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="font-medium">Spiritual Guide</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#f29e0d]/20 to-transparent border border-[#f29e0d]/20">
          <p className="text-xs font-bold text-[#f29e0d] uppercase tracking-widest mb-2">Pro Tip</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Golden dates are highly auspicious (Sarvartha Siddhi Yoga).</p>
        </div>
      </aside>

      {/* ── Main Calendar Section ── */}
      <section className="flex-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-[#1a140d] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentDate(addDays(currentDate, -30))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => setCurrentDate(addDays(currentDate, 30))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="flex gap-2 bg-slate-100 dark:bg-white/10 p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-[#221b10] shadow-sm text-slate-900 dark:text-white">Month</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Week</button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden gap-px border border-slate-200 dark:border-white/10">
            {weekDays.map(day => (
              <div key={day} className="bg-slate-50 dark:bg-[#221b10]/50 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                {day}
              </div>
            ))}

            {/* Pagination Padding */}
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} className="bg-white dark:bg-[#221b10] min-h-[100px] p-2 text-slate-400"></div>
            ))}

            {/* Days */}
            {calendarDays.map((day) => {
              const dayNum = day.getDate();
              const isSelected = isSameDay(day, selectedDate);
              const pujaCount = getPujaCount(day);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[100px] p-2 transition-all cursor-pointer relative group
                    ${isSelected
                      ? "bg-[#f29e0d]/10 dark:bg-[#f29e0d]/20 ring-inset ring-2 ring-[#f29e0d] z-10 shadow-[inset_0_0_20px_rgba(242,158,13,0.1)]"
                      : "bg-white dark:bg-[#221b10] hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  onClick={() => handleDateSelect(day)}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                    ${isSelected
                      ? "bg-[#f29e0d] text-[#221b10]"
                      : pujaCount > 0
                        ? "bg-[#f29e0d]/20 text-[#f29e0d]"
                        : "text-slate-700 dark:text-slate-300"
                    }`}>
                    {dayNum}
                  </span>

                  {pujaCount > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold w-fit
                        ${isSelected
                          ? "bg-[#f29e0d]/30 text-[#221b10] dark:text-[#f29e0d]"
                          : "bg-[#f29e0d]/10 text-[#f29e0d]"
                        }`}>
                        {pujaCount} Pujas{isSelected && " Today"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Right Sidebar: Puja List ── */}
      <aside className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-white dark:bg-[#1a140d] rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Puja List for {format(selectedDate, "MMM d")}
            </h3>
            <span className="text-xs bg-[#f29e0d]/20 text-[#f29e0d] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Auspicious</span>
          </div>

          <div className="space-y-4">
            {[
              { title: "Wedding", time: "7:00 AM - 12:00 PM", icon: "favorite" },
              { title: "Griha Pravesh", time: "9:00 AM - 11:00 AM", icon: "house" },
              { title: "Namkaran Sanskar", time: "10:30 AM - 1:00 PM", icon: "child_care" },
              { title: "Vahan Puja", time: "3:00 PM - 5:00 PM", icon: "precision_manufacturing" },
            ].map((puja, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-[#f29e0d]/50 transition-colors bg-slate-50/50 dark:bg-white/5 group">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#f29e0d]/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#f29e0d]">{puja.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900 dark:text-white">{puja.title}</p>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        <span>{puja.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-lg border border-[#f29e0d] text-[#f29e0d] font-bold text-sm hover:bg-[#f29e0d] hover:text-[#221b10] transition-all">
                  Search Pandits
                </button>
              </div>
            ))}
            <button className="w-full py-4 bg-slate-100 dark:bg-white/10 rounded-xl text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
              View 4 more pujas <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#f29e0d]/30 to-[#f29e0d]/5 rounded-2xl p-6 border border-[#f29e0d]/20 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-lg font-bold font-serif mb-2 text-slate-900 dark:text-white">Panchang Insights</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">Today's Tithi: Shukla Paksha Dashami. Nakshatra: Revati.</p>
            <a className="text-sm font-bold text-[#f29e0d] flex items-center gap-1 hover:gap-2 transition-all" href="#">Detailed View <span className="material-symbols-outlined text-base">arrow_forward</span></a>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-[#f29e0d]/10 rotate-12 group-hover:rotate-0 transition-transform duration-500 select-none">brightness_high</span>
        </div>
      </aside>
    </div>
  );
}
