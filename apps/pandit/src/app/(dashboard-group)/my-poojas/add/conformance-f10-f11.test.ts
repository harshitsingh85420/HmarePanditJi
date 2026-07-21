// ─────────────────────────────────────────────────────────────
// CONFORMANCE PIN — F10 (Team Size) and F11 (Dakshina Setup).
//
// These requirements are ✅/🟡 TODAY. This file FREEZES what is true right
// now so a future edit that silently breaks them fails the build. It is
// not aspirational: where a requirement is only partly met the test
// asserts the PART THAT IS TRUE, and — where marked GAP — asserts the
// absence too, so CLOSING the gap fails here and forces whoever closed it
// to come back and update docs/pandit-pov-conformance-register.md.
//
// IDs pinned here: F10-01, F10-02, F11-01, F11-02.
// F10-03 is pinned by stepModel.test.ts (the ₹5000→teamSize=5 grammar
// collision) — deliberately NOT duplicated here.
//
// Everything below drives the REAL AddPooja5Page component and the REAL
// voiceController. Only the three things a jsdom run cannot have are
// mocked: the Next router, the network (mutateOnce) and the microphone
// (useVoiceInput). TTS is spied, not faked away — the spy IS the
// evidence for the F11-01 spoken-vs-written split.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup, screen, act, fireEvent, within } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  nav: vi.fn(),
  mutateOnce: vi.fn(async () => ({ success: true }) as { success: boolean }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.nav, replace: mocks.nav, back: mocks.nav, prefetch: mocks.nav }),
  usePathname: () => "/my-poojas/add",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/mutate", () => ({
  mutateOnce: mocks.mutateOnce,
  once: (_k: string, fn: () => Promise<unknown>) => fn(),
}));

// the mic: inert. The loop still ARMS (so promptText is spoken and the
// field-claim hook registers) — it just never hears anything by itself.
vi.mock("@/hooks/useVoiceInput", () => ({
  useVoiceInput: () => ({
    state: "idle" as const,
    transcript: null,
    confidence: null,
    heardSpeech: false,
    start: async () => {},
    stop: () => {},
    reset: () => {},
    showExplainer: false,
    proceedWithPermission: async () => {},
    cancelExplainer: () => {},
  }),
}));

import { voiceController } from "@/lib/voiceController";
import { reduce, type VFState } from "@/components/voice/voiceFieldMachine";
import AddPooja5Page from "./page";

const DRAFT_KEY = "add-pooja-draft";

/** old(7-step) step index → the component remaps it via migrateStep */
const OLD_STEP_TEAM = 3; // आपूर्ति+टीम+दक्षिणा → merged step 2
const OLD_STEP_VIDEO = 5; // वीडियो → step 3

let speakSpy: ReturnType<typeof vi.spyOn>;

/** every string the screen actually SPOKE, in order */
const spokenLines = (): string[] => speakSpy.mock.calls.map((c) => String(c[0]));
const spokenCorpus = (): string => spokenLines().join(" ⏎ ");

/**
 * The टीम card — scoped, because the header's ProgressDots ALSO renders
 * buttons labelled 1..5 and a document-wide getByRole would match both.
 * Anchored on the self-inclusive caption so it cannot drift to another card.
 */
function teamCard(): HTMLElement {
  const caption = screen.getByText(/पंडित \(आप सहित\)$/);
  const card = caption.parentElement;
  if (!card) throw new Error("टीम card not found around the (आप सहित) caption");
  return card as HTMLElement;
}

function renderDraft(draft: Record<string, unknown>) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  const utils = render(React.createElement(AddPooja5Page));
  // narration fires at 150ms, the VoiceField prompt at 400ms
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  return utils;
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  mocks.nav.mockClear();
  mocks.mutateOnce.mockClear();
  voiceController.setMuted(false);
  speakSpy = vi.spyOn(voiceController, "speak").mockImplementation(() => {
    // swallow TTS; deliberately do NOT invoke onEnd — the loop must not
    // advance on its own, so each test drives exactly what it means to.
  }) as unknown as ReturnType<typeof vi.spyOn>;
});

