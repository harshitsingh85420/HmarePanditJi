"use client";

import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  error,
  placeholder = &quot;Select...&quot;,
  searchable = false,
  disabled = false,
  className = &quot;&quot;,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(&quot;&quot;);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectId = label?.toLowerCase().replace(/\s+/g, &quot;-&quot;) ?? &quot;select&quot;;

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch(&quot;&quot;);
      }
    }
    document.addEventListener(&quot;mousedown&quot;, handleOutside);
    return () => document.removeEventListener(&quot;mousedown&quot;, handleOutside);
  }, []);

  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, searchable]);

  const selectedOption = options.find((o) => o.value === value);
  const filtered = searchable && search
    ? options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    )
    : options;

  return (
    <div ref={ref} className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        // ACC-010 FIX: Larger label text for elderly users
        <label
          htmlFor={selectId}
          className="text-base font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={selectId}
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          className={[
            // ACC-009 FIX: Larger touch target (min 56px height)
            &quot;w-full flex items-center justify-between py-4 pl-4 pr-10 text-left min-h-[56px]&quot;,
            &quot;bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg&quot;,
            // ACC-010 FIX: Larger text for elderly users
            &quot;text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary&quot;,
            &quot;disabled:opacity-50 disabled:cursor-not-allowed&quot;,
            error ? &quot;border-red-400 focus:ring-red-400&quot; : &quot;&quot;,
            selectedOption
              ? &quot;text-slate-900 dark:text-slate-100&quot;
              : &quot;text-slate-400&quot;,
          ]
            .filter(Boolean)
            .join(&quot; &quot;)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selectedOption?.label ?? placeholder}
        </button>

        <span
          aria-hidden="true"
          className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none"
        >
          {open ? &quot;expand_less&quot; : &quot;expand_more&quot;}
        </span>

        {open && (
          <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {searchable && (
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  // ACC-010 FIX: Larger search input text for elderly users
                  className="w-full px-4 py-3 text-base bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-primary min-h-[52px]"
                />
              </div>
            )}

            <ul
              role="listbox"
              className="max-h-60 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                // ACC-010 FIX: Larger &quot;no results&quot; text
                <li className="px-4 py-3 text-base text-slate-400">
                  No options found
                </li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={opt.value === value}
                    onClick={() => {
                      onChange?.(opt.value);
                      setOpen(false);
                      setSearch(&quot;&quot;);
                    }}
                    className={[
                      // ACC-009 & ACC-010 FIX: Larger options with bigger touch targets
                      &quot;px-4 py-3 text-base cursor-pointer transition-colors min-h-[52px] flex items-center&quot;,
                      opt.value === value
                        ? &quot;bg-primary/10 text-primary font-medium&quot;
                        : &quot;text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800&quot;,
                    ].join(&quot; &quot;)}
                  >
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        // ACC-010 FIX: Larger error text
        <p className="text-base text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
