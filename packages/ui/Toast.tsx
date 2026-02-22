"use client";

import React, { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

// Global state for toasts
let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

const notifyListeners = () => {
    listeners.forEach((listener) => listener(toasts));
};

export const useToast = () => {
    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substr(2, 9);
        toasts = [...toasts, { id, message, type }];
        notifyListeners();

        setTimeout(() => {
            toasts = toasts.filter((t) => t.id !== id);
            notifyListeners();
        }, 4000); // 4 seconds auto-dismiss
    }, []);

    return {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        warning: (message: string) => addToast(message, 'warning'),
        info: (message: string) => addToast(message, 'info'),
    };
};

const ToastIcon = ({ type }: { type: ToastType }) => {
    switch (type) {
        case 'success':
            return (
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'error':
            return (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case 'warning':
            return (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        case 'info':
            return (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
};

export const Toaster: React.FC = () => {
    const [activeToasts, setActiveToasts] = useState<Toast[]>(toasts);

    useEffect(() => {
        setActiveToasts(toasts);
        listeners.push(setActiveToasts);
        return () => {
            listeners = listeners.filter((l) => l !== setActiveToasts);
        };
    }, []);

    const handleDismiss = (id: string) => {
        toasts = toasts.filter((t) => t.id !== id);
        notifyListeners();
    };

    // Max 3 toasts visible, queue older ones by slicing from the end
    const visibleToasts = activeToasts.slice(-3);

    return (
        <div className="fixed bottom-0 right-0 z-[100] p-4 sm:p-6 space-y-3 pointer-events-none flex flex-col items-end">
            {visibleToasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto w-full max-w-sm overflow-hidden bg-white shadow-lg rounded-lg border border-gray-100 ring-1 ring-black ring-opacity-5 animate-toast-slide-in transform transition-all"
                >
                    <div className="p-4 flex items-start">
                        <div className="flex-shrink-0">
                            <ToastIcon type={toast.type} />
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium text-gray-900 leading-snug">{toast.message}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                onClick={() => handleDismiss(toast.id)}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Animated progress bar at bottom */}
                    <div className="h-0.5 w-full bg-gray-100 overflow-hidden">
                        <div
                            className={`h-full animate-toast-progress origin-left
                ${toast.type === 'success' ? 'bg-green-500' : ''}
                ${toast.type === 'error' ? 'bg-red-500' : ''}
                ${toast.type === 'warning' ? 'bg-amber-500' : ''}
                ${toast.type === 'info' ? 'bg-blue-500' : ''}
              `}
                        />
                    </div>
                </div>
            ))}
            <style>{`
        @keyframes toast-slide-in {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes toast-progress {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        .animate-toast-slide-in {
          animation: toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-toast-progress {
          animation: toast-progress 4s linear forwards;
        }
      `}</style>
        </div>
    );
};
