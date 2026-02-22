import Link from "next/link";
import React from "react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl pt-1">🕉️</span>
                        <span className="font-display font-black text-xl tracking-tight text-gray-900">
                            Hmare<span className="text-orange-600">PanditJi</span>
                        </span>
                    </Link>
                    <Link href="/" className="text-sm text-gray-600 hover:text-orange-600 font-medium">
                        &larr; Back to Home
                    </Link>
                </div>
            </header>
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-orange max-w-none">
                    {children}
                </div>
            </main>
        </div>
    );
}
