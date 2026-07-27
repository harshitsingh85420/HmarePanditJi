// ─────────────────────────────────────────────────────────────
// RULING ख (Isj, 2026-07-25 — recorded in docs/CONFLICT_RULINGS.md):
// v1 ships HINDI-ONLY. The runtime Mayura machine translation is
// UNAUDITED output; until a real per-language review pass exists, no
// language switch may succeed. With this flag false:
//   • POST /voice/translate NEVER fires — fetchGroups (the single
//     chokepoint every translate request goes through) throws before
//     the request is built;
//   • every non-Hindi pick lands in runLanguageSwitch's honesty-notice
//     path — spoken IN the target language, awaited (proven audible);
//   • a previously persisted non-Hindi bundle is IGNORED at boot (a
//     pre-ruling pilot device returns to Hindi rather than serving
//     cached unaudited output).
// REVERSAL IS THIS ONE LINE — flip to true and the old behavior is
// intact (guarded both ways by langSwitchV1Gate.test.ts).
// Odia note: with ख active the or-IN TTS 502 is moot for v1 — no
// switch succeeds in ANY language, so or-IN never becomes the active
// app language (the honesty notice itself still speaks via the TTS
// fallback chain).
// ─────────────────────────────────────────────────────────────
export const LANG_SWITCH_V1_ENABLED = false;
