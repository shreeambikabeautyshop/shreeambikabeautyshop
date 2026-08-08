-- ═══════════════════════════════════════════════════════════════
-- TARGETED PRICE FIXES — Products identified directly
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Streax Canvo Combo (300ml Shampoo + 250ml Conditioner)
-- Cost: Rs.303.80 + Rs.290 = Rs.593.80 | Sale: Rs.849 | Profit: Rs.192 (32%)
UPDATE products SET price=849, mrp=999, cost_price=593.80
WHERE id = 'eba37521-f40c-4124-b35c-f0ef3315e7cc';

-- Streax Canvoline Shampoo 300ml (standalone)
-- Cost: Rs.303.80 | Sale: Rs.449 | Profit: Rs.103 (34%)
UPDATE products SET price=449, mrp=490, cost_price=303.80
WHERE name ILIKE '%canvoline%shampoo%300%'
  AND id != 'eba37521-f40c-4124-b35c-f0ef3315e7cc';

-- Streax Canvolien Conditioner 240g (standalone)
-- Cost: Rs.290 | Sale: Rs.399 | Profit: Rs.68 (23%)
UPDATE products SET price=399, mrp=500, cost_price=290.00
WHERE name ILIKE '%canvolien%conditioner%';

-- Streax Canvo Shampoo 500ml
-- Cost: Rs.384.40 | Sale: Rs.549 | Profit: Rs.116 (30%)
UPDATE products SET price=549, mrp=620, cost_price=384.40
WHERE name ILIKE '%canvo%shampoo%500%';

-- Streax Canvo Shampoo 1500ml
-- Cost: Rs.868 | Sale: Rs.1149 | Profit: Rs.194 (22%)
UPDATE products SET price=1149, mrp=1400, cost_price=868.00
WHERE name ILIKE '%canvo%shampoo%1500%';

-- Streax Canvo Serum 100ml
-- Cost: Rs.252.30 | Sale: Rs.399 | Profit: Rs.109 (43%)
UPDATE products SET price=399, mrp=435, cost_price=252.30
WHERE name ILIKE '%canvo%serum%100%';

-- Cetaphil Moisturising Lotion 100ml
-- Cost: Rs.473.40 | Sale: Rs.699 | Profit: Rs.170 (36%)
UPDATE products SET price=699, mrp=789, cost_price=473.40
WHERE name ILIKE '%cetaphil%moisturising%lotion%100%';

-- Cetaphil Moisturising Lotion 250ml
-- Cost: Rs.779.40 | Sale: Rs.1099 | Profit: Rs.239 (31%)
UPDATE products SET price=1099, mrp=1299, cost_price=779.40
WHERE name ILIKE '%cetaphil%moisturising%lotion%250%';

-- Cetaphil Gentle Skin Cleanser 125ml
-- Cost: Rs.275.40 | Sale: Rs.399 | Profit: Rs.84 (30%)
UPDATE products SET price=399, mrp=459, cost_price=275.40
WHERE name ILIKE '%cetaphil%gentle%cleanser%125%';

-- Cetaphil Gentle Skin Cleanser 250ml
-- Cost: Rs.479.40 | Sale: Rs.699 | Profit: Rs.163 (34%)
UPDATE products SET price=699, mrp=799, cost_price=479.40
WHERE name ILIKE '%cetaphil%gentle%cleanser%250%';

-- Cetaphil Oily Skin Cleanser 125ml
-- Cost: Rs.449.40 | Sale: Rs.649 | Profit: Rs.146 (32%)
UPDATE products SET price=649, mrp=749, cost_price=449.40
WHERE name ILIKE '%cetaphil%oily%cleanser%125%';

-- Cetaphil Oily Skin Cleanser 250ml
-- Cost: Rs.689.40 | Sale: Rs.999 | Profit: Rs.236 (34%)
UPDATE products SET price=999, mrp=1149, cost_price=689.40
WHERE name ILIKE '%cetaphil%oily%cleanser%250%';

