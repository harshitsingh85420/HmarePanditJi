import type { Metadata } from "next";
import "./globals.css";
import AdminNav from "../components/AdminNav";

export const metadata: Metadata = {
  title: "HmarePanditJi — Admin Panel",
  description:
    "Admin panel for managing pandits, bookings, and operations on HmarePanditJi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background-light font-display antialiased dark:bg-background-dark">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">

          {/* Left: Branding */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-primary p-2 rounded-lg text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-xl leading-none">account_balance</span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                HmarePanditJi Admin
              </p>
              <p className="text-xs text-slate-500 leading-tight">
                Centralized Operations &amp; Vetting
              </p>
            </div>
          </div>

          {/* Center: Navigation */}
          <AdminNav />

          {/* Right: Status + Profile */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* System status */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">System Online</span>
            </div>

            {/* Admin profile */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Arjun Verma</p>
                <p className="text-xs text-slate-500 leading-tight">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border-2 border-primary/20 flex-shrink-0">
                A
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ────────────────────────────────────────────────── */}
        {children}

      </body>
    </html>
  );
}
