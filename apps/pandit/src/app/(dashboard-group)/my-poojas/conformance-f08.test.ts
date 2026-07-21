import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup, screen, fireEvent, act } from "@testing-library/react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFORMANCE PINS for F08-02 / F08-03 / F08-06 (register:
// docs/pandit-pov-conformance-register.md lines 93-97; verified findings in
// docs/spec/VERIFY-RESULTS.md "## F08-03"; deviation D-03 in
// docs/spec/DEVIATIONS.md lines 79-99).
//
// These three are 🟡 PARTIAL today. This file does NOT try to make them
// conform — it FREEZES what is true right now on the live 5-step पूजा जोड़िए
// flow, so that a change which silently drops the video requirement, the
// recording checklist, or the YouTube-link submission shape fails the build.
//
// Two of the tests below deliberately assert a GAP (आसन missing; the checklist
// never being spoken). They are marked KNOWN GAP. Closing the gap is a GOOD
// thing and it MUST fail this file — that failure is the signal to update the
// register entry rather than to quietly move on.
// ─────────────────────────────────────────────────────────────────────────────

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/my-poojas/add",
  useSearchParams: () => new URLSearchParams(),
}));

/** Narrate renders null, so the only way to see what is SPOKEN is to capture it. */
const narrated: string[] = [];
vi.mock("@/hooks/useScreenVoice", () => ({
  Narrate: ({ text }: { text: string }) => {
    narrated.push(text);
    return null;
  },
  useScreenVoice: () => {},
  default: () => {},
}));

const mutateOnce = vi.fn(async () => ({ success: true }) as any);
vi.mock("@/lib/mutate", () => ({ mutateOnce: (...a: any[]) => mutateOnce(...(a as [])) }));

import AddPooja5Page from "./add/page";

const DRAFT_KEY = "add-pooja-draft";

/**
 * Land the component on the वीडियो step.
 *
 * NOTE the 5 — the page runs every persisted draft.step through
 * migrateStep(), which is the 7-step→5-step remap (STEP_7_TO_5 in
 * ./add/stepModel.ts). Old index 5 (वीडियो) is what maps to new index 3;
 * writing 3 here would land on "और थोड़ी बातें" instead.
 */
function seedVideoStep(over: Record<string, unknown> = {}) {
  localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({ step: 5, name: "सत्यनारायण पूजा", videoUrl: "", consent: false, ...over }),
  );
}

function renderVideoStep(over: Record<string, unknown> = {}) {
  seedVideoStep(over);
  return render(React.createElement(AddPooja5Page));
}

/** the narration attached to the वीडियो step (the last Narrate mounted) */
function videoStepNarration(): string {
  return narrated[narrated.length - 1] ?? "";
}

beforeEach(() => {
  narrated.length = 0;
  push.mockClear();
  mutateOnce.mockClear();
  localStorage.clear();
});
afterEach(cleanup);

