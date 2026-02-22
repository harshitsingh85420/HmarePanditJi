"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

export interface OtpInputProps {
    length?: number;
    onComplete?: (otp: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
    length = 6,
    onComplete,
    disabled = false,
    autoFocus = false,
    className = '',
}) => {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    // Use a string array with true/false string or similar, but simpler to use numbers for hiding
    const [showValues, setShowValues] = useState<boolean[]>(Array(length).fill(true));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;

        // Only allow single numeric digits
        if (!/^\d*$/.test(value)) return;

        // Get the last character if they pasted or typed multiple quickly into one box
        const digit = value.slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Briefly show the value then mask it
        if (digit !== '') {
            const newShowValues = [...showValues];
            newShowValues[index] = true;
            setShowValues(newShowValues);

            // Auto-advance
            if (index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }

            // Delay hiding for security mask
            setTimeout(() => {
                setShowValues(prev => {
                    const nextMasks = [...prev];
                    nextMasks[index] = false;
                    return nextMasks;
                });
            }, 500);
        }

        // Check if complete
        if (newOtp.every(v => v !== '') && onComplete) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                // Box is empty, move up one and clear it
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else {
                // Just clear current box
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length).replace(/\D/g, '');

        if (pastedData) {
            const newOtp = [...otp];
            const newShowValues = [...showValues];

            pastedData.split('').forEach((char, i) => {
                if (i < length) {
                    newOtp[i] = char;
                    newShowValues[i] = true;
                }
            });

            setOtp(newOtp);
            setShowValues(newShowValues);

            // Focus last filled input
            const focusIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[focusIndex]?.focus();

            // Mask all
            setTimeout(() => {
                setShowValues(Array(length).fill(false));
            }, 500);

            if (pastedData.length === length && onComplete) {
                onComplete(pastedData);
            }
        }
    };

    return (
        <div className={`flex gap-2 sm:gap-3 justify-center w-full ${className}`}>
            {otp.map((value, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    disabled={disabled}
                    value={value === '' ? '' : (showValues[index] ? value : '•')}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className="w-10 h-11 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:text-gray-400 transition-colors shadow-sm"
                    maxLength={1} // Important to still allow onPaste effectively, we slice paste data
                />
            ))}
        </div>
    );
};
