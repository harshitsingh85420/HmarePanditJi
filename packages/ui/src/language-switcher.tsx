"use client";

export interface LanguageSwitcherProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function LanguageSwitcher({
  value = "en",
  onChange,
}: LanguageSwitcherProps) {
  const isHindi = value === "hi";

  return (
    <button
      onClick={() => onChange?.(isHindi ? "en" : "hi")}
      className="text-text-primary focus:ring-saffron border-border-default bg-surface-card hover:bg-surface-muted flex min-h-[56px] items-center gap-3 rounded-full border-2 px-6 text-[22px] font-bold transition-colors focus:outline-none focus:ring-2 active:opacity-50"
      aria-label="भाषा बदलें / Change Language"
    >
      <span className={isHindi ? "text-saffron" : ""}>हिन्दी</span>
      <span className="text-text-secondary text-[18px]">/</span>
      <span className={!isHindi ? "text-saffron" : ""}>English</span>
    </button>
  );
}
