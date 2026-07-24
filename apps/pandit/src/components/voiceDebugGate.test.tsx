// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useVoiceDebugFlag } from "./VoiceDebugPanel";

// ─────────────────────────────────────────────────────────────
// VOICEDEBUG GATE — RULED (Isj 2026-07-24): the ?voicedebug=1 flag stays
// exactly as-is (the real-device audio pass runs against prod and needs
// it). The gate is the sessionStorage latch, NOT NODE_ENV — deliberately
// prod-renderable, but ONLY via the explicit flag. This guard pins both
// directions: latch absent → the panel is never mounted; latch present →
// it is. Companion operator rule (pilot-ops-runbook): no support script
// or shared URL ever carries ?voicedebug=1.
// ─────────────────────────────────────────────────────────────

const FLAG_KEY = "hpj_voicedebug";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe("voicedebug badge gate — flag-latched, never ambient", () => {
  it("latch absent → useVoiceDebugFlag stays false (panel unrenderable)", async () => {
    sessionStorage.removeItem(FLAG_KEY);
    const { result } = renderHook(() => useVoiceDebugFlag());
    // the effect has run (initial state false, and it must STAY false)
    await waitFor(() => expect(result.current).toBe(false));
  });

  it("latch present → flag turns on (the deliberate diagnostic path)", async () => {
    sessionStorage.setItem(FLAG_KEY, "1");
    const { result } = renderHook(() => useVoiceDebugFlag());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("VoiceRoot mounts the panel ONLY behind the flag — and the gate is the latch, not NODE_ENV", () => {
    const root = readFileSync(join(__dirname, "VoiceRoot.tsx"), "utf8");
    expect(root).toMatch(/\{debugOn && <VoiceDebugPanel \/>\}/);
    const panel = readFileSync(join(__dirname, "VoiceDebugPanel.tsx"), "utf8");
    // the latch is the one gate; a NODE_ENV gate would break the ruled-on
    // real-device prod diagnostic — pin its absence deliberately
    expect(panel).toMatch(/sessionStorage\.getItem\(FLAG_KEY\) === "1"/);
    expect(panel, "gate must stay the explicit flag (founder ruling)").not.toMatch(/NODE_ENV/);
  });
});
