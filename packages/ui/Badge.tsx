import React from 'react';
import { Theme, themes } from './tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
    size?: 'sm' | 'md';
    dot?: boolean;
    theme?: Theme;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
    variant = 'neutral',
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

    const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
    const dotSizeClass = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

    const variantClasses = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        neutral: 'bg-gray-100 text-gray-800',
        primary: 'bg-[var(--badge-primary-light)] text-[var(--badge-primary-dark)]',
    };

    const dotClasses = {
        success: 'bg-green-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        neutral: 'bg-gray-500',
        primary: 'bg-[var(--badge-primary)]',
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
