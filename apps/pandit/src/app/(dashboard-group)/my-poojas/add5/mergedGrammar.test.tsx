import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { voiceController } from "@/lib/voiceController";
import { useVoiceOptions } from "@/hooks/useVoiceScreen";
import { teamOptionLabel, teamOptionKeywords } from "./stepModel";

// ─────────────────────────────────────────────────────────────
// REACT-LEVEL CO-MOUNT GUARD. stepModel.test.ts proves the CONTROLLER
// semantics; this proves the HOOK semantics — two useVoiceOptions calls
// inside ONE component, which is exactly what merging आपूर्ति + टीम does
// and which never happened before the merge.
//
// What could break here and not in the controller test:
//   · effect ordering — the second hook's register running before the
//     first's, or one disposer tearing down the other's group
//   · unmount leaving a live listener behind (the classic leak)
//   · a re-render re-registering and doubling the groups
// ─────────────────────────────────────────────────────────────

afterEach(cleanup);

/** the merged step's two groups, exactly as the component registers them */
function MergedStep({ hit }: { hit: string[] }) {
  useVoiceOptions([
    { label: "हाँ, मैं लाऊँगा", onSelect: () => hit.push("PANDIT_BRINGS") },
    { label: "प्लेटफ़ॉर्म बेचे", onSelect: () => hit.push("PLATFORM_SELLS") },
    { label: "सिर्फ़ सूची", onSelect: () => hit.push("LIST_ONLY") },
  ]);
  useVoiceOptions(
    [1, 2, 3, 4, 5].map((n) => ({
      label: teamOptionLabel(n),
      keywords: teamOptionKeywords(n),
      onSelect: () => hit.push(`team:${n}`),
    })),
  );
  return <div>merged</div>;
}

describe("merged step — two useVoiceOptions in one component", () => {
  it("both grammars answer while mounted", () => {
    const hit: string[] = [];
    render(<MergedStep hit={hit} />);

    voiceController.handleTranscript("सिर्फ़ सूची", 1);
    voiceController.handleTranscript("3 पंडित", 1);

    expect(hit).toContain("LIST_ONLY");
    expect(hit).toContain("team:3");
  });

  it("a spoken amount is NOT captured by either grammar", () => {
    const hit: string[] = [];
    render(<MergedStep hit={hit} />);

    for (const amount of ["5000", "2100", "11000", "500"]) {
      voiceController.handleTranscript(amount, 1);
    }
    expect(hit, `an amount leaked into the grammar: ${hit.join(",")}`).toEqual([]);
  });

  it("unmount removes BOTH groups — no listener survives", () => {
    const hit: string[] = [];
    const { unmount } = render(<MergedStep hit={hit} />);
    unmount();

    voiceController.handleTranscript("हाँ, मैं लाऊँगा", 1);
    voiceController.handleTranscript("2 पंडित", 1);
    expect(hit, "a listener survived unmount").toEqual([]);
  });

  it("re-render does not double-register (one utterance = one selection)", () => {
    const hit: string[] = [];
    const { rerender } = render(<MergedStep hit={hit} />);
    rerender(<MergedStep hit={hit} />);
    rerender(<MergedStep hit={hit} />);

    voiceController.handleTranscript("प्लेटफ़ॉर्म बेचे", 1);
    expect(hit).toEqual(["PLATFORM_SELLS"]);
  });

  it("mounting, unmounting and remounting leaves exactly one live set", () => {
    const hit: string[] = [];
    const first = render(<MergedStep hit={hit} />);
    first.unmount();
    render(<MergedStep hit={hit} />);

    voiceController.handleTranscript("4 पंडित", 1);
    expect(hit).toEqual(["team:4"]);
  });
});
