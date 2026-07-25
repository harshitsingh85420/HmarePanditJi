import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// NARRATION-QUEUE LAW (Isj ruling, 2026-07-25) — the switch's own line
// must COMPLETE before the flow advances and the next screen's intro may
// speak. Twice live-proven defect: the honesty notice (fail path) was
// fire-and-forgotten with bare speak(), and PARICHAY's mount interrupted
// it 25ms (PAGE 3) / 9ms (PAGE 3-A row 1) in — the pandit NEVER heard why
// the app stayed in Hindi. The fix is a queue property, not a timer:
// runLanguageSwitch awaits speakAndWait (whose outcome semantics —
// ended/interrupted/parked/muted — always resolve, never hang), and both
// callers advance only in .then() after the switch resolves.
// ─────────────────────────────────────────────────────────────

const src = readFileSync(join(__dirname, "page.tsx"), "utf8");
const start = src.indexOf("const runLanguageSwitch");
const body = src.slice(start, src.indexOf("\n  };", start));

describe("language switch — notice-then-intro order (narration queue)", () => {
  it("runLanguageSwitch exists and is async (the callers can sequence on it)", () => {
    expect(start).toBeGreaterThan(0);
    expect(body).toMatch(/async \(code: LangCode\)/);
  });

  it("the HONESTY NOTICE is awaited to completion — never a bare speak()", () => {
    expect(body).toMatch(/await voiceController\.speakAndWait\(LANG_CONFIRM\[code\]\.fallbackNotice/);
    expect(body, "fire-and-forget notice = the 9ms kill returns").not.toMatch(
      /voiceController\.speak\(LANG_CONFIRM\[code\]\.fallbackNotice/,
    );
  });

  it("the success confirmedLine is awaited too (same preemption risk on prod)", () => {
    expect(body).toMatch(/await voiceController\.speakAndWait\(LANG_CONFIRM\[code\]\.confirmedLine/);
    expect(body).not.toMatch(/voiceController\.speak\(LANG_CONFIRM\[code\]\.confirmedLine/);
  });

  it("both callers advance only AFTER the switch resolves (.then chains the queue)", () => {
    // onYes (confirm ceremony) and onSelect (list) both sequence the
    // confirmed-flag + navigation behind runLanguageSwitch's promise.
    const thens = src.match(/void runLanguageSwitch\((?:detectedCode|code)\)\.then\(/g) || [];
    expect(thens.length, "both switch callers must chain on the promise").toBeGreaterThanOrEqual(2);
  });
});
