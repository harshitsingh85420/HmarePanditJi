import type { Metadata } from "next";
import "./globals.css";
import AdminLayout from "../components/AdminLayout";

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
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <AdminLayout>
          {children}
        </AdminLayout>
      </body>
    </html>
  );
}
