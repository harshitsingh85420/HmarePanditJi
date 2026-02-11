"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const SMS_TEMPLATES = [
  { id: "booking_confirmed", label: "Booking Confirmed", body: "Namaste {pandit_name} ji! Aapki puja booking confirm ho gayi hai. Booking #{booking_id} — {ceremony} on {date} at {address}. Please confirm receipt." },
  { id: "travel_arranged", label: "Travel Arranged", body: "Namaste {pandit_name} ji! Aapka travel arrange ho gaya hai. {mode}: {from} → {to} on {date}. Travel allowance: ₹{amount}." },
  { id: "payment_done", label: "Payment Released", body: "Namaste {pandit_name} ji! ₹{amount} aapke account mein transfer ho gaya hai. Booking #{booking_id}. HmarePanditJi" },
  { id: "review_request", label: "Review Request (to customer)", body: "Namaste {customer_name} ji! Aapki puja sampann hui. Kripya {pandit_name} ji ko review dein: {review_link}" },
  { id: "otp", label: "OTP Message", body: "{otp} is your HmarePanditJi OTP. Valid for 10 minutes. Do not share with anyone." },
];

const ADMIN_USERS = [
  { id: "1", name: "Arjun Verma", email: "arjun@hmarepanditji.com", role: "Super Admin", lastActive: "Now" },
  { id: "2", name: "Sneha Gupta", email: "sneha@hmarepanditji.com", role: "Operations", lastActive: "2h ago" },
  { id: "3", name: "Vikram Singh", email: "vikram@hmarepanditji.com", role: "Support", lastActive: "1d ago" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("commission");
  const [toast, setToast] = useState("");

  // Commission settings
  const [commission, setCommission] = useState("10");
  const [gst, setGst] = useState("18");
  const [minBookingValue, setMinBookingValue] = useState("1500");
  const [cancellationFee, setCancellationFee] = useState("10");

  // Travel rates
  const [carRate, setCarRate] = useState("12");
  const [trainRate, setTrainRate] = useState("3.5");
  const [busRate, setBusRate] = useState("2");
  const [flightRate, setFlightRate] = useState("8");
  const [foodAllowance, setFoodAllowance] = useState("500");
  const [stayAllowance, setStayAllowance] = useState("1500");

  // SMS
  const [selectedTemplate, setSelectedTemplate] = useState(SMS_TEMPLATES[0].id);
  const [templateBody, setTemplateBody] = useState(SMS_TEMPLATES[0].body);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"all_pandits" | "all_customers">("all_pandits");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const saveSettings = async (section: string) => {
    try {
      await fetch(`${API_BASE}/admin/settings/${section}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section }),
      });
    } catch { /* dev */ }
    showToast(`${section} settings saved`);
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    try {
      await fetch(`${API_BASE}/admin/sms/broadcast`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: broadcastMsg, target: broadcastTarget }),
      });
    } catch { /* dev */ }
    showToast(`Broadcast sent to ${broadcastTarget === "all_pandits" ? "all pandits" : "all customers"}`);
    setBroadcastMsg("");
  };

  const SECTIONS = [
    { id: "commission", icon: "percent", label: "Commission & Fees" },
    { id: "travel", icon: "local_shipping", label: "Travel Rates" },
    { id: "sms", icon: "sms", label: "SMS Templates" },
    { id: "admins", icon: "manage_accounts", label: "Admin Users" },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform configuration and administration</p>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
                activeSection === s.id
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-base leading-none">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

          {/* Commission & Fees */}
          {activeSection === "commission" && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Commission & Fees</h2>
                <p className="text-sm text-slate-500 mt-0.5">Platform fee configuration. Changes apply to new bookings immediately.</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: "Platform Commission (%)", sub: "Charged on each completed booking", value: commission, setter: setCommission },
                  { label: "GST Rate (%)", sub: "Applied on platform commission", value: gst, setter: setGst },
                  { label: "Minimum Booking Value (₹)", sub: "Bookings below this are not accepted", value: minBookingValue, setter: setMinBookingValue },
                  { label: "Cancellation Fee (%)", sub: "Charged if cancelled within 24h", value: cancellationFee, setter: setCancellationFee },
                ].map(({ label, sub, value, setter }) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">{label}</label>
                    <p className="text-xs text-slate-400 mb-2">{sub}</p>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>

              {/* Live preview */}
              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Fee Preview — Sample ₹10,000 Booking</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Pandit Earnings", value: `₹${(10000 * (1 - parseFloat(commission || "0") / 100)).toLocaleString("en-IN")}` },
                    { label: "Platform Fee", value: `₹${(10000 * parseFloat(commission || "0") / 100).toLocaleString("en-IN")}` },
                    { label: "GST on Fee", value: `₹${(10000 * parseFloat(commission || "0") / 100 * parseFloat(gst || "0") / 100).toLocaleString("en-IN")}` },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{s.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => saveSettings("commission")} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                Save Commission Settings
              </button>
            </div>
          )}

          {/* Travel Rates */}
          {activeSection === "travel" && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Travel Reimbursement Rates</h2>
                <p className="text-sm text-slate-500 mt-0.5">Per-km rates and daily allowances for pandit travel.</p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Per-km Rates (₹/km)</p>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Car / Cab", value: carRate, setter: setCarRate, icon: "directions_car" },
                    { label: "Train", value: trainRate, setter: setTrainRate, icon: "train" },
                    { label: "Bus", value: busRate, setter: setBusRate, icon: "directions_bus" },
                    { label: "Flight", value: flightRate, setter: setFlightRate, icon: "flight" },
                  ].map(({ label, value, setter, icon }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                      <span className="material-symbols-outlined text-primary text-xl leading-none">{icon}</span>
                      <p className="text-xs font-semibold text-slate-500 mt-2">{label}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-sm text-slate-400">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="w-full bg-transparent text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Daily Allowances (₹/day or night)</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Food Allowance (per day)", value: foodAllowance, setter: setFoodAllowance, icon: "restaurant" },
                    { label: "Accommodation (per night)", value: stayAllowance, setter: setStayAllowance, icon: "hotel" },
                  ].map(({ label, value, setter, icon }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary text-2xl leading-none">{icon}</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500">{label}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm text-slate-400">₹</span>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="w-full bg-transparent text-xl font-bold text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => saveSettings("travel")} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                Save Travel Rates
              </button>
            </div>
          )}

          {/* SMS Templates */}
          {activeSection === "sms" && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">SMS Templates</h2>
                <p className="text-sm text-slate-500 mt-0.5">Edit system SMS templates. Use {"{variable}"} placeholders.</p>
              </div>

              <div className="grid grid-cols-[220px_1fr] gap-5">
                {/* Template list */}
                <div className="space-y-1">
                  {SMS_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTemplate(t.id); setTemplateBody(t.body); }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedTemplate === t.id
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Edit area */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {SMS_TEMPLATES.find((t) => t.id === selectedTemplate)?.label}
                  </p>
                  <textarea
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <p className="text-xs text-slate-400">{templateBody.length} chars · ~{Math.ceil(templateBody.length / 160)} SMS unit(s)</p>
                  <button onClick={() => saveSettings("sms_template")} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                    Save Template
                  </button>
                </div>
              </div>

              {/* Broadcast */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Broadcast SMS</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {([["all_pandits", "All Pandits"], ["all_customers", "All Customers"]] as const).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="broadcast" value={value} checked={broadcastTarget === value} onChange={() => setBroadcastTarget(value)} className="accent-primary" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Type broadcast message..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <button
                    onClick={sendBroadcast}
                    disabled={!broadcastMsg.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-base leading-none">campaign</span>
                    Send Broadcast
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Users */}
          {activeSection === "admins" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Users</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Manage admin access levels. All actions are logged.</p>
                </div>
                <button onClick={() => showToast("Invite modal opened")} className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-base leading-none">person_add</span>
                  Invite Admin
                </button>
              </div>

              <div className="space-y-3">
                {ADMIN_USERS.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          user.role === "Super Admin" ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-slate-400 mt-1 text-right">Active: {user.lastActive}</p>
                      </div>
                      {user.role !== "Super Admin" && (
                        <button onClick={() => showToast(`${user.name} access revoked`)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                          <span className="material-symbols-outlined text-red-500 text-base leading-none">person_remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-900/40">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl leading-none mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">All admin actions are logged</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Every action (approve, reject, refund, edit) is recorded to AdminLog with timestamp and admin ID.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  );
}
