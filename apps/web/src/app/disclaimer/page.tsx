import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — HmarePanditJi",
  description: "Legal disclaimer for HmarePanditJi. Important information about the use of our pandit booking platform.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. General Disclaimer",
    body: `The information provided on HmarePanditJi ("Platform") is for general informational and booking purposes only. While we strive to keep the information accurate and up to date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the Platform or the services provided through it.`,
  },
  {
    title: "2. Religious Content",
    body: `HmarePanditJi is a technology platform that connects customers with independent Hindu priests. We do not provide religious advice, spiritual guidance, or astrological predictions. Any religious content, muhurat timings, or puja descriptions on the Platform are provided for informational purposes only and should not be treated as authoritative religious guidance. Users are encouraged to consult qualified religious scholars for spiritual matters.`,
  },
  {
    title: "3. Muhurat & Astrological Information",
    body: `Muhurat timings, auspicious dates, and astrological information displayed on the Platform are sourced from publicly available Hindu panchang data and third-party providers (such as DrikPanchang). HmarePanditJi does not guarantee the accuracy of these timings and recommends users verify important dates with their family pandit or a qualified Jyotish practitioner.`,
  },
  {
    title: "4. Pandit Services",
    body: `Pandits registered on HmarePanditJi are independent service providers and not employees or agents of HmarePanditJi. We verify pandit profiles to the best of our ability but do not guarantee the quality, outcome, or religious efficacy of any ceremony or puja performed. Customers engage pandits at their own discretion. Reviews and ratings reflect individual customer experiences and may not represent the views of HmarePanditJi.`,
  },
  {
    title: "5. Pricing & Financial Information",
    body: `All pricing on the Platform — including dakshina amounts, travel costs, and platform fees — are indicative and subject to change. Final pricing is confirmed at the time of booking. Dakshina amounts suggested on the Platform are customary guidelines and customers may offer additional dakshina at their discretion. HmarePanditJi is not responsible for any financial disputes between customers and pandits outside the Platform.`,
  },
  {
    title: "6. Travel & Logistics",
    body: `Travel cost estimates are calculated based on available route data and standard rates. Actual travel costs may vary due to fuel prices, route conditions, traffic, and other factors. HmarePanditJi arranges travel logistics as a convenience service and is not a travel agency. We are not liable for delays, cancellations, or issues arising from third-party travel providers (railways, airlines, cab services).`,
  },
  {
    title: "7. External Links",
    body: `The Platform may contain links to external websites or third-party services (such as Google Maps, payment gateways, and WhatsApp). HmarePanditJi has no control over the content, privacy policies, or practices of these external sites and accepts no responsibility for them. Use of external services is governed by their respective terms and privacy policies.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `To the fullest extent permitted by applicable Indian law, HmarePanditJi, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill, arising from or related to the use of the Platform. Our maximum aggregate liability shall not exceed the amount paid by the user for the specific booking in question.`,
  },
  {
    title: "9. No Professional Advice",
    body: `Nothing on the Platform constitutes professional legal, financial, tax, or medical advice. Users should seek independent professional counsel for matters requiring specialized expertise. GST and tax calculations shown on invoices are estimates — please consult a qualified chartered accountant for tax filing purposes.`,
  },
  {
    title: "10. Changes to This Disclaimer",
    body: `HmarePanditJi reserves the right to update or modify this disclaimer at any time without prior notice. Changes become effective immediately upon posting on the Platform. Continued use of the Platform after any changes constitutes acceptance of the revised disclaimer.`,
  },
];

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Disclaimer</h1>
          <p className="mt-3 text-gray-600">
            Important information about the use of HmarePanditJi platform.
          </p>
          <p className="mt-2 text-sm text-gray-400">Last updated: February 2025</p>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-gray-900">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-xl border border-orange-100 bg-orange-50 p-6">
          <h3 className="text-base font-semibold text-gray-900">Questions?</h3>
          <p className="mt-1 text-sm text-gray-600">
            If you have questions about this disclaimer, contact us at{" "}
            <a href="mailto:legal@hmarepanditji.com" className="text-[#f49d25] hover:underline">
              legal@hmarepanditji.com
            </a>{" "}
            or call{" "}
            <a href="tel:+911234567890" className="text-[#f49d25] hover:underline">
              +91 12345 67890
            </a>.
          </p>
        </div>

        {/* Governing Law */}
        <p className="mt-8 text-xs text-gray-400 text-center">
          This disclaimer is governed by the laws of India. Any disputes arising shall be subject
          to the exclusive jurisdiction of the courts in New Delhi, India.
        </p>
      </section>
    </main>
  );
}