// ─── F08-02 ──────────────────────────────────────────────────────────────────
// Register: "Per selected pooja: 2-minute video required; both paths offered —
// 'नया रिकॉर्ड कीजिए' / 'गैलरी से'". Status 🟡: the video IS required, but the
// two documented paths are not what is offered.
describe("F08-02 — per-pooja video is required, and which submission paths are actually offered", () => {
  it("F08-02: the 2-minute video requirement is stated in the step's narration", () => {
    renderVideoStep();
    expect(videoStepNarration()).toContain("दो मिनट");
  });

  it("F08-02: जमा कीजिए stays disabled until BOTH a video link and consent exist", () => {
    // no link, no consent
    const a = renderVideoStep();
    expect(a.getByRole("button", { name: /जमा कीजिए/ })).toBeDisabled();
    cleanup();

    // link but no consent — still blocked
    const b = renderVideoStep({ videoUrl: "https://youtu.be/dQw4w9WgXcQ", consent: false });
    expect(b.getByRole("button", { name: /जमा कीजिए/ })).toBeDisabled();
    cleanup();

    // consent but no link — still blocked
    const c = renderVideoStep({ videoUrl: "", consent: true });
    expect(c.getByRole("button", { name: /जमा कीजिए/ })).toBeDisabled();
    cleanup();

    // both — the only unlocked combination
    const d = renderVideoStep({ videoUrl: "https://youtu.be/dQw4w9WgXcQ", consent: true });
    expect(d.getByRole("button", { name: /जमा कीजिए/ })).toBeEnabled();
  });

  it("F08-02: exactly two paths are offered today — type a link, or hand it to WhatsApp", () => {
    const { container } = renderVideoStep();

    // path 1: a typed URL field
    const url = container.querySelector('input[inputmode="url"]') as HTMLInputElement | null;
    expect(url, "the typed-link path disappeared").not.toBeNull();
    expect(url!.placeholder).toContain("youtu.be");

    // path 2: the WhatsApp assist link (D-03 calls this load-bearing, not a convenience)
    const wa = Array.from(container.querySelectorAll("a")).find((a) =>
      (a.getAttribute("href") ?? "").includes("wa.me"),
    );
    expect(wa, "the WhatsApp help path disappeared").toBeTruthy();
    expect(wa!.getAttribute("href")).toContain("wa.me/918934095599");
  });

  it("F08-02: KNOWN GAP — neither documented path ('नया रिकॉर्ड कीजिए' / 'गैलरी से') exists", () => {
    // KNOWN GAP, not a desired property. The doc requires in-app capture AND a
    // gallery picker; we ship neither (deviation D-03). If someone builds either
    // one, this test fails — which is the point: come update F08-02/D-03.
    const { container } = renderVideoStep();

    expect(container.querySelectorAll('input[type="file"]').length).toBe(0);
    expect(container.querySelectorAll("[capture]").length).toBe(0);
    expect(container.querySelectorAll("video").length).toBe(0);

    const text = container.textContent ?? "";
    expect(text).not.toContain("रिकॉर्ड");
    expect(text).not.toContain("गैलरी");
  });
});

// ─── F08-03 ──────────────────────────────────────────────────────────────────
// Register: "Recording instructions delivered (मंत्रोच्चार, आसन, चेहरा साफ़)".
// Status 🟡, DOWNGRADED by the refute pass: 2 of the 3 documented items are
// delivered, आसन is absent everywhere, and delivery is on-screen text only.
describe("F08-03 — the recording checklist that is actually rendered on the वीडियो step", () => {
  /** the exact list the component renders today (add/page.tsx CHECK) —
   *  canon 18d's noun phrases, adopted by the exact-UI port */
  const RENDERED = [
    "साफ़ मंत्रोच्चार", // documented: मंत्रोच्चार
    "अच्छी रोशनी", // undocumented extra
    "चेहरा साफ़ दिखे", // documented: चेहरा साफ़
    "पूजा का माहौल", // undocumented extra here (माहौल is an F08-04 admin parameter)
  ];

  it("F08-03: the checklist card renders, titled अच्छे वीडियो के लिए", () => {
    renderVideoStep();
    expect(screen.getByText("अच्छे वीडियो के लिए")).toBeInTheDocument();
  });

  it("F08-03: it delivers exactly these four items, each as a ✅ line", () => {
    const { container } = renderVideoStep();
    const ticked = Array.from(container.querySelectorAll("span"))
      .map((s) => (s.textContent ?? "").trim())
      .filter((t) => t.startsWith("✅"))
      .map((t) => t.replace(/^✅\s*/, ""));

    expect(ticked).toEqual(RENDERED);
  });

  it("F08-03: KNOWN GAP — आसन (posture/seating) is delivered nowhere on this step", () => {
    // KNOWN GAP, not a desired property. आसन is one of the three documented
    // recording instructions and no component, voice script or string in the
    // pandit app carries it. Adding it SHOULD fail this test — then update the
    // register entry to say F08-03 is fully met.
    const { container } = renderVideoStep();
    expect(container.textContent ?? "").not.toContain("आसन");
    expect(videoStepNarration()).not.toContain("आसन");
  });

  it("F08-03: KNOWN GAP — the checklist is on-screen text only, never spoken", () => {
    // KNOWN GAP, not a desired property. The persona is a 62-year-old relying on
    // audio; the step's narration omits every checklist item. If narration starts
    // carrying them, this fails — good, come update the register.
    renderVideoStep();
    const spoken = videoStepNarration();
    expect(spoken.length).toBeGreaterThan(0);
    for (const item of RENDERED) {
      expect(spoken, `narration unexpectedly now speaks "${item}"`).not.toContain(item);
    }
  });
});

