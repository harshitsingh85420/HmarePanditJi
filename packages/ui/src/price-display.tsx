import React from "react";

export interface PriceDisplayProps {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "featured";
  /** Show strikethrough original price */
  originalAmount?: number;
  className?: string;
}

/** Format number in Indian numbering system: 1,00,000 */
function formatIndianNumber(n: number): string {
  const str = Math.round(n).toString();
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

export function PriceDisplay({
  amount,
  currency = "₹",
  size = "md",
  originalAmount,
  className = "",
}: PriceDisplayProps) {
  const sizes: Record<string, string> = {
    sm: &quot;text-base font-bold&quot;,
    md: &quot;text-lg font-bold&quot;,
    lg: &quot;text-2xl font-bold&quot;,
    featured: &quot;text-xl font-black text-primary&quot;,
  };

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={sizes[size]}>
        {currency}
        {formatIndianNumber(amount)}
      </span>
      {originalAmount !== undefined && originalAmount > amount && (
        <span className="text-sm text-slate-400 line-through">
          {currency}
          {formatIndianNumber(originalAmount)}
        </span>
      )}
    </span>
  );
}