-- Cetaphil Moisturising Cream 80g
-- Cost: Rs.401.40 | Sale: Rs.599 | Profit: Rs.147 (37%)
UPDATE products SET price=599, mrp=669, cost_price=401.40
WHERE name ILIKE '%cetaphil%moisturising%cream%80%';

-- Cetaphil Baby Daily Lotion
-- Cost: Rs.599.40 | Sale: Rs.849 | Profit: Rs.184 (31%)
UPDATE products SET price=849, mrp=999, cost_price=599.40
WHERE name ILIKE '%cetaphil%baby%daily%lotion%';

-- Cetaphil Brightening Day Cream SPF15
-- Cost: Rs.779.40 | Sale: Rs.1099 | Profit: Rs.239 (31%)
UPDATE products SET price=1099, mrp=1299, cost_price=779.40
WHERE name ILIKE '%cetaphil%brightening%day%cream%';

-- Pilgrim Hair Growth Serum 50ml
-- Cost: Rs.547.25 | Sale: Rs.799 | Profit: Rs.190 (35%)
UPDATE products SET price=799, mrp=995, cost_price=547.25
WHERE name ILIKE '%pilgrim%hair%growth%serum%';

-- Pilgrim Rosemary Water 200ml
-- Cost: Rs.189.75 | Sale: Rs.299 | Profit: Rs.76 (40%)
UPDATE products SET price=299, mrp=345, cost_price=189.75
WHERE name ILIKE '%pilgrim%rosemary%water%200%';

-- Pilgrim Anti-Hairfall Serum 30ml
-- Cost: Rs.272.25 | Sale: Rs.399 | Profit: Rs.87 (32%)
UPDATE products SET price=399, mrp=495, cost_price=272.25
WHERE name ILIKE '%pilgrim%anti%hairfall%serum%30%'
   OR name ILIKE '%pilgrim%hairfall%serum%30%';

-- Pilgrim Oil Balance Gel Face Wash 100ml
-- Cost: Rs.137.50 | Sale: Rs.249 | Profit: Rs.82 (60%)
UPDATE products SET price=249, mrp=250, cost_price=137.50
WHERE name ILIKE '%pilgrim%oil%balance%face%wash%';

-- Pilgrim Hydra Glow Face Wash 100ml
-- Cost: Rs.134.75 | Sale: Rs.244 | Profit: Rs.80 (59%)
UPDATE products SET price=244, mrp=245, cost_price=134.75
WHERE name ILIKE '%pilgrim%hydra%glow%face%wash%';

-- Pilgrim 15% Vitamin C Serum 20ml
-- Cost: Rs.327.25 | Sale: Rs.499 | Profit: Rs.128 (39%)
UPDATE products SET price=499, mrp=595, cost_price=327.25
WHERE name ILIKE '%pilgrim%15%vitamin%c%serum%20%'
   OR name ILIKE '%pilgrim%vitamin%c%serum%20%';

-- Pilgrim Hairfall Control Shampoo
-- Cost: Rs.189.75 | Sale: Rs.299 | Profit: Rs.76 (40%)
UPDATE products SET price=299, mrp=345, cost_price=189.75
WHERE name ILIKE '%pilgrim%hairfall%control%shampoo%';

-- Pilgrim Damage Repair Shampoo
-- Cost: Rs.167.75 | Sale: Rs.249 | Profit: Rs.50 (30%)
UPDATE products SET price=249, mrp=305, cost_price=167.75
WHERE name ILIKE '%pilgrim%damage%repair%shampoo%';

-- Pilgrim Damage Repair Conditioner
-- Cost: Rs.217.25 | Sale: Rs.349 | Profit: Rs.96 (44%)
UPDATE products SET price=349, mrp=395, cost_price=217.25
WHERE name ILIKE '%pilgrim%damage%repair%conditioner%';

