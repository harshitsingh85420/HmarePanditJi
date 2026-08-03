-- ITEMS ARE THE POOJA'S DEFINITION — NO LIST, NO LISTING (Isj, 2026-08-03).
-- Grandfather is DEAD (ruled): one rule for all rows, existing five included.
-- A PujaService row is visible iff an ACTIVE BASIC SamagriPackage with ≥1
-- item exists for the same (pandit, pujaType).
--
-- FOR ISJ'S HAND ON NEON (Track 2A precedent — Render never migrates).
--
-- ── DRY RUN FIRST — must return exactly these 5 rows (measured 2026-08-03):
--   क्यूए-walk पंडित J2 · MUNDAN        ₹501
--   क्यूए-walk पंडित J2 · SATYANARAYAN  ₹2100
--   क्यूए-walk पंडित J2 · GRIHA_PRAVESH ₹1101  (video-APPROVED — video is NOT a gate)
--   Tanya               · SATYANARAYAN  ₹502
--   (क्यूए HAVAN must NOT appear — it has items: BASIC रोली + STANDARD देसी घी)
--
-- SELECT ps."id", ps."pujaType", ps."dakshinaAmount"
-- FROM "PujaService" ps
-- WHERE ps."isActive" = true
--   AND NOT EXISTS (
--     SELECT 1 FROM "SamagriPackage" sp
--     WHERE sp."panditId" = ps."panditProfileId"
--       AND sp."pujaType" = ps."pujaType"
--       AND sp."tier" = 'BASIC'
--       AND sp."isActive" = true
--       AND jsonb_array_length(sp."items") > 0
--   );
--
-- ── THE UPDATE (the dry-run's rows, and only them, flip false). The
--    directory consequence, accepted by ruling: 6 listings → 1 (क्यूए-HAVAN)
--    until each pandit's items land — at which moment saveSamagriPackages
--    (the one flip owner) republishes that row, no second migration needed.

UPDATE "PujaService" ps
SET "isActive" = false
WHERE ps."isActive" = true
  AND NOT EXISTS (
    SELECT 1 FROM "SamagriPackage" sp
    WHERE sp."panditId" = ps."panditProfileId"
      AND sp."pujaType" = ps."pujaType"
      AND sp."tier" = 'BASIC'
      AND sp."isActive" = true
      AND jsonb_array_length(sp."items") > 0
  );
