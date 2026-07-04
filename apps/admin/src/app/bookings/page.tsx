"use client";

import React, { useState, useEffect } from "react";
import { ADMIN_TOKEN_KEY } from "@hmarepanditji/utils";

interface User {
  name: string;
  phone: string;
}

interface Pandit {
  user: User;
}

interface Booking {
  id: string;
  bookingNumber: string;
  pujaType: string;
  eventType: string;
  eventDate: string;
  status: string;
  travelStatus: string;
  paymentStatus: string;
  dakshinaAmount: number;
  travelCost: number;
  foodAllowanceAmount: number;
  samagriAmount: number;
  grandTotal: number;
  customer?: {
    name: string;
    phone: string;
  };
  pandit?: Pandit;
}

export default function BookingsMonitorPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  // Drawer state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      
      const queryParams = new URLSearchParams();
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
      if (dateFrom) queryParams.append("dateFrom", dateFrom);
      if (dateTo) queryParams.append("dateTo", dateTo);
      if (search) queryParams.append("search", search);

      const res = await fetch(`${baseUrl}/admin/bookings?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.data?.data || data.data || []);
      } else {
        setError(data.error?.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFrom, dateTo]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to CANCEL this booking? This action is irreversible.")) return;
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Booking cancelled successfully");
        setSelectedBooking(null);
        fetchBookings();
      } else {
        alert(data.error?.message || "Cancellation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Cancellation failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-bold text-slate-800">Booking Monitor ({bookings.length})</h2>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase">Search</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button 
              onClick={fetchBookings}
              className="px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
            >
              Go
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="TRAVEL_BOOKED">Travel Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase">From Date</label>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase">To Date</label>
          <input 
            type="date" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-medium text-slate-500">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-slate-500 font-medium">
          No bookings found.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Customer Name & Phone</th>
                  <th className="px-6 py-4">Pandit Name & Phone</th>
                  <th className="px-6 py-4">Puja Type</th>
                  <th className="px-6 py-4">Event Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Journey Step</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr 
                    key={b.id} 
                    onClick={() => setSelectedBooking(b)}
                    className="hover:bg-slate-50/80 text-sm text-slate-700 cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">{b.bookingNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{b.customer?.name || "N/A"}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{b.customer?.phone || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{b.pandit?.user?.name || "Unassigned"}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{b.pandit?.user?.phone || ""}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{b.pujaType || b.eventType || "N/A"}</td>
                    <td className="px-6 py-4">{new Date(b.eventDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        b.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        b.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {b.travelStatus || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{(b.grandTotal || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {(b.status === "REQUESTED" || b.status === "ACCEPTED") ? (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                        >
                          CANCEL
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out detail drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setSelectedBooking(null)} />
          
          <div className="w-[450px] bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Booking Details</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedBooking.bookingNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Section */}
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                <span className="text-sm font-bold text-blue-600">{selectedBooking.status}</span>
              </div>

              {/* Customer & Pandit Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parties</h4>
                <div className="border rounded-lg p-3 space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block">Customer</span>
                    <span className="text-sm font-bold text-slate-700">{selectedBooking.customer?.name || "N/A"}</span>
                    <span className="text-xs text-slate-500 font-mono ml-2">({selectedBooking.customer?.phone || "N/A"})</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <span className="text-[11px] font-bold text-slate-400 block">Pandit</span>
                    <span className="text-sm font-bold text-slate-700">{selectedBooking.pandit?.user?.name || "Unassigned"}</span>
                    <span className="text-xs text-slate-500 font-mono ml-2">({selectedBooking.pandit?.user?.phone || ""})</span>
                  </div>
                </div>
              </div>

              {/* Puja Detail */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puja Info</h4>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Puja Type</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.pujaType || selectedBooking.eventType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Event Date</span>
                    <span className="font-semibold text-slate-800">{new Date(selectedBooking.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Travel Status</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.travelStatus || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payment Status</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.paymentStatus || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Amount breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Breakdown</h4>
                <div className="border rounded-lg p-3 space-y-2 bg-slate-50/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dakshina</span>
                    <span className="font-semibold text-slate-800">₹{selectedBooking.dakshinaAmount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Travel Cost</span>
                    <span className="font-semibold text-slate-800">₹{selectedBooking.travelCost || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Food Allowance</span>
                    <span className="font-semibold text-slate-800">₹{selectedBooking.foodAllowanceAmount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Samagri Amount</span>
                    <span className="font-semibold text-slate-800">₹{selectedBooking.samagriAmount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 mt-2 font-bold text-slate-900">
                    <span>Total Amount</span>
                    <span>₹{selectedBooking.grandTotal || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button Inside Drawer */}
            {(selectedBooking.status === "REQUESTED" || selectedBooking.status === "ACCEPTED") && (
              <div className="pt-4 border-t mt-auto">
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-sm transition"
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