-- Pilgrim Smoothening Shampoo 200ml
-- Cost: Rs.189.75 | Sale: Rs.299 | Profit: Rs.76 (40%)
UPDATE products SET price=299, mrp=345, cost_price=189.75
WHERE name ILIKE '%pilgrim%smoothening%shampoo%';

-- Pilgrim Smoothening Conditioner 200ml
-- Cost: Rs.220 | Sale: Rs.349 | Profit: Rs.93 (42%)
UPDATE products SET price=349, mrp=400, cost_price=220.00
WHERE name ILIKE '%pilgrim%smoothening%conditioner%';

-- Pilgrim Youth Glow Moisturizer 50g
-- Cost: Rs.302.50 | Sale: Rs.449 | Profit: Rs.104 (34%)
UPDATE products SET price=449, mrp=550, cost_price=302.50
WHERE name ILIKE '%pilgrim%youth%glow%moisturizer%';

-- Pilgrim Hydra Glow Moisturizer 50g
-- Cost: Rs.151.25 | Sale: Rs.249 | Profit: Rs.68 (45%)
UPDATE products SET price=249, mrp=275, cost_price=151.25
WHERE name ILIKE '%pilgrim%hydra%glow%moisturizer%50%';

-- Pilgrim Hydra Glow Moisturizer 100g
-- Cost: Rs.217.25 | Sale: Rs.349 | Profit: Rs.96 (44%)
UPDATE products SET price=349, mrp=395, cost_price=217.25
WHERE name ILIKE '%pilgrim%hydra%glow%moisturizer%100%';

-- Pilgrim Kojic Acid Face Serum 30ml
-- Cost: Rs.272.25 | Sale: Rs.399 | Profit: Rs.87 (32%)
UPDATE products SET price=399, mrp=495, cost_price=272.25
WHERE name ILIKE '%pilgrim%kojic%acid%serum%30%';

-- Minimalist Retinol Eye Cream
-- Cost: Rs.329.34 | Sale: Rs.498 | Profit: Rs.124 (38%)
UPDATE products SET price=498, mrp=499, cost_price=329.34
WHERE name ILIKE '%minimalist%retinol%eye%cream%';

-- Minimalist Niacinamide 5% Serum 30ml
-- Cost: Rs.395.34 | Sale: Rs.598 | Profit: Rs.153 (39%)
UPDATE products SET price=598, mrp=599, cost_price=395.34
WHERE name ILIKE '%minimalist%niacinamide%5%serum%30%'
   OR (name ILIKE '%minimalist%niacinamide%' AND name ILIKE '%30%');

-- Minimalist Vitamin C 10% Serum
-- Cost: Rs.461.34 | Sale: Rs.649 | Profit: Rs.133 (29%)
UPDATE products SET price=649, mrp=699, cost_price=461.34
WHERE name ILIKE '%minimalist%vitamin%c%10%serum%';

-- Minimalist Salicylic Acid 2% Serum 30ml
-- Cost: Rs.362.34 | Sale: Rs.548 | Profit: Rs.139 (38%)
UPDATE products SET price=548, mrp=549, cost_price=362.34
WHERE name ILIKE '%minimalist%salicylic%acid%2%serum%30%';

-- Minimalist Sunscreen SPF60
-- Cost: Rs.395.34 | Sale: Rs.598 | Profit: Rs.153 (39%)
UPDATE products SET price=598, mrp=599, cost_price=395.34
WHERE name ILIKE '%minimalist%sunscreen%spf60%'
   OR name ILIKE '%minimalist%sunscreen%spf 60%';

-- Derma Co Oil Free Face Wash 100ml
-- Cost: Rs.151.25 | Sale: Rs.249 | Profit: Rs.68 (45%)
UPDATE products SET price=249, mrp=275, cost_price=151.25
WHERE name ILIKE '%derma%co%oil%free%face%wash%';

