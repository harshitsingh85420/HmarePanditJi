"use client";

import React, { useState } from "react";

export default function VoiceSearchPage() {
    const [isListening, setIsListening] = useState(false);

    return (
        <div className="bg-gray-50 text-gray-900 font-sans min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                                <span className="material-symbols-outlined text-[#f49d25] text-3xl">
                                    temple_hindu
                                </span>
                                <span className="font-bold text-xl tracking-tight text-gray-900">
                                    Hmare<span className="text-[#f49d25]">PanditJi</span>
                                </span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a
                                    className="border-[#f49d25] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    href="#"
                                >
                                    Home
                                </a>
                                <a
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    href="#"
                                >
                                    Muhurat
                                </a>
                                <a
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    href="#"
                                >
                                    Pujas
                                </a>
                                <a
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    href="#"
                                >
                                    Pandits
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                                <span className="sr-only">View notifications</span>
                                <span className="material-symbols-outlined">
                                    notifications
                                </span>
                            </button>
                            <div className="flex items-center gap-3">
                                <a
                                    className="text-sm font-medium text-gray-700 hover:text-gray-900 hidden sm:block"
                                    href="#"
                                >
                                    Login
                                </a>
                                <a
                                    className="bg-[#f49d25] hover:bg-[#d97f0a] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                                    href="#"
                                >
                                    Book Now
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Split Layout */}
            <div className="relative bg-[#fff8ed] overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-[#fff8ed] sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Authentic Vedic</span>{" "}
                                    <span className="block text-[#f49d25] xl:inline">
                                        Pandits for your Home
                                    </span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Connect with verified pandits for Griha Pravesh, Vivah,
                                    Satyanarayan Katha, and all Vedic rituals. Experience
                                    spirituality delivered with trust.
                                </p>

                                {/* Search Box Container */}
                                <div className="mt-8 sm:max-w-xl sm:mx-auto lg:mx-0 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 relative">
                                    <div className="absolute -top-3 right-4 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">
                                            mic
                                        </span>{" "}
                                        Voice Enabled
                                    </div>
                                    <form className="flex flex-col sm:flex-row gap-2">
                                        <div className="flex-1 relative flex items-center">
                                            <span className="absolute left-3 text-gray-400 material-symbols-outlined">
                                                search
                                            </span>
                                            <input
                                                aria-label="Search Puja"
                                                className="w-full pl-10 pr-12 py-3 rounded-xl border-gray-200 focus:border-[#f49d25] focus:ring-[#f49d25] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
                                                placeholder="Search for puja (e.g. Satyanarayan)"
                                                type="text"
                                            />
                                            <button
                                                aria-label="Use Voice Search"
                                                className="absolute right-2 p-2 rounded-full text-[#f49d25] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-[#f49d25] focus:ring-offset-2 transition-all group"
                                                title="Speak to Search"
                                                type="button"
                                                onClick={() => setIsListening(!isListening)}
                                            >
                                                <div className="relative">
                                                    <span className={`material-symbols-outlined text-3xl transition-transform ${isListening ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                        mic
                                                    </span>
                                                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f49d25]"></span>
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                        <div className="sm:w-32">
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-gray-400 material-symbols-outlined">
                                                    location_on
                                                </span>
                                                <select className="w-full pl-10 py-3 rounded-xl border-gray-200 focus:border-[#f49d25] focus:ring-[#f49d25] text-gray-900 bg-gray-50 focus:bg-white cursor-pointer appearance-none">
                                                    <option>Delhi</option>
                                                    <option>Mumbai</option>
                                                    <option>Bangalore</option>
                                                    <option>Varanasi</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            className="bg-[#f49d25] hover:bg-[#d97f0a] text-white px-6 py-3 rounded-xl font-medium shadow-md transition-colors flex items-center justify-center gap-2"
                                            type="submit"
                                        >
                                            <span>Find</span>
                                        </button>
                                    </form>
                                    <div className="mt-2 px-2 flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                            Tip
                                        </span>
                                        <span>
                                            Press the{" "}
                                            <span className="font-bold text-[#f49d25]">
                                                mic button
                                            </span>{" "}
                                            to speak in Hindi or English
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <span
                                            className="material-symbols-outlined text-green-500 text-lg filled"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            verified
                                        </span>
                                        <span>100% Verified Pandits</span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1">
                                        <span
                                            className="material-symbols-outlined text-yellow-500 text-lg filled"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            star
                                        </span>
                                        <span>4.8/5 Average Rating</span>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                {/* Right Image Background */}
                <div
                    className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBB9iSrTDDoRQBD42vUgOe8V26Svx_ndyxLzmYoBye2uw72oCmn8Yss5M2hwGlj2DIWYMn8oa8_U5qOWqa17zzk0OZN-wG35JA71-NQ7__LHhRjSeDBWdcl-dvs_WkHsK5VEga8gyLLkscHgMEnnKy5HrXXpO-ULhfG9mtAgvhLMRLBBGHC4RJfzVjdS_e5aPjkbQa4OKqYxvSZOivimgvpznRbUrM8xDegZl6k1b3XR0DwQL7mn_NMikGBwShDMdfn6RmMcG4315Y')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#fff8ed] to-transparent lg:via-[#fff8ed]/20"></div>
                </div>
            </div>

            {/* Content Section: Calendar & Services */}
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Auspicious Dates Card */}
                        <div className="w-full md:w-1/3">
                            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#f49d25]">
                                            calendar_month
                                        </span>
                                        Auspicious Dates
                                    </h3>
                                    <span className="text-xs font-medium bg-white px-2 py-1 rounded text-[#f49d25] border border-orange-100">
                                        Feb 2026
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-[#f49d25] transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 text-[#f49d25] w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold leading-none">
                                                <span className="text-xs">FEB</span>
                                                <span className="text-lg">15</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Vivah Muhurat
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Shubh Lagna Available
                                                </p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-[#f49d25]">
                                            chevron_right
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-[#f49d25] transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 text-[#f49d25] w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold leading-none">
                                                <span className="text-xs">FEB</span>
                                                <span className="text-lg">18</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Griha Pravesh
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Amrit Siddhi Yoga
                                                </p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-[#f49d25]">
                                            chevron_right
                                        </span>
                                    </div>
                                </div>
                                <a
                                    className="mt-4 text-sm text-[#f49d25] font-medium flex items-center hover:underline"
                                    href="#"
                                >
                                    View Full Calendar{" "}
                                    <span className="material-symbols-outlined text-sm ml-1">
                                        arrow_forward
                                    </span>
                                </a>
                            </div>
                        </div>

                        {/* Popular Services Grid */}
                        <div className="w-full md:w-2/3">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Popular Puja Services
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    {
                                        name: "Griha Pravesh",
                                        price: "Starting ₹2100",
                                        icon: "home_work",
                                    },
                                    {
                                        name: "Vivah Sanskar",
                                        price: "Starting ₹11000",
                                        icon: "diversity_3",
                                    },
                                    {
                                        name: "Satyanarayan",
                                        price: "Starting ₹1500",
                                        icon: "menu_book",
                                    },
                                    {
                                        name: "Havan",
                                        price: "Starting ₹2500",
                                        icon: "local_fire_department",
                                    },
                                ].map((service, index) => (
                                    <div key={index} className="group cursor-pointer">
                                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center hover:bg-orange-50 hover:shadow-md transition-all border border-transparent hover:border-orange-100 h-full">
                                            <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-3xl text-[#f49d25]">
                                                    {service.icon}
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-gray-900">
                                                {service.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {service.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verified Pandits List */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Verified Pandits Near You
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Experienced Vedic scholars ready to visit your home
                            </p>
                        </div>
                        <a
                            className="text-[#f49d25] font-medium text-sm hover:underline hidden sm:block"
                            href="#"
                        >
                            View All Pandits
                        </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Pandit 1 */}
                        <PanditCard
                            name="Pt. Rajesh Sharma"
                            location="Varanasi"
                            exp="15 Yrs Exp"
                            rating="4.9"
                            reviews="124"
                            languages={["Hindi", "Sanskrit", "English"]}
                            price="₹2,100"
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCvOYUbvoCqLhczardoP4jaq3NjY-m1_CIr5V8igZ_HH_zqv3sx0MXgdT1EXyhT5FPGbWE48Tg68aRvFBrXffzsEXiR5Y13tS-DSn5DvC20TaNFE6UUYsnf9BO4iXIsOvI0dpR3EgCaoFHSi2JkdJgsxnceaprOeOe7jm9ybY7VHN_rnIkGyPf8DT7c1XE8hsykPrhktaZxOm3NYpOtyo4YwM6UqRl84qwMQnLQBCsEVgfEiCneqv7tBk_pojQVNVvQESxgY1aq32w"
                        />
                        {/* Pandit 2 */}
                        <PanditCard
                            name="Acharya Vivek"
                            location="Delhi NCR"
                            exp="8 Yrs Exp"
                            rating="4.7"
                            reviews="89"
                            languages={["Hindi", "Maithili"]}
                            price="₹1,500"
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDYfGNFBwChxST0_xNEcGReyPs-Zf-yWlCvvKI3f5LPK9El7PZ_Q9SdRr83VrmjEwr9k-Bg8l-bNAgxEidsErOkvjKsRLiHORgLjXSOwy00l0t79gYBHvTiGTCKrF8ck9jelQ6fd8jv7gNmpGtj4rVsTk1itOuGptBzXzkw45DUVQlBSogbv3-orQi4Sv4QdKEtwBOjhk0qTyaN3pZ5QPM9XhHS0idqE8XnJLlGH6MqVZvXpceXwwUg2oP-JFf_OHsj28kJHDbm9SM"
                        />
                        {/* Pandit 3 */}
                        <PanditCard
                            name="Shastri Mohan"
                            location="Bangalore"
                            exp="22 Yrs Exp"
                            rating="5.0"
                            reviews="210"
                            languages={["Hindi", "Kannada", "Tamil"]}
                            price="₹3,100"
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCfbLJVipeUqgr90zPMWyzN-RamO_tQrWsGjCzrtyIPYVjni8cJ8rGwPt2_HestoVK6lxljthJiwENKoUcd1ymDA2Xv1sW0Dd8X_q7OpnCT6K82rj58Vxt0gj7dwllp0YYOFLwbJEnw9BqvHH61HkCmnHYr9J-2KvaVucBrRPZRRnWglfCi8qs8U4289fuG6x64wxRxx1k7JyF10Y50B2DO-wgU7vnTgtjvyWEgkJyS3A8BRx3QuKCO4o5QCVAPPTUPIKXQ8FQh4yo"
                            className="hidden lg:block"
                        />
                    </div>
                    <div className="mt-8 text-center sm:hidden">
                        <a
                            className="w-full py-3 rounded-lg border border-[#f49d25] text-[#f49d25] font-medium block hover:bg-orange-50 transition-colors"
                            href="#"
                        >
                            View All Pandits
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#f49d25] text-3xl">
                                temple_hindu
                            </span>
                            <span className="font-bold text-xl">
                                Hmare<span className="text-[#f49d25]">PanditJi</span>
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm max-w-sm">
                            Bringing the sanctity of Vedic rituals to your doorstep. Verified
                            pandits, transparent pricing, and managed logistics for a divine
                            experience.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>
                                <a className="hover:text-white" href="#">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-white" href="#">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-white" href="#">
                                    Careers
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function PanditCard({
    name,
    location,
    exp,
    rating,
    reviews,
    languages,
    price,
    image,
    className = "",
}: {
    name: string;
    location: string;
    exp: string;
    rating: string;
    reviews: string;
    languages: string[];
    price: string;
    image: string;
    className?: string;
}) {
    return (
        <div
            className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden ${className}`}
        >
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <img
                        alt="Pandit Ji"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#f49d25]"
                        src={image}
                    />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-900">{name}</h3>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <span
                                    className="material-symbols-outlined text-[14px] filled"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    verified
                                </span>{" "}
                                Verified
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {location} • {exp}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <span
                                className="material-symbols-outlined text-yellow-400 text-sm filled"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                star
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {rating}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({reviews} reviews)
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {languages.map((lang) => (
                        <span
                            key={lang}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                        >
                            {lang}
                        </span>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Dakshina from</p>
                        <p className="font-bold text-gray-900">{price}</p>
                    </div>
                    <button className="w-full bg-orange-50 hover:bg-orange-100 text-[#f49d25] font-medium py-2 rounded-lg text-sm transition-colors">
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
