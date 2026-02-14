"use client";

import React from "react";

export default function NRILiveStreamPage() {
    return (
        <div className="bg-[#0f0f11] text-gray-100 font-sans h-screen overflow-hidden flex flex-col">
            {/* Header: Event Title & Timers */}
            <header className="h-16 border-b border-gray-800 bg-[#18181b] px-6 flex items-center justify-between z-20 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#fcb040]">
                        <span className="material-icons">temple_buddhist</span>
                        <span className="font-bold tracking-tight hidden sm:block">
                            HmarePanditJi Live
                        </span>
                    </div>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    <div>
                        <h1 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                            Sharma Family Griha Pravesh Puja
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-red-500 font-bold animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            LIVE NOW
                        </div>
                    </div>
                </div>
                {/* World Clocks */}
                <div className="flex items-center gap-6 text-xs text-gray-400 font-mono hidden md:flex">
                    <div className="text-center">
                        <div className="text-gray-500 mb-0.5">San Francisco</div>
                        <div className="text-white">08:45 PM</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 mb-0.5">London</div>
                        <div className="text-white">04:45 AM</div>
                    </div>
                    <div className="text-center relative">
                        <div className="text-[#fcb040] mb-0.5 font-bold">New Delhi</div>
                        <div className="text-white font-bold bg-[#fcb040]/10 px-2 rounded">
                            09:15 AM
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fcb040] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fcb040]"></span>
                        </span>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors flex items-center text-xs gap-1 font-medium">
                        <span className="material-icons text-sm">share</span>
                        <span className="hidden sm:inline">Invite</span>
                    </button>
                    <button className="bg-[#e50914] hover:bg-[#b2070f] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-red-900/20">
                        Leave Room
                    </button>
                </div>
            </header>

            {/* Main Content Area: Split View */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* Left: Video Player Area */}
                <div className="flex-1 bg-black relative flex flex-col justify-center items-center group">
                    {/* Placeholder Video Background */}
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-80"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDUeFzEE5FeUu8xkg2hnNh4D5Q1MnO9XHnUcj4PBy3MIRwuuGfIciR5Lg1CuqFTYZF4oYwiyH2LjlO1ENhJw4uuP_lqskuqQX6xNBZ0xseWU9ht-c75yCPr7GppMUdlrAJWapUb--i5seYJuTctFDEgq9dKdTbtQJYvAMqBe1ggJuRL80gMIsxjnEFRW1ljJX6zNmqM4BO8FKlh9BhlFAZMPntZ6uX2a-C6-8hTjUu15_-z5T-yWNHIhm5D-aldM8AoPfg_GKkC2Es')",
                        }}
                    ></div>
                    {/* Video Overlay Controls (Hover) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                        <div className="flex justify-between items-start">
                            <div className="bg-black/50 backdrop-blur px-3 py-1 rounded text-xs font-mono">
                                <span className="text-[#fcb040]">HD</span> • 4K HDR •
                                60fps
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full bg-black/40 hover:bg-white/20 text-white">
                                    <span className="material-icons">cast</span>
                                </button>
                                <button className="p-2 rounded-full bg-black/40 hover:bg-white/20 text-white">
                                    <span className="material-icons">
                                        picture_in_picture_alt
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-white hover:text-[#fcb040] transition-colors">
                                <span className="material-icons text-4xl">
                                    play_arrow
                                </span>
                            </button>
                            <div className="h-1 bg-gray-600 flex-1 rounded-full overflow-hidden cursor-pointer relative group/timeline">
                                <div className="absolute left-0 top-0 bottom-0 w-[95%] bg-[#e50914] z-10"></div>
                                <div className="absolute left-[95%] top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full z-20 scale-0 group-hover/timeline:scale-100 transition-transform"></div>
                            </div>
                            <div className="text-xs font-mono">
                                -00:12 / <span className="text-gray-400">Live</span>
                            </div>
                            <div className="flex gap-3">
                                <button className="text-white hover:text-gray-300">
                                    <span className="material-icons">volume_up</span>
                                </button>
                                <button className="text-white hover:text-gray-300">
                                    <span className="material-icons">settings</span>
                                </button>
                                <button className="text-white hover:text-gray-300">
                                    <span className="material-icons">fullscreen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Current Muhurat Status (Overlay) */}
                    <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-md border border-[#fcb040]/30 rounded-xl p-4 max-w-xs shadow-2xl transform transition-transform hover:scale-105 cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[#fcb040] p-0.5 animate-spin-slow">
                                <div className="w-full h-full rounded-full bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuDUeFzEE5FeUu8xkg2hnNh4D5Q1MnO9XHnUcj4PBy3MIRwuuGfIciR5Lg1CuqFTYZF4oYwiyH2LjlO1ENhJw4uuP_lqskuqQX6xNBZ0xseWU9ht-c75yCPr7GppMUdlrAJWapUb--i5seYJuTctFDEgq9dKdTbtQJYvAMqBe1ggJuRL80gMIsxjnEFRW1ljJX6zNmqM4BO8FKlh9BhlFAZMPntZ6uX2a-C6-8hTjUu15_-z5T-yWNHIhm5D-aldM8AoPfg_GKkC2Es')] bg-cover bg-center"></div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-[#fcb040] tracking-wider mb-0.5">
                                    Current Ritual
                                </p>
                                <h3 className="text-sm font-bold text-white leading-tight">
                                    Ganesh Stapana &amp; Kalash Puja
                                </h3>
                                <div className="mt-2 text-xs text-gray-300 flex items-center gap-1">
                                    <span className="material-icons text-[12px]">
                                        hourglass_top
                                    </span>
                                    <span>~15 mins remaining</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Interactive Sidebar */}
                <aside className="w-[350px] lg:w-[400px] bg-[#18181b] border-l border-gray-800 flex flex-col z-10 shadow-xl">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-800">
                        <button className="flex-1 py-3 text-sm font-bold text-[#fcb040] border-b-2 border-[#fcb040] bg-[#fcb040]/5">
                            Live Interactions
                        </button>
                        <button className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            Ritual Guide
                        </button>
                    </div>

                    {/* Digital Puja Thali Action Area */}
                    <div className="p-4 border-b border-gray-800 bg-gradient-to-b from-[#18181b] to-[#121214]">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm text-[#fcb040]">
                                spa
                            </span>
                            Digital Offerings
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                            <button className="group relative aspect-square bg-[#27272a] rounded-xl hover:bg-[#fcb040]/20 hover:border-[#fcb040] border border-transparent transition-all flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                                    🌺
                                </span>
                                <span className="text-[10px] text-gray-400 group-hover:text-[#fcb040]">
                                    Pushp
                                </span>
                                {/* Particle effect placeholder */}
                                <span className="absolute inset-0 rounded-xl ring-2 ring-[#fcb040] opacity-0 group-active:animate-ping"></span>
                            </button>
                            <button className="group relative aspect-square bg-[#27272a] rounded-xl hover:bg-[#fcb040]/20 hover:border-[#fcb040] border border-transparent transition-all flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                                    🥥
                                </span>
                                <span className="text-[10px] text-gray-400 group-hover:text-[#fcb040]">
                                    Naivedya
                                </span>
                            </button>
                            <button className="group relative aspect-square bg-[#27272a] rounded-xl hover:bg-[#fcb040]/20 hover:border-[#fcb040] border border-transparent transition-all flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                                    🙏
                                </span>
                                <span className="text-[10px] text-gray-400 group-hover:text-[#fcb040]">
                                    Pranam
                                </span>
                            </button>
                            <button className="group relative aspect-square bg-[#27272a] rounded-xl hover:bg-[#fcb040]/20 hover:border-[#fcb040] border border-transparent transition-all flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                                    🔔
                                </span>
                                <span className="text-[10px] text-gray-400 group-hover:text-[#fcb040]">
                                    Ghanti
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Chat / Activity Feed */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {/* System Message */}
                        <div className="text-center my-4">
                            <span className="bg-gray-800 text-gray-400 text-[10px] px-3 py-1 rounded-full font-mono uppercase">
                                Puja Started at 09:00 AM IST
                            </span>
                        </div>
                        {/* Message 1 */}
                        <div className="flex gap-3 animate-fade-in-up">
                            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                R
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-bold text-gray-300">
                                        Rajiv (Brother)
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        09:05 AM
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 bg-[#27272a] p-2 rounded-r-lg rounded-bl-lg mt-0.5 border border-gray-700">
                                    Om Gan Ganpataye Namah 🙏 The decoration looks beautiful!
                                </p>
                            </div>
                        </div>
                        {/* Message 2 (Donation/Dakshina) */}
                        <div className="flex gap-3 animate-fade-in-up">
                            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                S
                            </div>
                            <div className="w-full">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-bold text-gray-300">
                                        Sunita Mami (USA)
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        09:12 AM
                                    </span>
                                </div>
                                <div className="mt-1 bg-gradient-to-r from-green-900/40 to-[#27272a] border border-green-800 p-2 rounded-r-lg rounded-bl-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-icons text-green-400 text-sm">
                                            paid
                                        </span>
                                        <span className="text-xs font-bold text-green-400">
                                            Sent Dakshina: $51.00
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        Blessings for the new home. Miss being there! ❤️
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Message 3 */}
                        <div className="flex gap-3 animate-fade-in-up">
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                A
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-bold text-gray-300">
                                        Amit (Cousin)
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        09:14 AM
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 bg-[#27272a] p-2 rounded-r-lg rounded-bl-lg mt-0.5 border border-gray-700">
                                    Pandit ji's chanting is so clear today. Great audio quality!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-4 border-t border-gray-800 bg-[#18181b]">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Send blessings or message..."
                                className="w-full bg-[#0f0f11] text-gray-200 text-sm rounded-full pl-4 pr-12 py-3 border border-gray-700 focus:border-[#fcb040] focus:ring-1 focus:ring-[#fcb040] outline-none transition-all placeholder-gray-600"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-[#fcb040] transition-colors">
                                    <span className="material-icons text-lg">paid</span>
                                </button>
                                <button className="p-1.5 rounded-full bg-[#fcb040] hover:bg-[#e09b35] text-black transition-colors">
                                    <span className="material-icons text-lg">
                                        send
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

// Add custom styles for animation and scrollbar if needed via a global CSS file or style tag
// For this snippet, standard tailwind utilities are used where possible.
