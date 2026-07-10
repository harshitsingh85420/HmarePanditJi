/**
 * N1 FOUNDER LAW — fresh install = हिंदी, ALWAYS.
 * Any other language only via explicit user selection; detection may
 * PROPOSE a regional language but never English, and never switches.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { hi } from "@/lib/strings";

// Storage must be fresh BEFORE the i18n module initializes (its init()
// caches the boot language on first t()/getActiveLang call).
beforeAll(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("N1 — fresh state boots Hindi", () => {
  it("t() serves the Hindi source and the active language is hi", async () => {
    const { t, getActiveLang, getActiveBcp47 } = await import("@/lib/i18n");
    expect(getActiveLang()).toBe("hi");
    expect(getActiveBcp47()).toBe("hi-IN");
    expect(t("common.next")).toBe(hi.common.next);
    expect(t("welcome.titleShort")).toBe(hi.welcome.titleShort);
    expect(t("shishya.intro")).toBe(hi.shishya.intro);
  });

  it("fresh onboarding state selects Hindi", async () => {
    const { loadOnboardingState } = await import("@/lib/onboarding-store");
    expect(loadOnboardingState().selectedLanguage).toBe("Hindi");
  });
});

describe("N1 — detection proposes only, never English", () => {
  it("DEFAULT_LANG is hi and unknown locations fall back to it", async () => {
    const { DEFAULT_LANG, detectLanguage } = await import("@/lib/languageDetect");
    expect(DEFAULT_LANG).toBe("hi");
    expect(detectLanguage()).toBe("hi");
    expect(detectLanguage("atlantis", "narnia")).toBe("hi");
  });

  it("no city or state ever detects English (en is list-only)", async () => {
    const { CITY_TO_LANG, STATE_TO_LANG } = await import("@/lib/languageDetect");
    expect(Object.values(CITY_TO_LANG)).not.toContain("en");
    expect(Object.values(STATE_TO_LANG)).not.toContain("en");
  });
});

describe("N1 — no silent language overrides at boot", () => {
  it("a stray hpj_preferred_language key cannot flip the selection", async () => {
    const { loadOnboardingState, STORAGE_KEY } = await import("@/lib/onboarding-store");
    localStorage.setItem("hpj_preferred_language", "English");
    // fresh device with the stray key
    expect(loadOnboardingState().selectedLanguage).toBe("Hindi");
    // returning device with a persisted explicit selection keeps IT
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedLanguage: "Marathi" }));
    expect(loadOnboardingState().selectedLanguage).toBe("Marathi");
    localStorage.removeItem("hpj_preferred_language");
    localStorage.removeItem(STORAGE_KEY);
  });
});
