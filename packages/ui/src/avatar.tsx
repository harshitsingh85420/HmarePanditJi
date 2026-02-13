import React from "react";

export interface AvatarProps {
  src?: string;
  name?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  verifiedBadge?: boolean;
  className?: string;
}

const sizeMap: Record<
  string,
  { container: string; badge: string; icon: string; text: string }
> = {
  sm: {
    container: "w-8 h-8",
    badge: "w-3.5 h-3.5 -bottom-0.5 -right-0.5 border",
    icon: "text-[8px]",
    text: "text-xs",
  },
  md: {
    container: "w-12 h-12",
    badge: "w-4 h-4 -bottom-1 -right-1 border-2",
    icon: "text-[10px]",
    text: "text-sm",
  },
  lg: {
    container: "w-16 h-16",
    badge: "w-5 h-5 -bottom-1 -right-1 border-2",
    icon: "text-xs",
    text: "text-base",
  },
  xl: {
    container: "w-24 h-24",
    badge: "w-6 h-6 -bottom-1.5 -right-1.5 border-2",
    icon: "text-sm",
    text: "text-xl",
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  alt,
  size = "md",
  verifiedBadge = false,
  className = "",
}: AvatarProps) {
  const s = sizeMap[size];
  const label = alt ?? name ?? "User";

  return (
    <div
      className={`relative inline-block flex-shrink-0 ${s.container} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover rounded-full bg-slate-200 dark:bg-slate-700"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold"
          aria-label={label}
        >
          {name ? (
            <span className={s.text}>{getInitials(name)}</span>
          ) : (
            <span className="material-symbols-outlined text-current">
              person
            </span>
          )}
        </div>
      )}

      {verifiedBadge && (
        <span
          className={`absolute ${s.badge} bg-green-500 text-white rounded-full flex items-center justify-center border-white dark:border-slate-900`}
          aria-label="Verified"
        >
          <span
            className={`material-symbols-outlined ${s.icon} leading-none`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check
          </span>
        </span>
      )}
    </div>
  );
}
