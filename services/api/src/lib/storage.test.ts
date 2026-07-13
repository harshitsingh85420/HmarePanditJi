import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { storageStartupDecision } from "./storage";

console.log("Running storage prod-fallback guard (BB2)...");

// ── the invariant: production may NEVER silently use the ephemeral disk ───────
assert.strictEqual(storageStartupDecision(true, false), "fatal", "prod + no R2 -> refuse to start");
assert.strictEqual(storageStartupDecision(true, true), "r2", "prod + R2 -> use R2");
assert.strictEqual(storageStartupDecision(false, false), "local", "dev + no R2 -> local fallback ok");
assert.strictEqual(storageStartupDecision(false, true), "r2", "dev + R2 -> use R2");

// ── wiring guards (grep) ──────────────────────────────────────────────────────
const storageSrc = readFileSync(join(__dirname, "storage.ts"), "utf-8");
// The disk-write paths are gated on useLocalDisk(), which throws in prod.
assert.ok(/function useLocalDisk\(\)/.test(storageSrc), "useLocalDisk gate exists");
assert.ok(
  /if \(IS_PROD\) \{\s*throw new Error\("R2 not configured in production/.test(storageSrc),
  "useLocalDisk refuses the fallback in production (defense in depth)",
);
assert.ok(!/if \(!isStorageConfigured\(\)\) \{\s*warnLocalOnce/.test(storageSrc), "no ungated disk fallback remains");

const indexSrc = readFileSync(join(__dirname, "..", "index.ts"), "utf-8");
assert.ok(/assertStorageReady\(\)/.test(indexSrc), "server startup asserts storage readiness");

const appSrc = readFileSync(join(__dirname, "..", "app.ts"), "utf-8");
assert.ok(
  /if \(!isStorageConfigured\(\)\) \{\s*app\.register\(fastifyStatic/.test(appSrc),
  "static /uploads route registered only in the local-disk fallback (kills the prod warning)",
);

console.log("storage prod-fallback guard: ALL PASSED ✅");
