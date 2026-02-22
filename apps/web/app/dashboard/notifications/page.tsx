"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@hmarepanditji/ui";
import { Bell, Check, Calendar, Plane, MapPin, CreditCard, Star, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationData {
    id: string;
    type: string; // BOOKING, TRAVEL, STATUS, PAYMENT, REVIEW, SYSTEM
    title: string;
    message: string;
    data: any;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        try {
            const token = localStorage.getItem("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err);
            // Revert on error
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        setIsMarkingAll(true);
        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            const token = localStorage.getItem("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/read-all`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err);
            fetchNotifications();
        } finally {
            setIsMarkingAll(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "BOOKING": return <Calendar className="w-5 h-5 text-blue-500" />;
            case "TRAVEL": return <Plane className="w-5 h-5 text-indigo-500" />;
            case "STATUS": return <MapPin className="w-5 h-5 text-orange-500" />;
            case "PAYMENT": return <CreditCard className="w-5 h-5 text-green-500" />;
            case "REVIEW": return <Star className="w-5 h-5 text-amber-500" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationLink = (n: NotificationData) => {
        const d = n.data || {};
        switch (n.type) {
            case "BOOKING":
            case "STATUS":
            case "PAYMENT":
                return d.bookingId ? `/dashboard/bookings/${d.bookingId}` : null;
            case "TRAVEL":
                return d.bookingId ? `/dashboard/bookings/${d.bookingId}?tab=itinerary` : null;
            case "REVIEW":
                return d.bookingId ? `/dashboard/bookings/${d.bookingId}/review` : null;
            default:
                return null; // No link for normal system messages
        }
    };

    const handleNotificationClick = (n: NotificationData) => {
        if (!n.isRead) markAsRead(n.id);
        const link = getNotificationLink(n);
        if (link) router.push(link);
    };

    const formatRelativeTime = (isoString: string) => {
        const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
        const diffInMs = new Date(isoString).getTime() - Date.now();
        const diffInMins = Math.round(diffInMs / (1000 * 60));
        const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

        if (Math.abs(diffInMins) < 1) return "Just now";
        if (Math.abs(diffInMins) < 60) return rtf.format(diffInMins, "minute");
        if (Math.abs(diffInHours) < 24) return rtf.format(diffInHours, "hour");
        return rtf.format(diffInDays, "day");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Bell className="text-blue-600" /> Notifications
                    {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                            {unreadCount} new
                        </span>
                    )}
                </h1>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={isMarkingAll}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        {isMarkingAll ? "Marking..." : "Mark all as read"}
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-lg text-gray-800">No notifications yet</p>
                    <p className="mt-1">When you get updates, they'll show up here.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map(n => {
                        const hasLink = !!getNotificationLink(n);
                        const Wrapper = hasLink ? 'div' : 'div';

                        return (
                            <Card
                                key={n.id}
                                className={`overflow-hidden transition-all ${!n.isRead
                                    ? 'border-l-4 border-l-blue-500 bg-blue-50/30'
                                    : 'bg-white opacity-80 border-l-4 border-l-transparent'
                                    } ${hasLink ? 'cursor-pointer hover:shadow-md' : ''}`}
                                onClick={() => hasLink && handleNotificationClick(n)}
                            >
                                <div className="p-4 flex gap-4 w-full text-left">
                                    <div className={`mt-1 p-2 rounded-full shrink-0 ${!n.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                        {getIcon(n.type)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-4 mb-1">
                                            <h3 className={`text-base ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                {n.title}
                                            </h3>
                                            <span className="text-xs text-gray-500 whitespace-nowrap whitespace-nowrap shrink-0">
                                                {formatRelativeTime(n.createdAt)}
                                            </span>
                                        </div>

                                        <p className={`text-sm ${!n.isRead ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                                            {n.message}
                                        </p>

                                        {!n.isRead && !hasLink && (
                                            <button
                                                onClick={(e) => markAsRead(n.id, e)}
                                                className="text-xs text-blue-600 font-medium mt-2 hover:underline inline-flex items-center"
                                            >
                                                <Check className="w-3 h-3 mr-1" /> Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
