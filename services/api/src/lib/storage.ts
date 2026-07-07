import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

// Cloudflare R2 (S3-compatible). When the four R2_* vars are absent we fall
// back to local disk with identical signatures so dev-without-keys keeps
// working unchanged.

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET;

export function isStorageConfigured(): boolean {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && BUCKET);
}

let r2: S3Client | null = null;
function client(): S3Client {
  if (!r2) {
    r2 = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2;
}

// ── Local-disk dev fallback ──────────────────────────────────────────────────

const LOCAL_ROOT = path.join(process.cwd(), "uploads");
let warnedLocal = false;
function warnLocalOnce(): void {
  if (!warnedLocal) {
    warnedLocal = true;
    logger.warn("R2 not configured, using local disk (dev only)");
  }
}

function localPath(key: string): string {
  // keys are always forward-slash object keys; keep them inside LOCAL_ROOT
  const p = path.join(LOCAL_ROOT, ...key.split("/"));
  if (!p.startsWith(LOCAL_ROOT)) throw new Error("Invalid storage key");
  return p;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  if (!isStorageConfigured()) {
    warnLocalOnce();
    const p = localPath(key);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, body);
    return;
  }
  await client().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

export async function getPresignedGetUrl(key: string, expiresSeconds = 900): Promise<string> {
  if (!isStorageConfigured()) {
    warnLocalOnce();
    // Local dev: files are served straight off disk by the API's static route
    return `/uploads/${key}`;
  }
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: expiresSeconds,
  });
}

export async function objectExists(key: string): Promise<boolean> {
  if (!isStorageConfigured()) {
    warnLocalOnce();
    return fs.existsSync(localPath(key));
  }
  try {
    await client().send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (err: unknown) {
    const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) return false;
    throw err;
  }
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  if (!isStorageConfigured()) {
    warnLocalOnce();
    return fs.readFileSync(localPath(key));
  }
  const res = await client().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const bytes = await res.Body!.transformToByteArray();
  return Buffer.from(bytes);
}
