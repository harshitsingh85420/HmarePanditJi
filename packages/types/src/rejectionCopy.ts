/* ─────────────────────────────────────────────────────────────
   WHAT THE PANDIT READS WHEN SOMETHING IS REJECTED.

   This copy lands on a 62-year-old's phone, usually while he is doing
   something else, and it is the only explanation he gets. Three rules
   shaped every line:

   1. NO PROMISED DURATION. The draft said "दो मिनट लगेंगे". Dropped —
      it is the payout-timing law in miniature: never promise a length
      you cannot guarantee. For a man with large thumbs and a slow
      connection a re-upload is not two minutes, and the promise turns
      a small task into a small failure. Say it is EASY, never FAST.

   2. NEVER ASSERT A VERIFICATION STATE YOU HAVE NOT READ. The draft's
      video rejection said "आपकी पहचान सत्यापित है" unconditionally —
      false for a pandit whose identity is still PENDING, and a video
      can absolutely be rejected in that state. The line is now chosen
      from the identity status actually passed in.

   3. THE FAULT IS IN THE ARTEFACT, NOT THE MAN. Every sentence names
      the document or the recording.
   ───────────────────────────────────────────────────────────── */

/**
 * The identity-rejection opening line — TWO VARIANTS, Isj's ruling pending.
 *
 * A · NEGATES SUSPICION. Reads warmly, but raises the idea of doubt in
 *     order to deny it ("no one suspects you" makes suspicion the
 *     subject of the sentence).
 * B · BLAMES THE IMAGE. Never mentions doubt at all; the camera is the
 *     problem. Shorter, and it cannot plant what it does not name.
 *
 * Both are kept in the code so the choice is visible and reversible.
 * `IDENTITY_REJECTION_VARIANT` selects; changing it is a one-word edit.
 */
export const IDENTITY_REJECTION_OPENING = {
  A_NEGATES_SUSPICION: "आपके दस्तावेज़ में कुछ साफ़ नहीं दिख रहा — इसलिए जाँच रुकी है, आप पर कोई शक नहीं।",
  B_BLAMES_THE_IMAGE: "कागज़ की तस्वीर साफ़ नहीं आई — इसलिए जाँच अभी पूरी नहीं हो पाई।",
} as const;

/** Awaiting Isj. B is the default only because it makes no claim about doubt. */
export const IDENTITY_REJECTION_VARIANT: keyof typeof IDENTITY_REJECTION_OPENING = "B_BLAMES_THE_IMAGE";

export interface RejectionMessage {
  title: string;
  body: string;
}

/**
 * Identity rejection. `reasonText` is already resolved from the preset
 * set (see verificationReasons.ts) — never raw operator input except
 * through the explicit OTHER path.
 */
export function identityRejectionMessage(reasonText: string): RejectionMessage {
  return {
    title: "पहचान जाँच अभी पूरी नहीं हुई",
    body: [
      IDENTITY_REJECTION_OPENING[IDENTITY_REJECTION_VARIANT],
      `कारण: ${reasonText}`,
      // EASY, not FAST — no duration is promised anywhere in this string.
      "दोबारा भेजना आसान है — ऐप में जाकर नई तस्वीर लगा दीजिए।",
    ].join("\n"),
  };
}

/**
 * Video rejection.
 *
 * `identityVerified` MUST be the real, read state — not an assumption.
 * The second line is the whole point of this message: it tells him how
 * far the damage extends, and saying "your identity is verified" to a
 * man whose identity is still pending would be a lie in the sentence
 * whose job is reassurance.
 */
export function videoRejectionMessage(
  poojaName: string,
  reasonText: string,
  identityVerified: boolean,
): RejectionMessage {
  const scope = identityVerified
    ? "आपकी पहचान सत्यापित है — यह सिर्फ़ इस एक पूजा के वीडियो की बात है।"
    : "यह सिर्फ़ इस एक पूजा के वीडियो की बात है — आपकी पहचान की जाँच अलग चलती है।";

  return {
    title: `“${poojaName}” का वीडियो दोबारा भेजिए`,
    body: [
      scope,
      `कारण: ${reasonText}`,
      "कोई और पूजा इससे प्रभावित नहीं होगी।",
    ].join("\n"),
  };
}
