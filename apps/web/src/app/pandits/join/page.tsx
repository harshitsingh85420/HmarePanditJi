import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a Pandit — HmarePanditJi",
  description:
    "Partner with HmarePanditJi to grow your priestly practice. Get verified bookings, guaranteed payments, and travel logistics support.",
};

const PANDIT_APP_URL =
  process.env.NEXT_PUBLIC_PANDIT_URL ?? "http://localhost:3001";

const benefits = [
  {
    icon: "calendar_month",
    title: "Guaranteed Bookings",
    desc: "Receive verified bookings from families who have already paid. No more last-minute cancellations or non-payment.",
  },
  {
    icon: "commute",
    title: "Travel Logistics",
    desc: "We arrange and fund your travel — self-drive allowance, train or flight — so you can focus on the ceremony.",
  },
  {
    icon: "payments",
    title: "Timely Payments",
    desc: "Earnings are deposited directly to your bank account within 48 hours of ceremony completion.",
  },
  {
    icon: "verified_user",
    title: "Verified Badge",
    desc: "Get an Aadhaar-verified badge that builds trust with families and sets you apart from unlisted pandits.",
  },
  {
    icon: "star",
    title: "Grow Your Reputation",
    desc: "Collect ratings and reviews that help you rank higher and attract higher-value ceremonies over time.",
  },
  {
    icon: "support_agent",
    title: "24/7 Support",
    desc: "Our operations team is always available to help you with bookings, travel, and any last-minute issues.",
  },
];

const steps = [
  { step: "01", title: "Register", desc: "Create your pandit profile on our partner portal with your credentials and experience." },
  { step: "02", title: "Get Verified", desc: "Submit your Aadhaar and credentials for background verification. Takes 24–48 hours." },
  { step: "03", title: "Start Earning", desc: "Go live on the platform and start receiving bookings from families near you." },
];

export default function PanditsJoinPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16">

      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
          <span className="material-symbols-outlined text-sm">verified</span>
          Pandit Partner Programme
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-5">
          Grow Your Priestly Practice with <span className="text-primary">HmarePanditJi</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Join 2,500+ verified pandits earning consistently with guaranteed bookings,
          upfront travel funding, and timely payouts — all on one platform.
        </p>
        <a
          href={PANDIT_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-14 px-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-xl shadow-primary/30 transition-all text-base"
        >
          <span className="material-symbols-outlined text-xl">login</span>
          Open Pandit Portal
        </a>
        <p className="text-sm text-slate-400 mt-3">Free to join · No commission on first 3 bookings</p>
      </div>

      {/* Benefits */}
      <div className="mb-20">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 text-center mb-10">
          Why Partners Choose Us
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl text-primary">{b.icon}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{b.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-20 bg-[#f0ece6] dark:bg-[#1a140d] rounded-3xl p-10 md:p-14">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 text-center mb-10">
          How to Join
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <span className="text-white font-black text-lg">{s.step}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-white dark:bg-slate-900 border border-primary/20 rounded-3xl p-12 shadow-2xl">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
          Ready to join 2,500+ verified pandits?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Register on our Pandit Portal and start receiving bookings in your area.
        </p>
        <a
          href={PANDIT_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-xl">open_in_new</span>
          Register as a Pandit Partner
        </a>
      </div>
    </div>
  );
}
