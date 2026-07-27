// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// RULING ख GUARD (Isj, 2026-07-25): v1 is Hindi-only.
//   flag FALSE (shipped) → zero /voice/translate requests; every
//     switch returns false (the caller's honesty-notice path — its
//     await is pinned by languageSwitchNotice.test.ts); a persisted
//     non-Hindi bundle is ignored at boot.
//   flag TRUE (the one-line reversal) → the old behavior is intact:
//     translate fires, the switch succeeds.
// ─────────────────────────────────────────────────────────────

const SRC = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  localStorage.clear();
});

describe("ruling ख — flag FALSE (shipped default)", () => {
  it("activateLanguage(non-hi) returns false and NEVER calls /voice/translate", async () => {
    const apiSpy = vi.fn(async () => ({ success: true, data: { translations: [] } }));
    vi.doMock("@/lib/api", () => ({ api: apiSpy }));
    const { activateLanguage } = await import("@/lib/i18n");
    const ok = await activateLanguage("bn");
    expect(ok).toBe(false);
    expect(apiSpy).not.toHaveBeenCalled();
  });
  it("a persisted non-Hindi bundle is IGNORED at boot — Hindi, never cached machine output", async () => {
    localStorage.setItem("hpj_lang_code", "bn");
    localStorage.setItem("lang_bundle_v3_bn", JSON.stringify({ "common.next": "এগিয়ে যান" }));
    vi.doMock("@/lib/api", () => ({ api: vi.fn() }));
    const { getActiveLang, t } = await import("@/lib/i18n");
    expect(getActiveLang()).toBe("hi");
    expect(t("common.next")).not.toBe("এগিয়ে যান");
  });
  it("hindi itself still activates (the hi path is not behind the gate)", async () => {
    vi.doMock("@/lib/api", () => ({ api: vi.fn() }));
    const { activateLanguage, getActiveLang } = await import("@/lib/i18n");
    expect(await activateLanguage("hi")).toBe(true);
    expect(getActiveLang()).toBe("hi");
  });
});

describe("ruling ख — flag TRUE (the reversal stays one line)", () => {
  it("old behavior intact: translate fires, the switch succeeds", async () => {
    vi.doMock("@/lib/featureFlags", () => ({ LANG_SWITCH_V1_ENABLED: true }));
    const apiSpy = vi.fn(async (_path: string, opts?: { body?: string }) => {
      const texts = opts?.body ? (JSON.parse(opts.body).texts as string[]) : [];
      return { success: true, data: { translations: texts.map((s) => `bn:${s}`) } };
    });
    vi.doMock("@/lib/api", () => ({ api: apiSpy }));
    const { activateLanguage, getActiveLang } = await import("@/lib/i18n");
    const ok = await activateLanguage("bn");
    expect(ok).toBe(true);
    expect(getActiveLang()).toBe("bn");
    expect(apiSpy).toHaveBeenCalled();
    expect(String(apiSpy.mock.calls[0][0])).toContain("/voice/translate");
  });
});

describe("ruling ख — source pins", () => {
  it("the flag is single-source and ships FALSE", () => {
    expect(SRC("lib/featureFlags.ts")).toMatch(/export const LANG_SWITCH_V1_ENABLED = false/);
  });
  it("the gate sits at the fetchGroups chokepoint (every translate request passes it)", () => {
    const i18n = SRC("lib/i18n.ts");
    const fn = i18n.slice(i18n.indexOf("async function fetchGroups"), i18n.indexOf("const entries = groups.flatMap"));
    expect(fn).toMatch(/if \(!LANG_SWITCH_V1_ENABLED\) throw/);
  });
  it("the boot-restore is gated too", () => {
    expect(SRC("lib/i18n.ts")).toMatch(/LANG_SWITCH_V1_ENABLED && stored && stored !== "hi"/);
  });
});