-- Derma Co Hyaluronic Aqua Gel SPF 50g
-- Cost: Rs.274.45 | Sale: Rs.399 | Profit: Rs.85 (31%)
UPDATE products SET price=399, mrp=499, cost_price=274.45
WHERE name ILIKE '%derma%co%hyaluronic%aqua%gel%spf%50%';

-- Foxtale Dewy SPF 70 50ml
-- Cost: Rs.272.25 | Sale: Rs.399 | Profit: Rs.87 (32%)
UPDATE products SET price=399, mrp=495, cost_price=272.25
WHERE name ILIKE '%foxtale%dewy%spf%70%50%';

-- Foxtale Mattifying SPF 70 50ml
-- Cost: Rs.272.25 | Sale: Rs.399 | Profit: Rs.87 (32%)
UPDATE products SET price=399, mrp=495, cost_price=272.25
WHERE name ILIKE '%foxtale%mattifying%spf%70%50%';

-- Foxtale Super Glow Moisturizer 50ml
-- Cost: Rs.272.25 | Sale: Rs.399 | Profit: Rs.87 (32%)
UPDATE products SET price=399, mrp=495, cost_price=272.25
WHERE name ILIKE '%foxtale%super%glow%moisturizer%';

-- Foxtale Oil Control SPF50 50g
-- Cost: Rs.219.45 | Sale: Rs.349 | Profit: Rs.94 (43%)
UPDATE products SET price=349, mrp=399, cost_price=219.45
WHERE name ILIKE '%foxtale%oil%control%spf%50%50%';

-- O3+ Bridal Vitamin C Kit
-- Cost: Rs.504.45 | Sale: Rs.749 | Profit: Rs.186 (37%)
UPDATE products SET price=749, mrp=885, cost_price=504.45
WHERE name ILIKE '%o3%bridal%vitamin%c%kit%';

-- O3+ Bridal Oxygenating Facial Kit
-- Cost: Rs.473.10 | Sale: Rs.699 | Profit: Rs.170 (36%)
UPDATE products SET price=699, mrp=830, cost_price=473.10
WHERE name ILIKE '%o3%bridal%oxygenating%facial%';

-- Berina Heat Protector 100ml
-- Cost: Rs.319.36 | Sale: Rs.449 | Profit: Rs.86 (27%)
UPDATE products SET price=449, mrp=499, cost_price=319.36
WHERE name ILIKE '%berina%heat%protector%100%';

-- Berina Heat Protector 230ml
-- Cost: Rs.543.36 | Sale: Rs.749 | Profit: Rs.144 (27%)
UPDATE products SET price=749, mrp=849, cost_price=543.36
WHERE name ILIKE '%berina%heat%protector%230%';

-- Berina Hair Spa Cream 500g
-- Cost: Rs.585.60 | Sale: Rs.799 | Profit: Rs.149 (25%)
UPDATE products SET price=799, mrp=915, cost_price=585.60
WHERE name ILIKE '%berina%hair%spa%cream%500%';

-- Berina Hair Mousse 300ml
-- Cost: Rs.306.56 | Sale: Rs.449 | Profit: Rs.100 (33%)
UPDATE products SET price=449, mrp=479, cost_price=306.56
WHERE name ILIKE '%berina%hair%mousse%300%';

-- Rica White Chocolate Wax 800ml
-- Cost: Rs.945 | Sale: Rs.1349 | Profit: Rs.310 (33%)
UPDATE products SET price=1349, mrp=1350, cost_price=945.00
WHERE name ILIKE '%rica%white%chocolate%wax%800%';

-- Rica Dark Chocolate Wax 800ml
-- Cost: Rs.1049.30 | Sale: Rs.1498 | Profit: Rs.347 (33%)
UPDATE products SET price=1498, mrp=1499, cost_price=1049.30
WHERE name ILIKE '%rica%dark%chocolate%wax%800%';

