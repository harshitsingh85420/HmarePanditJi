import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms and conditions for using HmarePanditJi platform.',
};

export default function TermsPage() {
    return (
        <>
            <h1>Terms of Service</h1>
            <p className="text-sm text-gray-500 mb-8">Last Updated: October 2026</p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <p className="text-yellow-800 text-sm font-medium m-0">
                    [LEGAL REVIEW NEEDED] This is a placeholder document and does not constitute finalized legal text.
                </p>
            </div>

            <h2>1. Platform Overview and Role</h2>
            <p>
                HmarePanditJi ("the Platform") operates as an intermediary connecting customers seeking Hindu religious services with verified independent Pandits. The Platform facilitates discovery, booking, and payment but is not the employer of any Pandit listed on the site.
            </p>

            <h2>2. User Eligibility</h2>
            <p>
                Users must be at least 18 years of age to create an account and book services. By using our platform, you represent that you meet this requirement.
            </p>

            <h2>3. Account Creation and Verification</h2>
            <p>
                Customers must provide accurate contact information. Pandits must undergo our rigorous verification process, including identity checks (Aadhaar/PAN), video KYC, and credential verification before they are listed as "Verified."
            </p>

            <h2>4. Booking Process and Obligations</h2>
            <p>
                When a booking is confirmed, a contract is formed directly between the Customer and the Pandit. The Pandit is responsible for delivering the Puja services as agreed. The Customer is responsible for ensuring the venue is ready and any required customer-provided samagri is available.
            </p>

            <h2>5. Payment Terms</h2>
            <p>
                {/* MONEY MODEL (CONFLICT_RULINGS #7, founder 2026-07-21): the Pandit
                    receives 100% of the dakshina — nothing is deducted. The platform
                    fee is a SEPARATE charge paid by the Customer, itemised before
                    payment. The previous sentence ("deducting a platform commission")
                    described the retired included-fee model and was a false statement
                    of the money flow. */}
                To confirm a booking, an advance payment is required. The Platform securely holds these funds and releases them to the Pandit in full after the successful completion of the Puja. The platform fee is a separate charge paid by the Customer at the time of booking, shown as its own line before payment; it is never deducted from the Pandit&apos;s dakshina.
            </p>

            <h2>6. Cancellation and Refund Policy</h2>
            <p>
                Please refer to our <a href="/cancellation-policy">Cancellation Policy</a> for detailed terms regarding refunds. Note that the platform fee portion of the payment may be non-refundable.
            </p>

            <h2>7. Liability Limitations</h2>
            <p>
                HmarePanditJi is not liable for indirect, incidental, special, or consequential damages arising from the use of the platform. Our liability is limited to the fees paid for the specific booking in question.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
                All content, logos, and platform features are the property of HmarePanditJi. Users may not copy or reproduce platform materials without permission.
            </p>

            <h2>9. Governing Law</h2>
            <p>
                These terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi, India.
            </p>

            <h2>10. Contact Information</h2>
            <p>
                For any questions regarding these terms, please contact us at legal@hmarepanditji.com.
            </p>
        </>
    );
}
