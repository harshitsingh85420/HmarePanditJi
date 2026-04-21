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
  placeholder = "Select...",
  searchable = false,
  disabled = false,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectId = label?.toLowerCase().replace(/\s+/g, "-") ?? "select";

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, searchable]);

  const selectedOption = options.find((o) => o.value === value);
  const filtered =
    searchable && search
      ? options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

  return (
    <div ref={ref} className={`flex w-full flex-col gap-1.5 ${className}`}>
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
            "flex min-h-[56px] w-full items-center justify-between py-4 pl-4 pr-10 text-left",
            "rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
            // ACC-010 FIX: Larger text for elderly users
            "focus:ring-primary focus:border-primary text-base focus:outline-none focus:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-400 focus:ring-red-400" : "",
            selectedOption
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-400",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selectedOption?.label ?? placeholder}
        </button>

        <span
          aria-hidden="true"
          className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400"
        >
          {open ? "expand_less" : "expand_more"}
        </span>

        {open && (
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {searchable && (
              <div className="border-b border-slate-100 p-3 dark:border-slate-800">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  // ACC-010 FIX: Larger search input text for elderly users
                  className="focus:ring-primary min-h-[52px] w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-base focus:outline-none focus:ring-1 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            )}

            <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                // ACC-010 FIX: Larger "no results" text
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
                      setSearch("");
                    }}
                    className={[
                      // ACC-009 & ACC-010 FIX: Larger options with bigger touch targets
                      "flex min-h-[52px] cursor-pointer items-center px-4 py-3 text-base transition-colors",
                      opt.value === value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                    ].join(" ")}
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
        <p className="text-base font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
