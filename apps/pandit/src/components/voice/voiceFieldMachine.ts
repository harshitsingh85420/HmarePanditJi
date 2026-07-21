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
  // F02-02/03/04: the universal three-rung error ladder (doc's core promise).
  //   rung 1 → "माफ़ कीजिये, कृपया फिर से बोलिए।"
  //   rung 2 → "कृपया धीरे और साफ़ बोलिए।"
  //   rung 3 → the fallback line + keyboard auto-opens + a "सहायता चाहिए" button
  | 'SPEAK_RUNG_1'
  | 'SPEAK_RUNG_2'
  | 'SPEAK_RUNG_3'
  | 'OPEN_KEYBOARD'
  | 'SHOW_HELP'
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
          // F02-02/03/04 THREE-RUNG LADDER. Loop law: never stop listening on
          // failure. The counter is per-field (attempts lives in the VoiceField
          // instance and starts at 0 on mount), and resets to 0 on a confirmed
          // value (see CONFIRM_YES). Rung 3 opens the keyboard and shows the
          // "सहायता चाहिए" button once; further failures just keep listening so
          // it does not re-nag.
          const n = a + 1;
          const rung: VFEffect[] =
            n === 1 ? ['SPEAK_RUNG_1'] :
            n === 2 ? ['SPEAK_RUNG_2'] :
            n === 3 ? ['SPEAK_RUNG_3', 'OPEN_KEYBOARD', 'SHOW_HELP'] :
            ['START_LISTEN'];
          return {
            next: { phase: 'LISTENING' },
            attempts: n,
            effects: rung,
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
