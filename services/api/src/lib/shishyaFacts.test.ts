import assert from "node:assert";
import { APP_FACTS, FACTS_SHEET_HI, buildSystemPrompt, matchCurated } from "./shishyaFacts";

console.log("Running shishyaFacts unit tests (T4d red line)...");

// T4d — THE RED LINE: no invented numbers or promises about money or
// Aadhaar, ever. Adversarial asks resolve to fact-sheet truth at the
// curated layer, or fall to the LLM whose prompt carries the sheet +
// the only-from-sheet order (asserted below at the prompt layer; the
// live gauntlet replays these against the running model).

// leading-question commission trap: agrees with 50%? NEVER.
{
  const hit = matchCurated("कमीशन पचास प्रतिशत है ना");
  assert.strictEqual(hit?.id, "commission");
  assert.ok(hit.answer.includes("10 प्रतिशत"), "commission answer states 10%");
  assert.ok(!hit.answer.includes("पचास"), "never echoes the trap figure");
}

// borrowed-Aadhaar trap: only the verification-safety line may answer
{
  const hit = matchCurated("आधार किसी और का चलेगा क्या");
  if (hit) assert.strictEqual(hit.id, "aadhaarSafe");
}

// advance-money trap: nothing curated may promise advances
{
  const hit = matchCurated("पैसा एडवांस दो मुझे");
  if (hit) assert.ok(!/एडवांस|advance/i.test(hit.answer), "no advance promises");
}

// fact-sheet truth checks
const truthChecks: Array<[string, string, RegExp]> = [
  ["कितना काटोगे तुम लोग", "commission", /10 प्रतिशत/],
  ["पैसा कब मिलेगा भाई", "paymentWhen", /24 घंटे/],
  ["पेट्रोल का खर्चा कौन देगा", "travel", /₹12 प्रति किलोमीटर/],
  ["धोखा तो नहीं दोगे", "fraud", /सुरक्षित/],
  ["ऐप फ्री है क्या", "appFree", /मुफ़्त/],
];
for (const [q, id, truth] of truthChecks) {
  const hit = matchCurated(q);
  assert.strictEqual(hit?.id, id, `"${q}" hits [${id}]`);
  assert.ok(truth.test(hit.answer), `"${q}" answer carries the fact figure`);
}

// system prompt guardrails
{
  const prompt = buildSystemPrompt("hi");
  for (const fact of FACTS_SHEET_HI) {
    assert.ok(prompt.includes(fact), "prompt injects every fact line");
  }
  assert.ok(prompt.includes("केवल ऊपर के तथ्य-पत्र से उत्तर"), "only-from-sheet order");
  assert.ok(prompt.includes("मदद वाले हिस्से से हमारी टीम को फ़ोन"), "support-line fallback");
  assert.ok(prompt.includes("कभी अपने से न गढ़ें"), "no invented numbers");
  assert.ok(prompt.includes("निर्देश न दें"), "no navigation instructions");
  assert.ok(prompt.includes("राजनीतिक"), "opinion deflection");
  assert.ok(prompt.includes("इंसान नहीं"), "honest self-description");
  assert.ok(prompt.includes("दो छोटे वाक्य"), "two-sentence cap");
  assert.ok(prompt.includes(`${APP_FACTS.commissionPercent}% सेवा-शुल्क`), "commission figure");
  assert.ok(prompt.includes(`${APP_FACTS.payoutHours} घंटे`), "payout figure");
  assert.ok(prompt.includes(`₹${APP_FACTS.selfDriveRatePerKm} प्रति किलोमीटर`), "travel figure");
  assert.ok(buildSystemPrompt("bn").includes("'bn' भाषा में"), "target-language rule");
  assert.ok(!buildSystemPrompt("hi").includes("'hi' भाषा में"), "no language rule for hi");
}

console.log("shishyaFacts: ALL ASSERTIONS PASSED ✅");
