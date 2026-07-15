// Logical backup of the whole database to a JSON file — every model's rows,
// restorable via re-insert (createMany per model in FK order). Used before a
// schema migration when pg_dump is unavailable. Reads DATABASE_URL from the
// env (same as the API); NEVER prints the connection string. The OUTPUT file
// contains prod data — write it OUTSIDE the repo and never commit it.
//
// Run:  DATABASE_URL=<prod> node --import tsx scripts/backup-prod.mjs <out.json>
import { prisma, Prisma } from "@hmarepanditji/db";
import { writeFileSync, statSync } from "node:fs";

const out = process.argv[2];
if (!out) { console.log("usage: backup-prod.mjs <out.json>"); process.exit(1); }
if (!process.env.DATABASE_URL) { console.log("DATABASE_URL not set — stop"); process.exit(1); }

const models = Prisma.dmmf.datamodel.models.map((m) => m.name);
const dump = { _meta: { models } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Neon's serverless pooler can cold-start; retry each model so a warm-up blip
// never leaves a table out of the backup.
let failures = 0;
for (const name of models) {
  const acc = name[0].toLowerCase() + name.slice(1);
  let ok = false;
  for (let attempt = 1; attempt <= 5 && !ok; attempt++) {
    try {
      dump[name] = await prisma[acc].findMany();
      ok = true;
    } catch (e) {
      if (attempt === 5) { dump[name] = { _error: String(e?.message || e) }; failures++; }
      else await sleep(1500 * attempt);
    }
  }
}
if (failures > 0) { console.log(`BACKUP INCOMPLETE — ${failures} model(s) failed after retries. Do NOT migrate.`); process.exitCode = 2; }
writeFileSync(out, JSON.stringify(dump, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
const sizeKB = Math.round(statSync(out).size / 1024);
console.log(`BACKUP → ${out}  (${sizeKB} KB)`);
console.log(models.map((n) => `${n}=${Array.isArray(dump[n]) ? dump[n].length : "ERR"}`).join("  "));
await prisma.$disconnect();
