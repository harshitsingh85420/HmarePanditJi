"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../context/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main className="max-w-[1280px] mx-auto w-full px-4 md:px-10 lg:px-40 py-8 bg-[#f8f7f5] dark:bg-[#221a10] min-h-screen">
      {/* Hero Section */}
      <section
        className="relative mb-12 rounded-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAENADsPUGYYRX8W7ZPPo9bObLv_ggsJP2f-dmHDI92bS6Rzsi1Mbz4l-cUAoxtpi4n7yUCq97yhJqpnagNiuHIpWnq6ItOFQssDwThF_SmIaOELlZ7372cnXUhu65Lxko0wLJUAplsu_-UFRF_wsIoKQdvB7I55W1w-NrjHmPqLPrAL5irNlfDAAeO9W0vf30hUVi53KNPBdmv796DvWjphasvINlrZHZ7M3qYu4kI1BbKyCbY4VzoY4Zsh8jIu7hLYOkJgtzDWIE")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-white text-4xl md:text-5xl font-black mb-4">
          Find the Perfect Pandit for Your Puja
        </h1>
        <p className="text-white/90 text-lg mb-8 max-w-2xl">
          Professional religious services with end-to-end travel and logistics
          across India.
        </p>
        <div className="w-full max-w-2xl bg-white dark:bg-[#221a10] p-2 rounded-xl shadow-2xl flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
            <span className="material-symbols-outlined text-[#8a7960]">
              search
            </span>
            <input
              className="w-full border-none focus:ring-0 bg-transparent text-sm py-3 text-slate-900 dark:text-white"
              placeholder="Which puja are you planning?"
            />
          </div>
          <div className="flex items-center px-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8a7960] uppercase">
                Search All India
              </span>
              <div
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#f49d25] cursor-pointer"
              >
                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition"></span>
              </div>
            </div>
            <Link
              href="/search"
              className="bg-[#f49d25] hover:bg-[#f49d25]/90 text-black font-bold py-2 px-6 rounded-lg text-sm transition-all whitespace-nowrap flex items-center justify-center"
            >
              Explore Now
            </Link>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-white/80 text-sm">Or use voice search:</span>
          {/* This button could trigger the voice modal */}
          <button className="size-12 rounded-full bg-[#f49d25] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
            <span className="material-symbols-outlined">mic</span>
          </button>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Popular Services
          </h2>
          <Link
            href="/search"
            className="text-[#f49d25] font-semibold text-sm hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Wedding", icon: "favorite" },
            { label: "Griha Pravesh", icon: "home" },
            { label: "Satyanarayan", icon: "festival" },
            { label: "Namkaran", icon: "child_care" },
            { label: "Vidhya Arambha", icon: "auto_stories" },
            { label: "More", icon: "more_horiz" },
          ].map((item, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="aspect-square rounded-2xl bg-[#fdf5e8] dark:bg-[#3a2f1f] flex flex-col items-center justify-center gap-3 border-2 border-transparent group-hover:border-[#f49d25] transition-all">
                <span className="material-symbols-outlined text-4xl text-[#f49d25]">
                  {item.icon}
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Muhurat Explorer */}
      <section className="mb-16">
        <div className="bg-white dark:bg-[#221a10] rounded-2xl border border-[#e6e1db] dark:border-[#3a2f1f] p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Muhurat Explorer
              </h2>
              <p className="text-[#8a7960] text-sm">
                Find auspicious dates for your upcoming ceremonies
              </p>
            </div>
            <div className="flex items-center gap-4 bg-[#f5f3f0] dark:bg-[#3a2f1f] p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md bg-white dark:bg-[#221a10] shadow-sm text-sm font-bold text-slate-900 dark:text-white">
                Monthly
              </button>
              <button className="px-4 py-1.5 rounded-md text-[#8a7960] text-sm font-bold">
                Weekly
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-[#e6e1db] dark:bg-[#3a2f1f] rounded-xl overflow-hidden border border-[#e6e1db] dark:border-[#3a2f1f]">
            {/* Calendar Header */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-[#fdfcfb] dark:bg-[#2a2216] py-3 text-center text-xs font-bold uppercase text-[#8a7960]"
              >
                {day}
              </div>
            ))}
            {/* Calendar Days (Mockup) */}
            <div className="bg-white dark:bg-[#221a10] min-h-[100px] p-2 text-gray-400">
              29
            </div>
            <div className="bg-white dark:bg-[#221a10] min-h-[100px] p-2 text-gray-400">
              30
            </div>
            <div className="bg-white dark:bg-[#221a10] min-h-[100px] p-2 text-slate-900 dark:text-white">
              1
            </div>
            <div className="bg-white dark:bg-[#221a10] min-h-[100px] p-2 text-slate-900 dark:text-white">
              2
            </div>
            <div className="bg-[#fdf5e8] dark:bg-[#f49d25]/10 min-h-[100px] p-2 border-2 border-[#f49d25]">
              <span className="font-bold text-slate-900 dark:text-white">3</span>
              <div className="mt-2 space-y-1">
                <span className="block bg-[#f49d25] text-white text-[10px] font-bold px-1 py-0.5 rounded leading-none">
                  Wedding
                </span>
                <span className="block bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 text-[10px] font-bold px-1 py-0.5 rounded leading-none">
                  Griha Pravesh
                </span>
              </div>
            </div>
            {[4, 5, 6, 7, 8].map((d) => (
              <div
                key={d}
                className="bg-white dark:bg-[#221a10] min-h-[100px] p-2 text-slate-900 dark:text-white"
              >
                {d}
              </div>
            ))}
            <div className="bg-[#fdf5e8] dark:bg-[#f49d25]/10 min-h-[100px] p-2">
              <span className="font-bold text-[#f49d25]">9</span>
              <div className="mt-2">
                <span className="block bg-[#f49d25] text-white text-[10px] font-bold px-1 py-0.5 rounded leading-none text-center">
                  Navratri Start
                </span>
              </div>
            </div>
            {[10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((d) => (
              <div
                key={d}
                className="bg-white dark:bg-[#221a10] min-h-[100px] p-2 text-slate-900 dark:text-white"
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pandits */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Highly Rated Pandits
          </h2>
          <div className="flex gap-2">
            <button className="size-10 rounded-full border border-[#e6e1db] dark:border-[#3a2f1f] flex items-center justify-center hover:bg-white dark:hover:bg-[#3a2f1f] transition-colors text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="size-10 rounded-full border border-[#e6e1db] dark:border-[#3a2f1f] flex items-center justify-center hover:bg-white dark:hover:bg-[#3a2f1f] transition-colors text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Pandit Sharma Ji",
              spec: "Vedic Astrology & Weddings",
              rating: 4.9,
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0gilJzZZBjbdG1_-a7y9QqKsMtncPw0rhX2J-FNqMNKNWhVgUjPsJ9HXoiDYe-SF6wBoGu5OTUGYX9GPuqNovU2F-_IhMKz3YpYyntRsERGLGMnSwoVT0rmBORPQtmOVvhS2SvHSL_yiKm9PYrqEfR7TfpZzcfp4rvlWqrBPD4D9z3JjYwoyEzATRGmaT74BsOzScZIOu7RNsuSCYNaOXZT8Np9TZJVFqSvw3pW3XnfyHl-2rsWmEzWiUoIBC3zfBUTiKE3HPXqo",
            },
            {
              name: "Acharya Manoj Pathak",
              spec: "Griha Pravesh & Shanti Puja",
              rating: 4.8,
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEYU6iXqJ1Vjsnf8MeJbW_M9W7UYoqQ7UhDbHjP-uhuw__ayLodE8KscwxFyWnu_JAkzf6EurY9AnxyYlVW3sBDuHmQGpzjmfCxfDknwkH-FJZpSvL9GchAiU_r6NjaBT6o9z5IRIlMzjoCFEDUM4eDufUUN8fbyTV00Wrp-EMWrmUqU2VdvHhoIu6DCrRSR_8Uj5MN46vhX3ZSigsVVrxYAgJa_tCvSTRtgqJXSURXalBbLcYy6jS-IWBLwyNAMsZTF3qxrkw6uI",
            },
            {
              name: "Pandit Rajesh Dixit",
              spec: "Bhagwat Katha & Havan",
              rating: 5.0,
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8-zW6_51dECd9HoZ-2avrMCsqKLAkNl6OrjbjYlftnjWEzzmq3H6125vwiQ61eIb4-HDjJ6DnWsvlZ4VVRUgewfsMS8RjYJkUCpa1d26e5EptwC3Bi_Ax-c_ChZmJLSijfjMa8K1ndFbCxea213ex5-wDpQvEsj3D-s6q8q6kfYHP4BAy5NJIGc8ajOXPelI_b4_AHB3skcjo-TVaLu6kJqA5YpXY0iFjwWNSAdrYX_6iT-M3dKAXZFg0SMSoVupcGKd_7KTiBI8",
            },
            {
              name: "Acharya Vinay Tiwari",
              spec: "Astrology & Matchmaking",
              rating: 4.7,
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxFL8pLsvu4LqHfcqV8hyBP9CzqCTrNXGPLxQoXxz3q3uZ4abiMxbwKz-RTOrDfWtK8ewpj3RAqFp6sVkyGwW_cioJRtcQ1bkQEKXlua8-q9BDX8N8IbkUDEXXonrUYqCmqzn6lYWnMK-3P7DA7MdrtGYMwHTh25cF0bAdnRyibNwxYtd4Q4gsqsbNWhq6Ks6f81Wv_kIAwflqVjrvk6xmBLBf_62m4hCfsQOwt1LuA77-4fiVnGOklkdu6xDk3NPZFlrFwKmvedI",
            },
          ].map((pandit, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#2a2216] rounded-2xl overflow-hidden border border-[#e6e1db] dark:border-[#3a2f1f] group"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  alt="Pandit profile"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={pandit.img}
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-[#221a10]/90 backdrop-blur px-2 py-1 rounded text-xs font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                  <span className="material-symbols-outlined text-xs text-[#f49d25] fill-1">
                    star
                  </span>{" "}
                  {pandit.rating}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">
                  {pandit.name}
                </h3>
                <p className="text-[#8a7960] text-sm mb-3">{pandit.spec}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-0.5 bg-[#f5f3f0] dark:bg-[#3a2f1f] text-slate-600 dark:text-slate-300 rounded">
                    10+ Yrs Exp
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-[#f5f3f0] dark:bg-[#3a2f1f] text-slate-600 dark:text-slate-300 rounded">
                    Verified
                  </span>
                </div>
                <Link
                  href="/pandits/p1"
                  className="w-full block text-center py-2.5 rounded-lg border-2 border-[#f49d25] text-[#f49d25] font-bold text-sm hover:bg-[#f49d25] hover:text-white transition-all"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
