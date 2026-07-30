/* Render BOTH card directions from the REAL /pandits payload, using the
   real components, so what Isj sees is component output — not a hand-copy. */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync } from "node:fs";
import { PanditCardEvidence, PanditCardDossier, PanditCardData } from "../components/design-system/PanditCard";
import { Button } from "../components/design-system/Button";
import { MoneyTwoZone } from "../components/design-system/MoneyTwoZone";

const SP = process.argv[2];
const REPO = process.argv[3];
const live = JSON.parse(readFileSync(`${SP}/pandits.json`, "utf8")).data.pandits;
const tokens = readFileSync(`${REPO}/apps/web/components/design-system/tokens.css`, "utf8");

const DEVA = /[ऀ-ॿ]/;

function toCard(p: any, ceremony: string, overrideReviewed?: boolean): PanditCardData {
  const svc = (p.pujaServices ?? []).find((s: any) => s.pujaType === ceremony) ?? null;
  const nameIsDeva = DEVA.test(p.user?.name ?? "");
  return {
    id: p.id,
    name: p.user?.name ?? "—",
    // no Roman form exists for a Devanagari-only stored name, so no accent line
    nameAccent: nameIsDeva ? null : null,
    city: p.location ?? null,
    identityVerified: p.verificationStatus === "VERIFIED",
    experienceYears: p.experienceYears || null,
    languages: p.languages ?? [],
    service: svc
      ? {
          pujaType: svc.pujaType,
          dakshinaAmount: svc.dakshinaAmount ?? null,
          durationHours: svc.durationHours ?? null,
          sampleReviewed: overrideReviewed ?? !!svc.poojaVerified,
          sampleViewable: !!svc.sampleViewable,
          sampleDuration: svc.sampleViewable ? "1:52" : null,
        }
      : null,
    timesPerformed: p.completedBookings ?? 0,
    platformFeePercent: 10,
  };
}

const ramesh = live.find((p: any) => /Ramesh Sharma/.test(p.user?.name ?? ""));
const noRate = live.find((p: any) => !(p.pujaServices ?? []).length);
const dinesh = live.find((p: any) => /Dinesh/.test(p.user?.name ?? ""));

const CONDITIONS: Array<{ key: string; note: string; data: PanditCardData }> = [
  {
    key: "B · sample video UNREVIEWED — the only state that exists today",
    note: "Real row, untouched. All six live pandits are poojaVerified:false with sampleVideoId null.",
    data: toCard(ramesh, "Griha Pravesh"),
  },
  {
    key: "A · sample video REVIEWED — CONSTRUCTED, no such row exists",
    note: "Same real row with poojaVerified flipped to true. Labelled because production has ZERO reviewed videos — showing this unlabelled would be the fixture lie.",
    data: toCard(ramesh, "Griha Pravesh", true),
  },
  {
    key: "C · no rate for this ceremony — real sparse row",
    note: `Real row: ${noRate?.user?.name ?? "?"} — 0 services, 0 experience, no languages. The genuine day-one shape.`,
    data: toCard(noRate, "Griha Pravesh"),
  },
  {
    key: "D · a second real pandit, different ceremony",
    note: "Real row, untouched — Dinesh Shastri, Griha Pravesh ₹6,500.",
    data: toCard(dinesh, "Griha Pravesh"),
  },
];

const col = (title: string, body: string) => `
  <div style="flex:1;min-width:0">
    <div style="font:600 12px/1 'Hanken Grotesk',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6B5B48;margin:0 0 10px">${title}</div>
    <div style="width:360px;max-width:100%;background:#EFE7DA;padding:14px;border-radius:12px">${body}</div>
  </div>`;

const sections = CONDITIONS.map((c) => `
  <section style="margin:0 0 34px">
    <h2 style="font:600 17px/1.3 'Hanken Grotesk',sans-serif;color:#241A12;margin:0 0 4px">${c.key}</h2>
    <p style="font:400 13px/1.5 'Hanken Grotesk',sans-serif;color:#6B5B48;margin:0 0 14px;max-width:760px">${c.note}</p>
    <div style="display:flex;gap:26px;flex-wrap:wrap">
      ${col("Direction A · The Evidence", renderToStaticMarkup(React.createElement(PanditCardEvidence, { d: c.data })))}
      ${col("Direction B · The Dossier", renderToStaticMarkup(React.createElement(PanditCardDossier, { d: c.data })))}
    </div>
  </section>`).join("");

const extras = `
  <section style="margin:40px 0 0;border-top:1px solid rgba(36,26,18,.12);padding-top:28px">
    <h2 style="font:600 17px/1.3 'Hanken Grotesk',sans-serif;color:#241A12;margin:0 0 14px">Foundation — button states &amp; the money block</h2>
    <div style="display:flex;gap:26px;flex-wrap:wrap;align-items:flex-start">
      <div style="width:360px;background:#EFE7DA;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:14px">
        ${renderToStaticMarkup(React.createElement(Button, { children: "Continue" } as any))}
        ${renderToStaticMarkup(React.createElement(Button, { busy: true } as any))}
        ${renderToStaticMarkup(React.createElement(Button, { done: true } as any))}
        ${renderToStaticMarkup(React.createElement(Button, { disabledReason: "Pick a date first — then you can continue", children: "Continue" } as any))}
        ${renderToStaticMarkup(React.createElement(Button, { kind: "secondary", children: "Secondary" } as any))}
        ${renderToStaticMarkup(React.createElement(Button, { kind: "destructive", children: "Cancel booking" } as any))}
      </div>
      <div style="width:360px;background:#EFE7DA;padding:14px;border-radius:12px">
        ${renderToStaticMarkup(React.createElement(MoneyTwoZone, {
          dakshina: 2100, platformFee: 210, totalNow: 2310,
          samagri: { label: "Samagri — Standard", amount: 1400 },
        } as any))}
      </div>
    </div>
  </section>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;500;600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
<style>${tokens}
body{margin:0;padding:30px;background:#FBF6EE;font-family:'Hanken Grotesk',system-ui,sans-serif}
.material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:400;font-style:normal;line-height:1;display:inline-block;vertical-align:middle}
</style></head><body>
<h1 style="font:600 26px/1.2 'Hanken Grotesk',sans-serif;color:#241A12;margin:0 0 6px">Pandit result card — two directions</h1>
<p style="font:400 14.5px/1.5 'Hanken Grotesk',sans-serif;color:#6B5B48;margin:0 0 30px;max-width:760px">
Rendered from the real <code>/pandits</code> payload through the actual components. Cards are 360&nbsp;wide.
<strong>The Introduction is cut</strong> (Ruling 3) — no quote field exists. No rating is rendered anywhere: the API returns 4.8/47 and similar against an empty Review table.</p>
${sections}${extras}
</body></html>`;

writeFileSync(process.argv[4], html);
console.log("wrote", process.argv[4], html.length, "bytes");
