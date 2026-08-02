import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildUploadKey, uploadEpoch, DRAFT_EPOCH,
  canPresign, isLegacyValue, extForMime, resolveKind, isUploadKind,
} from "./storage-keys";
import { proveMatchers, proveSaw, proveDetects } from "./g2";

console.log("Running storage-keys unit tests...");

// ═════════════════════════════════════════════════════════════
// THE LAW, RESTATED IN TWO CLAUSES — F-J7-2 / SHAPE B, ruled by Isj.
//
// THIS FILE USED TO ASSERT CLAUSE 1 UNCONDITIONALLY, and that is precisely
// what made it wrong. `assert.strictEqual(k1, k2, "re-upload … must produce
// the SAME key")` was true of every upload in the system, which is why the J7
// walk could replace the bytes under an already-reviewed Aadhaar and no test
// anywhere objected. THE GUARD WAS NOT SILENT ABOUT THE DEFECT; IT ASSERTED
// THE DEFECT. This is the ruled EDIT, not an addition.
//
//   CLAUSE 1 · DEDUP WHILE PENDING. A profile still PENDING has handed nothing
//     to a reviewer, so a re-upload OVERWRITES in place: one object per
//     (pandit, kind), no orphans. Unchanged from the original law.
//
//   CLAUSE 2 · VERSIONED ONCE IT LEAVES PENDING. The moment the status is
//     anything else the key carries an epoch, so an abandoned upload CANNOT
//     land on the object a reviewer was given. Immutable by construction.
//
// THE PREDICATE IS "LEAVES PENDING", NOT "IS APPROVED" — ruled, and the
// specimens below carry BOTH DOCUMENTS_SUBMITTED and VERIFIED so the
// distinction stays visible in the test rather than living in a comment.
// DOCUMENTS_SUBMITTED is the one that matters: it is the window J7 actually
// walked, and a guard that only exercised VERIFIED could not tell the two
// readings of the ruling apart.
// ═════════════════════════════════════════════════════════════
const CLAUSE_2_KINDS = ["aadhaar-front", "aadhaar-back", "profile-photo"] as const;
/** Every status that is NOT a draft. Each must version. */
const LEFT_PENDING = ["DOCUMENTS_SUBMITTED", "VIDEO_KYC_DONE", "VERIFIED", "APPROVED", "REJECTED"] as const;
const T0 = 1785662840222; // a fixed upload moment, so the test needs no clock

// ── CLAUSE 1 ─────────────────────────────────────────────────
{
  assert.strictEqual(uploadEpoch("PENDING", T0), DRAFT_EPOCH, "a PENDING profile is a DRAFT");
  const k1 = buildUploadKey("user123", "aadhaar-front", DRAFT_EPOCH);
  const k2 = buildUploadKey("user123", "aadhaar-front", DRAFT_EPOCH);
  assert.strictEqual(k1, "uploads/user123/aadhaar-front");
  assert.strictEqual(k1, k2, "clause 1 — while PENDING, a re-upload must produce the SAME key (dedup)");
  // the draft key is also the DEFAULT, so an un-migrated caller still dedups
  assert.strictEqual(buildUploadKey("user123", "aadhaar-front"), k1);
  // different kinds never collide
  assert.notStrictEqual(k1, buildUploadKey("user123", "aadhaar-back", DRAFT_EPOCH));
  // NO random id, NO extension in the key
  assert.ok(!/\.(jpg|png|webp|mp4)$/.test(k1), "canonical key has no extension");
  assert.ok(!/[0-9a-f]{16,}/.test(k1), "canonical key has no random id");
}

