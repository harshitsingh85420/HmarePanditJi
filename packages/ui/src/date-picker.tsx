"use client";

import React, { useState, useRef, useEffect } from "react";

export interface HighlightedDate {
  date: Date;
  color?: string;
  label?: string;
}

export interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  highlightedDates?: HighlightedDate[];
  disabled?: boolean;
  error?: string;
  className?: string;
}

const DAYS = [&quot;Su&quot;, &quot;Mo&quot;, &quot;Tu&quot;, &quot;We&quot;, &quot;Th&quot;, &quot;Fr&quot;, &quot;Sa&quot;];
const MONTHS = [
  &quot;January&quot;, &quot;February&quot;, &quot;March&quot;, &quot;April&quot;, &quot;May&quot;, &quot;June&quot;,
  &quot;July&quot;, &quot;August&quot;, &quot;September&quot;, &quot;October&quot;, &quot;November&quot;, &quot;December&quot;,
];

function formatIndian(date: Date): string {
  const d = String(date.getDate()).padStart(2, &quot;0&quot;);
  const m = String(date.getMonth() + 1).padStart(2, &quot;0&quot;);
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = &quot;DD/MM/YYYY&quot;,
  minDate,
  maxDate,
  highlightedDates = [],
  disabled = false,
  error,
  className = &quot;&quot;,
}: DatePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(value ?? today);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener(&quot;mousedown&quot;, handleOutside);
    return () => document.removeEventListener(&quot;mousedown&quot;, handleOutside);
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setCursor(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCursor(new Date(year, month + 1, 1));
  }

  function pickDay(day: number) {
    const picked = new Date(year, month, day);
    if (minDate && picked < minDate) return;
    if (maxDate && picked > maxDate) return;
    onChange(picked);
    setOpen(false);
  }

  function isDisabledDay(day: number): boolean {
    const d = new Date(year, month, day);
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  }

  const inputId = label?.toLowerCase().replace(/\s+/g, &quot;-&quot;) ?? &quot;date-picker&quot;;

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={inputId}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={[
          &quot;w-full flex items-center gap-2 pl-10 pr-4 py-3 text-left&quot;,
          &quot;bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl&quot;,
          &quot;text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary&quot;,
          &quot;disabled:opacity-50 disabled:cursor-not-allowed&quot;,
          error ? &quot;border-red-400 focus:ring-red-400&quot; : &quot;&quot;,
          value
            ? &quot;text-slate-900 dark:text-slate-100&quot;
            : &quot;text-slate-400&quot;,
        ]
          .filter(Boolean)
          .join(&quot; &quot;)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg pointer-events-none">
          calendar_today
        </span>
        {value ? formatIndian(value) : placeholder}
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div
          className="absolute z-30 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4"
          role="dialog"
          aria-label="Date picker"
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined text-slate-500 text-lg">
                chevron_left
              </span>
            </button>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined text-slate-500 text-lg">
                chevron_right
              </span>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <span
                key={d}
                className="text-center text-[10px] font-bold text-slate-400 uppercase py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isSelected = value ? isSameDay(date, value) : false;
              const isToday = isSameDay(date, today);
              const isOff = isDisabledDay(day);
              const highlight = highlightedDates.find((h) =>
                isSameDay(h.date, date),
              );

              return (
                <button
                  key={day}
                  onClick={() => pickDay(day)}
                  disabled={isOff}
                  className={[
                    &quot;relative flex items-center justify-center h-8 w-full text-sm rounded-lg transition-colors&quot;,
                    isSelected
                      ? &quot;bg-primary text-white font-bold&quot;
                      : isToday
                        ? &quot;border border-primary text-primary font-bold&quot;
                        : &quot;hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300&quot;,
                    isOff ? &quot;opacity-30 cursor-not-allowed&quot; : &quot;&quot;,
                  ]
                    .filter(Boolean)
                    .join(&quot; &quot;)}
                  title={highlight?.label}
                >
                  {day}
                  {highlight && (
                    <span
                      className="absolute bottom-0.5 w-1 h-1 rounded-full"
                      style={{
                        backgroundColor: highlight.color ?? "#f59e0b",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {value && (
            <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
