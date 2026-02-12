import type { Metadata } from "next";
import "./globals.css";
import ClientNav from "../components/ClientNav";
import PanditAuthGuard from "../components/PanditAuthGuard";

export const metadata: Metadata = {
  title: "HmarePanditJi — Pandit Dashboard",
  description: "Manage your bookings, profile, and earnings on HmarePanditJi.",
  manifest: "/manifest.json",
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
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#f09942" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="min-h-screen bg-background-light font-display antialiased">

        {/* ── Sticky Glassmorphism Header ─────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary/20">
          <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-4 sm:px-6">

            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="text-primary flex-shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M12 2l2.929 6.472L22 9.549l-5 4.951 1.18 6.999L12 18.272l-6.18 3.227L7 15.5 2 10.549l7.071-1.077L12 2z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-lg font-bold text-slate-900 leading-none">
                HmarePanditJi
              </span>
            </div>

            {/* Center Nav — rendered by ClientNav (dynamic active state) */}
            <ClientNav />

            {/* Right: Namaste greeting + Avatar */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg px-3 py-2 text-sm font-medium text-slate-800">
                <span aria-hidden="true">🙏</span>
                <span>Namaste, Pandit Ram Ji</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-primary border-2 border-primary/70 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                R
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ────────────────────────────────────────────────── */}
        <main className="mx-auto max-w-[960px] px-4 sm:px-6 pb-28 md:pb-10">
          <PanditAuthGuard>{children}</PanditAuthGuard>
        </main>

      </body>
    </html>
  );
}
