import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildUploadKey, canPresign, isLegacyValue, extForMime, resolveKind, isUploadKind } from "./storage-keys";

console.log("Running storage-keys unit tests...");

// DEDUP LAW — one CANONICAL key per (pandit, kind): deterministic, no random
// id, no extension, so a re-upload overwrites in place (no orphans).
{
  const k1 = buildUploadKey("user123", "aadhaar-front");
  const k2 = buildUploadKey("user123", "aadhaar-front"); // same inputs → SAME key
  assert.strictEqual(k1, "uploads/user123/aadhaar-front");
  assert.strictEqual(k1, k2, "re-upload of the same kind must produce the SAME key (dedup)");
  // different kinds never collide
  assert.notStrictEqual(buildUploadKey("user123", "aadhaar-front"), buildUploadKey("user123", "aadhaar-back"));
  // NO random id, NO extension in the key
  assert.ok(!/\.(jpg|png|webp|mp4)$/.test(k1), "canonical key has no extension");
  assert.ok(!/[0-9a-f]{16,}/.test(k1), "canonical key has no random id");
}

// legacy route params map onto stable kinds
{
  assert.strictEqual(resolveKind("aadhaar"), "aadhaar-front"); // legacy generic → front
  assert.strictEqual(resolveKind("aadhaar-back"), "aadhaar-back");
  assert.strictEqual(resolveKind("kyc"), "photo"); // unknown → safe default
  assert.strictEqual(resolveKind("kyc-video"), "kyc-video");
  assert.strictEqual(resolveKind(undefined), "photo");
  assert.ok(isUploadKind("aadhaar-front") && !isUploadKind("bogus"));
}

// GUARD: the upload controller must build a DETERMINISTIC key — never a random
// id — or re-uploads orphan the old R2 object (the bug this law closes).
{
  const ctrl = readFileSync(join(__dirname, "..", "controllers", "upload.controller.ts"), "utf8");
  assert.ok(/buildUploadKey\(\s*userId\s*,\s*kind\s*\)/.test(ctrl), "controller must use the 2-arg canonical buildUploadKey(userId, kind)");
  assert.ok(!/randomUUID/.test(ctrl), "controller must NOT mint a random id into the upload key (orphans on re-upload)");
}

// A pandit can presign only their own keys
{
  assert.strictEqual(canPresign("PANDIT", "user123", "uploads/user123/aadhaar/a.jpg"), true);
  // another user's key → forbidden (route returns 403)
  assert.strictEqual(canPresign("PANDIT", "user123", "uploads/user999/aadhaar/a.jpg"), false);
  // prefix trickery must not work
  assert.strictEqual(canPresign("PANDIT", "user123", "uploads/user1234/aadhaar/a.jpg"), false);
  assert.strictEqual(canPresign("PANDIT", "user123", "uploads/user123/../user999/a.jpg"), false);
}

// Admin can presign any uploads/ key, but nothing outside uploads/
{
  assert.strictEqual(canPresign("ADMIN", "adminId", "uploads/user999/aadhaar/a.jpg"), true);
  assert.strictEqual(canPresign("ADMIN", "adminId", "tts/somehash.mp3"), false);
}

// Customers / unknown roles: never
{
  assert.strictEqual(canPresign("CUSTOMER", "user123", "uploads/user123/photo/a.jpg"), false);
}

// Legacy passthrough detection
{
  assert.strictEqual(isLegacyValue("/uploads/old_file.jpg"), true);
  assert.strictEqual(isLegacyValue("https://cdn.example.com/x.jpg"), true);
  assert.strictEqual(isLegacyValue("uploads/user123/aadhaar/a.jpg"), false);
}

// MIME → extension mapping (whitelist)
{
  assert.strictEqual(extForMime("image/jpeg"), "jpg");
  assert.strictEqual(extForMime("application/pdf"), null);
}

console.log("✅ storage-keys tests passed!");
