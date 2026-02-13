"use client";

import { useState } from "react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", city: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Name: ${form.name}\nPhone: ${form.phone}\nCity: ${form.city}\n\n${form.message}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
    setSent(true);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-3">Contact Us</h1>
        <p className="text-slate-500 dark:text-slate-400">
          हम यहाँ हैं — We&apos;re here to help. Reach us via WhatsApp or the form below.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact info */}
        <div className="space-y-6">
          {[
            {
              icon: "chat",
              title: "WhatsApp Support",
              subtitle: "सबसे तेज़ जवाब — Fastest Response",
              detail: `+${WHATSAPP.replace("91", "+91 ")}`,
              href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Namaste! I need help with my booking.")}`,
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
            {
              icon: "mail",
              title: "Email Support",
              subtitle: "Response within 24 hours",
              detail: "support@hmarepanditji.com",
              href: "mailto:support@hmarepanditji.com",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: "location_on",
              title: "Service Area",
              subtitle: "Phase 1 Launch",
              detail: "Delhi, Noida, Gurgaon, Faridabad, Ghaziabad",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              icon: "schedule",
              title: "Support Hours",
              subtitle: "हर दिन — Every Day",
              detail: "6:00 AM – 10:00 PM IST",
              color: "text-violet-500",
              bg: "bg-violet-500/10",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined text-xl ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-xs text-slate-400 mb-1">{item.subtitle}</p>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-medium">
                    {item.detail}
                  </a>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Message Sent!</h3>
              <p className="text-slate-500 text-sm">We&apos;ve opened WhatsApp with your message. We&apos;ll reply within minutes.</p>
              <button onClick={() => setSent(false)} className="mt-6 text-sm text-primary hover:underline">Send another message</button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name", label: "Your Name", placeholder: "e.g. Ramesh Gupta", type: "text" },
                  { key: "phone", label: "Mobile Number", placeholder: "+91 99999 88888", type: "tel" },
                  { key: "city", label: "City", placeholder: "Delhi, Noida, Gurgaon...", type: "text" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Message / Query</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="I need a pandit for Griha Pravesh on 15 March in Delhi..."
                    rows={4}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 bg-[#25D366] hover:bg-[#20bd5c] text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Send via WhatsApp
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
