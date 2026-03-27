"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../src/context/auth-context";
import Link from "next/link";
import { ChevronLeft, Phone, MessageCircle } from "lucide-react";

export default function LiveTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!accessToken) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || &quot;http://localhost:3001/api/v1&quot;}/bookings/${params.bookingId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (data.success) {
          setBooking(data.data.booking);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [accessToken, params.bookingId]);

  if (loading) return <div className="h-screen flex items-center justify-center dark:bg-[#101922] dark:text-white">Loading tracking data...</div>;
  if (!booking) return <div className="h-screen flex items-center justify-center dark:bg-[#101922] dark:text-white">Unable to track this booking.</div>;

  return (
    <div className="relative flex h-[calc(100vh-72px)] w-full flex-col bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-slate-100 antialiased overflow-hidden -m-4 md:-m-8">
      {/* Main Fullscreen Map Area */}
      <main className="flex flex-1 relative overflow-hidden">
        {/* Full Screen Map Background (Simulated) */}
        <div className="absolute inset-0 z-0 bg-[#e5e7eb] dark:bg-[#1c2127]">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeaLCohXycqVnLLQCTXApvQRdXJYpA30yRcbha2X7bxeVG-JsEMqhdy3HKZMdmD-eok8AxQtRnuxu6KUNXgBGsTX1ooHAPzMntMBlLlzIfT0xR-iKfQZGWfRZR_bGGdB_sR_e8byDQun_HJ2x7fRZZ4zT7pJjVpsp_ndC9Fc3LLVhQR9ipEIaYoyBrMfumZaXp47unp6GQW5vn17qji73OFGOfkzwb2TKOnDjQ-A1BgVZrDE-Rk9LnPsOIUEcyL0735fsYp6Ngfiw')" }}
          ></div>

          {/* Map UI Elements */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
            <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-xl p-1 border border-slate-200 dark:border-slate-800">
              <input className="bg-transparent border-none focus:ring-0 text-sm w-64 dark:text-white placeholder:text-slate-400 outline-none px-3" placeholder="Search route..." type="text" />
              <button className="p-2 text-slate-500"><span className="material-symbols-outlined">search</span></button>
            </div>
          </div>

          <div className="absolute bottom-10 right-6 lg:right-[400px] z-10 flex flex-col gap-2">
            <button className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-lg text-slate-600 dark:text-slate-300 hover:text-[#137fec] transition-colors">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-lg text-slate-600 dark:text-slate-300 hover:text-[#137fec] transition-colors">
              <span className="material-symbols-outlined">remove</span>
            </button>
            <button className="h-10 w-10 flex items-center justify-center bg-[#137fec] text-white rounded-lg shadow-lg mt-2">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>

          {/* Live Route Overlay (Simulated) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-1/2 h-1/2">
              {/* Route Line */}
              <div className="absolute top-1/2 left-1/4 w-[60%] h-1 bg-[#137fec]/40 rounded-full rotate-[-15deg]"></div>
              {/* Current Position Marker */}
              <div className="absolute top-[48%] left-[60%] flex flex-col items-center">
                <div className="bg-[#137fec] text-white p-2 rounded-full shadow-xl animate-pulse">
                  <span className="material-symbols-outlined">directions_car</span>
                </div>
                <div className="mt-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-lg text-xs font-bold border border-[#137fec] text-slate-900 dark:text-white">
                  Pt. {booking.pandit?.name || &quot;Pandit&quot;}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Status Card (Left Bottom) */}
        <div className="absolute bottom-10 left-6 z-20 max-w-sm w-full hidden md:block">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">Pt. {booking.pandit?.name || &quot;Pandit&quot;} is approaching venue</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">Current Status: {booking.status === &quot;PANDIT_EN_ROUTE&quot; ? &quot;On Time&quot; : &quot;Scheduled&quot;}</p>
                  </div>
                </div>
                <div className="bg-[#137fec]/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-[#137fec]">schedule</span>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl mb-6">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Estimated Arrival</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">4h 20m <span className="text-slate-400 text-base font-normal">at 02:20 AM</span></p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${booking.pandit?.phone}`} className="flex items-center justify-center gap-2 bg-[#137fec] text-white font-bold py-3 rounded-xl hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/25">
                    <Phone size={16} /> Call Pandit
                  </a>
                  <a href={`https://wa.me/${booking.pandit?.phone?.replace('+', '')}`} className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
                    <MessageCircle size={16} /> Message
                  </a>
                </div>
                <button className="flex items-center justify-center gap-2 text-slate-500 hover:text-[#137fec] text-sm font-medium py-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">contact_support</span> Contact Backup Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Timeline */}
        <aside className="hidden lg:flex w-[380px] bg-white dark:bg-[#101922] border-l border-slate-200 dark:border-slate-800 z-30 flex-col absolute right-0 top-0 bottom-0">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold dark:text-white">Journey Timeline</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{booking.pandit?.city || &quot;HQ&quot;} → {booking.venueCity} Route</p>
            </div>
            <Link href={`/dashboard/bookings/${booking.id}`} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative space-y-8">
              {/* Vertical Connector Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

              {/* Timeline Item 1 */}
              <div className="relative flex gap-4">
                <div className="mt-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-[#101922]">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold dark:text-white">Journey Started</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{booking.pandit?.city || &quot;Varanasi&quot;} HQ</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">4:00 PM ✓</p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative flex gap-4">
                <div className="mt-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-[#101922]">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold dark:text-white">Crossed Checkpoint</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Highway Checkpoint 4</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">8:45 PM ✓</p>
                </div>
              </div>

              {/* Timeline Item 3 (Current) */}
              <div className="relative flex gap-4">
                <div className="mt-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-900/30">
                  <span className="material-symbols-outlined text-[16px] font-bold">more_horiz</span>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold dark:text-white text-lg">In Transit</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Distance: 42km left</p>
                  <p className="text-sm font-bold text-amber-500 mt-1">10:00 PM 🟡 (In Transit)</p>

                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cover bg-slate-200"></div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic">&quot;Traffic reported near Yamuna Expressway. Minor delay possible.&quot;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Item 5 (Destination) */}
              <div className="relative flex gap-4 opacity-50">
                <div className="mt-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-[#101922]">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold dark:text-white">{booking.venueCity} (Destination)</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Pooja Venue</p>
                  <p className="text-sm font-medium mt-1">Est. 02:20 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pandit Profile Quick View */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 pb-safe">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-cover bg-center border-2 border-[#137fec] bg-slate-200 shadow-sm overflow-hidden text-slate-500 flex items-center justify-center">
                {booking.pandit?.profilePhotoUrl ? (
                  <img src={booking.pandit.profilePhotoUrl} className="w-full h-full object-cover" alt={booking.pandit.name} />
                ) : (
                  <span className="font-bold">{booking.pandit?.name?.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-bold dark:text-white text-lg">Pt. {booking.pandit?.name}</p>
                <div className="flex items-center text-amber-500 text-xs">
                  <span className="material-symbols-outlined text-sm font-bold">star</span>
                  <span className="ml-1 font-semibold text-slate-700 dark:text-slate-300">4.8 (120 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}