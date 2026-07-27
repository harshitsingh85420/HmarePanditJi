import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hi } from "./strings";
import { LANG_SWITCH_V1_ENABLED } from "./featureFlags";

// ─────────────────────────────────────────────────────────────
// CLAIM-TRUTH GUARD (Isj order, 2026-07-25 — after the settings walk
// found the mount narration promising a voice on/off control that does
// not exist, and शिष्य's FAQ pointing at a language switch Ruling ख
// disabled).
//
// THE LAW: any user-facing string that tells the pandit to press or find
// something must name a control that actually renders. This test is
// table-driven — each row is (the string, the control it claims, the
// source file that must contain that control). A removed control now
// fails the build instead of leaving a live claim behind.
// ─────────────────────────────────────────────────────────────

const SRC = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

const SETTINGS = SRC("app/(dashboard-group)/settings/page.tsx");
const ORB = SRC("components/ui/ShishyaOrb.tsx");
const HELP = SRC("app/(auth)/help/page.tsx");
const MY_POOJAS = SRC("app/(dashboard-group)/my-poojas/page.tsx");
const ADD = SRC("app/(dashboard-group)/my-poojas/add/page.tsx");

describe("claims name controls that render", () => {
  const rows: Array<{ what: string; claim: string; control: RegExp; where: string; src: string }> = [
    {
      what: "settings narration → the bell toggle",
      claim: hi.settingsScreen.intro,
      control: /role="switch"/,
      where: "settings/page.tsx",
      src: SETTINGS,
    },
    {
      what: "settings narration → profile row",
      claim: hi.settingsScreen.intro,
      control: /router\.push\("\/profile-view"\)/,
      where: "settings/page.tsx",
      src: SETTINGS,
    },
    {
      what: "settings narration → help row",
      claim: hi.settingsScreen.intro,
      control: /router\.push\("\/help"\)/,
      where: "settings/page.tsx",
      src: SETTINGS,
    },
    {
      what: "settings narration → 'touch me to silence' = the ORB (Ruling #9)",
      claim: hi.settingsScreen.intro,
      control: /muteWithFarewell/,
      where: "ShishyaOrb.tsx",
      src: ORB,
    },
    {
      what: "shishya voiceOff → the orb tap",
      claim: hi.shishya.faq.voiceOff,
      control: /muteWithFarewell/,
      where: "ShishyaOrb.tsx",
      src: ORB,
    },
    {
      what: "help page offers a support call",
      claim: hi.shishya.faq.paymentMissing,
      control: /tel:/,
      where: "help/page.tsx",
      src: HELP,
    },
    {
      what: "addPooja claim → the add CTA exists",
      claim: hi.shishya.faq.addPooja,
      control: /router\.push\("\/my-poojas\/add"\)/,
      where: "my-poojas/page.tsx",
      src: MY_POOJAS,
    },
    {
      what: "videoVerify claim → the wizard's YouTube-link field",
      claim: hi.shishya.faq.videoVerify,
      control: /youtu\.be/,
      where: "my-poojas/add/page.tsx",
      src: ADD,
    },
  ];

  for (const r of rows) {
    it(`${r.what} (control lives in ${r.where})`, () => {
      expect(r.claim.length, "the claim string must exist").toBeGreaterThan(0);
      expect(r.src, `${r.where} must still render the claimed control`).toMatch(r.control);
    });
  }
});

describe("claims that were FALSE stay dead", () => {
  it("settings narration no longer promises a voice on/off control", () => {
    // there is no voice switch on that screen — the voice control is the orb
    expect(hi.settingsScreen.intro).not.toMatch(/आवाज़ चालू या बंद/);
    expect(SETTINGS).not.toMatch(/voiceOn|voiceOff/);
  });
  it("शिष्य no longer instructs a language switch that Ruling ख disabled", () => {
    if (!LANG_SWITCH_V1_ENABLED) {
      expect(hi.shishya.faq.changeLanguage).not.toMatch(/सेटिंग में भाषा वाला हिस्सा दबाइए/);
    }
  });
  it("no user-facing string claims a language COUNT while the switch is gated", () => {
    // "बारह" was wrong twice over: the list ships 11 tiles, and under
    // Ruling ख none of them can be activated.
    for (const s of [hi.shishya.faq.changeLanguage, hi.help.languageList]) {
      expect(s).not.toMatch(/बारह भाषा/);
    }
  });
  it("videoVerify no longer invents a verification CALL", () => {
    expect(hi.shishya.faq.videoVerify).not.toMatch(/कॉल पर आपसे मिलती है/);
  });
  it("profile's per-pooja green tick rides the SAME gate as its heading", () => {
    const src = SRC("app/(dashboard-group)/profile-view/page.tsx");
    // the tick is a verification claim: it may not render unconditionally
    const list = src.slice(src.indexOf("specializations.map((sp)"), src.indexOf("pujaLabel(sp)"));
    expect(list).toMatch(/profile\?\.verificationStatus === "VERIFIED" &&/);
  });
});
