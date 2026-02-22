import type { Metadata } from "next";
import { DashboardNav } from "./components/DashboardNav";

export const metadata: Metadata = {
    title: "My Dashboard | HmarePanditJi",
    description: "Customer Dashboard for HmarePanditJi",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-20 md:pb-0 pt-[72px]">
            <DashboardNav />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
