import "./globals.css";
import type { Metadata } from "next";
import { SamagriCartProvider } from "../context/SamagriCartContext";
import { CartSidebar } from "../components/CartSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
    title: "HmarePanditJi | Book Verified Pandits for Sacred Ceremonies",
    description:
        "Find and book verified Pandits for Vivah, Griha Pravesh, Satyanarayan Puja, and more. Transparent pricing · Travel managed · Backup guaranteed. Delhi-NCR & Pan-India.",
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
