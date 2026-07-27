// §3-V VISIBILITY LAW (Isj standing order, 2026-07-25) — machine checks for
// every walked state, run as part of every page's §3 from PAGE 12 onward
// (and retro-swept over PAGES 1-11):
//   • rect inside 390×844 (or fully below the fold = scrollable-to, stated)
//   • w>0, h>0, visibility≠hidden, display≠none; opacity ≥ .9 for actionables
//   • OCCLUSION: elementFromPoint(center) resolves to self-or-descendant
//     (the SOS-over-orb class, automated)
//   • TEXT CLIP: scrollWidth ≤ clientWidth (+height) (the hint-clip class)
//   • CONTRAST: WCAG ratio ≥ 4.5 body, ≥ 3.0 for the ≥19px-bold tier
// Usage: const v = await visibilityAudit(page, "state-name");

export async function visibilityAudit(page, stateName) {
  // CANONICAL MEASURE STATE: every audit reads at scrollTop 0 — of the
  // window AND of every inner scroller (these screens scroll inside a
  // <main overflow-y-auto>, so window.scrollTo alone left content
  // measuring above the fold and reported bogus top-clips).
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    for (const el of document.querySelectorAll("*")) {
      if (el.scrollTop) el.scrollTop = 0;
    }
  });
  await page.waitForTimeout(250);
  const violations = await page.evaluate(() => {
    const VW = 390, VH = 844;
    const out = [];

    // ── ROOT-WIDTH CHECK (permanent, every page; added after the P1) ──
    // The app column must never be WIDER than the device. Screen's column
    // was `max-w-[430px]` without `w-full`, so as a shrink-to-fit flex item
    // it grew to its max-width whenever a child's MIN-CONTENT exceeded the
    // viewport — and the shell's overflow:hidden then cut the excess off
    // the right of EVERY row, invisibly. Reported with numbers either way.
    for (const root of document.querySelectorAll("main, [class*='100dvh']")) {
      const rw = Math.round(root.getBoundingClientRect().width);
      if (rw > VW + 1) {
        out.push({
          el: `<${root.tagName.toLowerCase()} ${String(root.className).slice(0, 40)}>`,
          tag: root.tagName,
          check: "root-width",
          numbers: `column ${rw}px > viewport ${VW}px (right ${rw - VW}px is clipped)`,
          actionable: false,
        });
      }
    }
    const lum = (c) => {
      const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      const a = m[4] === undefined ? 1 : Number(m[4]);
      if (a === 0) return null;
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(+m[1]) + 0.7152 * f(+m[2]) + 0.0722 * f(+m[3]);
    };
    // gradient-aware: a background-image (incl. CSS gradients) between the
    // text and the first solid backgroundColor makes numeric contrast
    // unmeasurable-by-color (white-on-sindoor read 1.03 in sweep v1) —
    // those are handed to the visual leg, not flagged.
    const bgOf = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const s = getComputedStyle(n);
        if (s.backgroundImage && s.backgroundImage !== "none") return "gradient";
        const L = lum(s.backgroundColor);
        if (L !== null) return L;
        n = n.parentElement;
      }
      return lum(getComputedStyle(document.body).backgroundColor) ?? 1;
    };
    const label = (el) => ((el.getAttribute && el.getAttribute("aria-label")) || el.textContent || el.tagName || "").trim().replace(/\s+/g, " ").slice(0, 45);
    const seen = new Set();

    const interactive = [...document.querySelectorAll("button,a,[role=button],input,select,textarea")];
    const textParents = [...document.querySelectorAll("h1,h2,h3,p,span,div,figcaption,label")]
      .filter((el) => el.children.length === 0 && (el.textContent || "").trim().length > 1);

    const check = (el, isActionable) => {
      const key = label(el) + "|" + el.tagName;
      if (seen.has(key)) return;
      seen.add(key);
      const cs = getComputedStyle(el);
      if (cs.display === "none" || el.closest("[aria-hidden='true']")) return; // deliberately not rendered
      const r = el.getBoundingClientRect();
      const name = label(el);
      const add = (chk, num) => out.push({ el: name, tag: el.tagName, check: chk, numbers: num, actionable: isActionable });

      if (r.width <= 0 || r.height <= 0) { add("zero-size", `${Math.round(r.width)}x${Math.round(r.height)}`); return; }
      if (cs.visibility === "hidden") { add("visibility-hidden", cs.visibility); return; }

      const fullyBelow = r.top >= VH, fullyAbove = r.bottom <= 0;
      if (fullyBelow || fullyAbove) {
        // scrollable-to: legal, recorded not flagged
      } else {
        // clipped at a viewport edge = the real sin. Bottom-fold partials
        // are LEGAL (the page scrolls; sweep runs at scrollTop 0) — but a
        // top-clip at scrollTop 0 cannot be scrolled to, and horizontal
        // clip never can.
        if (r.left < -1 || r.right > VW + 1 || r.top < -1) {
          add("edge-clipped", `rect ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
        const deliberatelyDisabled = el.disabled || el.getAttribute("aria-disabled") === "true" || cs.cursor === "not-allowed";
        if (isActionable && Number(cs.opacity) < 0.9 && !deliberatelyDisabled) {
          add("low-opacity-actionable", cs.opacity);
        }
        if (isActionable && r.width >= 8 && r.height >= 8) {
          // clip-aware probe: intersect the rect with the viewport AND
          // every overflow-clipping ancestor — a tile past its scroll
          // container's clip is scrollable-to, not occluded (the
          // English-tile false positive of sweep v1).
          let vt = Math.max(r.top, 0), vb = Math.min(r.bottom, VH);
          let vl = Math.max(r.left, 0), vr2 = Math.min(r.right, VW);
          let anc = el.parentElement;
          while (anc && anc !== document.documentElement) {
            const as = getComputedStyle(anc);
            if (/(hidden|auto|scroll|clip)/.test(as.overflowY + as.overflowX)) {
              const ar = anc.getBoundingClientRect();
              vt = Math.max(vt, ar.top); vb = Math.min(vb, ar.bottom);
              vl = Math.max(vl, ar.left); vr2 = Math.min(vr2, ar.right);
            }
            anc = anc.parentElement;
          }
          if (vr2 - vl >= 8 && vb - vt >= 8) {
            const hit = document.elementFromPoint((vl + vr2) / 2, (vt + vb) / 2);
            if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) {
              // the coach-tip spotlight COVERS non-target siblings by
              // design (transient one-shot; Q2 guarantees outside taps
              // pass through + dismiss) — design, not occlusion. The ONE
              // exception: the emergency SOS control is never coverable —
              // a tip card over it (the bottom:104 collision) must always
              // fire, so the exemption does not apply to it.
              const isEmergency = /आपातकालीन|SOS/i.test(name);
              // the ?voicedebug=1 panel/badge is DEV CHROME (query-param
              // gated, never shipped to a pandit) — it may cover product
              // controls in a harness run without that being a defect.
              const devChrome = !!hit.closest("[data-dev-chrome]");
              if ((!hit.closest("[data-coach-tip]") && !devChrome) || isEmergency) {
                add("occluded", `by <${hit.tagName.toLowerCase()} '${label(hit).slice(0, 25)}'>`);
              }
            }
          }
        }
        // inline boxes report client sizes of 0 — not a clip
        if (cs.display !== "inline" && el.clientWidth > 0) {
          if (el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== "visible" && cs.textOverflow !== "ellipsis") {
            add("text-clip-x", `${el.scrollWidth}>${el.clientWidth}`);
          }
          if (el.scrollHeight > el.clientHeight + 3 && cs.overflowY !== "visible" && !["auto", "scroll"].includes(cs.overflowY)) {
            add("text-clip-y", `${el.scrollHeight}>${el.clientHeight}`);
          }
        }
        // contrast (text-bearing only)
        const txt = (el.textContent || "").trim();
        // WCAG 1.4.3 exempts INACTIVE controls — a disabled past-date
        // cell's muted number is design, not a violation.
        const inactive = el.closest("button[disabled],[aria-disabled='true'],[disabled]");
        if (txt.length > 1 && el.children.length === 0 && !inactive) {
          const Lf = lum(cs.color);
          const Lb = bgOf(el);
          if (Lf !== null && Lb !== null && Lb !== "gradient") {
            const ratio = (Math.max(Lf, Lb) + 0.05) / (Math.min(Lf, Lb) + 0.05);
            const px = parseFloat(cs.fontSize);
            const bold = Number(cs.fontWeight) >= 700;
            const need = px >= 19 && bold ? 3.0 : 4.5;
            if (ratio < need) add("contrast", `${ratio.toFixed(2)} < ${need} @${px}px/${cs.fontWeight}`);
          }
        }
      }
    };

    for (const el of interactive) check(el, true);
    for (const el of textParents) check(el, false);
    return out;
  });
  return violations.map((v) => ({ state: stateName, ...v }));
}
