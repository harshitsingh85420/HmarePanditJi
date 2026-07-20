# Conflict Rulings

Durable record of design/architecture conflicts and how they were settled, so a
ruling that flips is not silently re-litigated. Newest first.

---

## Ruling #1 — Primary palette: SINDOOR `#B23A1A`

**Status: evidence-final** (flipped twice before landing here).

### History

| Stage | Ruling | Basis |
| --- | --- | --- |
| 1. Original | App built in sindoor `#B23A1A` | Aarti design direction |
| 2. Audit reversal | "App drifted; re-token to saffron `#904D00`" | Audit baselined against the `/prompts` Stitch set + its `saffron_glow/DESIGN.md` |
| 3. **Evidence-final** | **Sindoor `#B23A1A` is canon; the app was faithful all along** | Measured against the real canon bundle once it was ingested |

### The evidence

Hex frequency counted directly from each source:

| Colour | canon `design/canon/` | legacy `/prompts` Stitch |
| --- | --- | --- |
| `#B23A1A` sindoor | **99 — most-used** | 0 |
| `#904D00` saffron | **0** | 223 |

Plus: 21 of 21 of the canon's most-used colours are present in
`apps/pandit/tailwind.config.ts`, and `#904D00` appears nowhere in app source
on any branch (`git grep` across `git rev-list --all`).

### Why stage 2 was wrong

The canon bundle was not in the repo — it existed only on Isj's machine. The
audit therefore baselined against the only design set it could see,
`/prompts`, which is a genuinely different and superseded design language. The
app's sindoor was read as drift when it was fidelity.

### Consequences

- No re-token to `#904D00` was ever executed in app source, so **nothing had to
  be reverted** — verified across all branches.
- The `saffron` Tailwind key keeps its legacy **name** (renaming would touch
  every class for no visual gain); its **value** stays sindoor `#B23A1A`. The
  comment at `apps/pandit/tailwind.config.ts` carries this distinction.
- `DESIGN.md` (repo root) now documents the canon palette and is authoritative.
- `prompts/.../saffron_glow/DESIGN.md` is legacy. It is **not** rewritten —
  editing a historical vendor export to state the opposite of what that design
  actually was would falsify the archive.
- Any audit finding whose baseline was the Stitch palette or layout is
  invalidated at the root, not merely downgraded.

### Reopening

Only new evidence from `design/canon/` reopens this. A document under
`prompts/` is not evidence.
