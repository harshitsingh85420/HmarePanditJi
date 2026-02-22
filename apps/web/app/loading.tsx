import { Skeleton } from "@hmarepanditji/ui";

export default function Loading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="w-full max-w-4xl space-y-8">
                <Skeleton variant="card" className="h-64 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton variant="card" className="h-40 rounded-xl" />
                    <Skeleton variant="card" className="h-40 rounded-xl" />
                    <Skeleton variant="card" className="h-40 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
