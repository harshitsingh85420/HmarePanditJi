import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

// ─────────────────────────────────────────────────────────────
// CANON खाली अवस्था (frames 37/38/39) — exact-UI batch 2B pins.
//
//   · the CTA draws Material `add_circle`, never the ➕ emoji (Law 3)
//   · a drawn ornament (orb/दीया) REPLACES the emoji medallion — frames
//     37/38 put live components where 39 puts the emoji disc
//   · the CTA keeps the canon 64px height (≥52px tap floor) and fires
// ─────────────────────────────────────────────────────────────

afterEach(cleanup);

describe("EmptyState — canon empty-state pins", () => {
  it("CTA draws Material add_circle (drawn-not-emoji) and fires", () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        emoji="🛕"
        title="अभी कोई पूजा नहीं जोड़ी"
        hint="पहली पूजा जोड़िए — मैं हर कदम बताऊँगा 🙏"
        action={{ label: "पहली पूजा जोड़ें", onClick }}
      />
    );
    const icon = screen.getByText("add_circle");
    expect(icon.className).toContain("material-symbols-outlined");
    expect(document.body.textContent).not.toContain("➕");

    const btn = screen.getByRole("button");
    expect(btn.className).toContain("min-h-[64px]"); // canon 64 ≥ 52 tap floor
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("a drawn ornament replaces the emoji medallion (frames 37/38)", () => {
    render(
      <EmptyState
        ornament={<span data-testid="drawn-orb" />}
        emoji="🪙"
        title="कमाई यहाँ दिखेगी"
        hint="पहली पूजा का इंतज़ार है — दीया जल रहा है 🪔"
      />
    );
    expect(screen.getByTestId("drawn-orb")).toBeTruthy();
    // the medallion (and its emoji) must NOT render alongside the ornament
    expect(document.body.textContent).not.toContain("🪙");
  });

  it("emoji medallion still renders when no ornament is given (frame 39)", () => {
    render(<EmptyState emoji="🛕" title="शीर्षक" hint="संकेत" />);
    expect(screen.getByText("🛕").className).toContain("rounded-full");
  });

  it("type floors hold: 22px title, 18px hint (canon 17 floored)", () => {
    render(<EmptyState emoji="🛕" title="शीर्षक" hint="संकेत" />);
    expect(screen.getByText("शीर्षक").className).toContain("text-[22px]");
    expect(screen.getByText("संकेत").className).toContain("text-[18px]");
  });
});
