import React from "react";

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: &quot;xs&quot; | &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;xl&quot; | number;
  filled?: boolean;
  &quot;aria-label&quot;?: string;
}

const sizeMap: Record<string, string> = {
  xs: &quot;text-sm&quot;,
  sm: &quot;text-base&quot;,
  md: &quot;text-xl&quot;,
  lg: &quot;text-2xl&quot;,
  xl: &quot;text-3xl&quot;,
};

export function Icon({
  name,
  size = &quot;md&quot;,
  filled = false,
  className = &quot;&quot;,
  style,
  &quot;aria-label&quot;: ariaLabel,
  ...props
}: IconProps) {
  const sizeClass =
    typeof size === &quot;number&quot; ? &quot;&quot; : sizeMap[size] ?? sizeMap.md;
  const sizeStyle =
    typeof size === &quot;number&quot; ? { fontSize: size } : undefined;

  return (
    <span
      className={`material-symbols-outlined select-none ${sizeClass} ${className}`}
      style={{
        ...(sizeStyle ?? {}),
        ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}),
        ...style,
      }}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : "true"}
      role={ariaLabel ? "img" : undefined}
      {...props}
    >
      {name}
    </span>
  );
}