// ─── F08-06 ──────────────────────────────────────────────────────────────────
// Register: submission is by unlisted YouTube link with a WhatsApp help path —
// a recorded deviation (D-03) from the doc's in-app record/gallery flow.
// This block pins the YouTube-link shape as today's truth.
describe("F08-06 — submission is an (unlisted) YouTube link, per deviation D-03", () => {
  it("F08-06: the field asks for a YouTube link and says it cannot be filled by voice", () => {
    const { container } = renderVideoStep();
    expect(screen.getByText(/यूट्यूब लिंक/)).toBeInTheDocument();
    expect((container.textContent ?? "")).toContain("यह बोलकर नहीं भरा जाता");
    expect(videoStepNarration()).toContain("यूट्यूब");
  });

  it("F08-06: a pasted YouTube link previews via a youtube.com/embed iframe", () => {
    const { container } = renderVideoStep();
    const url = container.querySelector('input[inputmode="url"]') as HTMLInputElement;
    fireEvent.change(url, { target: { value: "https://youtu.be/dQw4w9WgXcQ" } });

    const frame = container.querySelector("iframe") as HTMLIFrameElement | null;
    expect(frame, "no preview rendered for a valid YouTube link").not.toBeNull();
    expect(frame!.getAttribute("src")).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("F08-06: all three YouTube link shapes are accepted; a non-YouTube URL is not", () => {
    const cases: Array<[string, string | null]> = [
      ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
      ["https://youtu.be/aBcDeFgHiJ1", "aBcDeFgHiJ1"],
      ["https://www.youtube.com/shorts/ZZZZZZZZZZZ", "ZZZZZZZZZZZ"],
      ["https://vimeo.com/123456789", null],
      ["https://drive.google.com/file/d/abc/view", null],
    ];

    for (const [input, expectedId] of cases) {
      const { container } = renderVideoStep();
      const url = container.querySelector('input[inputmode="url"]') as HTMLInputElement;
      fireEvent.change(url, { target: { value: input } });

      const frame = container.querySelector("iframe");
      if (expectedId === null) {
        expect(frame, `${input} should not preview`).toBeNull();
      } else {
        expect(frame!.getAttribute("src"), input).toBe(`https://www.youtube.com/embed/${expectedId}`);
      }
      cleanup();
    }
  });

  it("F08-06: submit posts videoProvider YOUTUBE + the raw link — no upload endpoint is hit", async () => {
    const { getByRole } = renderVideoStep({
      videoUrl: "https://youtu.be/dQw4w9WgXcQ",
      consent: true,
    });

    await act(async () => {
      fireEvent.click(getByRole("button", { name: /जमा कीजिए/ }));
    });

    // the submit chain awaits pooja-config BEFORE pooja-verification, so waiting
    // on "called at all" would race — wait for the verification call itself
    await vi.waitFor(() =>
      expect(
        mutateOnce.mock.calls.some((c: any[]) => c[1] === "/pandit/pooja-verification"),
        "the verification POST is gone",
      ).toBe(true),
    );
    const verify = mutateOnce.mock.calls.find((c: any[]) => c[1] === "/pandit/pooja-verification")!;

    const body = JSON.parse((verify as any[])[2].body);
    expect(body.videoProvider).toBe("YOUTUBE");
    expect(body.videoUrl).toBe("https://youtu.be/dQw4w9WgXcQ");
    expect(body.consent).toBe(true);

    // no binary upload path exists — the link IS the submission
    const paths = mutateOnce.mock.calls.map((c: any[]) => c[1]);
    expect(paths.some((p: string) => /upload|presign|media|s3/i.test(p))).toBe(false);
  });
});
