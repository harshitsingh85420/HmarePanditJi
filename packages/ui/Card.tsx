import React from 'react';
import { Theme, themes, shadows } from './tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: &apos;default&apos; | &apos;outlined&apos; | &apos;elevated&apos;;
    padding?: &apos;none&apos; | 'sm' | 'md' | 'lg';
    theme?: Theme;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    variant = &apos;default&apos;,
    padding = 'md',
    theme = 'customer',
    className = '',
    onClick,
    children,
    ...props
}, ref) => {
    const currentTheme = themes[theme] || themes.customer;

    const styleVars = {
        '--card-primary': currentTheme.primary,
        '--card-shadow': shadows.card,
        '--card-shadow-hover': shadows.cardHover,
    } as React.CSSProperties;

    const paddingClass = {
        none: &apos;p-0&apos;,
        sm: &apos;p-3&apos;,
        md: &apos;p-4 sm:p-6&apos;,
        lg: &apos;p-6 sm:p-8&apos;,
    }[padding];

    const variantClass = {
        default: &apos;bg-white border border-gray-100 shadow-sm&apos;,
        outlined: &apos;bg-white border-[1.5px] border-[var(--card-primary)]&apos;,
        elevated: &apos;bg-white shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow duration-300&apos;,
    }[variant];

    const interactiveClass = onClick ? &apos;cursor-pointer transform transition-transform duration-200 hover:-translate-y-1&apos; : '';

    return (
        <div
            ref={ref}
            style={styleVars}
            className={`rounded-xl overflow-hidden ${variantClass} ${paddingClass} ${interactiveClass} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
});
Card.displayName = 'Card';
