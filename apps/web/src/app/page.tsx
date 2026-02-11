import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HmarePanditJi — Book Verified Pandits for Every Sacred Occasion",
  description:
    "Book Aadhaar-verified Hindu priests for Griha Pravesh, Wedding, Satyanarayan, Mundan & more across Delhi-NCR. Guaranteed travel logistics. Zero cancellations.",
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left column */}
          <div className="lg:w-1/2">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              Authentic &amp; Trusted
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-black tracking-[-0.03em] text-slate-900 dark:text-slate-100 leading-[1.1] mb-6">
              Book Verified Pandits with{" "}
              <span className="text-primary">Guaranteed Travel</span> &amp; Backup
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-[#5e5241] dark:text-[#c4b49a] max-w-[540px] mb-8 leading-relaxed">
              India&rsquo;s first platform connecting families with Aadhaar-verified
              Hindu priests — seamless ceremonies, zero last-minute cancellations,
              door-to-door logistics. Delhi-NCR Phase 1.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href="/pandits"
                className="h-12 px-8 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-xl shadow-primary/30 transition-all text-sm"
              >
                <span className="material-symbols-outlined text-xl">calendar_add_on</span>
                Book Now
              </a>
              <button className="h-12 px-8 inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm">
                <span className="material-symbols-outlined text-xl">download</span>
                Download App
              </button>
            </div>

            {/* Social proof chips */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { icon: "shield", text: "Aadhaar Verified" },
                { icon: "support_agent", text: "24/7 Support" },
                { icon: "verified_user", text: "Background Checked" },
              ].map((chip) => (
                <div
                  key={chip.text}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm text-primary">{chip.icon}</span>
                  {chip.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right column — hero visual */}
          <div className="lg:w-1/2 relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:to-orange-950/40 shadow-2xl flex items-center justify-center overflow-hidden border border-amber-200/50 dark:border-amber-800/30">
              {/* Decorative background rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border-2 border-amber-200/40 dark:border-amber-700/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full border-2 border-amber-300/30 dark:border-amber-700/15" />
              </div>

              {/* Center content */}
              <div className="text-center relative z-10 p-8">
                <span
                  className="material-symbols-outlined text-[96px] text-amber-500 dark:text-amber-400 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  temple_hindu
                </span>
                <p className="text-amber-800 dark:text-amber-300 font-bold text-base mt-3">
                  Vedic Rituals by Expert Pandits
                </p>
                <p className="text-amber-600/70 dark:text-amber-500/70 text-sm mt-1">
                  Griha Pravesh · Vivah · Satyanarayan
                </p>

                {/* Floating ritual icons */}
                <div className="flex justify-center gap-4 mt-5">
                  {["auto_awesome", "favorite", "celebration"].map((icon) => (
                    <div
                      key={icon}
                      className="w-10 h-10 rounded-xl bg-white/60 dark:bg-amber-900/40 shadow-sm flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-base text-amber-600 dark:text-amber-400">
                        {icon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating verification card */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-700">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-green-600 dark:text-green-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Aadhaar Verified</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">100% Background Check</p>
              </div>
            </div>

            {/* Floating rating card */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 flex items-center gap-2 border border-slate-100 dark:border-slate-700">
              <span
                className="material-symbols-outlined text-orange-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">4.9 / 5</p>
                <p className="text-[10px] text-slate-500">50K+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Proposition ─────────────────────────────────────────────── */}
      <section
        id="families"
        className="bg-[#f0ece6] dark:bg-[#1a140d] py-20"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
              Our Value Proposition
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Everything that makes HmarePanditJi different from a simple directory listing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 — Aadhaar Trust */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-[#e6e1db] dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-xl text-primary">verified_user</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Aadhaar Verified Trust
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every pandit on our platform completes Aadhaar ID verification and a thorough background check. Know exactly who is coming to your home before you confirm the booking.
              </p>
            </div>

            {/* Card 2 — Logistics */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-[#e6e1db] dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-xl text-primary">commute</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Door-to-Door Logistics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We handle pandit travel — self-drive, train, or flight options with upfront pricing. No surprise charges, no excuses for missing your muhurat. Your ceremony starts on time.
              </p>
            </div>

            {/* Card 3 — Backup */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-[#e6e1db] dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-xl text-primary">sync_saved_locally</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                100% Uptime Backup
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                If your booked pandit cancels for any reason, we guarantee a qualified replacement within hours. Your ceremony will happen on your chosen muhurat — no matter what.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it Works ──────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
            Book in 3 Simple Steps
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            From search to ceremony — in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-0.5 bg-primary/20" />

          {[
            {
              step: "01",
              icon: "manage_search",
              title: "Find Your Pandit",
              desc: "Search by ritual, date, location and budget. View pandit profiles with ratings, experience and verified badges.",
            },
            {
              step: "02",
              icon: "calendar_add_on",
              title: "Confirm & Pay",
              desc: "Select travel mode, confirm muhurat, and pay securely via UPI or card. Instant booking confirmation on WhatsApp.",
            },
            {
              step: "03",
              icon: "celebration",
              title: "Sacred Ceremony",
              desc: "Your verified pandit arrives on time with all pooja samagri knowledge. Rate the experience after completion.",
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/30 relative z-10">
                <span className="material-symbols-outlined text-2xl text-white">{item.icon}</span>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-primary/60 mb-2">
                Step {item.step}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Proof Banner ───────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-3xl bg-primary p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
              Trusted by Thousands of Families
            </h2>
            <p className="text-white/80 text-sm max-w-md leading-relaxed">
              From Griha Pravesh to grand weddings — families across Delhi-NCR trust
              HmarePanditJi for their most sacred moments.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 md:gap-10 flex-shrink-0">
            {[
              { value: "50,000+", label: "Successful Ceremonies" },
              { value: "2,500+", label: "Verified Pandits" },
              { value: "40+", label: "Cities Covered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
                <p className="text-white/70 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Rituals ──────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
            Popular Rituals
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Authentic ceremonies performed with correct Vedic vidhi
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { icon: "home", name: "Griha Pravesh", price: "From ₹5,000", category: "GRIHA" },
            { icon: "favorite", name: "Satyanarayan Katha", price: "From ₹3,500", category: "PUJA" },
            { icon: "celebration", name: "Vivah Sanskar", price: "From ₹15,000", category: "WEDDING" },
            { icon: "child_care", name: "Namkaran", price: "From ₹2,000", category: "PUJA" },
            { icon: "bolt", name: "Rudrabhishek", price: "From ₹4,500", category: "PUJA" },
            { icon: "book", name: "Sunderkand Path", price: "From ₹3,000", category: "PUJA" },
            { icon: "brightness_5", name: "Shanti Path", price: "From ₹4,000", category: "SHANTI" },
            { icon: "cut", name: "Mundan Sanskar", price: "From ₹2,500", category: "PUJA" },
          ].map((ritual) => (
            <a
              key={ritual.name}
              href={`/rituals/${ritual.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-lg text-primary">{ritual.icon}</span>
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">{ritual.name}</p>
              <p className="text-xs text-primary font-medium mt-1">{ritual.price}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-primary/20 p-12 shadow-2xl text-center">
          <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span
              className="material-symbols-outlined text-3xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              celebration
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
            Ready to book your ceremony?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            Search from 2,500+ verified pandits across Delhi-NCR. Quick booking, guaranteed presence at your chosen muhurat.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/pandits"
              className="h-12 px-8 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-xl">calendar_add_on</span>
              Get Started Now
            </a>
            <a
              href="/contact"
              className="h-12 px-8 inline-flex items-center gap-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-all text-sm"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
