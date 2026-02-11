import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HmarePanditJi — Book Verified Pandits Online",
  description:
    "India's first platform for booking verified Hindu priests (Pandits) with integrated travel logistics. Delhi-NCR.",
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
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background-light font-display antialiased">
        {/* Glassmorphism Header */}
        <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-primary">
                temple_hindu
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                HmarePanditJi
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="#services"
                className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
              >
                Services
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
              >
                How It Works
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
              >
                About
              </a>
              <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                Book Now
              </button>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 sm:px-6">{children}</main>

        <footer className="mt-20 border-t border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-primary">
                  temple_hindu
                </span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  HmarePanditJi
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Phase 1 — Delhi-NCR Region &copy; 2026
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
