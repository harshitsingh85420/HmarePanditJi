import React from 'react';
import { Theme, themes } from './tokens';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    name?: string;
    size?: &apos;xs&apos; | 'sm' | 'md' | 'lg' | 'xl';
    verified?: boolean;
    online?: boolean;
    theme?: Theme;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({
    src,
    name,
    size = 'md',
    verified = false,
    online = false,
    theme = 'customer',
    className = '',
    ...props
}, ref) => {
    const currentTheme = themes[theme] || themes.customer;

    const sizeClasses = {
        xs: &apos;w-6 h-6 text-xs&apos;,
        sm: &apos;w-8 h-8 text-sm&apos;,
        md: &apos;w-10 h-10 text-base&apos;,
        lg: &apos;w-16 h-16 text-xl&apos;,
        xl: &apos;w-24 h-24 text-3xl&apos;,
    };

    const getInitials = (n?: string) => {
        if (!n) return &apos;?&apos;;
        const parts = n.split(&apos; &apos;).filter(Boolean);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const styleVars = {
        '--avatar-bg': currentTheme.primaryLight,
        '--avatar-text': currentTheme.primaryDark,
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
                    alt={name || 'Avatar'}
                    className="w-full h-full rounded-full object-cover bg-gray-100"
                />
            ) : (
                <div
                    className="w-full h-full rounded-full flex items-center justify-center font-semibold bg-[var(--avatar-bg)] text-[var(--avatar-text)]"
                >
                    {getInitials(name)}
                </div>
            )}

            {verified && (
                <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center p-[2px]">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}

            {online && !verified && (
                <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            )}
        </div>
    );
});
Avatar.displayName = 'Avatar';
