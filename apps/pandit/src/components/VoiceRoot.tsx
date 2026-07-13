"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { voiceController } from "@/lib/voiceController";
import { Toast } from "@/components/ui/Toast";
import { t, refreshBundleInBackground } from "@/lib/i18n";
import { VoiceDebugPanel, useVoiceDebugFlag } from "@/components/VoiceDebugPanel";
import { NarrationHighlight } from "@/components/moments/NarrationHighlight";
import { API_BASE_MISSING } from "@/lib/api";

// S1: SPELLING CANARY (?voicedebug=1) — hunts wrong पंडित forms in the
// LIVE DOM: rendered text plus the attribute channels innerText misses
// (aria-label, placeholder, alt, title). Every hit prints one
// 'SPELLING CANARY' panel line naming the element and route.
const BAD_PANDIT = /पण्डित|पन्डित|पंड़ित|पण्डीत|पंडीत/;

function describeEl(el: Element): string {
  const id = el.id ? `#${el.id}` : "";
  const cls =
    typeof el.className === "string" && el.className
      ? `.${el.className.split(/\s+/).slice(0, 2).join(".")}`
      : "";
  return `${el.tagName.toLowerCase()}${id}${cls}`;
}

// Mounted once in app/layout.tsx: the "any interactive tap silences
// narration" rule (capture phase — speech never talks over action).
// The voice control itself is the शिष्य orb, docked in each screen's
// footer (BottomNav center-slot or the footer bar's orb slot).
// Also hosts the once-per-session voice toasts — X2b "voice unavailable"
// (`hpj-voice-unavailable`) and A3 "tap to hear" (`hpj-voice-tap-to-hear`)
// — plus the flag-gated ?voicedebug=1 diagnostics panel (A1).
export function VoiceRoot() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const debugOn = useVoiceDebugFlag();
  const pathname = usePathname();

  // S1: canary scan — on route change and on DOM mutation (debounced).
  // Dedupes per route+finding so the panel names each sighting once.
  useEffect(() => {
    if (!debugOn) return;
    const seen = new Set<string>();
    const scan = () => {
      try {
        // text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const text = node.textContent || "";
          const m = text.match(BAD_PANDIT);
          if (m) {
            const el = node.parentElement;
            const key = `${pathname}|text|${describeEl(el || document.body)}|${m[0]}`;
            if (!seen.has(key)) {
              seen.add(key);
              voiceController.debug(
                `SPELLING CANARY: "${m[0]}" in TEXT <${describeEl(el || document.body)}> at ${pathname} — "${text.trim().slice(0, 60)}"`,
              );
            }
          }
        }
        // attribute channels innerText misses
        for (const attr of ["aria-label", "placeholder", "alt", "title"]) {
          document.querySelectorAll(`[${attr}]`).forEach((el) => {
            const v = el.getAttribute(attr) || "";
            const m = v.match(BAD_PANDIT);
            if (m) {
              const key = `${pathname}|${attr}|${describeEl(el)}|${m[0]}`;
              if (!seen.has(key)) {
                seen.add(key);
                voiceController.debug(
                  `SPELLING CANARY: "${m[0]}" in ${attr.toUpperCase()} <${describeEl(el)}> at ${pathname} — "${v.slice(0, 60)}"`,
                );
              }
            }
          });
        }
      } catch { /* scanning must never break the app */ }
    };
    const t1 = setTimeout(scan, 800);
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const mo = new MutationObserver(() => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(scan, 1000);
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "placeholder", "alt", "title"] });
    return () => {
      clearTimeout(t1);
      if (debounce) clearTimeout(debounce);
      mo.disconnect();
    };
  }, [debugOn, pathname]);

  // D3: a persisted language bundle serves instantly on reload; refresh
  // it quietly so copy edits and not-yet-fetched groups catch up.
  useEffect(() => {
    refreshBundleInBackground();
  }, []);

  // J3e / X2: pre-warm the loop's static lines AND the splash welcome so
  // they answer in ~10ms from the TTS cache. The welcome is prefetched
  // FIRST — the very first thing the founder hears, made instant from its
  // 2nd load onward (first-ever load still fetches once). shishya.intro
  // is the exact splash utterance.
  useEffect(() => {
    voiceController.prefetch([
      t("shishya.intro"),
      t("splash.tapHintVoice"),
      t("voiceLoop.ack"),
      t("voiceLoop.unmatched"),
      t("voiceLoop.confirmRepeat"),
      t("tutorial.advanceAsk"),
      t("shishya.wake"),
      // T4/X3: the brain's own static lines + all filler variants
      t("shishya.thinking"),
      t("shishya.thinking2"),
      t("shishya.thinking3"),
      t("shishya.honestMiss"),
    ]);
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(
        'button, a, input, select, textarea, [role="button"]',
      );
      if (!el) return;
      // शिष्य manages speech himself
      const label = el.getAttribute("aria-label") || "";
      if (label.includes("शिष्य")) return;
      voiceController.stopSpeech("barge-in:tap");
    };
    const onVoiceUnavailable = () => setToastMsg(t("voice.unavailable"));
    const onTapToHear = () => setToastMsg(t("voice.tapToHear"));
    // J2: "सो जाओ" by voice = the orb tap's sleep, same toast
    const onVoiceSleep = () => setToastMsg(t("shishya.sleepToast"));
    // U1b: Sarvam hiccup mid-session → silence + this one toast
    const onVoiceHiccup = () => setToastMsg(t("voice.hiccup"));
    const onMicStuck = () => setToastMsg(t("voice.micStuck"));
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("hpj-voice-unavailable", onVoiceUnavailable);
    window.addEventListener("hpj-voice-tap-to-hear", onTapToHear);
    window.addEventListener("hpj-shishya-sleep", onVoiceSleep);
    window.addEventListener("hpj-voice-hiccup", onVoiceHiccup);
    window.addEventListener("hpj-mic-stuck", onMicStuck);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("hpj-voice-unavailable", onVoiceUnavailable);
      window.removeEventListener("hpj-voice-tap-to-hear", onTapToHear);
      window.removeEventListener("hpj-shishya-sleep", onVoiceSleep);
      window.removeEventListener("hpj-voice-hiccup", onVoiceHiccup);
      window.removeEventListener("hpj-mic-stuck", onMicStuck);
    };
  }, []);

  return (
    <>
      {/* F2: a deployed build without NEXT_PUBLIC_API_URL can never talk
          to the API — say so on screen instead of failing silently.
          pointer-events-none: it overlays the sticky Header, and eating
          back-button taps app-wide would sabotage the very QA walk it
          exists to inform. */}
      {API_BASE_MISSING && (
        <div className="fixed top-0 inset-x-0 z-[95] pointer-events-none bg-red-700 text-white text-[18px] font-bold font-hindi text-center px-4 py-2">
          {t("errors.apiBaseMissing")}
        </div>
      )}
      {toastMsg && (
        <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg(null)} />
      )}
      {/* S3: the "press THIS" gold ring — one overlay app-wide */}
      <NarrationHighlight />
      {debugOn && <VoiceDebugPanel />}
    </>
  );
}

export default VoiceRoot;
