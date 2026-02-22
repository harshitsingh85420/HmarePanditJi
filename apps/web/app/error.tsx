'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <span className="text-6xl mb-6">😕</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                We encountered an unexpected error. Our team has been notified.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-medium transition shadow-sm"
                >
                    Try Again
                </button>
                <a
                    href="/"
                    className="bg-white border text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-xl font-medium transition shadow-sm"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
