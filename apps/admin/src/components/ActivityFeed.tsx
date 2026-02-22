import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface FeedItem {
    id: string;
    icon: string;
    message: string;
    createdAt: string;
    bookingId?: string;
}

export default function ActivityFeed() {
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3001/api/admin/activity-feed?limit=20", {
            headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFeed(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-6 text-center text-slate-500">Loading activity...</div>;
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
                {feed.map((item, i) => (
                    <div key={item.id || i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 text-lg shadow-sm">
                            {item.icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm font-medium text-slate-800 leading-snug">{item.message}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                </span>
                                {item.bookingId && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <Link href={`/bookings/${item.bookingId}`} className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                            View details →
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
