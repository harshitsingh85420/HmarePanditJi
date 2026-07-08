// VoiceField v2 machine — DUAL INPUT, ZERO MODES.
// The <input> is ALWAYS visible and enabled; voice runs alongside it.
//   PROMPTING  → speaking the question
//   LISTENING  → mic open next to the live field
//   PROCESSING → STT round-trip
//   CONFIRMING → spoken value shown in the field + "सही है?" loop
//   IDLE       → voice disarmed (after 2 fails / typed input / accept);
//                the 🎤 re-arm icon in the field's right slot restarts it.
// TYPED_INPUT aborts any voice activity instantly: typed values are
// accepted with NO confirmation loop (normal validation only).

export type VFState =
  | { phase: 'PROMPTING' }
  | { phase: 'LISTENING' }
  | { phase: 'PROCESSING' }
  | { phase: 'CONFIRMING', heard: string, parsed: string }
  | { phase: 'IDLE' };

export type VFEvent =
  | { type: 'SPEECH_DONE' }
  | { type: 'TRANSCRIPT', text: string, confidence: number }
  | { type: 'STT_FAILED' }
  | { type: 'CONFIRM_YES' }
  | { type: 'CONFIRM_NO' }
  | { type: 'TYPED_INPUT' }      // pandit typed/focused the field — voice yields
  | { type: 'TAP_MIC_RETRY' };   // 🎤 icon in the field re-arms voice

export type VFEffect =
  | 'START_LISTEN'
  | 'STOP_LISTEN'
  | 'SPEAK_CONFIRM'
  | 'SPEAK_FALLBACK'   // "कोई बात नहीं, नीचे लिख दीजिए" + keep field focused
  | 'SPEAK_RETRY'
  | 'EMIT_VALUE';

export function reduce(
  s: VFState,
  e: VFEvent,
  ctx: { attempts: number, mode: string, parse: (t: string) => string | null },
): { next: VFState, attempts: number, effects: VFEffect[], accepted?: string } {
  const a = ctx.attempts;

  // Typing always wins, from any phase: abort voice, no confirmation loop.
  if (e.type === 'TYPED_INPUT') {
    if (s.phase === 'IDLE') return { next: s, attempts: a, effects: [] };
    return { next: { phase: 'IDLE' }, attempts: a, effects: ['STOP_LISTEN'] };
  }

  if (e.type === 'TAP_MIC_RETRY') {
    return { next: { phase: 'LISTENING' }, attempts: 0, effects: ['START_LISTEN'] };
  }

  switch (s.phase) {
    case 'PROMPTING':
      if (e.type === 'SPEECH_DONE') {
        return { next: { phase: 'LISTENING' }, attempts: a, effects: ['START_LISTEN'] };
      }
      break;

    case 'LISTENING':
    case 'PROCESSING':
      if (e.type === 'TRANSCRIPT') {
        const parsed = ctx.parse(e.text);
        if (!parsed || e.confidence < 0.55) {
          const n = a + 1;
          if (n >= 2) return { next: { phase: 'IDLE' }, attempts: n, effects: ['SPEAK_FALLBACK'] };
          return { next: { phase: 'LISTENING' }, attempts: n, effects: ['SPEAK_RETRY'] };
        }
        return { next: { phase: 'CONFIRMING', heard: e.text, parsed }, attempts: a, effects: ['SPEAK_CONFIRM'] };
      }
      if (e.type === 'STT_FAILED') {
        const n = a + 1;
        if (n >= 2) return { next: { phase: 'IDLE' }, attempts: n, effects: ['SPEAK_FALLBACK'] };
        return { next: { phase: 'LISTENING' }, attempts: n, effects: ['SPEAK_RETRY'] };
      }
      break;

    case 'CONFIRMING':
      if (e.type === 'CONFIRM_YES') {
        return { next: { phase: 'IDLE' }, attempts: 0, effects: ['EMIT_VALUE'], accepted: s.parsed };
      }
      if (e.type === 'CONFIRM_NO') {
        const n = a + 1;
        if (n >= 2) return { next: { phase: 'IDLE' }, attempts: n, effects: ['SPEAK_FALLBACK'] };
        return { next: { phase: 'LISTENING' }, attempts: n, effects: ['START_LISTEN'] };
      }
      break;
  }
  return { next: s, attempts: a, effects: [] };
}
