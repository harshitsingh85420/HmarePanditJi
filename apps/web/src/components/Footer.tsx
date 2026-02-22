import Link from "next/link";
import React from "react";

export function Footer() {
    return (
        <footer className="bg-gray-900 py-12 text-gray-300">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-amber-500">
                            🙏 HmarePanditJi
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-gray-400">
                            Book Verified Pandits for Every Sacred Occasion. Transparent pricing, travel managed, backup guaranteed.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Platform</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-amber-500 transition-colors">About</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-amber-500 transition-colors">How it Works</Link></li>
                            <li><Link href="/blog" className="hover:text-amber-500 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">For Customers</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/search" className="hover:text-amber-500 transition-colors">Find Pandits</Link></li>
                            <li><Link href="/muhurat" className="hover:text-amber-500 transition-colors">Muhurat Explorer</Link></li>
                            <li><Link href="/reviews" className="hover:text-amber-500 transition-colors">Reviews</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">For Pandits</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/join" className="hover:text-amber-500 transition-colors">Join as Pandit</Link></li>
                            <li><Link href="/earnings-calculator" className="hover:text-amber-500 transition-colors">Earnings Calculator</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between border-t border-gray-800 pt-8 sm:flex-row">
                    <p className="text-xs text-gray-500">© 2026 HmarePanditJi Technologies Pvt. Ltd.</p>
                    <div className="mt-4 flex space-x-6 sm:mt-0 text-xs text-gray-500">
                        <Link href="/terms" className="hover:text-amber-500 transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
                        <Link href="/cancellation" className="hover:text-amber-500 transition-colors">Cancellation Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
