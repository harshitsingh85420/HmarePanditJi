"use client";

import React, { useState } from 'react';

export interface StarRatingProps {
    value: number;
    max?: number;
    interactive?: boolean;
    onChange?: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
    value,
    max = 5,
    interactive = false,
    onChange,
    size = 'md',
    showValue = false,
    className = '',
}) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const starSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const displayValue = hoverValue !== null ? hoverValue : value;

    const handleClick = (index: number) => {
        if (interactive && onChange) {
            onChange(index + 1);
        }
    };

    const handleMouseEnter = (index: number) => {
        if (interactive) setHoverValue(index + 1);
    };

    const handleMouseLeave = () => {
        if (interactive) setHoverValue(null);
    };

    const stars = Array.from({ length: max }, (_, i) => {
        const isFull = displayValue >= i + 1;
        const isHalf = !isFull && displayValue > i && displayValue < i + 1;

        return (
            <span
                key={i}
                className={`${starSizes[size]} inline-block flex-shrink-0 ${interactive ? 'cursor-pointer' : ''}`}
                onClick={() => handleClick(i)}
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-amber-400 relative"
                >
                    {isFull ? (
                        <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="currentColor"
                        />
                    ) : isHalf ? (
                        <>
                            <defs>
                                <clipPath id={`half-star-${i}`}>
                                    <rect x="0" y="0" width="12" height="24" />
                                </clipPath>
                            </defs>
                            <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                fill="#E5E7EB" // gray-200
                            />
                            <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                fill="currentColor"
                                clipPath={`url(#half-star-${i})`}
                            />
                        </>
                    ) : (
                        <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="#E5E7EB" /* gray-200 */
                        />
                    )}
                </svg>
            </span>
        );
    });

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            <div className="flex">
                {stars}
            </div>
            {showValue && (
                <span className={`ml-1.5 font-medium text-gray-700 ${textSizes[size]}`}>
                    {value.toFixed(1)}
                </span>
            )}
        </div>
    );
};
