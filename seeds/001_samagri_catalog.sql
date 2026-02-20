-- HmarePanditJi — Platform Samagri Master Catalog Seed
-- 30+ items across all categories: flowers, grains, dairy, incense, metals, cloth, fruits, herbs, other
-- All prices in PAISE (INTEGER). Master Rule #2.
-- base_price_paise: price per standard unit (1000g for grams, 1 piece for pieces, 1000ml for ml)
--
-- Run AFTER migration 003_samagri.sql

INSERT INTO samagri_items
  (name, name_hindi, category, unit, base_price_paise, is_perishable, puja_relevance)
VALUES
  -- ─── DAIRY ────────────────────────────────────────────────────────────────────
  ('Desi Ghee', 'देसी घी', 'dairy', 'grams', 120000, false,
    '{vivah,griha_pravesh,havan,satyanarayan,navgrah_puja}'),
  ('Milk (Dudh)', 'दूध', 'dairy', 'ml', 5000, true,
    '{satyanarayan,rudrabhishek,annaprashan,navgrah_puja}'),
  ('Curd (Dahi)', 'दही', 'dairy', 'ml', 4000, true,
    '{vivah,satyanarayan,annaprashan}'),

  -- ─── FLOWERS ──────────────────────────────────────────────────────────────────
  ('Marigold Garland', 'गेंदे की माला', 'flowers', 'pieces', 5000, true,
    '{vivah,griha_pravesh,satyanarayan,namkaran}'),
  ('Lotus Flower', 'कमल', 'flowers', 'pieces', 15000, true,
    '{lakshmi_puja,rudrabhishek,durga_puja}'),

  -- ─── GRAINS ────────────────────────────────────────────────────────────────────
  ('Rice (Akshat)', 'चावल / अक्षत', 'grains', 'grams', 2000, false,
    '{vivah,griha_pravesh,satyanarayan,namkaran,annaprashan,mundan}'),
  ('Sesame Seeds (Til)', 'तिल', 'grains', 'grams', 3000, false,
    '{havan,shradh,pitru_paksha,navgrah_puja}'),
  ('Sugar (Mishri)', 'मिश्री', 'grains', 'grams', 5000, false,
    '{satyanarayan,ganesh_puja,lakshmi_puja}'),
  ('Black Sesame (Kala Til)', 'काला तिल', 'grains', 'grams', 4000, false,
    '{shradh,pitru_paksha,navgrah_puja}'),
  ('Barley (Jau)', 'जौ', 'grains', 'grams', 2500, false,
    '{havan,navgrah_puja,satyanarayan}'),

  -- ─── INCENSE ───────────────────────────────────────────────────────────────────
  ('Camphor (Kapoor)', 'कपूर', 'incense', 'grams', 15000, false,
    '{vivah,griha_pravesh,satyanarayan,havan,ganesh_puja,lakshmi_puja}'),
  ('Incense Sticks (Agarbatti)', 'अगरबत्ती', 'incense', 'pieces', 2000, false,
    '{vivah,griha_pravesh,satyanarayan,ganesh_puja,lakshmi_puja}'),

  -- ─── METALS ────────────────────────────────────────────────────────────────────
  ('Copper Kalash', 'तांबे का कलश', 'metals', 'pieces', 35000, false,
    '{vivah,griha_pravesh,satyanarayan,navgrah_puja}'),
  ('Silver Coin', 'चांदी का सिक्का', 'metals', 'pieces', 200000, false,
    '{vivah,lakshmi_puja,satyanarayan}'),

  -- ─── CLOTH ────────────────────────────────────────────────────────────────────
  ('Red Cloth (Lal Vastra)', 'लाल वस्त्र', 'cloth', 'pieces', 20000, false,
    '{satyanarayan,navgrah_puja,lakshmi_puja}'),
  ('Yellow Cloth (Peet Vastra)', 'पीला वस्त्र', 'cloth', 'pieces', 20000, false,
    '{vivah,namkaran,griha_pravesh}'),
  ('Sacred Thread (Mauli/Kalawa)', 'मौली', 'cloth', 'pieces', 1000, false,
    '{vivah,griha_pravesh,satyanarayan,havan,ganesh_puja}'),

  -- ─── FRUITS ──────────────────────────────────────────────────────────────────
  ('Banana (Kela)', 'केला', 'fruits', 'pieces', 3000, true,
    '{satyanarayan,annaprashan,ganesh_puja}'),
  ('Coconut (Nariyal)', 'नारियल', 'fruits', 'pieces', 5000, true,
    '{vivah,griha_pravesh,satyanarayan,havan,ganesh_puja,lakshmi_puja}'),

  -- ─── HERBS ────────────────────────────────────────────────────────────────────
  ('Sandalwood Paste (Chandan)', 'चंदन', 'herbs', 'grams', 80000, false,
    '{vivah,satyanarayan,rudrabhishek,ganesh_puja}'),
  ('Turmeric Powder (Haldi)', 'हल्दी', 'herbs', 'grams', 4000, false,
    '{vivah,mundan,namkaran,griha_pravesh}'),
  ('Betel Leaves (Paan ke Patte)', 'पान के पत्ते', 'herbs', 'pieces', 2000, true,
    '{vivah,satyanarayan,griha_pravesh,ganesh_puja}'),
  ('Betel Nuts (Supari)', 'सुपारी', 'herbs', 'pieces', 1500, false,
    '{vivah,satyanarayan,griha_pravesh,ganesh_puja}'),
  ('Mango Leaves (Aam ke Patte)', 'आम के पत्ते', 'herbs', 'pieces', 2000, true,
    '{vivah,griha_pravesh,satyanarayan}'),
  ('Havan Samagri Mix', 'हवन सामग्री', 'herbs', 'grams', 6000, false,
    '{havan,vivah,griha_pravesh,satyanarayan,rudrabhishek}'),
  ('Bel Patra', 'बेल पत्र', 'herbs', 'pieces', 1000, true,
    '{rudrabhishek,navgrah_puja}'),

  -- ─── OTHER ────────────────────────────────────────────────────────────────────
  ('Red Sindoor', 'सिंदूर', 'other', 'grams', 8000, false,
    '{vivah,satyanarayan,lakshmi_puja}'),
  ('Honey (Shehad)', 'शहद', 'other', 'ml', 25000, false,
    '{vivah,satyanarayan,annaprashan}'),
  ('Cow Dung Cake (Kanda)', 'कंडा', 'other', 'pieces', 3000, false,
    '{havan,griha_pravesh}'),
  ('Diyas (Clay Lamps)', 'दिया', 'other', 'pieces', 500, false,
    '{vivah,griha_pravesh,satyanarayan,ganesh_puja,lakshmi_puja,havan}')
ON CONFLICT DO NOTHING;
