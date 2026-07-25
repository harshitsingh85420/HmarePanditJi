// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { reconcileMicGrant, MIC_GRANTED_KEY } from "./micPermission";

// ─────────────────────────────────────────────────────────────
// P0 GUARD (Isj 2026-07-25) — voice-dead-on-entry for pre-granted users.
// The listen loop arms only when mic_permission_granted === "true"; the
// tutorial's pre-granted short-circuit never wrote it. Pinned here:
//   1. the reconciler repairs the absent-key case (behavioral);
//   2. a recorded "false" (deliberate denial) is never overridden;
//   3. EVERY granted classification routes through recordMicGranted —
//      no surface writes the key directly (single-writer law);
//   4. the tutorial's query-classification choke writes the record
//      (the exact hole PAGE 5 found).
// PROVEN-TO-FAIL: 3 and 4 were run against the pre-fix tree first — red.
// ─────────────────────────────────────────────────────────────

const SRC = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const mockQuery = (state: string) => {
  Object.defineProperty(navigator, "permissions", {
    value: { query: vi.fn(async () => ({ state })) },
    configurable: true,
  });
};

describe("mic-grant record — single source + reconciler", () => {
  it("reconciler: browser granted + key ABSENT → writes 'true' (repairs the short-circuit era)", async () => {
    localStorage.removeItem(MIC_GRANTED_KEY);
    mockQuery("granted");
    expect(await reconcileMicGrant()).toBe(true);
    expect(localStorage.getItem(MIC_GRANTED_KEY)).toBe("true");
  });

  it("reconciler: a deliberate 'false' is never overridden; prompt-state writes nothing", async () => {
    localStorage.setItem(MIC_GRANTED_KEY, "false");
    mockQuery("granted");
    expect(await reconcileMicGrant()).toBe(false);
    expect(localStorage.getItem(MIC_GRANTED_KEY)).toBe("false");

    localStorage.removeItem(MIC_GRANTED_KEY);
    mockQuery("prompt");
    expect(await reconcileMicGrant()).toBe(false);
    expect(localStorage.getItem(MIC_GRANTED_KEY)).toBeNull();
  });

  it("single-writer law: no surface writes the key directly (all route through micPermission)", () => {
    for (const p of [
      "app/onboarding/TutorialV2.tsx",
      "app/onboarding/screens/ParichayScreen.tsx",
      "hooks/useVoiceInput.ts",
    ]) {
      const src = SRC(p);
      expect(src, `${p} writes mic_permission_granted directly — route through micPermission.ts`).not.toMatch(
        /localStorage\.setItem\(\s*["']mic_permission_granted["']/,
      );
    }
  });

  it("the tutorial's query classification writes the record (the PAGE 5 hole)", () => {
    const src = SRC("app/onboarding/TutorialV2.tsx");
    // the permissions.query .then must settle through the choke that records
    const idx = src.indexOf('query({ name: "microphone"');
    expect(idx).toBeGreaterThan(0);
    const window = src.slice(idx, idx + 700);
    expect(window, "query-granted must route through settleMicPerm/recordMicGranted").toMatch(
      /settleMicPerm\(/,
    );
    expect(src).toMatch(/const settleMicPerm[\s\S]{0,220}recordMicGranted\(\)/);
  });

  it("the app mounts the reconciler (VoiceRoot)", () => {
    const src = SRC("../src/components/VoiceRoot.tsx".replace("../src/", ""));
    expect(src).toMatch(/reconcileMicGrant\(\)/);
  });
});
