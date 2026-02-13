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
  const filtered = searchable && search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  return (
    <div ref={ref} className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
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
            "w-full flex items-center justify-between py-3 pl-4 pr-10 text-left",
            "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg",
            "text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
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
          className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none"
        >
          {open ? "expand_less" : "expand_more"}
        </span>

        {open && (
          <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            <ul
              role="listbox"
              className="max-h-60 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-2 text-sm text-slate-400">
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
                      "px-4 py-2 text-sm cursor-pointer transition-colors",
                      opt.value === value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
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
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
