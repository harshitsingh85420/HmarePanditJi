import React from "react";

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  filled?: boolean;
  "aria-label"?: string;
}

const sizeMap: Record<string, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export function Icon({
  name,
  size = "md",
  filled = false,
  className = "",
  style,
  "aria-label": ariaLabel,
  ...props
}: IconProps) {
  const sizeClass =
    typeof size === "number" ? "" : sizeMap[size] ?? sizeMap.md;
  const sizeStyle =
    typeof size === "number" ? { fontSize: size } : undefined;

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
