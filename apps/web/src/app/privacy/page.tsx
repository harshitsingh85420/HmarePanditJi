import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — HmarePanditJi",
  description: "HmarePanditJi Privacy Policy. How we collect, use, and protect your personal data in compliance with Indian law.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect the following information when you use HmarePanditJi:
• Personal identification: name, mobile number, email address
• Location data: city and address for ceremony booking
• Payment information: processed securely via Razorpay; we do not store card details
• Usage data: pages visited, search queries, and booking history
• For pandits: Aadhaar number (for verification only, not stored after KYC), photos, and academic credentials`,
  },
  {
    title: "2. How We Use Your Information",
    body: `Your information is used to:
• Process and confirm bookings
• Match you with verified pandits
• Coordinate travel logistics for pandit arrivals
• Send booking confirmations and updates via SMS and WhatsApp
• Improve our platform through aggregated analytics
• Comply with Indian legal requirements including GST invoicing`,
  },
  {
    title: "3. Data Sharing",
    body: `We share your information only as necessary:
• With the assigned pandit (name and ceremony address) for confirmed bookings
• With travel providers to arrange pandit transportation
• With payment processor (Razorpay) for transaction processing
• With SMS/WhatsApp providers for booking notifications
We do not sell your personal data to third parties.`,
  },
  {
    title: "4. Data Security",
    body: `We implement industry-standard security measures including HTTPS encryption, database access controls, and regular security audits. Aadhaar numbers are processed only for KYC verification and are not stored on our servers.`,
  },
  {
    title: "5. Your Rights",
    body: `You have the right to:
• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your account and associated data
• Opt out of marketing communications at any time
Contact us at privacy@hmarepanditji.com to exercise these rights.`,
  },
  {
    title: "6. Cookies",
    body: `We use essential cookies for authentication and session management. We use analytics cookies (Google Analytics 4 and Microsoft Clarity) to understand how users interact with our platform. You can opt out of analytics tracking in your browser settings.`,
  },
  {
    title: "7. Children's Privacy",
    body: `Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal information, contact us immediately.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this Privacy Policy periodically. We will notify registered users of material changes via SMS. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">Privacy Policy</h1>
        <p className="text-slate-500 text-sm">Last updated: January 2025 · In compliance with IT Act 2000 and DPDP Act 2023</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-10">
        <p className="text-sm text-primary font-medium">
          आपकी गोपनीयता हमारी प्राथमिकता है — Your privacy matters to us. We only collect what we need to serve you.
        </p>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.title} className="border-b border-slate-100 dark:border-slate-800 pb-8 last:border-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">{section.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          For privacy-related inquiries, contact us at{" "}
          <a href="mailto:privacy@hmarepanditji.com" className="text-primary hover:underline">
            privacy@hmarepanditji.com
          </a>
        </p>
      </div>
    </div>
  );
}
