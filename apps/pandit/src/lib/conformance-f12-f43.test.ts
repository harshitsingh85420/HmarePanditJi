// ─────────────────────────────────────────────────────────────────────────────
// CONFORMANCE PINS — F12-01, F12-03, F43-02
//
// These tests FREEZE WHAT IS TRUE TODAY. They are not aspirational. Where the
// shipped behaviour falls short of docs/pandit-pov-conformance-register.md the
// test asserts the SHORTFALL and says so in a comment marked "GAP PIN", so that
// closing the gap turns this suite red and forces whoever closes it to update
// the register. A red GAP PIN is good news; read the comment, then edit the
// register row and this test together.
//
// This file is .ts (no JSX) by remit, so React trees are built with
// React.createElement. Everything mounted here is the REAL shipped component —
// nothing is re-implemented locally, because a re-implementation would pin the
// test's own copy of the behaviour rather than the app's.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, act } from "@testing-library/react";

// ── module doubles ───────────────────────────────────────────────────────────
// Only the network edge and the Next router are doubled. Component logic, the
// voice controller and the i18n strings are all the real thing.

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const READINESS_SNAPSHOT = {
  readinessStep: 1, // → the page resumes ON step 2 (R2), the सामग्री question
  isBookingReady: false,
  canBringSamagri: null as boolean | null,
  travelPrefs: null,
  foodPrefs: null,
  accommodationPrefs: null,
  specializations: ["SATYANARAYAN"],
  dakshinaRates: [{ pujaType: "SATYANARAYAN", amount: 2100 }],
  aadhaarUrl: "",
  aadhaarBackUrl: "",
  hasAadhaar: false,
  hasConsent: false,
  hasPayment: false,
  samagriTiersByPuja: {} as Record<string, number>,
};

const mutateOnce = vi.fn(async () => ({ success: true, data: READINESS_SNAPSHOT }));

vi.mock("@/lib/api", () => ({
  api: vi.fn(async () => ({ success: true, data: READINESS_SNAPSHOT })),
  API_BASE: "http://test.invalid",
}));
vi.mock("@/lib/mutate", () => ({
  mutateOnce: (...args: unknown[]) => (mutateOnce as any)(...args),
  once: async (_key: string, fn: () => unknown) => fn(),
}));

import { voiceController, type VoiceOption } from "@/lib/voiceController";
import { useVoiceOptions } from "@/hooks/useVoiceScreen";
import { SamagriTiers, type SamagriTier, type TierData } from "@/components/SamagriTiers";
import ReadinessPage from "@/app/(dashboard-group)/readiness/page";
import AddPoojaPage from "@/app/(dashboard-group)/my-poojas/add/page";

const DRAFT_KEY = "add-pooja-draft";

