import "./globals.css";
import type { Metadata } from "next";
import { SamagriCartProvider } from "../context/SamagriCartContext";
import { CartSidebar } from "../components/CartSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
    title: {
        template: '%s | HmarePanditJi',
        default: 'HmarePanditJi — Book Verified Pandits for Puja Online',
    },
    description: 'Book verified Pandits online for all Hindu ceremonies — Vivah, Griha Pravesh, Satyanarayan Puja & more. Transparent pricing, managed travel, verified priests. Delhi-NCR.',
    keywords: ['pandit booking', 'online puja booking', 'hindu priest', 'vivah pandit', 'griha pravesh', 'delhi pandit', 'verified pandit', 'puja at home', 'muhurat', 'pandit near me'],
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://hmarepanditji.com',
        siteName: 'HmarePanditJi',
        title: 'HmarePanditJi — Book Verified Pandits Online',
        description: 'India\'s trusted platform for booking verified Pandits. Transparent pricing, travel managed, 500+ priests.',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'HmarePanditJi — Book Verified Pandits Online',
        description: 'Book verified Pandits for any Hindu ceremony.',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://hmarepanditji.com' },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "LocalBusiness",
                            "name": "HmarePanditJi",
                            "description": "Online platform for booking verified Hindu priests",
                            "url": "https://hmarepanditji.com",
                            "areaServed": "Delhi-NCR, India",
                            "priceRange": "₹₹",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": "Delhi",
                                "addressCountry": "IN"
                            }
                        })
                    }}
                />
            </head>
            <body className="font-display antialiased bg-white text-gray-900 min-h-screen flex flex-col">
                <SamagriCartProvider>
                    <Header />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer />
                    <CartSidebar />
                </SamagriCartProvider>
            </body>
        </html>
    );
}
