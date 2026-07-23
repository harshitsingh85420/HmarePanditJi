import type { Metadata } from 'next';
// ONE refund-policy source (founder ruling 2026-07-23): this legal page renders
// its table FROM the same module the dashboard cancel screen computes with —
// the CODE is the source of truth; this page conforms to it, never the reverse.
// (Live incident: this page said 90/50/20/0 while the cancel screen computed
// 100/50/0.) Guard-pinned in payment-money.test.ts §7.
import { REFUND_TIERS, REFUND_PROCESSING_DAYS } from '../../../src/lib/refund-policy';

export const metadata: Metadata = {
    title: 'Cancellation & Refund Policy',
    description: 'Cancellation and refund policy for HmarePanditJi platform.',
};

export default function CancellationPolicyPage() {
    return (
        <>
            <h1>Cancellation & Refund Policy</h1>
            <p className="text-sm text-gray-500 mb-8">Last Updated: October 2026</p>

            <p>
                We understand that plans can change. Below is our cancellation and refund table based on when you cancel your booking relative to your scheduled Puja date:
            </p>

            <div className="overflow-x-auto my-8">
                <table className="min-w-full text-left bg-white border border-gray-200">
                    <thead className="bg-orange-50/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900 border-b">Cancellation Time</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 border-b">Refund Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                        {REFUND_TIERS.map((tier) => (
                            <tr key={tier.when}>
                                <td className="px-6 py-4">{tier.when}</td>
                                <td className="px-6 py-4">{tier.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-8 mb-8 space-y-4">
                <h3 className="font-semibold text-gray-900 mt-0">Important Notes:</h3>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                    <li><strong>Platform fees are entirely non-refundable</strong> regardless of when the cancellation occurs.</li>
                    <li>Refunds are processed within <strong>{REFUND_PROCESSING_DAYS}</strong> to the original payment method.</li>
                    <li>How to cancel: You can cancel directly from your User Dashboard under "My Bookings" or by contacting our support team at support@hmarepanditji.com.</li>
                </ul>
            </div>
        </>
    );
}