-- Rica Brazilian Wax 800ml
-- Cost: Rs.1085 | Sale: Rs.1549 | Profit: Rs.359 (33%)
UPDATE products SET price=1549, mrp=1550, cost_price=1085.00
WHERE name ILIKE '%rica%brazilian%wax%800%';

-- Raaga Pedi Manicure (all variants — same cost)
-- Cost: Rs.145 | Sale: Rs.249 | Profit: Rs.74 (51%)
UPDATE products SET price=249, mrp=250, cost_price=145.00
WHERE name ILIKE '%raaga%pedi%manicure%';

-- Plix Guava Combo 3 Pack
-- Cost: Rs.549.45 | Sale: Rs.799 | Profit: Rs.188 (34%)
UPDATE products SET price=799, mrp=999, cost_price=549.45
WHERE name ILIKE '%plix%guava%combo%3%pack%';

-- IK Hair Dryer Blaze
-- Cost: Rs.1681.50 | Sale: Rs.2199 | Profit: Rs.365 (22%)
UPDATE products SET price=2199, mrp=2950, cost_price=1681.50
WHERE name ILIKE '%ik%hair%dryer%blaze%';

-- IK Hair Dryer 2000
-- Cost: Rs.1710 | Sale: Rs.2249 | Profit: Rs.384 (22%)
UPDATE products SET price=2249, mrp=3000, cost_price=1710.00
WHERE name ILIKE '%ik%hair%dryer%2000%';

-- IK Hair Dryer Pro 2500
-- Cost: Rs.3990 | Sale: Rs.5149 | Profit: Rs.822 (21%)
UPDATE products SET price=5149, mrp=7000, cost_price=3990.00
WHERE name ILIKE '%ik%hair%dryer%pro%2500%';

-- IK Crimper
-- Cost: Rs.2280 | Sale: Rs.2949 | Profit: Rs.469 (21%)
UPDATE products SET price=2949, mrp=4000, cost_price=2280.00
WHERE name ILIKE '%ik%crimp%style%' OR name ILIKE '%ik%crimper%';

-- IK Pro Titanium Shine
-- Cost: Rs.4845 | Sale: Rs.6249 | Profit: Rs.998 (21%)
UPDATE products SET price=6249, mrp=8500, cost_price=4845.00
WHERE name ILIKE '%ik%pro%titanium%shine%';

-- IK 2in1 Straight and Curl Slim
-- Cost: Rs.1368 | Sale: Rs.1799 | Profit: Rs.304 (22%)
UPDATE products SET price=1799, mrp=2400, cost_price=1368.00
WHERE name ILIKE '%ik%2in1%straight%curl%slim%' OR name ILIKE '%ik%straight%curl%slim%';

-- IK Curling Tong CT16
-- Cost: Rs.2536.50 | Sale: Rs.3299 | Profit: Rs.542 (21%)
UPDATE products SET price=3299, mrp=4450, cost_price=2536.50
WHERE name ILIKE '%ik%curling%tong%ct16%' OR name ILIKE '%ik%curling%tong%16%';

-- IK Hair Straightener S3
-- Cost: Rs.2992.50 | Sale: Rs.3949 | Profit: Rs.699 (23%)
UPDATE products SET price=3949, mrp=5250, cost_price=2992.50
WHERE name ILIKE '%ik%hair%straightener%s3%' OR name ILIKE '%ik%straightener%s3%';

-- ═══════════════════════════════════════════════════════════════
-- VERIFY after running
-- ═══════════════════════════════════════════════════════════════
SELECT name, price, mrp, cost_price,
  ROUND((price - cost_price - (cost_price * 0.08) - 18) / cost_price * 100, 1) AS margin_pct,
  ROUND(price - cost_price - (cost_price * 0.08) - 18, 0) AS net_profit
FROM products
WHERE cost_price IS NOT NULL
ORDER BY name;
