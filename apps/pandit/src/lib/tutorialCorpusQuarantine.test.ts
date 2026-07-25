import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// LATENT-CORPUS QUARANTINE (Isj ruling, 2026-07-25). The 11-language
// register audit found the machine-generated translation corpora are
// below the shishya bar (Marathi तुम्ही-register throughout; Tamil rows
// containing the TURKISH word "için" and non-words). Decision:
//   • onboarding-translations.ts — DELETED (imported by nothing; the only
//     orphan; recoverable from git history if a real pass ever wants it).
//   • tutorial-translations.ts — FENCED, not deleted (TutorialShell
//     imports it, but every caller leaves the `language` prop unset so
//     the deck renders Hindi-only). This guard pins the fence: no caller
//     may pass `language=` to TutorialShell until the corpus has passed a
//     real register review — flipping that prop ships the audit's known
//     defects to users in their mother tongue.
// ─────────────────────────────────────────────────────────────

const ROOT = join(__dirname, "..");

describe("latent translation corpus — quarantined until a real register pass", () => {
  it("onboarding-translations.ts stays deleted (it was orphaned machine output)", () => {
    expect(existsSync(join(ROOT, "lib", "onboarding-translations.ts"))).toBe(false);
  });

  it("no TutorialShell caller passes the language prop (the deck stays Hindi-only)", () => {
    const v2 = readFileSync(join(ROOT, "app", "onboarding", "TutorialV2.tsx"), "utf8");
    // every <TutorialShell usage, scanned to its closing '>'
    let idx = 0;
    let found = 0;
    while ((idx = v2.indexOf("<TutorialShell", idx)) !== -1) {
      found++;
      const open = v2.slice(idx, v2.indexOf(">", idx));
      expect(open, "a caller passes language= — the quarantined corpus would ship").not.toMatch(/\slanguage=/);
      idx += 14;
    }
    expect(found).toBeGreaterThan(0); // the shell is still in use (fence still needed)
  });

  it("the corpus file carries the quarantine header (the next author must see it)", () => {
    const corpus = readFileSync(join(ROOT, "lib", "tutorial-translations.ts"), "utf8");
    expect(corpus).toMatch(/QUARANTINE/);
  });
});
