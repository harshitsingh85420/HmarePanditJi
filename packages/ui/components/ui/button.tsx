import React from "react";

function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

const variants: Record<string, string> = {
    default: &quot;bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm&quot;,
    destructive: &quot;bg-red-600 text-white hover:bg-red-700 shadow-sm&quot;,
    outline: &quot;border border-gray-300 bg-white hover:bg-gray-50 text-gray-700&quot;,
    secondary: &quot;bg-gray-100 text-gray-900 hover:bg-gray-200&quot;,
    ghost: &quot;hover:bg-gray-100 text-gray-700&quot;,
    link: &quot;text-indigo-600 underline-offset-4 hover:underline&quot;,
};

const sizes: Record<string, string> = {
    default: &quot;h-10 px-4 py-2&quot;,
    sm: &quot;h-9 px-3 text-sm&quot;,
    lg: &quot;h-11 px-8&quot;,
    icon: &quot;h-10 w-10&quot;,
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    asChild?: boolean;
}

export function Button({ className, variant = &quot;default&quot;, size = &quot;default&quot;, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
                variants[variant] || variants.default,
                sizes[size] || sizes.default,
                className
            )}
            {...props}
        />
    );
}
