import React, { ReactNode } from 'react';
import { Theme, themes } from './tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    prefixStr?: string; // e.g., "+91"
    theme?: Theme;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    prefixStr,
    theme = 'customer',
    className = '',
    id,
    type = 'text',
    disabled,
    ...props
}, ref) => {
    const inputId = id || Array.from({ length: 8 }, () => Math.random().toString(36)[2]).join('');
    const currentTheme = themes[theme] || themes.customer;

    const styleVars = {
        '--input-primary': currentTheme.primary,
    } as React.CSSProperties;

    return (
        <div className={`flex flex-col w-full ${className}`} style={styleVars}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={`mb-1 text-sm font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}
                >
                    {label}
                </label>
            )}

            <div className="relative flex rounded-md">
                {prefixStr && (
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        {prefixStr}
                    </span>
                )}

                <div className="relative flex-1 w-full flex">
                    {leftIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">{leftIcon}</span>
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        disabled={disabled}
                        className={`
              block w-full min-w-0 flex-1 sm:text-sm bg-white
              ${prefixStr ? 'rounded-none rounded-r-md' : 'rounded-md'}
              ${leftIcon ? 'pl-10' : 'pl-3'}
              ${rightIcon ? 'pr-10' : 'pr-3'}
              py-2
              ${error
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[var(--input-primary)] focus:ring-[var(--input-primary)]'}
              border focus:outline-none focus:ring-1
              disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
              transition-colors
            `}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">{rightIcon}</span>
                        </div>
                    )}
                </div>
            </div>

            {error ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span> {error}
                </p>
            ) : helperText ? (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            ) : null}
        </div>
    );
});
Input.displayName = 'Input';
