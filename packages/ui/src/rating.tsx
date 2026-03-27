"use client";

import React, { useState } from "react";

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;;
  showValue?: boolean;
  className?: string;
}

export function Rating({
  value,
  onChange,
  size = &quot;md&quot;,
  showValue = true,
  className = &quot;&quot;,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const isInput = !!onChange;
  const displayValue = hoverValue || value;

  const sizes: Record<string, { star: string; text: string }> = {
    sm: { star: &quot;text-base&quot;, text: &quot;text-xs&quot; },
    md: { star: &quot;text-xl&quot;, text: &quot;text-sm&quot; },
    lg: { star: &quot;text-2xl&quot;, text: &quot;text-base&quot; },
  };

  const { star, text } = sizes[size];

  if (!isInput) {
    return (
      <span className={`inline-flex items-center gap-0.5 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`material-symbols-outlined ${star} ${
              i <= Math.round(value)
                ? "text-amber-400"
                : "text-slate-200 dark:text-slate-600"
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            star
          </span>
        ))}
        {showValue && (
          <span
            className={`${text} font-bold text-slate-900 dark:text-slate-100 ml-1`}
          >
            {value.toFixed(1)}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHoverValue(i)}
          className={`material-symbols-outlined ${star} transition-colors cursor-pointer ${
            i <= displayValue
              ? "text-amber-400"
              : "text-slate-200 dark:text-slate-600"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-label={`Rate ${i} out of 5`}
        >
          star
        </button>
      ))}
      {showValue && displayValue > 0 && (
        <span
          className={`${text} font-bold text-slate-900 dark:text-slate-100 ml-1`}
        >
          {displayValue.toFixed(1)}
        </span>
      )}
    </span>
  );
}
