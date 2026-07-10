import assert from "node:assert";
import { maskBrandTokens, unmaskBrandTokens, BRAND_TOKENS } from "./brandTokens";

console.log("Running brandTokens unit tests...");

// Round-trip: every brand token survives an identity "translation"
{
  const src = "नमस्ते पंडित जी! मैं शिष्य हूँ — हमारे पंडित जी में आपका स्वागत है।";
  const masked = maskBrandTokens(src);
  assert.ok(!masked.includes("शिष्य"), "शिष्य must be masked");
  assert.ok(!masked.includes("हमारे पंडित जी"), "brand name must be masked");
  assert.ok(masked.includes("⟦S3⟧"), "shishya placeholder present");
  assert.ok(masked.includes("⟦S1⟧"), "brand placeholder present");
  // plain "पंडित जी" (common noun) must NOT be masked
  assert.ok(masked.includes("पंडित जी!"), "plain पंडित जी stays translatable");
  assert.strictEqual(unmaskBrandTokens(masked), src);
}

// Longest-first: "हमारे पंडित जी" is one unit, never a partial hit
{
  const masked = maskBrandTokens("हमारे पंडित जी ऐप");
  assert.strictEqual(masked, "⟦S1⟧ ऐप");
}

// Translation-engine tolerance: whitespace injected inside the brackets
{
  assert.strictEqual(unmaskBrandTokens("Welcome to ⟦ S1 ⟧, I am ⟦S3⟧."),
    `Welcome to ${BRAND_TOKENS[0]}, I am ${BRAND_TOKENS[2]}.`);
}

// Dropped/mangled placeholder never leaks brackets into the UI
{
  assert.strictEqual(unmaskBrandTokens("Hello ⟦S9⟧ world"), "Hello world");
  assert.strictEqual(unmaskBrandTokens("Hello ⟦⟧ world"), "Hello world");
}

// English brand spelling passes through
{
  const src = "Download HmarePanditJi today";
  assert.strictEqual(unmaskBrandTokens(maskBrandTokens(src)), src);
}

// Repeated tokens all round-trip
{
  const src = "शिष्य बोलेगा, शिष्य सुनेगा";
  assert.strictEqual(unmaskBrandTokens(maskBrandTokens(src)), src);
}

console.log("brandTokens unit tests passed ✓");
