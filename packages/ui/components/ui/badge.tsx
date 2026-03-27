import React from "react";

function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

const variants: Record<string, string> = {
    default: &quot;bg-indigo-600 text-white border-transparent&quot;,
    secondary: &quot;bg-gray-100 text-gray-800 border-transparent&quot;,
    destructive: &quot;bg-red-600 text-white border-transparent&quot;,
    outline: &quot;text-gray-700 border-gray-300&quot;,
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof variants;
}

export function Badge({ className, variant = &quot;default&quot;, ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant] || variants.default,
                className
            )}
            {...props}
        />
    );
}
