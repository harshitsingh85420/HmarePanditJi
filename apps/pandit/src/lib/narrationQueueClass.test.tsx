// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { computeFreshPaid } from "./payoutMoment";
import { hi } from "./strings";

// ─────────────────────────────────────────────────────────────
// NARRATION-QUEUE CLASS GUARD (Isj order after the THIRD sighting,
// 2026-07-25). The class: a line spoken outside the mount-narration
// channel dies to the next narration ~ms later. Sightings: the language
// switch's honesty notice (fixed: awaited), its confirmedLine (fixed),
// and earnings paidVoice (fixed here: FOLDED into the Narrate text — one
// utterance by construction). This guard pins the CLASS:
//   1. no bare speak() of a money/moment line that a Narrate on the same
//      screen will kill (earnings pinned; audit sites appended below);
//   2. the switch awaits stay awaited (delegated to its own guard file);
//   3. payout freshness: first-ever visit seeds silently — history never
//      replays as freshly paid; celebration amount = exact sum.
//   4. the day-one earnings intro promises nothing that doesn't exist.
// ─────────────────────────────────────────────────────────────

const SRC = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

describe("payout freshness (computeFreshPaid — single source)", () => {
  const rows = [
    { paidAt: "2026-07-24T10:00:00.000Z", amount: 5100 },
    { paidAt: "2026-07-20T10:00:00.000Z", amount: 1800 },
  ];
  it("FIRST-EVER visit: seeds silently, celebrates nothing", () => {
    const r = computeFreshPaid(rows, null);
    expect(r.fresh).toBeNull();
    expect(r.nextSeen).toBe(new Date("2026-07-24T10:00:00.000Z").getTime());
  });
  it("stale key: fresh = exact sum of strictly-newer rows (conservation)", () => {
    const r = computeFreshPaid(rows, String(new Date("2026-07-22T00:00:00.000Z").getTime()));
    expect(r.fresh).toBe(5100);
  });
  it("nothing newer: calm", () => {
    const r = computeFreshPaid(rows, String(new Date("2026-07-25T00:00:00.000Z").getTime()));
    expect(r.fresh).toBeNull();
  });
  it("an ISO-string key would have NaN'd every comparison — Number-parseable is the law", () => {
    const r = computeFreshPaid(rows, "not-a-number");
    // Number(junk)||0 → 0 → everything fresh: junk keys degrade to celebrate,
    // never to silence — but the WRITER only ever stores String(epoch)
    expect(r.fresh).toBe(6900);
  });
});

describe("narration-queue class — no dying lines", () => {
  const earnings = SRC("app/(dashboard-group)/earnings/page.tsx");
  it("earnings: paidVoice is FOLDED into the Narrate text, never a bare speak", () => {
    expect(earnings).not.toMatch(/speak\(t\("earnings\.paidVoice"/);
    expect(earnings).toMatch(/freshlyPaidAmount !== null\s*\?\s*`\$\{t\("earnings\.paidVoice"\)/);
  });
  it("earnings empty branch narrates the truthful day-one line", () => {
    expect(earnings).toMatch(/Narrate text=\{t\("earnings\.introEmptyVoice"\)\}/);
  });
  it("the day-one line exists, promises no incoming राशि, and holds the register", () => {
    expect(hi.earnings.introEmptyVoice).toBe("यह कमाई की स्क्रीन है। पहली पूजा के बाद यहाँ आपका पूरा हिसाब दिखेगा।");
    expect(hi.earnings.introEmptyVoice).not.toMatch(/आने वाली|पहुँचती|राशि/);
    expect(hi.earnings.introEmptyVoice).not.toMatch(/तुम|करो/);
  });
  it("the switch-path awaits remain pinned (companion guard present)", () => {
    const guard = SRC("app/onboarding/languageSwitchNotice.test.ts");
    expect(guard).toMatch(/await voiceController\\\.speakAndWait\\\(LANG_CONFIRM\\\[code\\\]\\\.fallbackNotice/);
  });
});

// ── THE CLASS, pinned at every audited site (workflow audit 2026-07-25:
// 7 DIES sites; the two KILLERS get interrupt:false = queue-not-assassinate,
// each dying line gets fold/await/overlay-ownership) ──────────────────
describe("narration-queue class — audited sites stay fixed", () => {
  it("KILLER 1 — useVoiceScreen mount narration queues (interrupt:false)", () => {
    const src = SRC("hooks/useVoiceScreen.ts");
    const mountSpeak = src.slice(src.indexOf("const timer = setTimeout"), src.indexOf("}, 150)"));
    expect(mountSpeak).toMatch(/interrupt:\s*false/);
  });
  it("KILLER 2 — VoiceField mount prompt queues (interrupt:false)", () => {
    const src = SRC("components/voice/VoiceField.tsx");
    expect(src).toMatch(/voiceController\.speak\(promptText, \{\s*interrupt: false/);
  });
  it("login: reauthForBooking is FOLDED into promptText, never a bare speak", () => {
    const src = SRC("app/(auth)/login/page.tsx");
    expect(src).not.toMatch(/speak\(t\("auth\.reauthForBooking"\)\)/);
    expect(src).toMatch(/reauthForBooking \? `\$\{t\("auth\.reauthForBooking"\)\} ` : ""/);
  });
  it("accept moment: the overlay OWNS acceptedVoice (no bare speak at the flip)", () => {
    const src = SRC("app/(dashboard-group)/bookings/[id]/request/page.tsx");
    expect(src).not.toMatch(/speak\(t\("booking\.acceptedVoice"\)\)/);
    expect(src).toMatch(/voiceLine=\{t\("booking\.acceptedVoice"\)\}/);
  });
  it("CelebrationOverlay: line awaited for auto-dismiss; tap stays immediate; failsafe", () => {
    const src = SRC("components/moments/CelebrationOverlay.tsx");
    expect(src).toMatch(/voiceController\.speakAndWait\(voiceLine\)/);
    expect(src).toMatch(/onClick=\{finish\}/); // hostage law: tap never waits
    expect(src).toMatch(/Math\.max\(autoMs, 12000\)/); // hung-synth failsafe
  });
  it("दक्षिणा floor error: heard IN FULL before go(2) swaps the step", () => {
    const src = SRC("app/(dashboard-group)/my-poojas/add/page.tsx");
    expect(src).toMatch(/await voiceController\.speakAndWait\(floorMsg\);\s*\n\s*go\(2\)/);
  });
  it("samagri saved-ack: awaited before onSaved() unmounts the editor", () => {
    const src = SRC("components/SamagriPackageEditor.tsx");
    expect(src).toMatch(/await voiceController\.speakAndWait\(t\("samagri\.saved"\)\);\s*\n\s*onSaved\?\.\(\)/);
  });
  it("tutorial unmute celebration: advanceAsk queues behind shishya.wake", () => {
    const src = SRC("app/onboarding/TutorialV2.tsx");
    expect(src).toMatch(/voiceController\.speak\(advanceAsk, \{ interrupt: false \}\)/);
  });
});
