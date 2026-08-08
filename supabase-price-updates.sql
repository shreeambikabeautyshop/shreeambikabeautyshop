-- ═══════════════════════════════════════════════════════════════
-- SHREE AMBIKA BEAUTY SHOP — PRICE UPDATES
-- Formula: Cost + 8% delivery + Rs.18 packaging + category margin
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- STEP 1: Add cost_price column (run once, safe to re-run)
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2);

-- STEP 2: Fix discount column type if needed
-- (skip if already NUMERIC — only run if you get a type error)
-- ALTER TABLE products ALTER COLUMN discount TYPE NUMERIC(5,1);

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: Price updates — 30 products matched from invoice
-- Cost:Rs.X → Sale:Rs.Y | Profit:Rs.Z (margin%) | Match confidence
-- ═══════════════════════════════════════════════════════════════

-- ABSOLUT REPAIR SHAMPOO 300ML — Cost:509 Sale:699 Profit:132 (25.8%) Match:67%
UPDATE products SET price=699, mrp=795, discount=12, cost_price=508.8
WHERE id = 'd78b1d25-954d-41bb-a5a0-dc656ea23417';

-- PILGRIM ANTI HAIRFALL SERUM 30ML — Cost:272 Sale:399 Profit:87 (31.9%) Match:62%
UPDATE products SET price=399, mrp=495, discount=19, cost_price=272.25
WHERE id = '0be592d2-c7ce-411a-acb2-ce8ed397ebb5';

-- ABSOLUT REPAIR MASK 250ML — Cost:639 Sale:849 Profit:140 (22.0%) Match:57%
UPDATE products SET price=849, mrp=999, discount=15, cost_price=639.36
WHERE id = '3e94af04-7de7-4067-bb85-bc6be258b235';

-- STREAX CANVO HAIR STRAIGHT INTENSE 80G — Cost:186 Sale:299 Profit:81 (43.4%) Match:50%
UPDATE products SET price=299, mrp=320, discount=7, cost_price=185.6
WHERE id = '864b1f9c-3d3e-4ad6-bbc6-523120477165';

-- STREAX GOLD SERUM 25ML — Cost:48 Sale:69 Profit:-0 (-0.9%) Match:50%
-- NOTE: Very low margin — consider not selling online (delivery cost kills profit)
UPDATE products SET price=69, mrp=70, discount=1, cost_price=47.6
WHERE id = '5104b999-d131-4907-b6c4-3acab0b59f0f';

-- METAL DX SHAMPOO 250ML — Cost:890 Sale:1199 Profit:220 (24.8%) Match:50%
UPDATE products SET price=1199, mrp=1390, discount=14, cost_price=889.6
WHERE id = 'fb350c1d-3734-46e4-b2d8-b485a3923616';

-- LISS UNLIMITED SERUM 125ML — Cost:768 Sale:1099 Profit:252 (32.8%) Match:50%
UPDATE products SET price=1099, mrp=1200, discount=8, cost_price=768.0
WHERE id = 'eedf368f-1313-4980-862f-25d1b079190d';

-- STREAX GLOSS SERUM 45ML — Cost:99 Sale:154 Profit:29 (29.1%) Match:50%
UPDATE products SET price=154, mrp=155, discount=1, cost_price=99.2
WHERE id = '425ef342-7e57-4d5b-a296-46c1ce72446b';

-- PLIX ROSEMARY ANTI HAIRFALL SHAMPOO 200ML — Cost:178 Sale:299 Profit:89 (50.3%) Match:50%
UPDATE products SET price=299, mrp=355, discount=16, cost_price=177.5
WHERE id = '8de6e3a3-b224-44fc-9ef6-e287e326bdfd';

-- PILGRIM HAIR GROWTH SERUM 50ML — Cost:547 Sale:799 Profit:190 (34.7%) Match:50%
UPDATE products SET price=799, mrp=995, discount=20, cost_price=547.25
WHERE id = 'bbe0ae37-5978-4f0e-a4c6-83cdaa561c48';

-- PILGRIM 2% KOJIC ACID FACE SERUM 30ML — Cost:272 Sale:399 Profit:87 (31.9%) Match:43%
UPDATE products SET price=399, mrp=495, discount=19, cost_price=272.25
WHERE id = '823c97a8-e502-48cb-8f41-5538da7df451';

-- IK 3 IN 1 EXPRESS STYLER — Cost:1910 Sale:2549 Profit:469 (24.5%) Match:40%
UPDATE products SET price=2549, mrp=3350, discount=24, cost_price=1909.5
WHERE id = '762673f2-5b45-478e-87c5-e538fe01a76c';

-- XTENSO CARE SULFATE FREE SHAMPOO 250ML — Cost:669 Sale:899 Profit:159 (23.7%) Match:40%
UPDATE products SET price=899, mrp=1045, discount=14, cost_price=668.8
WHERE id = 'cfff7e62-c892-4451-8331-3ce0359e2be7';

-- ABSOLUT REPAIR OIL 90ML — Cost:890 Sale:1199 Profit:220 (24.8%) Match:38%
UPDATE products SET price=1199, mrp=1390, discount=14, cost_price=889.6
WHERE id = '39925908-d6b4-4370-91ec-bb6dbedc55f0';