beforeEach(() => {
  mutateOnce.mockClear();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

/** mount + flush the mount-effect network round-trip */
async function mount(node: React.ReactElement) {
  const utils = render(node);
  await act(async () => {
    await Promise.resolve();
  });
  return utils;
}

/** body text with whitespace collapsed — the pages render a lot of nested spans */
const bodyText = () => (document.body.textContent || "").replace(/\s+/g, " ");

/** F02-06: a spoken menu choice now CONFIRMS before it commits. speak the
 *  choice, then हाँ. The label-based MATCH still happens on the first utterance
 *  (that is F43-02's gap) — this only defers the onSelect behind a confirm. */
async function speakAndConfirm(phrase: string) {
  await act(async () => {
    voiceController.handleTranscript(phrase, 1);
  });
  await act(async () => {
    voiceController.handleTranscript("हाँ", 1);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// F12-01 — three tiers per pooja, with the containment rule
//          Standard ⊇ Basic and Premium ⊇ Standard.
//
// TODAY'S TRUTH, in one sentence: containment is enforced in the RENDER and
// nowhere else. SamagriTiers builds its row list cumulatively, so the rule
// cannot be violated on screen; but each tier's stored/POSTed `items` array is
// its OWN items only, so the containment the pandit was shown is not the
// containment the server receives.
// ═════════════════════════════════════════════════════════════════════════════

const TIERS_FIXTURE: TierData[] = [
  { tier: "BASIC", label: "बेसिक", price: 501, items: [{ name: "रोली", qty: "50 ग्राम" }] },
  { tier: "STANDARD", label: "स्टैंडर्ड", price: 1100, items: [{ name: "देसी घी", qty: "500 ग्राम" }] },
  { tier: "PREMIUM", label: "प्रीमियम", price: 2100, items: [{ name: "केसर", qty: "2 ग्राम" }] },
];

describe("F12-01 — three tiers per pooja (Basic/Standard/Premium)", () => {
  it("F12-01: exactly three tiers exist, in the fixed order बेसिक → स्टैंडर्ड → प्रीमियम", async () => {
    await mount(
      React.createElement(SamagriTiers, {
        tiers: TIERS_FIXTURE,
        active: "BASIC" as SamagriTier,
        onSelect: () => {},
      }),
    );

    // the tier tabs are the only aria-pressed controls the component renders
    const tabs = document.querySelectorAll("button[aria-pressed]");
    expect(tabs.length, "a tier was added or removed").toBe(3);
    expect([...tabs].map((b) => b.textContent?.replace(/₹[\d,]+/, "").trim())).toEqual([
      "बेसिक",
      "स्टैंडर्ड",
      "प्रीमियम",
    ]);
  });

  it("F12-01: a tier the pandit has not priced is still one of the three (no fourth, no collapse)", async () => {
    await mount(
      React.createElement(SamagriTiers, {
        tiers: [TIERS_FIXTURE[0]], // only BASIC has data
        active: "BASIC" as SamagriTier,
        onSelect: () => {},
      }),
    );
    // STANDARD/PREMIUM render as tabs with no ₹ — the triple is structural,
    // not derived from whatever the pandit happened to fill in.
    const tabs = [...document.querySelectorAll("button[aria-pressed]")];
    expect(tabs.length).toBe(3);
    expect(tabs[1].textContent).toContain("STANDARD"); // falls back to the raw tier key
    expect(tabs[1].textContent).not.toContain("₹");
  });
});

describe("F12-01 — containment (Standard ⊇ Basic, Premium ⊇ Standard)", () => {
  it("F12-01: selecting स्टैंडर्ड shows बेसिक's items too, marked inherited", async () => {
    await mount(
      React.createElement(SamagriTiers, {
        tiers: TIERS_FIXTURE,
        active: "STANDARD" as SamagriTier,
        onSelect: () => {},
      }),
    );

    // Basic's item is present and attributed to बेसिक — that IS the containment
    expect(screen.getByText("रोली")).toBeInTheDocument();
    expect(screen.getByText("बेसिक से")).toBeInTheDocument();
    // Standard's own item is present and marked new
    expect(screen.getByText("देसी घी")).toBeInTheDocument();
    expect(screen.getByText("नया")).toBeInTheDocument();
    // Premium's item is NOT pulled down — containment is upward only
    expect(screen.queryByText("केसर")).toBeNull();
  });

  it("F12-01: selecting प्रीमियम shows all three tiers' items, two of them inherited", async () => {
    await mount(
      React.createElement(SamagriTiers, {
        tiers: TIERS_FIXTURE,
        active: "PREMIUM" as SamagriTier,
        onSelect: () => {},
      }),
    );

    expect(screen.getByText("रोली")).toBeInTheDocument();
    expect(screen.getByText("देसी घी")).toBeInTheDocument();
    expect(screen.getByText("केसर")).toBeInTheDocument();
    expect(screen.getByText("बेसिक से")).toBeInTheDocument();
    expect(screen.getByText("स्टैंडर्ड से")).toBeInTheDocument();
    expect(screen.getAllByText("नया")).toHaveLength(1); // only प्रीमियम's own item is new
  });

  it("F12-01: बेसिक shows only its own items — containment does not run downward", async () => {
    await mount(
      React.createElement(SamagriTiers, {
        tiers: TIERS_FIXTURE,
        active: "BASIC" as SamagriTier,
        onSelect: () => {},
      }),
    );
    expect(screen.getByText("रोली")).toBeInTheDocument();
    expect(screen.queryByText("देसी घी")).toBeNull();
    expect(screen.queryByText("केसर")).toBeNull();
    expect(screen.queryByText(/से$/)).toBeNull(); // nothing is inherited at the floor
  });

  it("F12-01: containment is CUMULATIVE-BY-CONSTRUCTION — a tier cannot drop a lower tier's item", async () => {
    // The strong form of the pin: the caller passes tiers whose own-item lists
    // are entirely disjoint (the worst case for containment), and the render
    // STILL produces the union. There is no data shape a caller can hand this
    // component that makes प्रीमियम show fewer items than स्टैंडर्ड.
    const rendered = await mount(
      React.createElement(SamagriTiers, {
        tiers: TIERS_FIXTURE,
        active: "STANDARD" as SamagriTier,
        onSelect: () => {},
      }),
    );
    expect(screen.getAllByText(/रोली|देसी घी/)).toHaveLength(2);

    rendered.rerender(
      React.createElement(SamagriTiers, {
        tiers: TIERS_FIXTURE,
        active: "PREMIUM" as SamagriTier,
        onSelect: () => {},
      }),
    );
    expect(screen.getAllByText(/रोली|देसी घी|केसर/)).toHaveLength(3);
  });

  // ── GAP PIN ───────────────────────────────────────────────────────────────
  it("F12-01 GAP: containment is a RENDER rule only — the POSTed tiers carry own-items, not the union", async () => {
    // GAP PIN — this asserts a SHORTFALL, not a desired property.
    //
    // The pandit selects प्रीमियम and is shown रोली + देसी घी + केसर. What the
    // add-a-pooja wizard actually POSTs for PREMIUM is [केसर] alone. Nothing in
    // the client, and nothing in the API handler (services/api/src/controllers/
    // auth.controller.ts saveSamagriPackages, which upserts each tier's `items`
    // verbatim), reconciles the two. A customer reading the stored PREMIUM
    // package therefore sees a package that does NOT contain the Basic and
    // Standard items the pandit priced it to include.
    //
    // WHEN THIS TEST FAILS: someone made containment real in the payload (or in
    // the API). Good. Update the F12-01 row in
    // docs/pandit-pov-conformance-register.md and rewrite this test to assert
    // the union.
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        // 5 in the OLD 7-step numbering; migrateStep maps it to new step 3 (वीडियो).
        // Seeding new-3 directly would be remapped to 2 — see stepModel.ts.
        step: 5,
        name: "सत्यनारायण कथा",
        desc: "कथा",
        items: {
          BASIC: [{ name: "रोली", qty: "50 ग्राम" }],
          STANDARD: [{ name: "देसी घी", qty: "500 ग्राम" }],
          PREMIUM: [{ name: "केसर", qty: "2 ग्राम" }],
        },
        prices: { BASIC: 501, STANDARD: 1100, PREMIUM: 2100 },
        supplyMode: "PANDIT_BRINGS",
        teamSize: 1,
        dakshina: 2100,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        consent: true,
      }),
    );

    await mount(React.createElement(AddPoojaPage));
    const submitBtn = screen.getByRole("button", { name: /जमा कीजिए/ });
    await act(async () => {
      submitBtn.click();
    });

    const samagriCall = mutateOnce.mock.calls.find(
      (c) => (c as unknown as unknown[])[1] === "/pandit/samagri-packages",
    ) as unknown as [string, string, { body: string }] | undefined;
    expect(samagriCall, "the wizard did not POST samagri packages at all").toBeTruthy();

    const posted = JSON.parse(samagriCall![2].body) as {
      pujaType: string;
      tiers: Array<{ tier: string; price: number | null; items: Array<{ name: string }> }>;
    };
    expect(posted.tiers.map((t) => t.tier)).toEqual(["BASIC", "STANDARD", "PREMIUM"]);

    const names = (tier: string) =>
      posted.tiers.find((t) => t.tier === tier)!.items.map((i) => i.name);

    expect(names("BASIC")).toEqual(["रोली"]);
    // THE GAP: STANDARD does not contain BASIC's रोली, PREMIUM contains neither.
    expect(names("STANDARD")).toEqual(["देसी घी"]);
    expect(names("STANDARD")).not.toContain("रोली");
    expect(names("PREMIUM")).toEqual(["केसर"]);
    expect(names("PREMIUM")).not.toContain("रोली");
    expect(names("PREMIUM")).not.toContain("देसी घी");
  });

  it("F12-01 GAP: no tier-price monotonicity is enforced — प्रीमियम may cost less than बेसिक", async () => {
    // GAP PIN — asserts a shortfall. "Premium ⊇ Standard" implies a premium
    // package is worth at least a standard one, but no validator exists on
    // either side of the wire, so an inverted price ladder renders happily.
    await mount(
      React.createElement(SamagriTiers, {
        tiers: [
          { tier: "BASIC", label: "बेसिक", price: 5000, items: [{ name: "रोली", qty: "1" }] },
          { tier: "STANDARD", label: "स्टैंडर्ड", price: 900, items: [] },
          { tier: "PREMIUM", label: "प्रीमियम", price: 100, items: [] },
        ],
        active: "PREMIUM" as SamagriTier,
        onSelect: () => {},
      }),
    );
    const tabs = [...document.querySelectorAll("button[aria-pressed]")].map((b) => b.textContent);
    expect(tabs[0]).toContain("₹5,000");
    expect(tabs[2]).toContain("₹100"); // accepted without complaint
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// F12-03 — the supply-preference question, at BOTH of its scopes.
//   Scope A: readiness step R2 — ONE GLOBAL हाँ/नहीं binary
//   Scope B: my-poojas/add step 2 — PER-POOJA, and a THREE-way choice
// ═════════════════════════════════════════════════════════════════════════════

describe("F12-03 — supply question, scope A: readiness R2 (global हाँ/नहीं)", () => {
  it("F12-03: R2 asks the supply question as a two-option हाँ/नहीं binary", async () => {
    await mount(React.createElement(ReadinessPage));

    await waitFor(() => {
      expect(screen.getByText("क्या आप पूजा का सामान खुद ला सकते हैं?")).toBeInTheDocument();
    });
    expect(screen.getByText("हाँ")).toBeInTheDocument();
    expect(screen.getByText("नहीं")).toBeInTheDocument();
  });

  it("F12-03: the नहीं branch waives packages and shows the ग्राहक/प्लेटफ़ॉर्म card", async () => {
    await mount(React.createElement(ReadinessPage));
    await waitFor(() => screen.getByText("क्या आप पूजा का सामान खुद ला सकते हैं?"));

    // neither branch's payload is on screen before an answer is given
    expect(bodyText()).not.toContain("सामान ग्राहक/प्लेटफ़ॉर्म का रहेगा");

    await act(async () => {
      screen.getByText("नहीं").closest("button")!.click();
    });

    expect(screen.getByText("कोई बात नहीं — सामान ग्राहक/प्लेटफ़ॉर्म का रहेगा")).toBeInTheDocument();
    // the package builder is NOT offered on this branch
    expect(bodyText()).not.toContain("कम से कम एक पैकेज की कीमत");
  });

  it("F12-03: the हाँ branch reveals the per-pooja package builder", async () => {
    await mount(React.createElement(ReadinessPage));
    await waitFor(() => screen.getByText("क्या आप पूजा का सामान खुद ला सकते हैं?"));

    await act(async () => {
      screen.getByText("हाँ").closest("button")!.click();
    });

    expect(
      screen.getByText("हर पूजा के लिए सामग्री सूची और कम से कम एक पैकेज की कीमत भरिए"),
    ).toBeInTheDocument();
    expect(bodyText()).not.toContain("सामान ग्राहक/प्लेटफ़ॉर्म का रहेगा");
  });

  it("F12-03: the two branches are mutually exclusive — answering again replaces, never stacks", async () => {
    await mount(React.createElement(ReadinessPage));
    await waitFor(() => screen.getByText("क्या आप पूजा का सामान खुद ला सकते हैं?"));

    await act(async () => {
      screen.getByText("हाँ").closest("button")!.click();
    });
    await act(async () => {
      screen.getByText("नहीं").closest("button")!.click();
    });

    expect(bodyText()).toContain("सामान ग्राहक/प्लेटफ़ॉर्म का रहेगा");
    expect(bodyText()).not.toContain("कम से कम एक पैकेज की कीमत");
  });

  it("F12-03: the question is SPEAKABLE — हाँ and नहीं are answerable by voice, not tap alone", async () => {
    await mount(React.createElement(ReadinessPage));
    await waitFor(() => screen.getByText("क्या आप पूजा का सामान खुद ला सकते हैं?"));

    await act(async () => {
      voiceController.handleTranscript("नहीं", 1);
    });
    expect(bodyText()).toContain("सामान ग्राहक/प्लेटफ़ॉर्म का रहेगा");

    await act(async () => {
      voiceController.handleTranscript("हाँ", 1);
    });
    expect(bodyText()).toContain("कम से कम एक पैकेज की कीमत");
  });

  it("F12-03: unanswered blocks advance — the wizard re-asks instead of moving on", async () => {
    await mount(React.createElement(ReadinessPage));
    await waitFor(() => screen.getByText("क्या आप पूजा का सामान खुद ला सकते हैं?"));

    mutateOnce.mockClear();
    await act(async () => {
      screen.getByRole("button", { name: /आगे बढ़िए/ }).click();
    });

    // no step PATCH was attempted, and the question is echoed as the error
    expect(mutateOnce).not.toHaveBeenCalled();
    expect(
      screen.getAllByText("क्या आप पूजा का सामान खुद ला सकते हैं?").length,
      "the unanswered question was not re-asked as the error line",
    ).toBeGreaterThan(1);
  });

  it("F12-03: the answer persists GLOBALLY, as canBringSamagri on the readiness step PATCH", async () => {
    await mount(React.createElement(ReadinessPage));
    await waitFor(() => screen.getByText("क्या आप पूजा का सामान खुद ला सकते हैं?"));

    await act(async () => {
      screen.getByText("नहीं").closest("button")!.click();
    });
    mutateOnce.mockClear();
    await act(async () => {
      screen.getByRole("button", { name: /आगे बढ़िए/ }).click();
    });

    const patch = mutateOnce.mock.calls.find(
      (c) => (c as unknown as unknown[])[1] === "/pandit/readiness",
    ) as unknown as [string, string, { body: string }] | undefined;
    expect(patch, "R2 did not PATCH the readiness step").toBeTruthy();
    const body = JSON.parse(patch![2].body) as { step: number; data: Record<string, unknown> };
    expect(body.step).toBe(2);
    // one column, no pujaType key — the scope really is global
    expect(body.data).toEqual({ canBringSamagri: false });
  });
});

describe("F12-03 — supply question, scope B: my-poojas/add step 2 (per-pooja)", () => {
  async function mountAddAtSupplyStep() {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ step: 2, name: "सत्यनारायण कथा", desc: "कथा" }),
    );
    await mount(React.createElement(AddPoojaPage));
  }

  it("F12-03: the add wizard asks the supply question again, per pooja", async () => {
    await mountAddAtSupplyStep();
    expect(screen.getByText("सामान कौन लाएगा?")).toBeInTheDocument();
    expect(screen.getByText("हाँ, मैं लाऊँगा")).toBeInTheDocument();
  });

  it("F12-03: at this scope it is a THREE-way choice, not a हाँ/नहीं pair", async () => {
    // Pins the documented divergence from the spec text: the per-pooja scope
    // offers PANDIT_BRINGS / PLATFORM_SELLS / LIST_ONLY. This is intentional
    // shipped behaviour, recorded here so a future "simplification" back to a
    // binary is a deliberate, visible change.
    await mountAddAtSupplyStep();
    expect(screen.getByText("हाँ, मैं लाऊँगा")).toBeInTheDocument();
    expect(screen.getByText("प्लेटफ़ॉर्म बेचे और पहुँचाए")).toBeInTheDocument();
    expect(screen.getByText("सिर्फ़ सूची दूँ")).toBeInTheDocument();
    // and there is no bare नहीं option at this scope
    expect(screen.queryByText("नहीं")).toBeNull();
  });

  it("F12-03: choosing हाँ, मैं लाऊँगा branches into the bring-what-you-named warning", async () => {
    await mountAddAtSupplyStep();
    expect(bodyText()).not.toContain("जो कंपनी बताई, वही सामान लाना होगा");

    await act(async () => {
      screen.getByText("हाँ, मैं लाऊँगा").closest("button")!.click();
    });
    expect(bodyText()).toContain("जो कंपनी बताई, वही सामान लाना होगा");
  });

  it("F12-03: the non-bring branches suppress that warning — the branches really differ", async () => {
    await mountAddAtSupplyStep();
    await act(async () => {
      screen.getByText("हाँ, मैं लाऊँगा").closest("button")!.click();
    });
    await act(async () => {
      screen.getByText("सिर्फ़ सूची दूँ").closest("button")!.click();
    });
    expect(bodyText()).not.toContain("जो कंपनी बताई, वही सामान लाना होगा");
  });

  it("F12-03: the per-pooja question is speakable too", async () => {
    await mountAddAtSupplyStep();
    await speakAndConfirm("सिर्फ़ सूची");
    // LIST_ONLY selected → step 2 is still incomplete (dakshina missing), and
    // the PANDIT_BRINGS warning is absent
    expect(bodyText()).not.toContain("जो कंपनी बताई, वही सामान लाना होगा");
    await speakAndConfirm("हाँ, मैं लाऊँगा");
    expect(bodyText()).toContain("जो कंपनी बताई, वही सामान लाना होगा");
  });

  it("F12-03: the per-pooja answer is persisted PER POOJA, as supplyMode on pooja-config", async () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step: 5, // old-7 numbering → new step 3 (वीडियो); see stepModel.migrateStep
        name: "सत्यनारायण कथा",
        desc: "कथा",
        items: { BASIC: [], STANDARD: [], PREMIUM: [] },
        prices: { BASIC: null, STANDARD: null, PREMIUM: null },
        supplyMode: "PLATFORM_SELLS",
        teamSize: 1,
        dakshina: 2100,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        consent: true,
      }),
    );
    await mount(React.createElement(AddPoojaPage));
    await act(async () => {
      screen.getByRole("button", { name: /जमा कीजिए/ }).click();
    });

    const cfg = mutateOnce.mock.calls.find(
      (c) => (c as unknown as unknown[])[1] === "/pandit/pooja-config",
    ) as unknown as [string, string, { body: string }] | undefined;
    expect(cfg, "the wizard did not POST the pooja config").toBeTruthy();
    const body = JSON.parse(cfg![2].body) as Record<string, unknown>;
    expect(body.supplyMode).toBe("PLATFORM_SELLS");
    expect(body.poojaType).toBe("सत्यनारायण कथा"); // keyed per pooja, unlike scope A
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// F43-02 — "voice input resolves to a universal ID, not a display string."
//
// TODAY'S TRUTH: it resolves to a DISPLAY STRING. VoiceOption carries no id;
// matchVisibleOption substring-matches the rendered label. Every assertion in
// this block is a GAP PIN — it freezes the label-only contract so that the day
// IDs arrive, this block goes red and the F43-02 register row must be updated.
// ═════════════════════════════════════════════════════════════════════════════

describe("F43-02 — voice resolution is label-based (GAP PINS)", () => {
  it("F43-02 GAP: VoiceOption has NO id field — the resolution contract is label-only", () => {
    // GAP PIN, enforced by `tsc --noEmit`, not by vitest. Today `id` is an
    // excess property on the VoiceOption object literal, so the @ts-expect-error
    // is satisfied. The MOMENT someone adds `id` to VoiceOption
    // (apps/pandit/src/lib/voiceController.ts:75-79) this stops being an error
    // and tsc fails on an unused @ts-expect-error — which is the alarm.
    const withId: VoiceOption = {
      label: "सत्यनारायण कथा",
      // @ts-expect-error — VoiceOption has no `id`. See the comment above.
      id: "SATYANARAYAN",
      onSelect: () => {},
    };
    expect(withId.label).toBe("सत्यनारायण कथा");
  });

  it("F43-02 GAP: useVoiceOptions STRIPS any id a caller passes before registering", async () => {
    // GAP PIN. The hook rebuilds each option as a {label, keywords, onSelect}
    // proxy (useVoiceScreen.ts:99-107), so even a caller who tries to carry an
    // ID into the registry loses it. Nothing downstream of resolution can be
    // ID-correct today.
    const spy = vi.spyOn(voiceController, "registerOptions");
    const Screen = () => {
      useVoiceOptions([
        // the id is deliberately smuggled in to prove it is dropped
        { label: "सत्यनारायण कथा", id: "SATYANARAYAN", onSelect: () => {} } as VoiceOption,
      ]);
      return null;
    };
    await mount(React.createElement(Screen));

    expect(spy).toHaveBeenCalled();
    const registered = spy.mock.calls[spy.mock.calls.length - 1][0] as readonly VoiceOption[];
    expect(registered).toHaveLength(1);
    expect((registered[0] as unknown as Record<string, unknown>).id).toBeUndefined();
    expect(registered[0].label).toBe("सत्यनारायण कथा");
    spy.mockRestore();
  });

  it("F43-02 GAP: matching is a substring test on the PRINTED label", async () => {
    const hit: string[] = [];
    const Screen = () => {
      useVoiceOptions([{ label: "सत्यनारायण कथा", onSelect: () => hit.push("hit") }]);
      return null;
    };
    await mount(React.createElement(Screen));

    // a fragment of the label MATCHES → the choice becomes pending, keyed by
    // the printed label (this IS the gap: label is the match key, no id).
    await act(async () => {
      voiceController.handleTranscript("सत्यनारायण", 1);
    });
    expect(voiceController.pendingOptionLabel()).toBe("सत्यनारायण कथा");
    // …and confirming it commits (F02-06 gate does not change the match key)
    await act(async () => {
      voiceController.handleTranscript("हाँ", 1);
    });
    expect(hit).toEqual(["hit"]);
  });

  it("F43-02 GAP: the same pooja spoken in another script does NOT resolve", async () => {
    // GAP PIN — this is the concrete cost of label-only matching, and the
    // reason F43-02 is 🟡. There is no ID-keyed alias table, so the pooja is
    // speakable ONLY as the string currently rendered. A pandit whose UI is in
    // another language cannot reach the card by its Hindi name, and vice versa.
    const hit: string[] = [];
    const Screen = () => {
      useVoiceOptions([{ label: "सत्यनारायण कथा", onSelect: () => hit.push("hit") }]);
      return null;
    };
    await mount(React.createElement(Screen));

    for (const utterance of ["satyanarayan katha", "सत्यनारायण पूजा", "ସତ୍ୟନାରାୟଣ"]) {
      await act(async () => {
        voiceController.handleTranscript(utterance, 1);
      });
    }
    expect(hit, "cross-script resolution started working — F43-02 may now be ✅").toEqual([]);
  });

  it("F43-02 GAP: two options sharing a label are indistinguishable — order decides, not identity", async () => {
    // GAP PIN. With a universal ID the two would be separable. With label
    // identity, one of them is simply unreachable by voice.
    const hit: string[] = [];
    const Screen = () => {
      useVoiceOptions([
        { label: "गणेश पूजा", onSelect: () => hit.push("GANESH_HOME") },
        { label: "गणेश पूजा", onSelect: () => hit.push("GANESH_SHOP") },
      ]);
      return null;
    };
    await mount(React.createElement(Screen));

    await speakAndConfirm("गणेश पूजा");
    expect(hit).toHaveLength(1);
    expect(hit[0]).toBe("GANESH_HOME"); // first registered wins; the other is dead
  });

  it("F43-02: an ID reaches state ONLY when a caller's closure happens to capture one", async () => {
    // The partial-credit half of 🟡, pinned honestly: resolution itself yields
    // no ID, but a caller that closes over one (as readiness/page.tsx:824-832
    // does with spec.id) still lands the ID in state. This test pins that the
    // ID comes from the CLOSURE, not from the match — swap the label and the
    // same ID still arrives.
    const stored: string[] = [];
    const Screen = () => {
      useVoiceOptions([
        { label: "सत्यनारायण कथा", onSelect: () => stored.push("SATYANARAYAN") },
      ]);
      return null;
    };
    await mount(React.createElement(Screen));

    await speakAndConfirm("सत्यनारायण");
    expect(stored).toEqual(["SATYANARAYAN"]);
  });
});
