import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { CelebrationOverlay } from "./CelebrationOverlay";

// ─────────────────────────────────────────────────────────────
// उत्सव overlay (canon frames 34/36) — exact-UI batch 2B.
//
// The DISMISS + MOTION CONTRACT is behavioral law and must survive any
// re-skin: auto-dismiss after autoMs, tap dismisses immediately, and the
// two can never double-fire onDone. The badge draws a Material Symbol
// (canon `check`/`verified`) — the legacy raw-char `badge` prop is
// accepted but ignored.
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CelebrationOverlay — canon frame 34/36 pins", () => {
  it("leaf tone stamps Material `check` FILLED at canon 76px", () => {
    const { container } = render(
      <CelebrationOverlay title="बुकिंग स्वीकार! 🎉" subtitle="s" tone="leaf" onDone={() => {}} />
    );
    const glyph = container.querySelector(".material-symbols-filled");
    expect(glyph?.textContent).toBe("check");
    expect((glyph as HTMLElement).style.fontSize).toBe("76px");
  });

  it("saffron tone stamps `verified`; a legacy badge char is ignored", () => {
    const { container } = render(
      <CelebrationOverlay badge="✓" title="t" subtitle="s" tone="saffron" onDone={() => {}} />
    );
    const glyph = container.querySelector(".material-symbols-filled");
    expect(glyph?.textContent).toBe("verified");
    expect(container.textContent).not.toContain("✓");
  });

  it("auto-dismisses after autoMs — exactly once", () => {
    const onDone = vi.fn();
    render(<CelebrationOverlay title="t" subtitle="s" autoMs={3200} onDone={onDone} />);
    act(() => {
      vi.advanceTimersByTime(3199);
    });
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("a tap dismisses immediately, and the later timer cannot double-fire", () => {
    const onDone = vi.fn();
    const { getByRole } = render(
      <CelebrationOverlay title="t" subtitle="s" autoMs={3200} onDone={onDone} />
    );
    fireEvent.click(getByRole("status"));
    expect(onDone).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onDone).toHaveBeenCalledTimes(1); // single-fire held
  });

  it("names real money only: amount 0 renders no ₹ at all", () => {
    const { container, rerender } = render(
      <CelebrationOverlay title="t" subtitle="s" amount={0} onDone={() => {}} />
    );
    expect(container.textContent).not.toContain("₹");
    rerender(<CelebrationOverlay title="t" subtitle="s" amount={5600} onDone={() => {}} />);
    expect(container.textContent).toContain("₹5,600");
  });
});
