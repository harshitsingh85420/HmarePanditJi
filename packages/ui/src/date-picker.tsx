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

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatIndian(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
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
  placeholder = "DD/MM/YYYY",
  minDate,
  maxDate,
  highlightedDates = [],
  disabled = false,
  error,
  className = "",
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
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
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

  const inputId = label?.toLowerCase().replace(/\s+/g, "-") ?? "date-picker";

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
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
          "flex w-full items-center gap-2 py-3 pl-10 pr-4 text-left",
          "rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
          "focus:ring-primary focus:border-primary text-sm focus:outline-none focus:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-400 focus:ring-red-400" : "",
          value ? "text-slate-900 dark:text-slate-100" : "text-slate-400",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined pointer-events-none absolute left-3 text-lg text-slate-400">
          calendar_today
        </span>
        {value ? formatIndian(value) : placeholder}
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div
          className="absolute z-30 mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          role="dialog"
          aria-label="Date picker"
        >
          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="rounded-lg p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined text-lg text-slate-500">
                chevron_left
              </span>
            </button>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="rounded-lg p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined text-lg text-slate-500">
                chevron_right
              </span>
            </button>
          </div>

          {/* Day names */}
          <div className="mb-1 grid grid-cols-7">
            {DAYS.map((d) => (
              <span
                key={d}
                className="py-1 text-center text-[10px] font-bold uppercase text-slate-400"
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
                    "relative flex h-8 w-full items-center justify-center rounded-lg text-sm transition-colors",
                    isSelected
                      ? "bg-primary font-bold text-white"
                      : isToday
                        ? "border-primary text-primary border font-bold"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    isOff ? "cursor-not-allowed opacity-30" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  title={highlight?.label}
                >
                  {day}
                  {highlight && (
                    <span
                      className="absolute bottom-0.5 h-1 w-1 rounded-full"
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
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="w-full text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
