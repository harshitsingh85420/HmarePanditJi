import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-16">
            <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🙏</span>
                            <span className="text-lg font-extrabold text-white">HmarePanditJi</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Sanskriti ko Digital Disha — Connecting families with verified
                            Pandits across India.
                        </p>
                        <p className="text-gray-500 text-xs">500+ pandits | 4.8★ average | Delhi-NCR</p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">About</Link></li>
                            <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">How it Works</Link></li>
                            <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* For Customers */}
                    <div>
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">For Customers</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/search" className="text-gray-400 hover:text-primary transition-colors">Find Pandits</Link></li>
                            <li><Link href="/muhurat" className="text-gray-400 hover:text-primary transition-colors">Muhurat Explorer</Link></li>
                            <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Reviews</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Cancellation Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © 2026 HmarePanditJi Technologies Pvt. Ltd.
                    </p>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <span className="text-xs text-gray-500">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
