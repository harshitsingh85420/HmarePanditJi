import React from "react";

export interface RatingProps {
  value: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({
  value,
  reviewCount,
  showCount = true,
  size = "md",
  className = "",
}: RatingProps) {
  const sizes: Record<string, { star: string; text: string }> = {
    sm: { star: "text-sm", text: "text-xs" },
    md: { star: "text-base", text: "text-sm" },
    lg: { star: "text-lg", text: "text-base" },
  };

  const { star, text } = sizes[size];

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span
        className={`material-symbols-outlined ${star} text-orange-500`}
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden="true"
      >
        star
      </span>
      <span className={`${text} font-bold text-slate-900 dark:text-slate-100`}>
        {value.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className={`${text} text-slate-400`}>({reviewCount})</span>
      )}
    </span>
  );
}
