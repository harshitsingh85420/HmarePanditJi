// ─────────────────────────────────────────────────────────────
// THE EVIDENCE EYE — now WATCHABLE (Isj order, 2026-07-27).
//
// WATCH is ON BY DEFAULT: a real 390×844 Chromium window opens on the
// founder's screen, slowed so the motion is readable, and THAT WINDOW
// BANKS EVERY SHOT. What Isj watches IS the evidence — there is no
// mirror to drift out of sync.
//
// Headless is the FALLBACK ONLY, and it is never silent: if the window
// cannot open (no display / display server refuses), openEye reports
// `watching:false` plus the reason, and the page report must print
// "watch window: not opened — <reason>" per the HEARTBEAT RULE.
//   --headless  force headless (CI)
//   --slowmo N  override the step delay (default 250ms)
// ─────────────────────────────────────────────────────────────
import { chromium } from "@playwright/test";

const CHROME_ARGS = ["--autoplay-policy=no-user-gesture-required"];

export async function openEye(argv = process.argv) {
  const forceHeadless = argv.includes("--headless");
  const i = argv.indexOf("--slowmo");
  const slowMo = i === -1 ? 250 : Number(argv[i + 1]) || 250;

  if (!forceHeadless) {
    // ORDER MATTERS: this sandbox refuses to spawn the BUNDLED chromium
    // headed ("spawn UNKNOWN") while the SYSTEM Chrome channel opens
    // fine — so the installed browser is the watch path, with bundled
    // chromium kept as a second try for machines without Chrome.
    const attempts = [
      { label: "system Chrome", cfg: { headless: false, slowMo, channel: "chrome", args: [...CHROME_ARGS, "--window-position=40,40"] } },
      { label: "bundled chromium", cfg: { headless: false, slowMo, args: [...CHROME_ARGS, "--window-position=40,40"] } },
    ];
    const failures = [];
    for (const a of attempts) {
      try {
        const browser = await chromium.launch(a.cfg);
        // prove the window really came up — a launch that "succeeds" into
        // a dead display would otherwise be reported as watched
        const probe = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const p = await probe.newPage();
        await p.goto("about:blank");
        await probe.close();
        console.log(`👁  WATCH WINDOW OPEN — ${a.label}, headed, slowMo ${slowMo}ms. This window banks every shot.`);
        return { browser, watching: true, why: `${a.label}, headed, slowMo ${slowMo}ms` };
      } catch (e) {
        failures.push(`${a.label}: ${String(e?.message || e).split("\n")[0].slice(0, 70)}`);
      }
    }
    const why = failures.join(" | ");
    console.log(`👁  WATCH WINDOW NOT OPENED — falling back to headless. Reason: ${why}`);
    const browser = await chromium.launch({ headless: true, args: CHROME_ARGS });
    return { browser, watching: false, why };
  }
  console.log("👁  WATCH WINDOW NOT OPENED — --headless requested explicitly.");
  const browser = await chromium.launch({ headless: true, args: CHROME_ARGS });
  return { browser, watching: false, why: "--headless requested" };
}

/** Narrate the walk so the window's motion is readable, not just pretty. */
export function announce(page, state) {
  const line = `▶ ${page} · ${state}`;
  console.log(line);
  return line;
}

/** One line for the report, per the HEARTBEAT RULE. */
export function watchStatus(eye) {
  return eye.watching
    ? `watch window: OPENED (${eye.why}) — the window you saw banked every shot`
    : `watch window: NOT OPENED — ${eye.why}`;
}
