import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "HmarePanditJi | Book Verified Pandits & Sacred Rituals",
  description:
    "Experience seamless spiritual ceremonies with Aadhaar-verified experts and automated door-to-door logistics. We ensure your Mahurat is never missed.",
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-20 py-12 md:py-24">
        <div className="flex flex-col gap-10 lg:flex-row items-center">
          <div className="flex flex-col gap-8 lg:w-1/2">
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary w-fit">
                <span className="material-symbols-outlined text-base">
                  verified
                </span>{" "}
                Authentic & Trusted
              </span>
              <h1 className="text-4xl font-black leading-tight tracking-[-0.03em] md:text-6xl text-[#181511] dark:text-white">
                Book Verified Pandits with{" "}
                <span className="text-primary">Guaranteed Travel</span> & Backup
              </h1>
              <p className="text-lg leading-relaxed text-[#5e5241] dark:text-slate-300 max-w-[540px]">
                Experience seamless spiritual ceremonies with Aadhaar-verified
                experts and automated door-to-door logistics. We ensure your
                Mahurat is never missed.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/search"
                className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all"
              >
                <span>Book Now</span>
              </Link>
              <button className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center rounded-lg border-2 border-[#e6e1db] dark:border-white/20 px-6 text-base font-bold text-[#181511] dark:text-white hover:bg-white dark:hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined mr-2">download</span>{" "}
                Download App
              </button>
            </div>
          </div>
          <div className="relative w-full lg:w-1/2">
            <div className="aspect-square w-full rounded-2xl bg-slate-200 dark:bg-slate-800 shadow-2xl overflow-hidden relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9eBptz8ZTcYEfLp7QaWTwx71FtJLHedZaiC6Q9u8h8X2XVRO3K0xoSc36Ees7qgjcj7LqHegKBh0dvxURu9dzAXxLBn4F7XSIE_Y-YyPEyIVNDICukJ-LUQZFTUdC4fjZE0UubuvKQwVBDg3RVKY_rvSsQlyuglILEVi3L32RXKK4u3vhtYEhFAuHMkmCPRYCLOh1QxjK9x8BSzxez8ER1f4hdG-JLJ1J9hZBOVOicfdcUzxQEfmPSwaZFzI94_aecKdBvTItMxM"
                alt="A Hindu priest performing a sacred fire ritual or havan"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            {/* Badge overlay */}
            <div className="absolute -bottom-6 -left-6 hidden md:block rounded-xl bg-white dark:bg-[#221a10] p-6 shadow-xl border border-[#e6e1db] dark:border-white/10 z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#181511] dark:text-white">
                    Aadhaar Verified
                  </p>
                  <p className="text-xs text-[#8a7960]">
                    100% Background Check
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Proposition ────────────────────────────────────────────── */}
      <section className="bg-[#f0ece6] dark:bg-[#1a140d] py-20 px-6 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-16 flex flex-col items-center text-center gap-4">
            <h2 className="text-3xl font-black text-[#181511] dark:text-white md:text-4xl">
              Our Value Proposition
            </h2>
            <p className="text-base text-[#8a7960] max-w-[600px]">
              Ensuring a seamless religious experience through technology,
              punctuality, and trust.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Aadhaar Verified Trust",
                desc: "Every Pandit undergoes rigorous Aadhaar verification and professional background checks for your absolute safety.",
                icon: "verified_user",
              },
              {
                title: "Door-to-Door Logistics",
                desc: "We handle all travel arrangements through our automated logistics platform, ensuring punctuality and stress-free arrival.",
                icon: "commute",
              },
              {
                title: "100% Uptime Backup",
                desc: "Never miss a mahurat. We maintain a standby Pandit network ready to fill in for every booking in case of emergencies.",
                icon: "sync_saved_locally",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-[#221a10] p-8 shadow-sm border border-[#e6e1db] dark:border-white/10 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    {item.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#181511] dark:text-white">
                  {item.title}
                </h3>
                <p className="text-[#8a7960] dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof Section ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-20 py-24">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-3xl bg-primary p-10 md:p-16 relative overflow-hidden">
          <div className="flex flex-col gap-4 max-w-[400px] relative z-10">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              Trusted by Thousands of Families
            </h2>
            <p className="text-white/80 font-medium">
              Spreading spiritual harmony across the nation through reliable
              service.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 relative z-10">
            <div className="text-center md:text-left">
              <p className="text-4xl font-black text-white">50,000+</p>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wide">
                Successful Ceremonies
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-4xl font-black text-white">2,500+</p>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wide">
                Verified Pandits
              </p>
            </div>
            <div className="text-center md:text-left col-span-2 md:col-span-1">
              <p className="text-4xl font-black text-white">40+</p>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wide">
                Cities Covered
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1280px] px-6 lg:px-20 py-20 text-center">
        <div className="flex flex-col items-center gap-8 rounded-3xl bg-white dark:bg-[#2d2419] border border-primary/20 p-12 md:py-24 shadow-2xl">
          <div className="flex flex-col gap-4 items-center">
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-4xl">
                celebration
              </span>
            </div>
            <h2 className="text-3xl font-black text-[#181511] dark:text-white md:text-5xl">
              Ready to book your ceremony?
            </h2>
            <p className="text-lg text-[#8a7960] max-w-[600px]">
              Join thousands of families who trust HmarePanditJi for their sacred
              rituals and auspicious beginnings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/search"
              className="flex h-14 min-w-[200px] cursor-pointer items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <span>Get Started Now</span>
            </Link>
            <Link
              href="/contact"
              className="flex h-14 min-w-[200px] cursor-pointer items-center justify-center rounded-xl border-2 border-primary/30 px-8 text-lg font-bold text-primary hover:bg-primary/5 transition-all"
            >
              <span>Contact Sales</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
