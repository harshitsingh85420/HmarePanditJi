"use client";

import React from 'react';
import Link from 'next/link';

export default function BookingSummaryAddOns() {
  return (
    <>
      {/* Generated from UI booking_summary_&_add-ons */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">

        <div className="flex flex-col gap-3 mb-8">
          <div className="flex gap-6 justify-between items-end">
            <div>
              <h1 className="text-[#181511] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Review your Booking</h1>
              <p className="text-[#8a7960] dark:text-gray-400 text-base font-normal">Wedding Puja at Delhi NCR</p>
            </div>
            <div className="text-right">
              <p className="text-[#181511] dark:text-white text-sm font-medium">Step 1 of 3: Booking Summary</p>
              <p className="text-primary text-xs font-bold">Next: Payment</p>
            </div>
          </div>
          <div className="rounded-full bg-[#e6e1db] dark:bg-[#3d3326] h-2 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: "33.33%" }}></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 space-y-6">

            <section className="bg-white dark:bg-[#2a2218] p-6 rounded-xl border border-[#e6e1db] dark:border-[#3d3326] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">event_available</span>
                <h2 className="text-xl font-bold dark:text-white">Event Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex flex-col border-b border-[#f5f3f0] dark:border-[#3d3326] pb-2">
                  <span className="text-[#8a7960] text-xs uppercase tracking-wider font-semibold">Event Type</span>
                  <span className="text-[#181511] dark:text-white font-medium">Wedding (Vivah Sanskar)</span>
                </div>
                <div className="flex flex-col border-b border-[#f5f3f0] dark:border-[#3d3326] pb-2">
                  <span className="text-[#8a7960] text-xs uppercase tracking-wider font-semibold">Primary Pandit</span>
                  <span className="text-[#181511] dark:text-white font-medium">Pt. Ramakrishna Sharma</span>
                </div>
                <div className="flex flex-col border-b border-[#f5f3f0] dark:border-[#3d3326] pb-2">
                  <span className="text-[#8a7960] text-xs uppercase tracking-wider font-semibold">Date &amp; Muhurat</span>
                  <span className="text-[#181511] dark:text-white font-medium">Nov 24, 2024 (09:30 AM - 02:00 PM)</span>
                </div>
                <div className="flex flex-col border-b border-[#f5f3f0] dark:border-[#3d3326] pb-2">
                  <span className="text-[#8a7960] text-xs uppercase tracking-wider font-semibold">Venue</span>
                  <span className="text-[#181511] dark:text-white font-medium">Radisson Blu, Dwarka, New Delhi</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-[#2a2218] p-6 rounded-xl border border-[#e6e1db] dark:border-[#3d3326] shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                <h2 className="text-xl font-bold dark:text-white">Cost Itemization</h2>
              </div>
              <div className="space-y-4">

                <div className="flex justify-between items-start py-2">
                  <div>
                    <p className="text-[#181511] dark:text-white font-semibold">Pandit Dakshina</p>
                    <p className="text-[#8a7960] text-xs">Standard professional fees for main ritual</p>
                  </div>
                  <span className="font-semibold">₹21,000</span>
                </div>

                <div className="flex justify-between items-start py-2">
                  <div>
                    <p className="text-[#181511] dark:text-white font-semibold">Samagri Package (Premium)</p>
                    <p className="text-[#8a7960] text-xs">A-grade organic herbs, ghee, and curated ritual kit</p>
                  </div>
                  <span className="font-semibold">₹12,500</span>
                </div>

                <div className="bg-[#f8f7f5] dark:bg-[#32291d] p-4 rounded-lg space-y-3">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Logistics &amp; Travel</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a7960]">Travel Allowance (Self-Drive: 600km @ ₹12/km)</span>
                    <span className="font-medium text-[#181511] dark:text-white">₹7,200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a7960]">Food Allowance (2 Meals)</span>
                    <span className="font-medium text-[#181511] dark:text-white">₹800</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a7960]">Accommodation (3-Star Nearby)</span>
                    <span className="font-medium text-[#181511] dark:text-white">₹3,500</span>
                  </div>
                </div>

                <div className="flex justify-between items-start py-2">
                  <div>
                    <p className="text-[#181511] dark:text-white font-semibold">Platform Convenience Fee</p>
                    <p className="text-[#8a7960] text-xs">Service &amp; automated logistics handling</p>
                  </div>
                  <span className="font-semibold">₹1,499</span>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-6">

            <section className="bg-white dark:bg-[#2a2218] p-6 rounded-xl border border-[#e6e1db] dark:border-[#3d3326] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                <h2 className="text-lg font-bold dark:text-white">Recommended Add-ons</h2>
              </div>
              <div className="space-y-4">

                <div className="p-3 border-2 border-primary/20 bg-primary/5 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold text-[#181511] dark:text-white">Premium Backup</p>
                      <span className="text-[10px] bg-primary text-white px-1 rounded">SAFE</span>
                    </div>
                    <p className="text-[11px] text-[#8a7960]">Guaranteed replacement within 2 hrs if emergency</p>
                    <p className="text-xs font-bold text-primary mt-1">+ ₹9,999</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-3 border border-[#e6e1db] dark:border-[#3d3326] rounded-lg flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#181511] dark:text-white">Muhurat Consultation</p>
                    <p className="text-[11px] text-[#8a7960]">15-min call for optimal timing adjustment</p>
                    <p className="text-xs font-bold text-primary mt-1">+ ₹1,100</p>
                  </div>
                  <button className="bg-primary/20 hover:bg-primary text-primary hover:text-white p-1 rounded transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>

                <div className="p-3 border border-[#e6e1db] dark:border-[#3d3326] rounded-lg flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#181511] dark:text-white">Nirmalya Visarjan</p>
                    <p className="text-[11px] text-[#8a7960]">Eco-friendly floral waste management</p>
                    <p className="text-xs font-bold text-primary mt-1">+ ₹500</p>
                  </div>
                  <button className="bg-primary/20 hover:bg-primary text-primary hover:text-white p-1 rounded transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="sticky top-24 bg-white dark:bg-[#2a2218] rounded-xl border-t-4 border-primary shadow-xl overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-[#8a7960]">
                  <span>Subtotal</span>
                  <span>₹46,499</span>
                </div>
                <div className="flex justify-between items-center text-[#8a7960]">
                  <span>Add-ons</span>
                  <span>₹9,999</span>
                </div>
                <div className="flex justify-between items-center text-primary text-sm font-bold bg-primary/5 p-2 rounded">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">local_offer</span> PANDIT10 Applied</span>
                  <span>-₹4,650</span>
                </div>
                <div className="h-px bg-[#e6e1db] dark:border-[#3d3326] my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-[#181511] dark:text-white">Grand Total</span>
                  <span className="text-2xl font-black text-primary">₹51,848</span>
                </div>
                <p className="text-[10px] text-center text-[#8a7960]">Inclusive of all taxes and automated travel credits</p>
              </div>
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 flex items-center justify-center gap-2 text-lg transition-all group">
                Proceed to Payment
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </section>
            <div className="flex flex-col gap-4 text-center mt-6">
              <p className="text-sm text-[#8a7960] flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                Secure 256-bit encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
