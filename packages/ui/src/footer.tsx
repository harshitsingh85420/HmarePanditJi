import React from "react";

export interface FooterProps {
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
}

const quickLinks = [
  { label: "About", href: "/about" },
  { label: "Search Pandits", href: "/search" },
  { label: "Muhurat Calendar", href: "/muhurat" },
  { label: "How it Works", href: "/#how-it-works" },
];

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const socialLinks: { icon: string; href: string; label: string }[] = [
  { icon: "chat", href: "https://wa.me/919999999999", label: "WhatsApp" },
  { icon: "mail", href: "mailto:support@hmarepanditji.com", label: "Email" },
  { icon: "call", href: "tel:+919999999999", label: "Phone" },
];

export function Footer({ LinkComponent }: FooterProps) {
  function NavLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    if (LinkComponent) {
      return (
        <LinkComponent href={href} className={className}>
          {children}
        </LinkComponent>
      );
    }
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  const linkClass =
    "text-sm text-slate-400 hover:text-slate-200 transition-colors";

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-2xl text-amber-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                temple_hindu
              </span>
              <span className="text-lg font-bold">HmarePanditJi</span>
            </div>
            <p className="text-sm text-slate-400 italic leading-relaxed">
              Sanskriti ko Digital Disha
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              India&rsquo;s first platform for booking verified Hindu priests.
              Delhi-NCR Phase 1.
            </p>
            {/* Social icons */}
            <div className="flex gap-2 mt-5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 text-base">
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <NavLink href={l.href} className={linkClass}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <NavLink href={l.href} className={linkClass}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Stay Updated
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              Get updates on upcoming festivals and special puja packages.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                aria-label="Email for newsletter"
              />
              <button
                className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all"
                aria-label="Subscribe"
              >
                <span className="material-symbols-outlined text-base">
                  send
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} HmarePanditJi. All rights reserved.
            Made with{" "}
            <span
              className="material-symbols-outlined text-xs text-red-500 align-middle"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>{" "}
            in India.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="material-symbols-outlined text-xs text-green-500">
              security
            </span>
            Safe & Secure Payments · 100% Authentic Pandits
          </div>
        </div>
      </div>
    </footer>
  );
}
