import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — HmarePanditJi",
  description:
    "HmarePanditJi is India's first platform connecting families with Aadhaar-verified Hindu priests. Learn our story, mission, and why Delhi-NCR families trust us.",
};

const TEAM = [
  { name: "Founders' Mission", role: "Why We Built This", bio: "After witnessing a pandit cancel 2 hours before a Griha Pravesh ceremony, our founders set out to build a platform where verified priests and guaranteed logistics are the standard — not the exception." },
  { name: "Our Verification Promise", role: "Aadhaar + Background Check", bio: "Every pandit on HmarePanditJi completes Aadhaar verification, video KYC, and an academic credential review before their first booking. No exceptions." },
  { name: "Travel Logistics", role: "Door-to-Door Coverage", bio: "We handle pandit travel for every outstation booking — car, train, or flight — with upfront pricing and zero cancellations from our side." },
];

export default function AboutPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>temple_hindu</span>
          Our Story
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          About HmarePanditJi
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          India's first platform for booking Aadhaar-verified Hindu priests with integrated travel logistics and a zero-cancellation guarantee.
        </p>
      </div>

      {/* Mission section */}
      <div className="bg-primary rounded-3xl p-10 md:p-16 text-white mb-16">
        <h2 className="text-2xl md:text-3xl font-black mb-4">Our Mission</h2>
        <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-3xl">
          Sacred ceremonies deserve sacred reliability. We believe every Indian family should be able to book a qualified, verified pandit for their most important life moments — without anxiety, without last-minute cancellations, and without hidden costs. HmarePanditJi makes this possible through rigorous pandit vetting, transparent pricing, and guaranteed travel logistics.
        </p>
      </div>

      {/* What makes us different */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: "verified_user", title: "Aadhaar Verified", desc: "Every pandit completes Aadhaar ID verification, video KYC, and a background check before joining our platform." },
          { icon: "commute", title: "Travel Guaranteed", desc: "We book and pay for pandit travel to outstation ceremonies. Car, train, or flight — the pandit always arrives." },
          { icon: "backup", title: "Backup Assurance", desc: "If a pandit cancels for any reason, we place a qualified replacement within hours. Your muhurat is sacred." },
        ].map((item) => (
          <div key={item.title} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-xl text-primary">{item.icon}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Story cards */}
      <div className="space-y-6 mb-16">
        {TEAM.map((card) => (
          <div key={card.name} className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{card.role}</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">{card.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{card.bio}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        {[
          { value: "50,000+", label: "Ceremonies Completed" },
          { value: "2,500+", label: "Verified Pandits" },
          { value: "Delhi-NCR", label: "Phase 1 Region" },
        ].map((stat) => (
          <div key={stat.label} className="text-center bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <p className="text-3xl font-black text-primary">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <a
          href="/pandits"
          className="h-12 px-8 inline-flex items-center gap-2 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">calendar_add_on</span>
          Book Your Ceremony
        </a>
      </div>
    </div>
  );
}
