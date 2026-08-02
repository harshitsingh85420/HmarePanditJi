import type { Metadata } from "next";
import { DashboardNav } from "./components/DashboardNav";

export const metadata: Metadata = {
    title: "My Dashboard | HmarePanditJi",
    description: "Customer Dashboard for HmarePanditJi",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        // pb-20 removed in batch 2d: it was clearance for DashboardNav's own
        // fixed bottom bar, which no longer exists. The app-wide bar's
        // clearance lives on <body> (pb-nav) so it applies to every route,
        // not only this one.
        <div className="min-h-screen bg-[#181511] flex flex-col md:flex-row pt-[72px]">
            <DashboardNav />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
