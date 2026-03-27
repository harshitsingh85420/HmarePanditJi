import React from 'react';
import { Theme, themes } from './tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: &apos;success&apos; | &apos;warning&apos; | &apos;error&apos; | &apos;info&apos; | &apos;neutral&apos; | 'primary';
    size?: 'sm' | 'md';
    dot?: boolean;
    theme?: Theme;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
    variant = &apos;neutral&apos;,
    size = 'md',
    dot = false,
    theme = 'customer',
    className = '',
    children,
    ...props
}, ref) => {
    const currentTheme = themes[theme] || themes.customer;

    const styleVars = {
        '--badge-primary': currentTheme.primary,
        '--badge-primary-light': currentTheme.primaryLight,
        '--badge-primary-dark': currentTheme.primaryDark,
    } as React.CSSProperties;

    const sizeClass = size === 'sm' ? &apos;px-2 py-0.5 text-xs&apos; : &apos;px-2.5 py-1 text-sm&apos;;
    const dotSizeClass = size === 'sm' ? &apos;w-1.5 h-1.5&apos; : &apos;w-2 h-2&apos;;

    const variantClasses = {
        success: &apos;bg-green-100 text-green-800&apos;,
        warning: &apos;bg-amber-100 text-amber-800&apos;,
        error: &apos;bg-red-100 text-red-800&apos;,
        info: &apos;bg-blue-100 text-blue-800&apos;,
        neutral: &apos;bg-gray-100 text-gray-800&apos;,
        primary: &apos;bg-[var(--badge-primary-light)] text-[var(--badge-primary-dark)]&apos;,
    };

    const dotClasses = {
        success: &apos;bg-green-500&apos;,
        warning: &apos;bg-amber-500&apos;,
        error: &apos;bg-red-500&apos;,
        info: &apos;bg-blue-500&apos;,
        neutral: &apos;bg-gray-500&apos;,
        primary: &apos;bg-[var(--badge-primary)]&apos;,
    };

    return (
        <span
            ref={ref}
            style={styleVars}
            className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {dot && (
                <span className={`${dotSizeClass} rounded-full mr-1.5 ${dotClasses[variant]}`} aria-hidden="true" />
            )}
            {children}
        </span>
    );
});
Badge.displayName = 'Badge';