afterEach(() => {
  cleanup();
  speakSpy.mockRestore();
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────
// F10-01 — "self included in the count"
//
// TRUE TODAY: the count the pandit picks INCLUDES himself, and the screen
// says so in writing, live, tracking the picker. The register's quoted
// script "…आप मुख्य पंडित होंगे" is not the literal string shipped —
// the shipped statement is "(आप सहित)". These tests pin the SEMANTICS
// (self is inside the number) rather than a copy string, because that is
// what the requirement is actually about and what a regression would eat.
// ─────────────────────────────────────────────────────────────
describe("F10-01 — the team count includes the pandit himself", () => {
  it("F10-01: the default team size is 1, i.e. the pandit alone — never 0", () => {
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा" });
    // an empty draft means "just me": the self-inclusive statement must
    // read 1, not 0. A 0-based count would be the regression.
    expect(screen.getByText("1 पंडित (आप सहित)")).toBeInTheDocument();
    expect(within(teamCard()).queryByRole("button", { name: "0" })).toBeNull();
  });

  it("F10-01: the picker offers 1..5 — there is no 'zero pandits' option", () => {
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा" });
    const picker = within(teamCard());
    for (const n of ["1", "2", "3", "4", "5"]) {
      expect(picker.getByRole("button", { name: n })).toBeInTheDocument();
    }
    expect(picker.queryByRole("button", { name: "6" })).toBeNull();
  });

  it("F10-01: the '(आप सहित)' statement tracks the picked number, live", () => {
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 3 });
    expect(screen.getByText("3 पंडित (आप सहित)")).toBeInTheDocument();

    act(() => {
      fireEvent.click(within(teamCard()).getByRole("button", { name: "4" }));
    });
    expect(screen.getByText("4 पंडित (आप सहित)")).toBeInTheDocument();
    expect(screen.queryByText("3 पंडित (आप सहित)")).toBeNull();
  });

  it("F10-01: the dakshina card restates the same self-inclusive count", () => {
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 3 });
    // one number, two places — they must not drift apart
    expect(screen.getByText("3 पंडित (आप सहित)")).toBeInTheDocument();
    expect(screen.getByText("सत्यनारायण कथा (3 पंडितों सहित)")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────
// F10-02 — "per-pooja team size stored"
//
// TRUE TODAY: the picked size is POSTed to /pandit/pooja-config keyed by
// poojaType, and the idempotency key is per-pooja too, so two poojas
// cannot collapse onto one config row.
//
// NOT PINNED HERE (see the register): the requirement's second clause,
// "shown to customer side". PoojaConfig is served only by
// pandit-authenticated routes; the teamSize customers see is the
// PROFILE-level one, not this per-pooja value. Pinning that would need an
// API-tree test and a customer surface that does not exist yet.
// ─────────────────────────────────────────────────────────────
describe("F10-02 — the per-pooja team size is stored against that pooja", () => {
  const fullDraft = (over: Record<string, unknown> = {}) => ({
    step: OLD_STEP_VIDEO,
    name: "रुद्राभिषेक",
    desc: "शिव पूजा",
    items: { BASIC: [], STANDARD: [], PREMIUM: [] },
    prices: { BASIC: null, STANDARD: null, PREMIUM: null },
    supplyMode: "PANDIT_BRINGS",
    teamSize: 4,
    dakshina: 5100,
    videoUrl: "https://youtu.be/abcdefghijk",
    consent: true,
    ...over,
  });

  async function submitDraft(over: Record<string, unknown> = {}) {
    renderDraft(fullDraft(over));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "पूजा भेजिए" }));
      await Promise.resolve();
    });
    return mocks.mutateOnce.mock.calls as unknown as Array<
      [string, string, { method: string; body: string }]
    >;
  }

  it("F10-02: teamSize is sent to /pandit/pooja-config with the pooja it belongs to", async () => {
    const calls = await submitDraft();
    const config = calls.find((c) => c[1] === "/pandit/pooja-config");
    expect(config, "no /pandit/pooja-config POST was made").toBeTruthy();

    const body = JSON.parse(config![2].body);
    expect(config![2].method).toBe("POST");
    expect(body.poojaType).toBe("रुद्राभिषेक");
    expect(body.teamSize).toBe(4);
  });

  it("F10-02: the picked size — not a hardcoded default — is what gets stored", async () => {
    const calls = await submitDraft({ teamSize: 2 });
    const body = JSON.parse(calls.find((c) => c[1] === "/pandit/pooja-config")![2].body);
    expect(body.teamSize).toBe(2);
  });

  it("F10-02: the config write is keyed PER POOJA, so two poojas cannot share a row", async () => {
    const first = await submitDraft();
    const firstKey = first.find((c) => c[1] === "/pandit/pooja-config")![0];
    cleanup();
    mocks.mutateOnce.mockClear();

    const second = await submitDraft({ name: "गृह प्रवेश", teamSize: 5 });
    const secondCall = second.find((c) => c[1] === "/pandit/pooja-config")!;
    expect(secondCall[0]).not.toBe(firstKey);
    expect(secondCall[0]).toContain("गृह प्रवेश");
    expect(JSON.parse(secondCall[2].body).teamSize).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────
// F11-02 — "amount confirm loop before save"
//
// TRUE TODAY, in two halves that must BOTH hold:
//   (a) the VoiceField machine never commits a parsed amount without an
//       explicit हाँ — CONFIRMING sits between the transcript and the
//       committed value;
//   (b) the दक्षिणा field on the merged step really routes through that
//       machine, and nothing is SAVED while the loop is open.
// ─────────────────────────────────────────────────────────────
describe("F11-02 — a spoken amount is confirmed before it is committed", () => {
  const moneyCtx = {
    attempts: 0,
    mode: "money",
    parse: (t: string) => (/^\d+$/.test(t.trim()) ? String(parseInt(t, 10)) : null),
  };

  it("F11-02: a heard amount enters CONFIRMING — it is NOT emitted straight away", () => {
    const r = reduce({ phase: "LISTENING" }, { type: "TRANSCRIPT", text: "5100", confidence: 1 }, moneyCtx);
    expect(r.next.phase).toBe("CONFIRMING");
    expect((r.next as Extract<VFState, { phase: "CONFIRMING" }>).parsed).toBe("5100");
    expect(r.effects).toContain("SPEAK_CONFIRM");
    expect(r.effects).not.toContain("EMIT_VALUE");
    expect(r.accepted).toBeUndefined();
  });

  it("F11-02: only हाँ emits the value", () => {
    const confirming: VFState = { phase: "CONFIRMING", heard: "5100", parsed: "5100" };
    const yes = reduce(confirming, { type: "CONFIRM_YES" }, moneyCtx);
    expect(yes.effects).toContain("EMIT_VALUE");
    expect(yes.accepted).toBe("5100");
  });

  it("F11-02: नहीं re-opens the listen and emits nothing", () => {
    const confirming: VFState = { phase: "CONFIRMING", heard: "5100", parsed: "5100" };
    const no = reduce(confirming, { type: "CONFIRM_NO" }, moneyCtx);
    expect(no.next.phase).toBe("LISTENING");
    expect(no.effects).not.toContain("EMIT_VALUE");
    expect(no.accepted).toBeUndefined();
  });

  it("F11-02: the live दक्षिणा field opens the confirm loop for a spoken amount", () => {
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 3, supplyMode: "LIST_ONLY" });

    let outcome = "";
    act(() => {
      outcome = voiceController.injectTranscript("5100");
    });
    // the money field claimed it (not the team/supply option grammar)
    expect(outcome, "the amount was not claimed by the दक्षिणा field").toBe("field");

    // the confirmation is on screen, with the parsed amount and both answers
    expect(screen.getByText(/सही है\?/)).toBeInTheDocument();
    expect(screen.getByText("5100")).toBeInTheDocument();
  });

  it("F11-02: nothing is SAVED while the confirmation is still open", () => {
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 3, supplyMode: "LIST_ONLY" });
    act(() => {
      voiceController.injectTranscript("5100");
    });
    expect(screen.getByText(/सही है\?/)).toBeInTheDocument();
    expect(mocks.mutateOnce, "a save fired while the amount was unconfirmed").not.toHaveBeenCalled();
  });

  it("F11-02: answering नहीं closes the confirmation without saving", () => {
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 3, supplyMode: "LIST_ONLY" });
    act(() => {
      voiceController.injectTranscript("5100");
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /नहीं|नही/ }));
    });
    expect(screen.queryByText(/सही है\?/)).toBeNull();
    expect(mocks.mutateOnce).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// F11-01 — "voice script states the total covers ALL pandits' dakshina"
