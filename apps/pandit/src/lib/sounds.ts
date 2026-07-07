// Sacred, synthetic sounds — WebAudio oscillators only, no audio files.
// Respect the pandit's "घंटी की आवाज़" toggle (sound_enabled, default true).

function soundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("sound_enabled") !== "false";
  } catch {
    return true;
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    return new AC();
  } catch {
    return null;
  }
}

/** Temple bell: two sine partials (784Hz + 1568Hz) with a 1.2s exponential decay. */
export function playBell(): void {
  if (!soundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [784, 1568].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(i === 0 ? 0.25 : 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  });
  setTimeout(() => void ctx.close(), 1400);
}

/** Rising chime: three quick sine notes (1046 → 1318 → 1568 Hz, 120ms each). */
export function playChime(): void {
  if (!soundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [1046, 1318, 1568].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = now + i * 0.12;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  });
  setTimeout(() => void ctx.close(), 600);
}

/** Light tap feedback; guarded for unsupported browsers. */
export function vibrateTap(): void {
  if (typeof navigator !== "undefined") navigator.vibrate?.(30);
}

/** Stronger confirm pattern for accept / puja-complete. */
export function vibrateConfirm(): void {
  if (typeof navigator !== "undefined") navigator.vibrate?.([60, 40, 60]);
}
