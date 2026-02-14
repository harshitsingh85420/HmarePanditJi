"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full gap-6 p-6 min-h-screen bg-[#f8f7f6] dark:bg-[#221a10]">
      {/* Sidebar: Navigation & Documents */}
      <aside className="w-full lg:w-72 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">
            Booking Details
          </h3>
          <p className="text-[#ee9d2b] font-bold text-sm mb-1 uppercase tracking-wider">
            Booking ID
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-mono mb-6">
            HPJ-{id || "1256"}
          </p>
          <nav className="flex flex-col gap-1">
            <Link
              href={`/bookings/${id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#ee9d2b]/10 text-[#ee9d2b] font-bold"
            >
              <span className="material-symbols-outlined">dashboard</span>{" "}
              Overview
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              <span className="material-symbols-outlined">chat</span> Messages
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              <span className="material-symbols-outlined">payments</span>{" "}
              Payments
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              <span className="material-symbols-outlined">settings</span>{" "}
              Settings
            </Link>
          </nav>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">
            Documents
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { name: "Itinerary", size: "1.2 MB", link: `/bookings/${id}/itinerary` },
              { name: "Hotel Voucher", size: "840 KB", link: "#" },
              { name: "Muhurat Patrika", size: "2.4 MB", link: `/bookings/${id}/certificate` },
              { name: "Completion Report", size: "1.8 MB", link: `/bookings/${id}/completion` },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 group cursor-pointer hover:bg-[#ee9d2b]/5 transition-colors"
                onClick={() => doc.link !== "#" && router.push(doc.link)}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500">
                    picture_as_pdf
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {doc.name}
                    </span>
                    <span className="text-xs text-slate-500">{doc.size}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-[#ee9d2b] transition-colors">
                  download
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Main Header & Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Booking Confirmed - HPJ-{id || "1256"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
              Wedding Ceremony of Rahul &amp; Priya
            </p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 w-fit">
            <span className="material-symbols-outlined text-base">
              check_circle
            </span>
            Payment Verified
          </div>
        </div>

        {/* Pandit Status Banner */}
        <div className="bg-gradient-to-r from-[#ee9d2b] to-orange-500 rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div
                  className="size-16 rounded-full border-4 border-white/30 bg-center bg-no-repeat bg-cover"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsHuQoydJPpusVER4PdusRO1EEdKFQ_Ma5O_xQedMTaHJUvczVhvKsyDWETiFEycV0vuZ548r8yBp2e0OmJogpCiHci3ouXIdBVeHEYPt5cSdyjLVm6-YYo26EJGAg-0eSLZNW_AkPqw-wSkx2_8Pm3LCtz60LJ925GfKgU-l7EethlkUmV8fCjM3ma6M-453WxOwhDPw2i_ttrOnPYu4kYtAVyq9YbqWjezgCrA9uCP846cKOEZMZ60p3dka7zp48X-MVtS8EwhI')",
                  }}
                ></div>
                <div className="absolute bottom-0 right-0 size-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">Pandit Sharma is on his way</h2>
                <p className="text-white/80">
                  Live tracking enabled for your peace of mind.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/bookings/${id}/track`)}
              className="bg-white text-[#ee9d2b] hover:bg-slate-50 px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-sm"
            >
              Track Now
            </button>
          </div>
          {/* Abstract Background Pattern */}
          <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
            <svg className="h-full w-full fill-white" viewBox="0 0 100 100">
              <circle cx="80" cy="50" r="40"></circle>
              <circle cx="100" cy="20" r="30"></circle>
            </svg>
          </div>
        </div>

        {/* Central Timeline */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ee9d2b]">
              route
            </span>{" "}
            Transit Timeline
          </h3>
          <div className="relative flex flex-col gap-0">
            {/* Connecting Line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-slate-100 dark:bg-slate-800"></div>

            {/* Timeline Item 1 */}
            <div className="flex items-start gap-6 pb-10 relative">
              <div className="z-10 size-14 flex items-center justify-center rounded-full bg-[#ee9d2b]/20 text-[#ee9d2b] border-4 border-white dark:border-slate-900">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div className="flex flex-col pt-1">
                <p className="text-slate-900 dark:text-white font-bold text-lg leading-none">
                  Departed Varanasi
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    calendar_today
                  </span>{" "}
                  Dec 14, 10:00 PM
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex items-start gap-6 pb-10 relative">
              <div className="z-10 size-14 flex items-center justify-center rounded-full bg-[#ee9d2b]/20 text-[#ee9d2b] border-4 border-white dark:border-slate-900">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div className="flex flex-col pt-1">
                <p className="text-slate-900 dark:text-white font-bold text-lg leading-none">
                  ETA Delhi 8:00 AM
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    calendar_today
                  </span>{" "}
                  Dec 15
                </p>
                <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-sm font-medium w-fit">
                  <span className="material-symbols-outlined text-sm animate-pulse">
                    local_shipping
                  </span>
                  Currently passing through Kanpur
                </div>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex items-start gap-6 relative">
              <div className="z-10 size-14 flex items-center justify-center rounded-full bg-[#ee9d2b] text-white border-4 border-white dark:border-slate-900 ring-4 ring-[#ee9d2b]/20">
                <span className="material-symbols-outlined">light_mode</span>
              </div>
              <div className="flex flex-col pt-1">
                <p className="text-[#ee9d2b] font-bold text-lg leading-none">
                  Wedding Muhurat
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    calendar_today
                  </span>{" "}
                  Dec 16, 4:30 AM
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Location: Grand Hyatt Ballroom, New Delhi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Track Pandit",
              desc: "Real-time GPS tracking",
              icon: "my_location",
              link: `/bookings/${id}/track`,
            },
            {
              title: "Chat with Pandit",
              desc: "Discuss ritual details",
              icon: "forum",
              link: "#",
            },
            {
              title: "View Samagri List",
              desc: "Required items checklist",
              icon: "inventory_2",
              link: `/bookings/${id}/samagri`,
            },
            {
              title: "Support",
              desc: "24/7 Concierge help",
              icon: "support_agent",
              link: "#",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.link && router.push(item.link)}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="size-12 rounded-lg bg-[#ee9d2b]/10 flex items-center justify-center text-[#ee9d2b] mb-4 group-hover:bg-[#ee9d2b] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">
                {item.title}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
