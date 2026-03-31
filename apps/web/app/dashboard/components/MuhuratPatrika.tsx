export function MuhuratPatrika({ booking }: { booking: any }) {
    return (
        <div className="bg-gradient-to-br from-[#FFF5E6] to-[#FFE4E1] border-8 border-double border-orange-300 rounded-2xl p-6 md:p-8 max-w-lg mx-auto text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ea580c 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

            <div className="relative z-10">
                <div className="text-5xl mb-4 leading-none">🕉️</div>
                <h2 className="text-3xl font-black text-red-800 mb-1 drop-shadow-sm">श्री मुहूर्त पत्रिका</h2>
                <p className="text-xs font-bold text-orange-700 uppercase tracking-[0.2em] mb-8">(Auspicious Timing Certificate)</p>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-orange-200 text-left space-y-4 shadow-inner">
                    <div className="flex justify-between border-b border-orange-100 pb-2">
                        <span className="font-bold text-gray-500 w-24">पूजा:</span>
                        <span className="font-bold text-gray-900 text-right">{booking.eventType}</span>
                    </div>
                    <div className="flex justify-between border-b border-orange-100 pb-2">
                        <span className="font-bold text-gray-500 w-24">दिनांक:</span>
                        <span className="font-bold text-gray-900 text-right">{new Date(booking.eventDate).toLocaleDateString("hi-IN")}</span>
                    </div>
                    <div className="flex justify-between border-b border-orange-100 pb-2">
                        <span className="font-bold text-gray-500 w-24">मुहूर्त:</span>
                        <span className="font-bold text-orange-700 text-right">{booking.muhuratTime || "निर्धारित नहीं"}</span>
                    </div>

                    <div className="h-px bg-transparent my-1"></div>

                    <div className="flex justify-between border-b border-orange-100 pb-2">
                        <span className="font-bold text-gray-500 w-24">कर्ता:</span>
                        <span className="font-bold text-gray-900 text-right">{booking.customer?.name || "यजमान"}</span>
                    </div>
                    <div className="flex justify-between border-b border-orange-100 pb-2">
                        <span className="font-bold text-gray-500 w-24">स्थान:</span>
                        <span className="font-bold text-gray-900 text-right">{booking.venueCity}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                        <span className="font-bold text-gray-500 w-24">पुरोहित:</span>
                        <span className="font-bold text-gray-900 text-right">Pt. {booking.pandit?.name || "___"}</span>
                    </div>
                </div>

                <div className="mt-10">
                    <p className="text-2xl font-black text-red-700 tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">🙏 शुभम् भवतु 🙏</p>
                    <div className="mt-8 flex justify-between items-end text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <div className="text-left">
                            HmarePanditJi<br />
                            <span className="text-orange-600">ID: {booking.bookingNumber}</span>
                        </div>
                        <div className="text-right flex justify-end">
                            <div className="w-16 h-16 border-4 border-red-500 rounded-full flex items-center justify-center text-red-500 font-black opacity-30 transform -rotate-12 bg-white/50 backdrop-blur-md mix-blend-multiply">
                                VERIFIED
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
