import { describe, it, expect, afterEach } from "vitest";
import { voiceController } from "@/lib/voiceController";
import {
  STEPS_5,
  STEPS_7,
  STEP_7_TO_5,
  migrateStep,
  teamOptionLabel,
  teamOptionKeywords,
} from "./stepModel";

// ─────────────────────────────────────────────────────────────
// 7→5 MERGE GUARD. The two things that can silently break when three
// steps become one:
//   A. draft.step remap — a pandit resuming a 7-step draft must land on
//      the right merged step, and a corrupt value must not strand him.
//   B. VOICE GRAMMAR CO-MOUNTING — आपूर्ति and टीम each registered their
//      own useVoiceOptions group. Merged, BOTH mount at once, alongside
//      the दक्षिणा money field. These tests drive the REAL
//      voiceController matcher, not a mock.
// ─────────────────────────────────────────────────────────────

const disposers: Array<() => void> = [];
afterEach(() => {
  while (disposers.length) disposers.pop()!();
});

/** register a group the way useVoiceOptions does, and track its disposer */
function mountOptions(options: Array<{ label: string; keywords?: string[]; onSelect: () => void }>) {
  const off = voiceController.registerOptions(options);
  disposers.push(off);
  return off;
}

const SUPPLY = (hit: string[]) => [
  { label: "हाँ, मैं लाऊँगा", onSelect: () => hit.push("PANDIT_BRINGS") },
  { label: "प्लेटफ़ॉर्म बेचे", onSelect: () => hit.push("PLATFORM_SELLS") },
  { label: "सिर्फ़ सूची", onSelect: () => hit.push("LIST_ONLY") },
];

const TEAM_FIXED = (hit: string[]) =>
  [1, 2, 3, 4, 5].map((n) => ({
    label: teamOptionLabel(n),
    keywords: teamOptionKeywords(n),
    onSelect: () => hit.push(`team:${n}`),
  }));

/** the OLD, unsafe shape — bare digits, kept only to prove the hazard */
const TEAM_DIGITS = (hit: string[]) =>
  [1, 2, 3, 4, 5].map((n) => ({
    label: `${n}`,
    keywords: [`${n}`],
    onSelect: () => hit.push(`team:${n}`),
  }));

describe("A. draft.step remap (7 -> 5)", () => {
  it("maps every old step onto a real new step", () => {
    expect(STEP_7_TO_5).toHaveLength(STEPS_7.length);
    for (const mapped of STEP_7_TO_5) {
      expect(mapped).toBeGreaterThanOrEqual(0);
      expect(mapped).toBeLessThan(STEPS_5.length);
    }
  });

  it("folds आपूर्ति, टीम and दक्षिणा onto the SAME merged step", () => {
    expect(migrateStep(2)).toBe(migrateStep(3));
    expect(migrateStep(3)).toBe(migrateStep(4));
    expect(STEPS_5[migrateStep(2)]).toBe("और थोड़ी बातें");
  });

  it("keeps the steps either side of the merge intact", () => {
    expect(STEPS_5[migrateStep(0)]).toBe("नाम");
    expect(STEPS_5[migrateStep(1)]).toBe("सामग्री");
    expect(STEPS_5[migrateStep(5)]).toBe("वीडियो");
    expect(STEPS_5[migrateStep(6)]).toBe("भेजें");
  });

  it("never strands a pandit on a corrupt draft", () => {
    for (const bad of [-1, 99, 2.5, NaN, undefined, null, "3", {}]) {
      const s = migrateStep(bad as unknown);
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThan(STEPS_5.length);
    }
  });
});

describe("B. voice grammar co-mounting", () => {
  it("two option groups COEXIST — registering the second does not clobber the first", () => {
    const hit: string[] = [];
    mountOptions(SUPPLY(hit));
    mountOptions(TEAM_FIXED(hit));

    // a supply phrase still resolves with the team group mounted on top
    expect(voiceController.handleTranscript("हाँ, मैं लाऊँगा", 1)).toBe(true);
    expect(hit).toContain("PANDIT_BRINGS");

    // and the team group resolves too
    expect(voiceController.handleTranscript("3 पंडित", 1)).toBe(true);
    expect(hit).toContain("team:3");
  });

  it("unmounting one group leaves the other working (no shared-state damage)", () => {
    const hit: string[] = [];
    mountOptions(SUPPLY(hit));
    const offTeam = mountOptions(TEAM_FIXED(hit));
    offTeam();

    expect(voiceController.handleTranscript("सिर्फ़ सूची", 1)).toBe(true);
    expect(hit).toContain("LIST_ONLY");
    // the unmounted team grammar must be gone
    hit.length = 0;
    voiceController.handleTranscript("4 पंडित", 1);
    expect(hit).not.toContain("team:4");
  });

  it("unmounting BOTH leaves no listener behind", () => {
    const hit: string[] = [];
    const offA = mountOptions(SUPPLY(hit));
    const offB = mountOptions(TEAM_FIXED(hit));
    offA();
    offB();
    voiceController.handleTranscript("हाँ, मैं लाऊँगा", 1);
    voiceController.handleTranscript("2 पंडित", 1);
    expect(hit).toEqual([]);
  });

  it("REGRESSION: bare-digit labels steal a spoken money amount", () => {
    // This is the hazard the merge would introduce if टीम kept "1".."5".
    // matchVisibleOption does `clean.includes(label)`, so "5000" contains
    // "5". Proven here so nobody reintroduces digit labels.
    const hit: string[] = [];
    mountOptions(TEAM_DIGITS(hit));
    voiceController.handleTranscript("5000", 1);
    expect(hit, "bare digit labels are unsafe beside a money field").toContain("team:5");
  });

  it("FIX: 'N पंडित' labels do NOT match a spoken amount", () => {
    const hit: string[] = [];
    mountOptions(SUPPLY(hit));
    mountOptions(TEAM_FIXED(hit));
    for (const amount of ["5000", "2100", "11000", "1500"]) {
      voiceController.handleTranscript(amount, 1);
    }
    expect(hit, `an amount was captured by the team grammar: ${hit.join(",")}`).toEqual([]);
  });

  it("team labels still resolve the way a pandit would say them", () => {
    const hit: string[] = [];
    mountOptions(TEAM_FIXED(hit));
    voiceController.handleTranscript("2 पंडित", 1);
    expect(hit).toContain("team:2");
  });

  it("supply and team labels do not collide with each other", () => {
    const hit: string[] = [];
    mountOptions(SUPPLY(hit));
    mountOptions(TEAM_FIXED(hit));
    voiceController.handleTranscript("प्लेटफ़ॉर्म बेचे", 1);
    expect(hit).toEqual(["PLATFORM_SELLS"]);
  });
});