//                                     🟡 PARTIAL
//
// The MEANING ships, but only in silent 13px text. The two strings this
// screen actually SPEAKS — the Narrate line and the दक्षिणा VoiceField
// promptText — never say it. For a voice-first 62-year-old that is the
// difference between being told and not being told.
//
// The first test pins the part that IS true. The two that follow pin the
// ABSENCE. They are GAP TESTS: they document what is missing, not what is
// wanted. Closing the gap (speaking the sentence, or making the written
// line conditional on teamSize > 1) MUST fail them — that failure is the
// prompt to update the register entry from 🟡 to ✅. Do not "fix" them by
// loosening the assertion.
// ─────────────────────────────────────────────────────────────
describe("F11-01 — the all-pandits statement is written, not spoken", () => {
  it("F11-01: the written line under the money field does state it", () => {
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 3 });
    expect(screen.getByText("इसमें बाकी पंडितों की दक्षिणा भी शामिल है।")).toBeInTheDocument();
  });

  it("F11-01: both of the screen's spoken strings really were captured", () => {
    // Guards the two GAP tests below from passing vacuously: if the screen
    // spoke nothing at all, a "the speech omits X" assertion would be
    // meaningless. This proves the speech channel is live and recorded.
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 3 });
    const corpus = spokenCorpus();
    expect(corpus, "the screen narration was not spoken").toContain(
      "अब तीन छोटी बातें — सामान कौन लाएगा, कितने पंडित चाहिए, और कुल दक्षिणा कितनी।",
    );
    expect(corpus, "the दक्षिणा field prompt was not spoken").toContain(
      "इस पूजा की कुल दक्षिणा बोलिए",
    );
  });

  it("F11-01: KNOWN GAP — no spoken string says the total covers all pandits", () => {
    // DOCUMENTS A GAP, not a desired property. When someone makes the
    // narration or the field prompt say it, this test fails on purpose:
    // update docs/pandit-pov-conformance-register.md (F11-01 🟡 → ✅) and
    // delete this test, replacing it with the positive assertion.
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 3 });
    const corpus = spokenCorpus();
    const ALL_PANDITS = /बाकी पंडित|सभी पंडित|पंडितों की दक्षिणा|पंडितों सहित|मुख्य पंडित/;
    expect(
      ALL_PANDITS.test(corpus),
      `F11-01 looks CLOSED — spoken text now carries the all-pandits statement:\n${corpus}\nUpdate the register and replace this gap test.`,
    ).toBe(false);
  });

  it("F11-01: KNOWN GAP — the written line is unconditional, wrong at teamSize 1", () => {
    // DOCUMENTS A GAP. A solo pandit is told his total includes "the other
    // pandits'" dakshina, and the label reads the ungrammatical
    // "1 पंडितों सहित". Making either conditional fails this test — which
    // is the point: come back and update the register.
    renderDraft({ step: OLD_STEP_TEAM, name: "सत्यनारायण कथा", teamSize: 1 });
    expect(
      screen.queryByText("इसमें बाकी पंडितों की दक्षिणा भी शामिल है।"),
      "F11-01 gap (2) looks CLOSED — the line is now conditional. Update the register.",
    ).toBeInTheDocument();
    expect(screen.getByText("सत्यनारायण कथा (1 पंडितों सहित)")).toBeInTheDocument();
  });
});
