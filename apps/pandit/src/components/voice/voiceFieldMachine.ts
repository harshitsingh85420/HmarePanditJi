export type VFState =
  | { phase:'PROMPTING' }                       // speaking promptText
  | { phase:'LISTENING' }                       // mic open
  | { phase:'PROCESSING' }                      // waiting for /api/stt
  | { phase:'CONFIRMING', heard:string, parsed:string } // showing "आपने कहा"
  | { phase:'ACCEPTED', value:string }
  | { phase:'TYPE_FALLBACK' };                  // keyboard mode

export type VFEvent =
  | { type:'SPEECH_DONE' } | { type:'TRANSCRIPT', text:string, confidence:number }
  | { type:'STT_FAILED' } | { type:'CONFIRM_YES' } | { type:'CONFIRM_NO' }
  | { type:'TAP_TYPE' } | { type:'TAP_MIC_RETRY' };

export function reduce(s:VFState, e:VFEvent, ctx:{attempts:number, mode:string, parse:(t:string)=>string|null}):
  { next:VFState, attempts:number, effects:Array<'START_LISTEN'|'SPEAK_CONFIRM'|'SPEAK_FALLBACK'|'SPEAK_RETRY'|'FOCUS_KEYBOARD'|'EMIT_VALUE'> } {
  const a = ctx.attempts;
  switch (s.phase) {
    case 'PROMPTING':
      if (e.type==='SPEECH_DONE') return { next:{phase:'LISTENING'}, attempts:a, effects:['START_LISTEN'] };
      break;
    case 'LISTENING':
    case 'PROCESSING':
      if (e.type==='TRANSCRIPT') {
        const parsed = ctx.parse(e.text);
        if (!parsed || e.confidence < 0.55) {
          const n = a+1;
          if (n>=2) return { next:{phase:'TYPE_FALLBACK'}, attempts:n, effects:['SPEAK_FALLBACK','FOCUS_KEYBOARD'] };
          return { next:{phase:'LISTENING'}, attempts:n, effects:['SPEAK_RETRY','START_LISTEN'] };
        }
        return { next:{phase:'CONFIRMING', heard:e.text, parsed}, attempts:a, effects:['SPEAK_CONFIRM'] };
      }
      if (e.type==='STT_FAILED') {
        const n=a+1;
        if (n>=2) return { next:{phase:'TYPE_FALLBACK'}, attempts:n, effects:['SPEAK_FALLBACK','FOCUS_KEYBOARD'] };
        return { next:{phase:'LISTENING'}, attempts:n, effects:['SPEAK_RETRY','START_LISTEN'] };
      }
      break;
    case 'CONFIRMING':
      if (e.type==='CONFIRM_YES') return { next:{phase:'ACCEPTED', value:s.parsed}, attempts:0, effects:['EMIT_VALUE'] };
      if (e.type==='CONFIRM_NO') {
        const n=a+1;
        if (n>=2) return { next:{phase:'TYPE_FALLBACK'}, attempts:n, effects:['SPEAK_FALLBACK','FOCUS_KEYBOARD'] };
        return { next:{phase:'LISTENING'}, attempts:n, effects:['START_LISTEN'] };
      }
      break;
  }
  if (e.type==='TAP_TYPE') return { next:{phase:'TYPE_FALLBACK'}, attempts:a, effects:['FOCUS_KEYBOARD'] };
  if (e.type==='TAP_MIC_RETRY') return { next:{phase:'LISTENING'}, attempts:0, effects:['START_LISTEN'] };
  return { next:s, attempts:a, effects:[] };
}
