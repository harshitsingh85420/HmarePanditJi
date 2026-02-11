import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HmarePanditJi — Pandit Dashboard",
  description: "Manage your bookings, profile, and earnings on HmarePanditJi.",
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
          <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-primary">
                temple_hindu
              </span>
              <div>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  HmarePanditJi
                </span>
                <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  Pandit
                </span>
              </div>
            </div>
            <nav className="flex items-center gap-5">
              <a
                href="#"
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
              >
                <span className="material-symbols-outlined text-base">
                  event_note
                </span>
                Bookings
              </a>
              <a
                href="#"
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
              >
                <span className="material-symbols-outlined text-base">
                  currency_rupee
                </span>
                Earnings
              </a>
              <a
                href="#"
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
              >
                <span className="material-symbols-outlined text-base">
                  person
                </span>
                Profile
              </a>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                P
              </div>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-[960px] px-4 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
