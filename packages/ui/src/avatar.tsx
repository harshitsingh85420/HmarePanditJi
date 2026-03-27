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
  // ACC-009 & ACC-010 FIX: Larger avatars and text for elderly users
  sm: {
    container: &quot;w-12 h-12&quot;,
    badge: &quot;w-5 h-5 -bottom-1 -right-1 border-2&quot;,
    icon: &quot;text-[10px]&quot;,
    text: &quot;text-base&quot;,
  },
  md: {
    container: &quot;w-16 h-16&quot;,
    badge: &quot;w-6 h-6 -bottom-1.5 -right-1.5 border-2&quot;,
    icon: &quot;text-xs&quot;,
    text: &quot;text-lg&quot;,
  },
  lg: {
    container: &quot;w-20 h-20&quot;,
    badge: &quot;w-7 h-7 -bottom-1.5 -right-1.5 border-2&quot;,
    icon: &quot;text-sm&quot;,
    text: &quot;text-xl&quot;,
  },
  xl: {
    container: &quot;w-28 h-28&quot;,
    badge: &quot;w-8 h-8 -bottom-2 -right-2 border-2&quot;,
    icon: &quot;text-base&quot;,
    text: &quot;text-2xl&quot;,
  },
};

function getInitials(name: string): string {
  return name
    .split(&quot; &quot;)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join(&quot;&quot;)
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  alt,
  size = &quot;md&quot;,
  verifiedBadge = false,
  className = &quot;&quot;,
}: AvatarProps) {
  const s = sizeMap[size];
  const label = alt ?? name ?? &quot;User&quot;;

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
