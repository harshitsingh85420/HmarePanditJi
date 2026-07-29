import assert from "node:assert";
import { byteLength, isHeaderSafe, jsonBody, assertHeaderSafe } from "./http-body";

console.log("Running http-body (byte-vs-character) guard...");

// THE DEVANAGARI FACT both incidents turned on.
assert.strictEqual("क्यूए".length, 5, "precondition: JS counts 5 CHARACTERS");
assert.strictEqual(byteLength("क्यूए"), 15, "…but 15 BYTES on the wire — the 3x that broke Content-Length");
assert.strictEqual(byteLength("abc"), 3, "ASCII must be unchanged");

// jsonBody must declare BYTES, never characters.
{
  const { body, headers } = jsonBody({ text: "क्यूए traversal probe", route: "/qa" });
  assert.strictEqual(headers["Content-Length"], String(byteLength(body)));
  assert.notStrictEqual(headers["Content-Length"], String(body.length), "declaring body.length is the exact bug this prevents");
  assert.match(headers["Content-Type"], /charset=utf-8/);
}

// Header safety — incident 1.
assert.ok(isHeaderSafe("HPJ-2026-19502"));
assert.ok(!isHeaderSafe("क्यूए-19502"), "Devanagari is NOT header-safe");
assert.throws(() => assertHeaderSafe("Idempotency-Key", "क्यूए-19502"), /BEFORE it leaves the client/,
  "the error must name the invisible pre-network failure, which the native one does not");
assert.strictEqual(assertHeaderSafe("Idempotency-Key", "HPJ-1"), "HPJ-1");

console.log("✓ http-body guard passed (5 chars = 15 bytes; Content-Length is byte-derived; headers rejected pre-flight)");
