import React from 'react';
import { Theme, themes, shadows } from './tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    theme?: Theme;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    variant = 'default',
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
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
    }[padding];

    const variantClass = {
        default: 'bg-white border border-gray-100 shadow-sm',
        outlined: 'bg-white border-[1.5px] border-[var(--card-primary)]',
        elevated: 'bg-white shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow duration-300',
    }[variant];

    const interactiveClass = onClick ? 'cursor-pointer transform transition-transform duration-200 hover:-translate-y-1' : '';

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
