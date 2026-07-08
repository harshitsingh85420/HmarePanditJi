// VoiceField v3 machine — ALWAYS-LISTENING LOOP semantics.
// Failures NEVER stop the loop: at most ONE gentle apology per field,
// then keep listening silently. Typing always wins (no confirm loop);
// the outer loop re-arms after the field blurs/advances.

export type VFState =
  | { phase: 'PROMPTING' }
  | { phase: 'LISTENING' }
  | { phase: 'PROCESSING' }
  | { phase: 'CONFIRMING', heard: string, parsed: string }
  | { phase: 'IDLE' }; // typed-input takeover or voice paused

export type VFEvent =
  | { type: 'SPEECH_DONE' }
  | { type: 'TRANSCRIPT', text: string, confidence: number }
  | { type: 'STT_FAILED' }
  | { type: 'CONFIRM_YES' }
  | { type: 'CONFIRM_NO' }
  | { type: 'TYPED_INPUT' };

export type VFEffect =
  | 'START_LISTEN'
  | 'STOP_LISTEN'
  | 'SPEAK_CONFIRM'
  | 'SPEAK_SORRY_ONCE' // "माफ़ कीजिए, समझ नहीं आया — फिर बोलें या नीचे लिख दें"
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
          // Loop law: never stop listening on failure; apologize ONCE.
          const n = a + 1;
          return {
            next: { phase: 'LISTENING' },
            attempts: n,
            effects: n === 1 ? ['SPEAK_SORRY_ONCE'] : ['START_LISTEN'],
          };
        }
        return { next: { phase: 'CONFIRMING', heard: e.text, parsed }, attempts: a, effects: ['SPEAK_CONFIRM'] };
      }
      if (e.type === 'STT_FAILED') {
        // Silence timeouts / STT hiccups: quietly re-arm, no nagging.
        return { next: { phase: 'LISTENING' }, attempts: a, effects: ['START_LISTEN'] };
      }
      break;

    case 'CONFIRMING':
      if (e.type === 'CONFIRM_YES') {
        return { next: { phase: 'IDLE' }, attempts: 0, effects: ['EMIT_VALUE'], accepted: s.parsed };
      }
      if (e.type === 'CONFIRM_NO') {
        return { next: { phase: 'LISTENING' }, attempts: a, effects: ['START_LISTEN'] };
      }
      break;
  }
  return { next: s, attempts: a, effects: [] };
}
