export function ItineraryTimeline({ booking }: { booking: any }) {
    if (!booking.travelRequired) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">{new Date(booking.eventDate).toLocaleDateString(&quot;hi-IN&quot;, { month: &quot;long&quot;, day: &quot;numeric&quot;, year: &quot;numeric&quot; })}</h3>
                <div className="relative pl-6 border-l-2 border-orange-200 ml-4 pb-2">
                    <div className="absolute w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded-full -left-[9px] top-1"></div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-2 shadow-sm">
                        <div className="font-black text-orange-800 flex items-center gap-2 mb-1">
                            <span>🕉️</span> MUHURAT WINDOW
                        </div>
                        <p className="font-bold text-gray-900 text-lg">{booking.eventType}</p>
                        <p className="text-orange-700 font-medium">शुभ मुहूर्त: {booking.muhuratTime || &quot;निर्धारित नहीं&quot;}</p>
                        <p className="text-gray-600 text-sm mt-2 flex items-start gap-1">
                            <span className="mt-0.5 text-gray-400">📍</span>
                            <span>{booking.venueAddress}, {booking.venueCity}</span>
                        </p>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Pt. {booking.pandit?.name || &quot;Pandit&quot;} will arrive 30 minutes prior.</p>
                </div>
            </div>
        );
    }

    // Very simplified travel timeline
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>✈️</span> Outstation Booking Travel Plan
            </h3>
            <div className="text-sm text-gray-500 mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                Travel arrangements for the pandit are managed by the admin. Real-time updates will appear here once booked.
            </div>

            <div className="space-y-8">
                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Journey to Venue</h4>
                    <div className="relative pl-6 border-l-2 border-blue-200 ml-4">
                        <div className="absolute w-4 h-4 bg-white border-2 border-blue-400 rounded-full -left-[9px] top-1"></div>
                        <div className="pb-6">
                            <p className="font-bold text-gray-900 flex items-center gap-2">🚕 Transport Arranged</p>
                            <p className="text-gray-500 text-sm mt-1">Status: {booking.travelStatus}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Puja Day</h4>
                    <div className="relative pl-6 border-l-2 border-orange-200 ml-4">
                        <div className="absolute w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded-full -left-[9px] top-1"></div>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-2 shadow-sm">
                            <div className="font-black text-orange-800 flex items-center gap-2 mb-1">
                                <span>🕉️</span> MUHURAT WINDOW
                            </div>
                            <p className="font-bold text-gray-900">{booking.eventType}</p>
                            <p className="text-orange-700 font-medium text-sm mt-1">शुभ मुहूर्त: {booking.muhuratTime || &quot;निर्धारित नहीं&quot;}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
