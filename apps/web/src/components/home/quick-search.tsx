"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const PUJA_TYPES = [
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Vivah Sanskar",
  "Namkaran",
  "Rudrabhishek",
  "Sunderkand Path",
  "Shanti Path",
  "Mundan Sanskar",
  "Ganesh Puja",
  "Havan",
];

const CITIES = [
  "Delhi",
  "New Delhi",
  "Noida",
  "Greater Noida",
  "Gurgaon",
  "Faridabad",
  "Ghaziabad",
  "Meerut",
  "Mathura",
  "Vrindavan",
];

export function QuickSearch() {
  const router = useRouter();
  const [pujaType, setPujaType] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const sugRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sugRef.current && !sugRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCityInput = (val: string) => {
    setCity(val);
    if (val.length > 0) {
      const filtered = CITIES.filter((c) =>
        c.toLowerCase().includes(val.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (pujaType) p.set("ritual", pujaType);
    if (city) p.set("city", city);
    if (date) p.set("date", date);
    router.push(`/search?${p.toString()}`);
  };

  const inputClass =
    "w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Puja Type */}
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Puja Type
          </label>
          <select
            value={pujaType}
            onChange={(e) => setPujaType(e.target.value)}
            className={inputClass}
          >
            <option value="">All Puja Types</option>
            {PUJA_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="relative" ref={sugRef}>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            City / Location
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
              location_on
            </span>
            <input
              type="text"
              value={city}
              onChange={(e) => handleCityInput(e.target.value)}
              onFocus={() =>
                city.length > 0 &&
                suggestions.length > 0 &&
                setShowSuggestions(true)
              }
              placeholder="e.g. Delhi, Noida"
              className={`${inputClass} pl-9`}
            />
          </div>
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 py-1 max-h-40 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setCity(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-slate-400 align-middle mr-1.5">
                    location_on
                  </span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Date
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
              calendar_today
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm inline-flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">search</span>
            Search Pandits
          </button>
        </div>
      </div>
    </div>
  );
}
