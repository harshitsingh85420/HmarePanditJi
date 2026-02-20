-- HmarePanditJi Seed Data — Platform rituals / puja types
-- Run after all migrations

INSERT INTO samagri_items (id, name, name_hindi, category, unit, base_price_paise, is_perishable, puja_relevance, is_active) VALUES
  (gen_random_uuid(), 'Marigold Garland', 'गेंदे की माला', 'flowers', 'piece', 15000, true, '{vivah,griha_pravesh,satyanarayan}', true),
  (gen_random_uuid(), 'Rose Petals', 'गुलाब की पंखुड़ियां', 'flowers', 'kg', 40000, true, '{vivah,lakshmi_puja}', true),
  (gen_random_uuid(), 'Raw Rice (Akshata)', 'अक्षत', 'grains', 'kg', 8000, false, '{vivah,satyanarayan,ganesh_puja,navgrah_puja}', true),
  (gen_random_uuid(), 'Whole Wheat', 'गेहूं', 'grains', 'kg', 6000, false, '{havan,mundan}', true),
  (gen_random_uuid(), 'Cow Ghee', 'गाय का घी', 'dairy', '500ml', 30000, true, '{havan,satyanarayan,rudrabhishek}', true),
  (gen_random_uuid(), 'Camphor', 'कपूर', 'incense', '50g', 10000, false, '{ganesh_puja,lakshmi_puja,durga_puja}', true),
  (gen_random_uuid(), 'Agarbatti (Incense)', 'अगरबत्ती', 'incense', 'packet', 5000, false, '{ganesh_puja,lakshmi_puja,satyanarayan,vastu_puja}', true),
  (gen_random_uuid(), 'Silver Coin (Laxmi)', 'चांदी का सिक्का', 'metals', 'piece', 100000, false, '{lakshmi_puja,griha_pravesh}', true),
  (gen_random_uuid(), 'Red Cloth (Chunari)', 'लाल चुनरी', 'cloth', 'meter', 15000, false, '{vivah,navgrah_puja,durga_puja}', true),
  (gen_random_uuid(), 'Bananas', 'केले', 'fruits', 'dozen', 10000, true, '{satyanarayan,ganesh_puja}', true),
  (gen_random_uuid(), 'Coconut', 'नारियल', 'fruits', 'piece', 5000, false, '{griha_pravesh,ganesh_puja,lakshmi_puja}', true),
  (gen_random_uuid(), 'Mango Leaves', 'आम के पत्ते', 'herbs', 'bunch', 3000, true, '{griha_pravesh,satyanarayan}', true),
  (gen_random_uuid(), 'Sindoor', 'सिंदूर', 'other', 'box', 5000, false, '{vivah,navgrah_puja}', true),
  (gen_random_uuid(), 'Havan Samagri Mix', 'हवन सामग्री', 'other', 'packet', 25000, false, '{havan,griha_pravesh,vastu_puja}', true),
  (gen_random_uuid(), 'Turmeric (Haldi)', 'हल्दी', 'herbs', '100g', 3000, false, '{vivah,ganesh_puja,satyanarayan}', true)
ON CONFLICT DO NOTHING;
