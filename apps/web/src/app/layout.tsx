import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import LandingHeader from "../components/landing-header";
import AuthModal from "../components/auth-modal";
import { AuthProvider } from "../context/auth-context";
import { CartProvider } from "../context/cart-context";
import { ToastProvider } from "@hmarepanditji/ui";
import { Footer } from "@hmarepanditji/ui";

const BASE_URL = "https://hmarepanditji.com";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "HmarePanditJi — Book Verified Pandits Online | Delhi-NCR",
    template: "%s | HmarePanditJi",
  },
  description:
    "India's first platform for booking Aadhaar-verified Hindu priests with integrated travel logistics. Griha Pravesh, Vivah, Satyanarayan & more. Delhi-NCR. Guaranteed presence.",
  keywords: [
    "book pandit online",
    "verified pandit Delhi",
    "Hindu priest booking",
    "puja booking Delhi NCR",
    "Griha Pravesh pandit",
    "wedding pandit Delhi",
    "pandit for Satyanarayan katha",
    "Aadhaar verified pandit",
    "pandit booking app India",
    "HmarePanditJi",
  ],
  authors: [{ name: "HmarePanditJi", url: BASE_URL }],
  creator: "HmarePanditJi",
  publisher: "HmarePanditJi Pvt. Ltd.",
  formatDetection: { telephone: true, email: true },
  alternates: {
    canonical: BASE_URL,
    languages: { "en-IN": BASE_URL, "hi-IN": BASE_URL },
  },
  openGraph: {
    title: "HmarePanditJi — Book Verified Pandits Online",
    description:
      "India's first platform connecting families with Aadhaar-verified Hindu priests. Integrated travel logistics, backup guarantee. Delhi-NCR Phase 1.",
    type: "website",
    locale: "en_IN",
    siteName: "HmarePanditJi",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "HmarePanditJi — Book Verified Pandits Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hmarepanditji",
    creator: "@hmarepanditji",
    title: "HmarePanditJi — Book Verified Pandits Online",
    description:
      "India's first platform for Aadhaar-verified Hindu priests. Delhi-NCR Phase 1.",
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// JSON-LD — LocalBusiness for Delhi-NCR launch
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "HmarePanditJi",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/og-image.png`,
  description:
    "India's first platform for booking Aadhaar-verified Hindu priests with integrated travel logistics. Serving Delhi-NCR.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    addressCountry: "IN",
  },
  areaServed: [
    { "@type": "City", name: "Delhi" },
    { "@type": "City", name: "Noida" },
    { "@type": "City", name: "Gurgaon" },
    { "@type": "City", name: "Faridabad" },
    { "@type": "City", name: "Ghaziabad" },
  ],
  priceRange: "₹₹",
  telephone: `+${WHATSAPP_NUMBER}`,
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "06:00",
    closes: "22:00",
  },
  sameAs: [
    "https://www.facebook.com/hmarepanditji",
    "https://www.instagram.com/hmarepanditji",
    "https://twitter.com/hmarepanditji",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Serif:wght@400;700&display=swap"
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className="min-h-screen bg-[#f8f7f5] dark:bg-[#221a10] antialiased"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}

        {/* Microsoft Clarity */}
        {CLARITY_ID && (
          <Script id="clarity-init" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","${CLARITY_ID}");
            `}
          </Script>
        )}

        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <LandingHeader />
              <main>{children}</main>
              <Footer />
              <AuthModal />

              {/* WhatsApp Floating Button */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Namaste! I want to book a pandit for my puja.")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
              >
                {/* WhatsApp SVG icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-7 h-7"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