// ── CLAUSE 2 ─────────────────────────────────────────────────
{
  let versioned = 0;
  for (const status of LEFT_PENDING) {
    const epoch = uploadEpoch(status, T0);
    assert.notStrictEqual(epoch, DRAFT_EPOCH, `${status} has left PENDING and must NOT use the draft key`);
    for (const kind of CLAUSE_2_KINDS) {
      const draft = buildUploadKey("user123", kind, DRAFT_EPOCH);
      const after = buildUploadKey("user123", kind, epoch);
      versioned++;
      assert.notStrictEqual(after, draft,
        `clause 2 — under ${status}, a ${kind} upload must NOT land on the reviewed object`);
      assert.ok(after.startsWith(`uploads/user123/${kind}`), "the versioned key keeps its kind prefix");
      assert.ok(!after.includes(".."), "the version suffix cannot escape the prefix");
      assert.ok(!/[0-9a-f]{16,}/.test(after), "the version suffix is not a random id");
      assert.ok(canPresign("PANDIT", "user123", after), "the owner can still read back his versioned object");
      assert.ok(!canPresign("PANDIT", "someone-else", after), "and nobody else can");
    }
  }
  proveSaw("storage-keys", "post-draft (status × kind) key combinations asserted", versioned);

  // THE PREDICATE, MADE VISIBLE. If the ruling had said "after APPROVAL", this
  // assertion would be false — DOCUMENTS_SUBMITTED would still be a draft and
  // the submitted-but-unreviewed window would stay overwritable. It is the
  // window J7 walked, so it is the one the test names out loud.
  assert.notStrictEqual(uploadEpoch("DOCUMENTS_SUBMITTED", T0), DRAFT_EPOCH,
    "SUBMITTED IS ALREADY TOO LATE TO OVERWRITE IN PLACE — the pandit has handed the file to a " +
    "reviewer even if no reviewer has opened it. Versioning only at approval leaves exactly the " +
    "window F-J7-2 was found in.");
  assert.strictEqual(uploadEpoch("VERIFIED", T0), uploadEpoch("DOCUMENTS_SUBMITTED", T0),
    "the epoch is the UPLOAD moment — every post-draft status versions the same way");

  // The suffix is the upload moment, so two uploads a second apart cannot
  // collide onto one object. This is the ruled shape and its cost: orphaned
  // bytes with no DB pointer, whose reaping is a NAMED FUTURE.
  assert.notStrictEqual(
    buildUploadKey("user123", "profile-photo", uploadEpoch("VERIFIED", T0)),
    buildUploadKey("user123", "profile-photo", uploadEpoch("VERIFIED", T0 + 1000)),
    "two post-draft uploads at different moments must not share a key",
  );
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

// GUARD: the controller must build the key from BOTH the identity and the
// LIFECYCLE. The 2-arg call is now the SUPERSEDED law: it silently rebuilds
// the draft key for a pandit whose documents are already with a reviewer —
// F-J7-2, restored.
{
  const ctrl = readFileSync(join(__dirname, "..", "controllers", "upload.controller.ts"), "utf8");
  proveSaw("storage-keys", "upload.controller.ts bytes read", ctrl.length);
  assert.ok(/buildUploadKey\(\s*userId\s*,\s*kind\s*,/.test(ctrl),
    "controller must use the 3-arg buildUploadKey(userId, kind, epoch)");
  assert.ok(!/buildUploadKey\(\s*userId\s*,\s*kind\s*\)/.test(ctrl),
    "controller must NOT use the superseded 2-arg call — clause 2 would never fire");
  assert.ok(/verificationStatus/.test(ctrl),
    "controller must READ the lifecycle — a key built without it cannot honour clause 2");
  assert.ok(!/randomUUID/.test(ctrl),
    "controller must NOT mint a random id into the upload key (orphans on re-upload)");
}

// ── G2: every matcher proven able to see what it hunts ───────
proveMatchers("storage-keys", [
  ["the superseded 2-arg call", /buildUploadKey\(\s*userId\s*,\s*kind\s*\)/,
    "    const key = buildUploadKey(userId, kind);",
    "    const key = buildUploadKey(userId, kind, uploadEpoch(profile.verificationStatus));"],
  ["a random id minted into the key", /randomUUID/,
    "    const key = `uploads/${userId}/${randomUUID()}`;",
    "    const key = buildUploadKey(userId, kind, epoch);"],
  ["the lifecycle read", /verificationStatus/,
    "      select: { verificationStatus: true },",
    "      select: { id: true },"],
]);

// THE DEFECT ITSELF, AS A DETECTOR. The tainted input is the old law's own
// behaviour — treat every status as a draft — and it must produce a collision
// with the reviewed object. The clean input is the ruling.
proveDetects("storage-keys",
  "a post-draft upload that collides with the object a reviewer was given",
  (epochFor: (s: string) => string) =>
    CLAUSE_2_KINDS.some((kind) =>
      buildUploadKey("u1", kind, epochFor("DOCUMENTS_SUBMITTED")) ===
      buildUploadKey("u1", kind, DRAFT_EPOCH)),
  () => DRAFT_EPOCH,                    // tainted: the superseded law
  (s: string) => uploadEpoch(s, T0),    // clean: Shape B
);
proveSaw("storage-keys", "kinds covered by clause 2", CLAUSE_2_KINDS.length);
proveSaw("storage-keys", "post-draft statuses exercised", LEFT_PENDING.length);

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
