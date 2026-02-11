import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — HmarePanditJi",
  description: "HmarePanditJi Terms of Service. Read our policies for customers, pandits, and the use of our platform.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using HmarePanditJi ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Platform. These terms apply to all users — customers booking pandits, pandits registering on the platform, and visitors.`,
  },
  {
    title: "2. Platform Description",
    body: `HmarePanditJi is a technology platform that connects customers with independent Hindu priests ("Pandits") for religious ceremonies. We facilitate bookings, handle travel logistics, and provide customer support. We are not a religious institution and do not employ the pandits directly.`,
  },
  {
    title: "3. User Accounts",
    body: `You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials. HmarePanditJi reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`,
  },
  {
    title: "4. Booking and Payments",
    body: `All bookings are subject to pandit availability. Payment must be completed to confirm a booking. Prices are displayed in Indian Rupees (₹) inclusive of applicable taxes. Travel reimbursement charges are shown separately and are non-negotiable once confirmed.`,
  },
  {
    title: "5. Cancellation Policy",
    body: `Cancellations made more than 48 hours before the ceremony will receive a full refund. Cancellations made 24–48 hours before will incur a 25% cancellation fee. Cancellations within 24 hours are non-refundable. HmarePanditJi will provide a backup pandit free of charge if the assigned pandit cancels.`,
  },
  {
    title: "6. Pandit Conduct",
    body: `Pandits on our platform agree to arrive on time, perform ceremonies with proper Vedic methodology, and maintain respectful conduct. Any breach of these standards should be reported to our support team immediately for resolution.`,
  },
  {
    title: "7. Intellectual Property",
    body: `All content on HmarePanditJi — including text, images, logos, and software — is the property of HmarePanditJi Pvt. Ltd. and is protected under Indian copyright law. Unauthorized reproduction or distribution is prohibited.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `HmarePanditJi shall not be liable for any indirect, incidental, or consequential damages arising from the use of our Platform. Our total liability in any matter related to a specific booking shall not exceed the booking amount paid.`,
  },
  {
    title: "9. Governing Law",
    body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in New Delhi, India.`,
  },
  {
    title: "10. Modifications",
    body: `We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms. We will notify registered users of material changes via SMS or email.`,
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">Terms of Service</h1>
        <p className="text-slate-500 text-sm">Last updated: January 2025 · Effective: Delhi-NCR Phase 1 Launch</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5 mb-10">
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
          यह नियम और शर्तें पढ़ें — Please read these Terms carefully before using HmarePanditJi. Using our platform means you accept these terms.
        </p>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.title} className="border-b border-slate-100 dark:border-slate-800 pb-8 last:border-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">{section.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          For questions about these Terms, contact us at{" "}
          <a href="mailto:legal@hmarepanditji.com" className="text-primary hover:underline">
            legal@hmarepanditji.com
          </a>{" "}
          or WhatsApp us at{" "}
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999"}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            +91 (your number)
          </a>.
        </p>
      </div>
    </div>
  );
}
