// AA1 durability proof: put an object to R2, read it back, delete it.
// R2 is external object storage, so an object that round-trips here
// SURVIVES a Render deploy (unlike the ephemeral disk it replaces).
// Reads creds from services/api/.env — NEVER prints them.
import { readFileSync } from "node:fs";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function env() {
  const out = {};
  try {
    for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* none */ }
  return out;
}

const e = env();
const need = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
const missing = need.filter((k) => !(process.env[k] || e[k]));
if (missing.length) { console.log("MISSING R2 vars:", missing.join(", ")); process.exit(1); }
const get = (k) => process.env[k] || e[k];

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: get("R2_ACCESS_KEY_ID"), secretAccessKey: get("R2_SECRET_ACCESS_KEY") },
});
const Bucket = get("R2_BUCKET");
const Key = `healthcheck/r2-roundtrip-${Date.now()}.txt`;
const payload = "aadhaar-durability-proof";

try {
  await s3.send(new PutObjectCommand({ Bucket, Key, Body: Buffer.from(payload), ContentType: "text/plain" }));
  const res = await s3.send(new GetObjectCommand({ Bucket, Key }));
  const back = await res.Body.transformToString();
  console.log("R2 PUT+GET:", back === payload ? "OK ✓ durable (external to Render disk)" : "MISMATCH");
  console.log("bucket reachable, key round-tripped:", Key);
  await s3.send(new DeleteObjectCommand({ Bucket, Key }));
  console.log("cleanup: test object deleted");
} catch (err) {
  console.log("R2 ERROR:", err?.name || err, "-", (err?.message || "").slice(0, 120));
  process.exit(2);
}
