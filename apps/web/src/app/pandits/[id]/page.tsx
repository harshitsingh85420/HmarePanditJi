import { PanditProfileClient } from "../../../components/pandit/PanditProfileClient";

export default function PanditProfilePage({ params }: { params: { id: string } }) {
    return (
        <main className="max-w-[1280px] mx-auto w-full px-4 md:px-10 lg:px-40 py-8 min-h-screen bg-[#f8f7f5] dark:bg-[#221a10]">
            <div className="flex flex-wrap gap-2 pb-6">
                <a className="text-[#8a7960] text-sm font-medium hover:text-[#f49d25] transition-colors" href="/dashboard">Home</a>
                <span className="text-[#8a7960] text-sm font-medium">/</span>
                <a className="text-[#8a7960] text-sm font-medium hover:text-[#f49d25] transition-colors" href="/search">Pandit Search</a>
                <span className="text-[#8a7960] text-sm font-medium">/</span>
                <span className="text-[#181511] dark:text-white text-sm font-bold">Pandit Profile</span>
            </div>
            <PanditProfileClient panditId={params.id} />
        </main>
    );
}
