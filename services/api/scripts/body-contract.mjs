// L9 — CLIENT↔SERVER BODY CONTRACT AUDIT.
// BB1d/route-audit already guarantees client calls hit a real route with the
// right METHOD + PATH. But BODY SHAPE was unchecked — so the web app POSTed
// {ritualId, nested venueAddress object, pricing object} to /bookings while
// createBookingSchema requires {eventType, flat venueAddress string,
// venueCity, venuePincode, dakshinaAmount, ...}. Every real customer submit
// 400'd on Zod and NO booking could be created, with no guard failing.
//
// This audits the create-booking contract: it extracts createBookingSchema's
// REQUIRED keys (z.object keys not marked .optional()/.default()) and asserts
// every client POST .../bookings literal body supplies them. Structured to
// extend: add more {schema, routeFile, clientPathRe} entries to CONTRACTS.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..", "..");
const norm = (p) => p.split("\\").join("/");

// Extract the required keys of a `const <name> = z.object({ ... })` block.
// A key is REQUIRED unless its definition chain contains .optional() or
// .default(.
function requiredKeysOf(src, schemaName) {
  const start = src.indexOf(`${schemaName} = z.object({`);
  if (start === -1) return null;
  let i = src.indexOf("{", start);
  let depth = 0;
  let body = "";
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
    if (depth >= 1) body += ch;
  }
  // split into top-level "key: <chain>," entries
  const required = [];
  let seg = "";
  let d = 0;
  for (const ch of body.slice(1)) {
    if ("{[(".includes(ch)) d++;
    else if ("}])".includes(ch)) d--;
    if (ch === "," && d === 0) {
      pushKey(seg, required);
      seg = "";
    } else seg += ch;
  }
  pushKey(seg, required);
  return required;
}
function pushKey(seg, out) {
  const m = seg.match(/^\s*([A-Za-z0-9_]+)\s*:\s*z\./);
  if (!m) return;
  if (/\.optional\(\)|\.default\(/.test(seg)) return; // optional → not required
  out.push(m[1]);
}

// Top-level keys of an object literal starting at `{` (nested objects skipped).
function topLevelKeys(objSrc) {
  const keys = [];
  let d = 0;
  let expectKey = true;
  const body = objSrc.replace(/^\s*\{/, "");
  let seg = "";
  for (const ch of body) {
    if ("{[(".includes(ch)) d++;
    else if ("}])".includes(ch)) { if (d === 0) break; d--; }
    if (ch === "," && d === 0) { grabKey(seg, keys); seg = ""; continue; }
    seg += ch;
  }
  grabKey(seg, keys);
  return keys;
  function grabKey(s, out) {
    const m = s.match(/^\s*([A-Za-z0-9_]+)\s*:/);
    if (m) out.push(m[1]);
  }
}

const CONTRACTS = [
  {
    label: "POST /bookings (createBookingSchema)",
    routeFile: "services/api/src/routes/booking.routes.ts",
    schema: "createBookingSchema",
    clientCallRe: /fetch\(\s*`\$\{API_BASE\}\/bookings`[\s\S]{0,1500}?JSON\.stringify\((\{[\s\S]*?\n\s*\})\)/g,
    apps: ["apps/web/src", "apps/pandit/src"],
  },
];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "dist") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec)\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

export function audit() {
  const violations = [];
  let checked = 0;
  for (const c of CONTRACTS) {
    const routeSrc = readFileSync(join(REPO, c.routeFile), "utf8");
    const required = requiredKeysOf(routeSrc, c.schema);
    if (!required) {
      violations.push({ contract: c.label, reason: `schema ${c.schema} not found` });
      continue;
    }
    let sawClientCall = false;
    for (const appDir of c.apps) {
      for (const file of walk(join(REPO, appDir))) {
        const src = readFileSync(file, "utf8");
        c.clientCallRe.lastIndex = 0;
        let m;
        while ((m = c.clientCallRe.exec(src)) !== null) {
          sawClientCall = true;
          checked++;
          const keys = new Set(topLevelKeys(m[1]));
          const missing = required.filter((k) => !keys.has(k));
          if (missing.length) {
            violations.push({
              contract: c.label,
              file: norm(relative(REPO, file)),
              missing,
              required,
              sent: [...keys],
            });
          }
        }
      }
    }
    if (!sawClientCall) violations.push({ contract: c.label, reason: "no client create-booking call found — regex drift?" });
  }
  return { violations, checked };
}

if (process.argv[1] && norm(process.argv[1]).endsWith("body-contract.mjs")) {
  const { violations, checked } = audit();
  console.log(`body-contract: ${checked} client body/ies checked, ${violations.length} violation(s)`);
  for (const v of violations) console.log("  ", JSON.stringify(v));
  process.exit(Math.min(violations.length, 255));
}
