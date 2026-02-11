"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-4xl text-red-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
          कुछ तकनीकी समस्या आ गई है।
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-8">
          {error.digest && `Error ID: ${error.digest}`}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="h-11 px-6 inline-flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Try Again / पुनः प्रयास करें
          </button>
          <a
            href="/"
            className="h-11 px-6 inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Go Home / होम जाएं
          </a>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Need help?{" "}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999"}`}
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp us
          </a>
        </p>
      </div>
    </div>
  );
}
