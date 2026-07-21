import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { hi } from "./strings";

// ─────────────────────────────────────────────────────────────
// NO-ROMAN-LETTERS guard (PW-04, PROPOSED → built 2026-07-21).
//
// The persona reads Devanagari only. Roman text at UI size is a wall.
// This guard scans everything शिष्य writes for [A-Za-z] runs and fails on
// any that is not on the WHITELIST below.
//
// THE WHITELIST IS NOT A LOOPHOLE — every entry is either (a) roman that
// CANON ITSELF renders (OTP, +91, Allow, WhatsApp, AES-256, REC — verified
// against the bundle), (b) a technical token with no Devanagari form
// (UPI/IFSC/bank formats, rail classes), or (c) a non-displayed value
// (template {tokens}, URLs, emails, lang codes, Material icon ligatures —
// which render as DRAWN ICONS, not text).
//
// LEGACY_EXEMPT routes have no canon artboard (listed for Isj's page-level
// ruling; the directive is touch-nothing) — they are named here so their
// debt is visible, not laundered.
// ─────────────────────────────────────────────────────────────

const WHITELIST = [
  "OTP", // canon frame 7 writes roman OTP ("OTP डालिए")
  "Allow", // canon frame 4: the OS button's own name
  "WhatsApp", // canon frame 23
  "AES", // canon: "· AES-256"
  "REC", // canon frame 5e video chrome
  "UPI",
  "IFSC",
  "SBIN", // bank-format placeholder
  "example", // example@upi placeholder
  "upi",
  "AC", // rail classes 3AC/2AC/AC/Non-AC
  "Non",
  "km",
  "HmarePanditJi", // brand
  "hi", // lang codes hi / hi-IN
  "IN",
  "e", // an "e.g."-style leftover guard (single letters from ₹-formats)
  // language-switch affordances stay findable by readers who CANNOT read
  // Devanagari — the same principle as canon's roman language subtitles
  "Change",
  "Language",
];

const WORD = /[A-Za-z]{1,}/g;

function stripNonDisplay(s: string): string {
  return s
    .replace(/\{[a-zA-Z]+\}/g, " ") // template tokens
    .replace(/https?:\/\/\S+/g, " ") // URLs
    .replace(/\S+@\S+\.\S+/g, " "); // emails
}

function romanViolations(s: string): string[] {
  const words = stripNonDisplay(s).match(WORD) ?? [];
  return words.filter((w) => !WHITELIST.includes(w));
}

function flatten(obj: unknown, path: string, out: Array<{ path: string; value: string }>) {
  if (typeof obj === "string") out.push({ path, value: obj });
  else if (Array.isArray(obj)) obj.forEach((v, i) => flatten(v, `${path}[${i}]`, out));
  else if (obj && typeof obj === "object")
    for (const [k, v] of Object.entries(obj as Record<string, unknown>))
      flatten(v, path ? `${path}.${k}` : k, out);
}

describe("PW-04 — no roman letters in what शिष्य writes (PROPOSED, built)", () => {
  it("the scanner itself can fail (proof-of-teeth fixtures)", () => {
    expect(romanViolations("Skip to next")).toEqual(["Skip", "to", "next"]);
    expect(romanViolations("XXXXXXXXXX")).toEqual(["XXXXXXXXXX"]);
    expect(romanViolations("Validating referral code...")).toContain("Validating");
    // …and the whitelist holds:
    expect(romanViolations("OTP डालिए")).toEqual([]);
    expect(romanViolations("'अनुमति दें' / 'Allow' दबाइए")).toEqual([]);
    expect(romanViolations("WhatsApp पर पूछिए")).toEqual([]);
    expect(romanViolations("आपकी जानकारी सुरक्षित है · AES-256")).toEqual([]);
    expect(romanViolations("+91 {phone} पर भेजा गया")).toEqual([]);
    expect(romanViolations("12 रुपये प्रति km")).toEqual([]);
  });

  it("strings.ts display values carry no unlisted roman", () => {
    const rows: Array<{ path: string; value: string }> = [];
    flatten(hi, "hi", rows);
    const hits = rows
      // non-displayed data keys: shishya intent-group tags, voice-script roman
      // transliteration mirrors (spoken via TTS for keypad users, never shown)
      .filter((r) => !/\.g$|roman/i.test(r.path))
      .map((r) => ({ ...r, bad: romanViolations(r.value) }))
      .filter((r) => r.bad.length > 0);
    expect(
      hits.map((h) => `${h.path}: [${h.bad.join(", ")}] in "${h.value.slice(0, 70)}"`),
    ).toEqual([]);
  });

  it("JSX text carries no unlisted roman (canon-frame surface; legacy routes named-exempt)", () => {
    const SRC = join(__dirname, "..");
    // No canon artboard exists for these routes — page-level founder ruling
    // pending (PW-06 family). Named here so the debt stays visible.
    const LEGACY_EXEMPT = [
      join("app", "(auth)", "homepage"),
      join("app", "(auth)", "referral"),
      join("app", "(auth)", "identity"),
    ];
    const files: string[] = [];
    (function walk(dir: string) {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
          if (["node_modules", "design", "dev", "test-voice", "test"].includes(name)) continue;
          walk(p);
        } else if (/\.tsx$/.test(p) && !/\.test\.tsx$/.test(p)) {
          if (LEGACY_EXEMPT.some((ex) => p.includes(ex))) continue;
          files.push(p);
        }
      }
    })(SRC);

    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      // JSX TEXT nodes only. The >…< net also catches TypeScript generics
      // and icon ligatures, so a candidate must LOOK like prose:
      //   · no code characters  ; = ( ) { } & | . ` $
      //   · not a bare snake_case token (Material icon ligatures — they
      //     render as DRAWN icons, not text)
      for (const m of src.matchAll(/>([^<>{}\n]*[A-Za-z]{2,}[^<>{}\n]*)</g)) {
        const text = m[1].trim();
        if (!text) continue;
        // skip matches sitting on comment lines (file-header ASCII art etc.)
        const lineStart = src.lastIndexOf("\n", m.index!) + 1;
        const line = src.slice(lineStart, src.indexOf("\n", m.index!)).trim();
        if (line.startsWith("//") || line.startsWith("*") || line.startsWith("/*")) continue;
        if (/[;={}()&|.`$]/.test(text)) continue; // code, not copy
        if (/^[a-z0-9_]+$/.test(text)) continue; // icon ligature
        if (/^(Promise|ReactNode|null|void|string|number|boolean)$/.test(text)) continue; // TS generic remnants
        const bad = romanViolations(text);
        if (bad.length > 0) {
          offenders.push(`${f.replace(SRC, "src")}: [${bad.slice(0, 4).join(", ")}] in "${text.slice(0, 60)}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
