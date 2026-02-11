import type { Metadata } from "next";
import "./globals.css";
import LandingHeader from "../components/landing-header";
import AuthModal from "../components/auth-modal";
import { AuthProvider } from "../context/auth-context";
import { ToastProvider } from "@hmarepanditji/ui";
import { Footer } from "@hmarepanditji/ui";

export const metadata: Metadata = {
  title: "HmarePanditJi — Book Verified Pandits Online",
  description:
    "India's first platform for booking Aadhaar-verified Hindu priests with integrated travel logistics. Authentic rituals, guaranteed presence — Delhi-NCR.",
  keywords: [
    "book pandit online",
    "verified pandit Delhi",
    "Hindu priest booking",
    "puja booking Delhi NCR",
    "Griha Pravesh pandit",
    "wedding pandit Delhi",
  ],
  openGraph: {
    title: "HmarePanditJi — Book Verified Pandits Online",
    description:
      "India's first platform for booking Aadhaar-verified Hindu priests with integrated travel logistics. Delhi-NCR Phase 1.",
    type: "website",
    locale: "en_IN",
    siteName: "HmarePanditJi",
  },
  twitter: {
    card: "summary_large_image",
    title: "HmarePanditJi — Book Verified Pandits Online",
    description:
      "India's first platform for booking Aadhaar-verified Hindu priests. Delhi-NCR Phase 1.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#f8f7f5] dark:bg-[#221a10] antialiased" style={{ fontFamily: "Inter, sans-serif" }}>
        <ToastProvider>
          <AuthProvider>
            <LandingHeader />
            <main>{children}</main>
            <Footer />
            <AuthModal />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
