import React, { ReactNode } from 'react';
import { Theme, themes } from './tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
    theme?: Theme;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    theme = 'customer',
    className = '',
    children,
    ...props
}, ref) => {
    const currentTheme = themes[theme] || themes.customer;

    const cssVars = {
        '--btn-primary': currentTheme.primary,
        '--btn-primary-dark': currentTheme.primaryDark,
        '--btn-primary-light': currentTheme.primaryLight,
        '--btn-text': currentTheme.textOnPrimary,
    } as React.CSSProperties;

    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            style={cssVars}
            className={`
        relative inline-flex items-center justify-center rounded-md font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'md' ? 'px-4 py-2 text-base' : 'px-6 py-3 text-lg'}
        ${variant === 'primary' ? 'bg-[var(--btn-primary)] hover:bg-[var(--btn-primary-dark)] text-[var(--btn-text)]' : ''}
        ${variant === 'secondary' ? 'bg-[var(--btn-primary-light)] text-[var(--btn-primary-dark)] hover:bg-[var(--btn-primary)] hover:text-[var(--btn-text)]' : ''}
        ${variant === 'outline' ? 'border border-[var(--btn-primary)] text-[var(--btn-primary)] hover:bg-[var(--btn-primary-light)]' : ''}
        ${variant === 'ghost' ? 'text-[var(--btn-primary)] hover:bg-[var(--btn-primary-light)]' : ''}
        ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
        ${className}
      `}
            {...props}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            <span className={`inline-flex items-center justify-center ${loading ? 'opacity-0' : 'opacity-100'}`}>
                {leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {rightIcon && <span className="ml-2">{rightIcon}</span>}
            </span>
        </button>
    );
});
Button.displayName = 'Button';