-- PILGRIM ROSEMARY WATER 200ML — Cost:190 Sale:299 Profit:76 (40.1%) Match:38%
UPDATE products SET price=299, mrp=345, discount=13, cost_price=189.75
WHERE id = '69d1d1b9-a731-4738-92f6-495410e27404';

-- PILGRIM OIL BALANCE GEL FACE WASH 100ML — Cost:138 Sale:249 Profit:82 (60.0%) Match:38%
UPDATE products SET price=249, mrp=250, discount=0, cost_price=137.5
WHERE id = 'b7858e40-470b-4cbe-a89f-88289b7c3074';

-- PILGRIM 15% VITAMIN C FACE SERUM 20ML — Cost:327 Sale:499 Profit:128 (39.0%) Match:38%
UPDATE products SET price=499, mrp=595, discount=16, cost_price=327.25
WHERE id = '4f941d56-8b17-4e12-b530-4e3cefb84866';

-- BIGEN HAIR COLOUR 102 40G — Cost:364 Sale:498 Profit:87 (23.8%) Match:33%
UPDATE products SET price=498, mrp=499, discount=0, cost_price=364.27
WHERE id = 'b2713055-8189-45a6-833d-835e9163b409';

-- PILGRIM HYDRA GLOW FACE WASH 100ML — Cost:135 Sale:244 Profit:80 (59.7%) Match:33%
UPDATE products SET price=244, mrp=245, discount=0, cost_price=134.75
WHERE id = '6774c19b-52ce-4d4e-a516-e4028b280279';

-- O3+ BRIDAL OXYGENATING FACIAL KIT — Cost:473 Sale:699 Profit:170 (35.9%) Match:33%
UPDATE products SET price=699, mrp=830, discount=16, cost_price=473.1
WHERE id = '25deebee-fe36-4a1f-bcb6-f0f89acd4032';

-- LISS UNLIMITED MASK 490G — Cost:1204 Sale:1599 Profit:280 (23.3%) Match:30%
UPDATE products SET price=1599, mrp=1650, discount=3, cost_price=1204.5
WHERE id = 'df2a4af5-e4d4-4b34-8663-d83bc2c9dd2e';

-- OSIS SPARKLER SPRAY 300ML — Cost:650 Sale:899 Profit:179 (27.5%) Match:30%
UPDATE products SET price=899, mrp=1250, discount=28, cost_price=650.0
WHERE id = '7c095e77-fae9-42c2-98db-7fc6b60d65d2';

-- CETAPHIL MOISTURISING LOTION 100ML — Cost:473 Sale:699 Profit:170 (35.9%) Match:29%
UPDATE products SET price=699, mrp=789, discount=11, cost_price=473.4
WHERE id = 'c7437a7a-0058-44e4-a979-b12cfc8b01dd';

-- MATRIX SOCOLOR 5.5 90GM — Cost:328 Sale:414 Profit:42 (12.8%) Match:29%
-- NOTE: Low margin — increase to 450 if possible
UPDATE products SET price=450, mrp=499, discount=10, cost_price=327.85
WHERE id = '73a60a03-bcf3-455f-88d1-57f22f934269';

-- BBLUNT COLOR 4.31 50GM — Cost:219 Sale:349 Profit:94 (42.8%) Match:29%
UPDATE products SET price=349, mrp=399, discount=13, cost_price=219.45
WHERE id = '9583a5ba-9165-44bf-946b-b1a18da9ebb1';

-- LUXLISS DAILY CARE CONDITIONER 200ML — Cost:648 Sale:899 Profit:182 (28.1%) Match:29%
UPDATE products SET price=899, mrp=1349, discount=33, cost_price=647.52
WHERE id = '72f6478c-6f49-4792-bfa9-02eb59525bae';

-- DERMA CO OIL FREE FACE WASH 100ML — Cost:151 Sale:249 Profit:68 (44.7%) Match:29%
UPDATE products SET price=249, mrp=275, discount=10, cost_price=151.25
WHERE id = '2952e9fc-7f92-4d4e-8f27-1d8f306d28d5';

-- DERMA CO HYALURONIC AQUA GEL SPF 50G — Cost:274 Sale:399 Profit:85 (30.8%) Match:29%
UPDATE products SET price=399, mrp=499, discount=20, cost_price=274.45
WHERE id = '52ea917b-a41a-43ab-b5da-3977c122a604';

-- BERINA HAIR SPA CREAM 500GM — Cost:586 Sale:799 Profit:149 (25.4%) Match:25%
UPDATE products SET price=799, mrp=915, discount=13, cost_price=585.6
WHERE id = 'c689bcc0-1e7f-47a8-bbdc-69786f6f41a6';

-- MINIMALIST RETINOL EYE CREAM — Cost:329 Sale:498 Profit:124 (37.7%) Match:25%
UPDATE products SET price=498, mrp=499, discount=0, cost_price=329.34
WHERE id = '8b2d4a4b-5789-44fd-8d0e-602e1df69908';

-- ═══════════════════════════════════════════════════════════════
-- VERIFY: Check updated products
-- ═══════════════════════════════════════════════════════════════
SELECT name, price, mrp, discount, cost_price,
       ROUND((price - cost_price - (cost_price * 0.08) - 18) / cost_price * 100, 1) AS margin_pct
FROM products
WHERE cost_price IS NOT NULL
ORDER BY margin_pct DESC;
