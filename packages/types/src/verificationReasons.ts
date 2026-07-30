/* ─────────────────────────────────────────────────────────────
   REJECTION REASONS — PRESET, NOT FREE TEXT.

   THE STRUCTURAL PROBLEM THIS FIXES. Both reject endpoints took a
   free-text `reason` and interpolated it VERBATIM into a Devanagari
   sentence on the pandit's phone:

     poojaVerification.controller.ts:184
       `आपकी "…" पूजा अभी स्वीकृत नहीं हुई। कारण: ${reason} — सुधार कर दोबारा भेजिए।`

   Every register guard in this repo — the no-roman law, the तुम/करो
   ban, the 18sp floor — checks STRINGS IN THE REPO. A reason typed by
   ops at runtime is not in the repo, so it passes through all of them
   untouched. Isj typing "photo blurry" in a hurry ships roman English
   to a 62-year-old who cannot read it, inside an otherwise Hindi
   sentence.

   So the reasons live HERE, as code, where the guards can see them.
   The picker is the default; free text is the exception and is
   labelled as such.

   TWO SETS, BECAUSE THEY ARE TWO DIFFERENT CLAIMS. An identity
   rejection is about a document that proves who he is. A video
   rejection is about one ceremony's sample. Sharing a list would make
   them one thing, which is the collapse PAGE 16 forbids.

   REGISTER. Devanagari only; आप, never तुम; कीजिए, never करो. Each
   line names WHAT IS WRONG WITH THE ARTEFACT, never what is wrong with
   the man.
   ───────────────────────────────────────────────────────────── */

export interface RejectionReason {
  /** Stable code — this is what the API accepts and stores. */
  code: string;
  /** What ops sees in the picker. */
  adminLabel: string;
  /** What the PANDIT reads on his phone. Devanagari, register-checked. */
  panditText: string;
}

/** Identity (Aadhaar / document) rejections. */
export const IDENTITY_REJECTION_REASONS: readonly RejectionReason[] = [
  {
    code: "DOC_UNREADABLE",
    adminLabel: "Document unreadable",
    panditText: "कागज़ की तस्वीर साफ़ नहीं आई — अक्षर पढ़े नहीं जा रहे।",
  },
  {
    code: "DOC_CROPPED",
    adminLabel: "Photo cut off at the edges",
    panditText: "तस्वीर में कागज़ का कोना कट गया है — पूरा कागज़ दिखना चाहिए।",
  },
  {
    code: "DOC_GLARE",
    adminLabel: "Glare / reflection on the document",
    panditText: "तस्वीर पर रोशनी की चमक पड़ रही है — छाया में दोबारा लीजिए।",
  },
  {
    code: "NAME_MISMATCH",
    adminLabel: "Name does not match the profile",
    panditText: "कागज़ पर लिखा नाम आपके खाते के नाम से नहीं मिल रहा।",
  },
  {
    code: "BACK_MISSING",
    adminLabel: "Back side missing",
    panditText: "आधार का पिछला हिस्सा नहीं मिला — दोनों तरफ़ की तस्वीर चाहिए।",
  },
  {
    code: "FACE_NOT_VISIBLE",
    adminLabel: "Face not clear in the video",
    panditText: "वीडियो में आपका चेहरा साफ़ नहीं दिख रहा।",
  },
  {
    code: "OTHER",
    adminLabel: "Other (type the reason — use Hindi)",
    panditText: "", // supplied by ops; see OTHER_CODE handling
  },
] as const;

/** Per-ceremony sample-video rejections. */
export const VIDEO_REJECTION_REASONS: readonly RejectionReason[] = [
  {
    code: "NO_SOUND",
    adminLabel: "Video has no sound",
    panditText: "वीडियो में आवाज़ नहीं आ रही — यजमान को आपका पाठ सुनना है।",
  },
  {
    code: "WRONG_CEREMONY",
    adminLabel: "Video shows a different ceremony",
    panditText: "वीडियो में कोई और पूजा दिख रही है, यह वाली नहीं।",
  },
  {
    code: "TOO_SHORT",
    adminLabel: "Video too short",
    panditText: "वीडियो बहुत छोटा है — कम से कम एक मिनट का पाठ भेजिए।",
  },
  {
    code: "FACE_NOT_VISIBLE",
    adminLabel: "Face not visible",
    panditText: "वीडियो में आपका चेहरा नहीं दिख रहा।",
  },
  {
    code: "AUDIO_UNCLEAR",
    adminLabel: "Audio unclear / too noisy",
    panditText: "आसपास का शोर ज़्यादा है — शांत जगह पर दोबारा रिकॉर्ड कीजिए।",
  },
  {
    code: "NOT_PLAYABLE",
    adminLabel: "Video will not play",
    panditText: "वीडियो चल नहीं रहा — शायद अधूरा भेजा गया है।",
  },
  {
    code: "OTHER",
    adminLabel: "Other (type the reason — use Hindi)",
    panditText: "",
  },
] as const;

export const OTHER_CODE = "OTHER";

function lookup(set: readonly RejectionReason[], code: string): RejectionReason | undefined {
  return set.find((r) => r.code === code);
}

export function isIdentityReasonCode(code: string): boolean {
  return !!lookup(IDENTITY_REJECTION_REASONS, code);
}
export function isVideoReasonCode(code: string): boolean {
  return !!lookup(VIDEO_REJECTION_REASONS, code);
}

/**
 * Resolve a code to the sentence the pandit reads.
 *
 * `OTHER` is the only path a runtime string can take, and it is
 * deliberately narrow: the caller must supply the text, and the API
 * layer is responsible for refusing an empty one. Everything else is
 * repo-resident and therefore guard-visible.
 */
export function resolveRejectionText(
  kind: "identity" | "video",
  code: string,
  otherText?: string | null,
): string | null {
  const set = kind === "identity" ? IDENTITY_REJECTION_REASONS : VIDEO_REJECTION_REASONS;
  const found = lookup(set, code);
  if (!found) return null;
  if (found.code === OTHER_CODE) {
    const t = (otherText ?? "").trim();
    return t.length ? t : null;
  }
  return found.panditText;
}
