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
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Refund Policy", href: "/legal/cancellation" },
  { label: "Disclaimer", href: "/legal/terms" }, // Placeholder
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
    <footer className="bg-slate-900 text-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-2xl text-amber-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                temple_hindu
              </span>
              <span className="text-lg font-bold">HmarePanditJi</span>
            </div>
            <p className="text-sm italic leading-relaxed text-slate-400">
              Sanskriti ko Digital Disha
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              India&rsquo;s first platform for booking verified Hindu priests.
              Delhi-NCR Phase 1.
            </p>
            {/* Social icons */}
            <div className="mt-5 flex gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 transition-colors hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-base text-slate-400">
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
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
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
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
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
              Stay Updated
            </h4>
            <p className="mb-3 text-sm text-slate-400">
              Get updates on upcoming festivals and special puja packages.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="focus:border-primary focus:ring-primary flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1"
                aria-label="Email for newsletter"
              />
              <button
                className="bg-primary hover:bg-primary/90 rounded-xl px-3 py-2 text-sm font-bold text-white transition-all"
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
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} HmarePanditJi. All rights
            reserved. Made with{" "}
            <span
              className="material-symbols-outlined align-middle text-xs text-red-500"
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
