import React from "react";

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded";
  verified?: boolean;
  className?: string;
}

const sizes: Record<string, { container: string; badge: string; icon: string }> = {
  sm: { container: "w-10 h-10", badge: "w-4 h-4 -bottom-1 -right-1 border-2", icon: "text-[10px]" },
  md: { container: "w-16 h-16", badge: "w-5 h-5 -bottom-1.5 -right-1.5 border-2", icon: "text-xs" },
  lg: { container: "w-24 h-24", badge: "w-6 h-6 -bottom-2 -right-2 border-[3px]", icon: "text-sm" },
  xl: { container: "w-32 h-32", badge: "w-7 h-7 -bottom-2 -right-2 border-4", icon: "text-base" },
};

export function Avatar({
  src,
  alt,
  size = "md",
  shape = "rounded",
  verified = false,
  className = "",
}: AvatarProps) {
  const { container, badge, icon } = sizes[size];
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div className={`relative inline-block flex-shrink-0 ${container} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover bg-slate-200 dark:bg-slate-700 ${shapeClass}`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center bg-primary/10 text-primary ${shapeClass}`}
          aria-label={alt}
        >
          <span className="material-symbols-outlined text-current text-2xl">
            person
          </span>
        </div>
      )}

      {verified && (
        <span
          className={`absolute ${badge} bg-green-500 text-white rounded-full flex items-center justify-center border-white dark:border-slate-900`}
          aria-label="Verified"
        >
          <span
            className={`material-symbols-outlined ${icon} leading-none`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
        </span>
      )}
    </div>
  );
}
