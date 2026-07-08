"use client";

// ─────────────────────────────────────────────────────────────
// Screen — THE layout grammar (Spec 2). Every pandit screen is:
//   <div h-[100dvh] flex-col max-w-[430px] bg-cream>
//     <Header 64px> <OfflineBanner slot> <optional status banner>
//     <main flex-1 overflow-y-auto px-4 pt-3 pb-6> …content… </main>
//     <footer: ONE fixed CTA zone OR the thali BottomNav — never both>
//   </div>
// Laws enforced here: single vertical scroller (main), the root owns
// 100dvh, the footer keeps the one primary CTA always visible.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export interface ScreenProps {
  title?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  headerRightSlot?: React.ReactNode;
  /** Optional banner strip below the header (status/verification). */
  banner?: React.ReactNode;
  children: React.ReactNode;
  /** EITHER a fixed CTA footer… */
  footer?: React.ReactNode;
  /** …OR the thali nav (dashboard screens). Never both. */
  bottomNav?: { activeTab: number; onChange: (idx: number) => void };
  mainClassName?: string;
  /** Set false for screens that render their own header (e.g. tutorial). */
  withHeader?: boolean;
}

export function Screen({
  title,
  showBack,
  onBack,
  headerRightSlot,
  banner,
  children,
  footer,
  bottomNav,
  mainClassName,
  withHeader = true,
}: ScreenProps) {
  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      {withHeader && (
        <Header title={title ?? ""} showBack={showBack} onBack={onBack} rightSlot={headerRightSlot} />
      )}
      {banner}
      <main className={cn("flex-1 overflow-y-auto px-4 pt-3 pb-6", mainClassName)}>
        {children}
      </main>
      {footer && !bottomNav && (
        <footer className="shrink-0 px-4 py-3 bg-cream/95 backdrop-blur border-t border-saffron-100">
          {footer}
        </footer>
      )}
      {bottomNav && !footer && (
        <div className="shrink-0">
          <BottomNav activeTab={bottomNav.activeTab} onChange={bottomNav.onChange} />
        </div>
      )}
    </div>
  );
}

export default Screen;
