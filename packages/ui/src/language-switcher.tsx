"use client";

const OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];

export interface LanguageSwitcherProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function LanguageSwitcher({ value = "en", onChange }: LanguageSwitcherProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
      aria-label="Language"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
