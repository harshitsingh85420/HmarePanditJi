"use client";

export interface LanguageSwitcherProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function LanguageSwitcher({ value = "en", onChange }: LanguageSwitcherProps) {
  const isHindi = value === "hi";

  return (
    <button
      onClick={() => onChange?.(isHindi ? "en" : "hi")}
      className="min-h-[56px] px-6 flex items-center gap-3 text-[22px] font-bold text-text-primary active:opacity-50 focus:ring-2 focus:ring-saffron focus:outline-none border-2 border-border-default rounded-full bg-surface-card hover:bg-surface-muted transition-colors"
      aria-label="भाषा बदलें / Change Language"
    >
      <span className={isHindi ? "text-saffron" : ""}>हिन्दी</span>
      <span className="text-[18px] text-text-secondary">/</span>
      <span className={!isHindi ? "text-saffron" : ""}>English</span>
    </button>
  );
}
