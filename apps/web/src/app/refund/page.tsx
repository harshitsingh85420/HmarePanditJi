import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — HmarePanditJi",
  description:
    "HmarePanditJi Refund and Cancellation Policy. Transparent policies for booking cancellations, refunds, and our backup guarantee.",
};

export default function RefundPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-slate-500 text-sm">Last updated: January 2025</p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-5 mb-10">
        <p className="text-sm text-green-800 dark:text-green-300 font-medium">
          हम आपकी सहायता के लिए प्रतिबद्ध हैं — We believe in transparent, fair, and fast refunds. Your trust is our priority.
        </p>
      </div>

      {/* Cancellation timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-10">
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">Customer Cancellation Schedule</h2>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {[
            { timing: "More than 72 hours before ceremony", refund: "100% Full Refund", badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
            { timing: "48–72 hours before ceremony", refund: "90% Refund", badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
            { timing: "24–48 hours before ceremony", refund: "75% Refund", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
            { timing: "Less than 24 hours before ceremony", refund: "No Refund", badge: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
          ].map((row) => (
            <div key={row.timing} className="grid grid-cols-[1fr_auto] gap-4 px-6 py-4 items-center">
              <p className="text-sm text-slate-700 dark:text-slate-300">{row.timing}</p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${row.badge}`}>
                {row.refund}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* How to cancel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-10">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">How to Cancel a Booking</h2>
        <ol className="space-y-3">
          {[
            "Log in to your HmarePanditJi account.",
            "Go to \"My Bookings\" and select the booking you wish to cancel.",
            "Click \"Cancel Booking\" and select a reason.",
            "Confirm cancellation. You will receive an SMS confirmation immediately.",
            "Refund (if applicable) will be credited to the original payment method within 5–7 business days.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Pandit cancellation / backup */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-10">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
          Pandit Cancellation / Our Backup Guarantee
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          If your assigned pandit cancels for any reason, HmarePanditJi will:
        </p>
        <ul className="space-y-2">
          {[
            "Immediately assign a qualified backup pandit at no extra charge.",
            "Notify you via SMS and WhatsApp within 30 minutes of the cancellation.",
            "If no suitable backup is available within 4 hours, you are entitled to a full refund regardless of timing.",
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined text-green-500 text-base mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Travel costs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-10">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Travel Reimbursement Refund</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Travel costs (train/flight/car) are non-refundable once tickets are purchased, except in cases of pandit cancellation by us. In such cases, the full travel amount is refunded within 2 business days.
        </p>
      </div>

      {/* Contact for refund */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Refund questions? WhatsApp us at{" "}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999"}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            our support number
          </a>{" "}
          or email{" "}
          <a href="mailto:support@hmarepanditji.com" className="text-primary hover:underline">
            support@hmarepanditji.com
          </a>
        </p>
      </div>
    </div>
  );
}
