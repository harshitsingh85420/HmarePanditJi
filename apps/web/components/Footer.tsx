import React from "react";
import Link from "next/link";

const panditAppUrl = process.env.NEXT_PUBLIC_PANDIT_APP_URL || "http://localhost:3002";
const adminAppUrl = process.env.NEXT_PUBLIC_ADMIN_APP_URL || "http://localhost:3003";

export default function Footer() {
    return (
        <footer className="bg-background-light dark:bg-[#1a140d] border-t border-[#e6e1db] dark:border-white/10 px-6 lg:px-20 py-12 mt-16">
            <div className="mx-auto max-w-[1280px] grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-primary text-2xl">temple_hindu</span>
                        <h2 className="text-lg font-bold text-[#181511] dark:text-white">HmarePanditJi</h2>
                    </div>
                    <p className="text-sm text-[#8a7960] leading-relaxed">
                        Empowering devotees through accessible technology for a divine spiritual experience.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-[#181511] dark:text-white">Quick Links</h4>
                    <ul className="flex flex-col gap-4 text-sm text-[#8a7960]">
                        <li><Link className="hover:text-primary transition-colors" href="/search">Find a Pandit</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/muhurat">Upcoming Puja</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/pricing">Pricing Details</Link></li>
                        <li><a className="hover:text-primary transition-colors" href={panditAppUrl} target="_blank" rel="noopener noreferrer">For Pandits</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-[#181511] dark:text-white">Support</h4>
                    <ul className="flex flex-col gap-4 text-sm text-[#8a7960]">
                        <li><Link className="hover:text-primary transition-colors" href="/help">Help Center</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/terms">Terms of Service</Link></li>
                        <li><Link className="hover:text-primary transition-colors" href="/cancellation-policy">Cancellation Policy</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-[#181511] dark:text-white">Newsletter</h4>
                    <p className="text-sm text-[#8a7960] mb-4">Stay updated with spiritual events and offers.</p>
                    <div className="flex gap-2">
                        <input className="w-full rounded-lg border-[#e6e1db] bg-white dark:bg-background-dark dark:border-white/10 focus:border-primary focus:ring-primary text-sm px-3 py-2" placeholder="Email address" type="email" />
                        <button className="bg-primary text-white p-2 rounded-lg material-symbols-outlined flex items-center justify-center">send</button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1280px] mt-12 pt-8 border-t border-[#e6e1db] dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-[#8a7960]">© 2026 HmarePanditJi Technologies Pvt. Ltd. All rights reserved.</p>

                <div className="flex items-center gap-6">
                    <a href={adminAppUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8a7960] hover:text-primary transition-colors">
                        Admin Portal
                    </a>
                    <div className="flex gap-6">
                        <a className="text-[#8a7960] hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-lg">public</span></a>
                        <a className="text-[#8a7960] hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-lg">forum</span></a>
                        <a className="text-[#8a7960] hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-lg">mail</span></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}