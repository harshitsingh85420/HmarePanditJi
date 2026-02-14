"use client";

import React from "react";

export default function EcoNirmalyaPage() {
    return (
        <div className="bg-[#f2fcf5] text-[#134e4a] font-sans antialiased min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-[#2dd4bf]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <span className="material-icons text-[#0d9488] text-3xl">
                                spa
                            </span>
                            <span className="font-bold text-xl tracking-tight text-[#0f766e]">
                                HmarePanditJi{" "}
                                <span className="text-[#134e4a] font-light">Eco</span>
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <a
                                    className="px-3 py-2 rounded-md text-sm font-medium text-[#115e59] hover:bg-[#ccfbf1] transition-colors"
                                    href="#"
                                >
                                    Our Mission
                                </a>
                                <a
                                    className="px-3 py-2 rounded-md text-sm font-medium text-[#115e59] hover:bg-[#ccfbf1] transition-colors"
                                    href="#"
                                >
                                    Process
                                </a>
                                <a
                                    className="px-3 py-2 rounded-md text-sm font-medium bg-[#0d9488] text-white shadow-lg shadow-[#2dd4bf]/40 hover:bg-[#0f766e] transition-all transform hover:-translate-y-0.5"
                                    href="#"
                                >
                                    Book Collection
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ccfbf1] text-[#0f766e] uppercase tracking-wide mb-6 animate-fade-in-up">
                        <span className="material-icons text-xs mr-1">
                            recycling
                        </span>
                        Respectful Disposal
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-[#042f2e] tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
                        Sacred Rituals, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d9488] to-[#2dd4bf]">
                            Sustainable Future
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-[#374151] mb-10">
                        We collect your Nirmalya (holy floral waste) and transform it
                        into organic compost and incense, ensuring it returns to nature
                        with dignity.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            className="px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-[#0d9488] hover:bg-[#0f766e] md:py-4 md:text-lg md:px-10 shadow-xl shadow-[#2dd4bf]/30 transition-all transform hover:-translate-y-1"
                            href="#schedule-pickup"
                        >
                            Schedule Pickup
                        </a>
                        <a
                            className="px-8 py-3.5 border border-[#0d9488]/30 text-base font-bold rounded-full text-[#0f766e] bg-white hover:bg-[#f0fdfa] md:py-4 md:text-lg md:px-10 transition-colors"
                            href="#learn-more"
                        >
                            How it Works
                        </a>
                    </div>
                </div>
                {/* Decorative Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-[#2dd4bf]/10 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-96 h-96 bg-[#99f6e4]/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
                </div>
            </header>

            {/* Steps Section */}
            <section className="py-20 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#042f2e] sm:text-4xl">
                            The Journey of Nirmalya
                        </h2>
                        <p className="mt-4 text-lg text-gray-500">
                            From your altar back to the Earth, a pure cycle.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-[#f0fdfa] text-[#0d9488] mb-6 group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-md border border-[#ccfbf1]">
                                    <span className="material-icons text-4xl">
                                        local_florist
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-[#134e4a] mb-3">
                                    Collection
                                </h3>
                                <p className="text-center text-gray-600 leading-relaxed">
                                    Our uniformed 'Eco-Sahayaks' collect the floral waste
                                    directly from your doorstep in specialized biodegradable
                                    bags.
                                </p>
                            </div>
                        </div>
                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-[#f0fdfa] text-[#0d9488] mb-6 group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-md border border-[#ccfbf1]">
                                    <span className="material-icons text-4xl">
                                        compost
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-[#134e4a] mb-3">
                                    Processing
                                </h3>
                                <p className="text-center text-gray-600 leading-relaxed">
                                    The waste is segregated and processed using organic
                                    methods to create chemical-free compost and natural dyes.
                                </p>
                            </div>
                        </div>
                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-[#f0fdfa] text-[#0d9488] mb-6 group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-md border border-[#ccfbf1]">
                                    <span className="material-icons text-4xl">
                                        opacity
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-[#134e4a] mb-3">
                                    Rebirth
                                </h3>
                                <p className="text-center text-gray-600 leading-relaxed">
                                    Transformed into premium incense sticks and soil
                                    enhancers, closing the loop of devotion sustainably.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Action Card Section */}
            <section
                className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full"
                id="schedule-pickup"
            >
                <div className="bg-[#134e4a] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                    <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center text-white">
                        <h3 className="text-2xl font-bold mb-4">
                            Eco-Conscious Disposal
                        </h3>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <span className="material-icons text-[#5eead4]">
                                    check_circle
                                </span>
                                <span>Next-day doorstep pickup</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-icons text-[#5eead4]">
                                    check_circle
                                </span>
                                <span>Certified eco-friendly processing</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-icons text-[#5eead4]">
                                    check_circle
                                </span>
                                <span>Contribution to green cover</span>
                            </li>
                        </ul>
                        <div className="mt-auto">
                            <p className="text-[#99f6e4] text-sm uppercase tracking-wider font-bold mb-2">
                                Partnered with
                            </p>
                            <div className="flex items-center gap-4 opacity-80 mix-blend-screen">
                                <span className="text-2xl font-serif font-black tracking-tighter">
                                    Phool.co
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#f0fdfa] p-8 md:p-12 md:w-1/2">
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#134e4a] mb-1">
                                    Pickup Date
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#ccfbf1] rounded-xl focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none text-[#134e4a]"
                                        type="date"
                                    />
                                    <span className="material-icons absolute left-3 top-3.5 text-[#0d9488] text-lg">
                                        calendar_today
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#134e4a] mb-1">
                                    Quantity (Approx)
                                </label>
                                <select className="w-full pl-10 pr-4 py-3 bg-white border border-[#ccfbf1] rounded-xl focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none text-[#134e4a]">
                                    <option>Small Bag (&lt; 2kg)</option>
                                    <option>Medium Bag (2-5kg)</option>
                                    <option>Large Event (&gt; 5kg)</option>
                                </select>
                                <span className="material-icons absolute left-3 top-3.5 text-transparent text-lg pointer-events-none">
                                    shopping_bag
                                </span>{" "}
                                {/* Placeholder alignment fix needed in real implementation */}
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <span className="text-sm font-medium text-[#134e4a] text-opacity-80">
                                    Service Fee
                                </span>
                                <span className="text-2xl font-bold text-[#0d9488]">
                                    ₹149
                                </span>
                            </div>
                            <button
                                className="w-full bg-[#0d9488] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2"
                                type="button"
                            >
                                Confirm Pickup
                                <span className="material-icons">arrow_forward</span>
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-[#134e4a] py-8 text-center text-[#99f6e4] text-sm">
                <p>
                    © 2024 HmarePanditJi Eco-Initiative. Working towards a cleaner
                    Ganges.
                </p>
            </footer>
        </div>
    );
}
