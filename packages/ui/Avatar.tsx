import React from "react";
import { Theme, themes } from "./tokens";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  verified?: boolean;
  online?: boolean;
  theme?: Theme;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      name,
      size = "md",
      verified = false,
      online = false,
      theme = "customer",
      className = "",
      ...props
    },
    ref,
  ) => {
    const currentTheme = themes[theme] || themes.customer;

    const sizeClasses = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-16 h-16 text-xl",
      xl: "w-24 h-24 text-3xl",
    };

    const getInitials = (n?: string) => {
      if (!n) return "?";
      const parts = n.split(" ").filter(Boolean);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    };

    const styleVars = {
      "--avatar-bg": currentTheme.primaryLight,
      "--avatar-text": currentTheme.primaryDark,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={`relative inline-block ${sizeClasses[size]} ${className}`}
        style={styleVars}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="h-full w-full rounded-full bg-gray-100 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--avatar-bg)] font-semibold text-[var(--avatar-text)]">
            {getInitials(name)}
          </div>
        )}

        {verified && (
          <div className="absolute bottom-0 right-0 flex translate-x-1/4 translate-y-1/4 transform items-center justify-center rounded-full border-2 border-white bg-amber-500 p-[2px]">
            <svg
              className="h-2.5 w-2.5 text-white"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {online && !verified && (
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 translate-x-1/4 translate-y-1/4 transform rounded-full border-2 border-white bg-green-500" />
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";
