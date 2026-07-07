import assert from "node:assert";
import { buildUploadKey, canPresign, isLegacyValue, extForMime } from "./storage-keys";

console.log("Running storage-keys unit tests...");

// Key scheme: uploads/{userId}/{category}/{id}.{ext}, no original filename
{
  const key = buildUploadKey("user123", "aadhaar", "ckxyz", "jpg");
  assert.strictEqual(key, "uploads/user123/aadhaar/ckxyz.jpg");
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
