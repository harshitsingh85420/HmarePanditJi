import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy policy for HmarePanditJi platform.',
};

export default function PrivacyPage() {
    return (
        <>
            <h1>Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-8">Last Updated: October 2026</p>

            <h2>1. Data Collection</h2>
            <p>
                When you use HmarePanditJi, we collect information you provide directly, including your name, phone number, physical address, and payment details. For Pandits, we collect professional credentials and verification documents.
            </p>

            <h2>2. How Data is Used</h2>
            <p>
                We use this information to:
            </p>
            <ul>
                <li>Match customers with appropriate Pandits based on location and requirements.</li>
                <li>Process payments and payouts.</li>
                <li>Send service-related communications (booking confirmations, reminders).</li>
                <li>Improve our platform and user experience.</li>
            </ul>

            <h2>3. Data Sharing</h2>
            <p>
                We share limited necessary information:
            </p>
            <ul>
                <li><strong>With Pandits:</strong> Your verified booking details and address.</li>
                <li><strong>With Customers:</strong> The assigned Pandit's profile and contact info.</li>
                <li><strong>With Service Providers:</strong> Payment processors (Razorpay) and communication services (Twilio).</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>

            <h2>4. Aadhaar Handling (For Pandits)</h2>
            <p>
                Aadhaar details submitted during the verification process are encrypted and stored securely. We do not store full unencrypted Aadhaar numbers in our active database, and they are used solely for the initial verification process.
            </p>

            <h2>5. Cookies and Analytics</h2>
            <p>
                We use cookies to maintain your session and analyze platform traffic. You can control cookie preferences through your browser settings.
            </p>

            <h2>6. User Rights</h2>
            <p>
                You have the right to request access to your data, correction of inaccurate data, and deletion of your account/data, subject to legal retention requirements.
            </p>

            <h2>7. Contact</h2>
            <p>
                For privacy-related inquiries, contact privacy@hmarepanditji.com.
            </p>
        </>
    );
}
