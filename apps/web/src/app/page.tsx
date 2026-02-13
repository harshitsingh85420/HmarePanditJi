import type { Metadata } from "next";
import { QuickSearch } from "../components/home/quick-search";
import { MuhuratExplorer } from "../components/home/muhurat-explorer";
import { FeaturedPandits } from "../components/home/featured-pandits";

export const metadata: Metadata = {
  title: "HmarePanditJi — Book Verified Pandits for Every Sacred Occasion",
  description:
    "Book Aadhaar-verified Hindu priests for Griha Pravesh, Wedding, Satyanarayan, Mundan & more across Delhi-NCR. Transparent pricing. Travel managed. Zero cancellations.",
};

export default function HomePage() {
  return (
    <>
      {/* ── 1. Hero Section ───────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-[-0.03em] text-slate-900 dark:text-slate-100 leading-[1.1] mb-5">
            Book Verified Pandits for{" "}
            <span className="text-primary">Every Sacred Occasion</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Search All India &bull; Transparent Pricing &bull; Travel Managed
          </p>
        </div>

        {/* Quick Search Bar */}
        <div className="max-w-4xl mx-auto">
          <QuickSearch />
          <p className="text-xs text-slate-400 text-center mt-3">
            No registration needed to explore
          </p>
        </div>
      </section>

      {/* ── 2. How It Works ───────────────────────────────────────────────── */}
      <section className="bg-[#f0ece6] dark:bg-[#1a140d] py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
              How It Works
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              From search to ceremony — in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dotted connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] border-t-2 border-dashed border-primary/30" />

            {[
              {
                step: "01",
                icon: "search",
                title: "Search & Choose",
                desc: "Browse verified Pandits by puja type, location, and muhurat dates. Compare ratings and pricing.",
              },
              {
                step: "02",
                icon: "event_available",
                title: "Book & Pay",
                desc: "Secure booking with transparent pricing. We handle travel logistics — train, flight, or cab.",
              },
              {
                step: "03",
                icon: "auto_awesome",
                title: "Celebrate",
                desc: "Your verified Pandit Ji arrives on time. Focus on your ceremony, we take care of the rest.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/30 relative z-10">
                  <span className="material-symbols-outlined text-3xl text-white">
                    {item.icon}
                  </span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-primary/60 mb-2">
                  Step {item.step}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Muhurat Explorer ────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — text */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-2xl text-primary">
                calendar_month
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                Muhurat Explorer
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-lg">
              Find auspicious dates for your ceremony. Our muhurat calendar highlights
              the best dates for Vivah, Griha Pravesh, Mundan, Satyanarayan Katha and
              more — sourced from DrikPanchang.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Vivah", "Griha Pravesh", "Mundan", "Satyanarayan", "Havan"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Right — calendar widget */}
          <MuhuratExplorer />
        </div>
      </section>

      {/* ── 4. Featured Pandits ────────────────────────────────────────────── */}
      <section className="bg-[#f0ece6] dark:bg-[#1a140d] py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
                Our Highly Rated Pandits
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Verified, experienced, and trusted by families across Delhi-NCR
              </p>
            </div>
            <a
              href="/search"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View All Pandits
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>

          <FeaturedPandits />

          <div className="sm:hidden text-center mt-6">
            <a
              href="/search"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              View All Pandits
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 5. Stats Bar ──────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "verified_user", value: "100+", label: "Verified Pandits" },
              { icon: "star", value: "4.8\u2605", label: "Average Rating" },
              { icon: "currency_rupee", value: "\u20B90", label: "Hidden Costs" },
              { icon: "flight", value: "100%", label: "Travel Managed" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-xl text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {stat.icon}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Trust Section ──────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
            Why Families Trust HmarePanditJi
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Every detail is designed to give you peace of mind for your most sacred moments.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "verified_user",
              title: "Verified & Authenticated",
              desc: "Aadhaar + Video KYC verification for every Pandit. Know exactly who is coming to your home before you confirm.",
            },
            {
              icon: "receipt_long",
              title: "Transparent Pricing",
              desc: "Complete breakdown before you pay. Dakshina, travel, platform fee — everything upfront. No surprises, no hidden charges.",
            },
            {
              icon: "commute",
              title: "Travel Managed",
              desc: "We handle train, flight, and cab bookings for outstation Pandits. Upfront pricing, guaranteed arrival at your muhurat.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <span
                  className="material-symbols-outlined text-xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {card.icon}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
