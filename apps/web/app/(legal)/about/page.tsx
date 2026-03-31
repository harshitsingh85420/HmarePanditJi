import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About HmarePanditJi',
    description: 'Learn about HmarePanditJi - Sanskriti ko Digital Disha.',
};

export default function AboutPage() {
    return (
        <>
            <div className="text-center mb-12 border-b border-gray-100 pb-10">
                <span className="text-5xl mb-4 block">🕉️</span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4 mt-0">
                    About Hmare<span className="text-orange-600">PanditJi</span>
                </h1>
                <p className="text-xl text-orange-600 font-medium italic">"Sanskriti ko Digital Disha"</p>
            </div>

            <h2>What We Do</h2>
            <p className="lead text-lg text-gray-700">
                HmarePanditJi is a modern platform bridging the gap between authentic Vedic traditions and today's digital convenience. We connect families and individuals with highly qualified, rigorously verified Pandits for sacred ceremonies, rituals, and Pujas across India.
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-10 not-prose">
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 text-center">
                    <div className="text-3xl mb-3">✅</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Verified Pandits</h3>
                    <p className="text-gray-600 text-sm">Every Pandit undergoes a STRICT 5-step verification process, including video KYC and background checks.</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 text-center">
                    <div className="text-3xl mb-3">💸</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Transparent Pricing</h3>
                    <p className="text-gray-600 text-sm">No hidden dakshina costs. What you see is what you pay. Book confidently.</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 text-center">
                    <div className="text-3xl mb-3">✈️</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Travel Managed</h3>
                    <p className="text-gray-600 text-sm">We handle outstation Pandit travel, ensuring they arrive punctually to your venue.</p>
                </div>
            </div>

            <h2>Trust & Safety</h2>
            <p>
                Your peace of mind is our priority. HmarePanditJi holds trust and safety as the foundation of our service. Our verification system ensures that only highly educated and respected Acharyas join our platform.
            </p>

            <hr className="my-10 border-gray-200" />

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mt-0">Contact Us</h3>
                <p className="text-gray-600 mb-6 font-medium">Have questions or need assistance booking?</p>
                <div className="inline-flex flex-col sm:flex-row gap-4 justify-center items-center not-prose">
                    <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm font-medium text-gray-700 flex items-center gap-2">
                        <span>📧</span> support@hmarepanditji.com
                    </div>
                    <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm font-medium text-gray-700 flex items-center gap-2">
                        <span>📱</span> +91 90000 00000
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-4 text-2xl">
                    {/* Placeholders for social links */}
                    <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">📘</a>
                    <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">📸</a>
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">🐦</a>
                </div>
            </div>
        </>
    );
}
