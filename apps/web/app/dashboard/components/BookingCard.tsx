import Link from "next/link";
import { Badge } from "@hmarepanditji/ui";

export function getEventIcon(eventType: string) {
    const type = eventType.toLowerCase();
    if (type.includes("vivah") || type.includes("marriage")) return "🎊";
    if (type.includes("griha") || type.includes("house")) return "🏠";
    if (type.includes("katha")) return "📖";
    if (type.includes("rasta") || type.includes("shanti")) return "🕊️";
    if (type.includes("antim") || type.includes("shradh")) return "🙏";
    return "🕉️";
}

export function getStatusBadgeData(status: string) {
    switch (status) {
        case "CREATED": return { label: "Pending", variant: "warning" as const };
        case "PANDIT_REQUESTED": return { label: "Awaiting Pandit", variant: "warning" as const };
        case "CONFIRMED": return { label: "Confirmed", variant: "success" as const };
        case "TRAVEL_BOOKED": return { label: "Travel Ready", variant: "info" as const };
        case "PANDIT_EN_ROUTE": return { label: "Pandit On Way", variant: "info" as const };
        case "PANDIT_ARRIVED": return { label: "Pandit Arrived", variant: "success" as const };
        case "PUJA_IN_PROGRESS": return { label: "Puja Started", variant: "success" as const };
        case "COMPLETED": return { label: "Completed", variant: "success" as const };
        case "CANCELLED": return { label: "Cancelled", variant: "error" as const };
        case "REFUNDED": return { label: "Refunded", variant: "error" as const };
        default: return { label: status, variant: "neutral" as const };
    }
}

export function BookingCard({ booking }: { booking: any }) {
    const icon = getEventIcon(booking.eventType);
    const badge = getStatusBadgeData(booking.status);

    const d = new Date(booking.eventDate);
    const formattedDate = d.toLocaleDateString("hi-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Link href={`/dashboard/bookings/${booking.id}`}>
            <div className="bg-white border text-left border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 shrink-0 bg-orange-50 rounded-full flex items-center justify-center text-2xl">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{booking.eventType}</h3>
                    <p className="text-gray-600 text-sm mt-1">{formattedDate}</p>
                    {booking.pandit?.name && (
                        <p className="text-gray-800 font-medium text-sm mt-1">Pt. {booking.pandit.name}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-0.5">{booking.venueCity}</p>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <div className="font-bold text-gray-900 mt-auto">
                        ₹{booking.grandTotal.toLocaleString("en-IN")}
                    </div>
                </div>
            </div>
        </Link>
    );
}
