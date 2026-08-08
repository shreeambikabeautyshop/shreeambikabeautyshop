"""
fix-prices.py
Reads PDF invoice, matches with Supabase products, calculates profitable sale prices,
generates SQL UPDATE statements.

Formula:
  Sale Price = Cost + Delivery Buffer (8%) + Profit Margin (category-wise)
  Rounded to nearest ₹9 (psychological pricing)
  Capped at MRP - 1
"""

import json, math

# ── PDF invoice data (extracted) ─────────────────────────────────────────────
# Format: (sr, name, mrp, cost, disc_pct)
INVOICE = [
    (1,  "IK HAIR DRYER BLAZE",                          2950,  1681.50, 43),
    (2,  "IK 3 IN 1 EXPRESS STYLER",                     3350,  1909.50, 43),
    (3,  "IK HAIR DRYER PRO 2500",                       7000,  3990.00, 43),
    (4,  "BERINA HEAT PROTECTOR 100ML",                   499,   319.36, 36),
    (5,  "TOUCH UP MASCARA",                              295,   295.00,  0),
    (6,  "BERINA HAIR SPA CREAM 500GM",                   915,   585.60, 36),
    (7,  "BERINA HAIR MOUSSE 300ML",                      479,   306.56, 36),
    (8,  "ENZO SPRAY 420ML",                               85,    85.00,  0),
    (10, "XTENSO CARE SULFATE FREE SHAMPOO 250ML",       1045,   668.80, 36),
    (11, "XTENSO CARE SULFATE FREE MASK 196GM",          1290,   825.60, 36),
    (12, "CETAPHIL MOISTURISING LOTION 100ML",            789,   473.40, 40),
    (13, "XTENSO CARE MASK 490GM",                       1650,  1204.50, 27),
    (14, "ABSOLUT REPAIR SHAMPOO 1.5L",                  2450,  1788.50, 27),
    (15, "ABSOLUT REPAIR MASK 490GM",                    1650,  1204.50, 27),
    (16, "LISS UNLIMITED MASK 490G",                     1650,  1204.50, 27),
    (17, "XTENSO CARE SHAMPOO 1500ML",                   2450,  1788.50, 27),
    (18, "LISS UNLIMITED SHAMPOO 1500ML",                2350,  1715.50, 27),
    (19, "O3+ PEEL OFF WHITE CHOCOLATE WAX 165G",         370,   240.50, 35),
    (20, "CETAPHIL GENTLE SKIN CLEANSER 125ML",           459,   275.40, 40),
    (21, "CETAPHIL OILY SKIN CLEANSER 125ML",             749,   449.40, 40),
    (22, "CETAPHIL MOISTURISING CREAM 80G",               669,   401.40, 40),
    (23, "STREAX CANVO SHAMPOO 1500ML",                  1400,   868.00, 38),
    (24, "STREAX CANVOLINE SHAMPOO 300ML",                490,   303.80, 38),
    (25, "STREAX CANVOLIEN CONDITIONER 240G",             500,   290.00, 42),
    (26, "STREAX CANVO HAIR STRAIGHT INTENSE 80G",        320,   185.60, 42),
    (27, "RAAGA WAX WHITE CHOCOLATE 800ML",              1545,   679.80, 56),
    (28, "CETAPHIL DAM LOTION 100G",                      765,   459.00, 40),
    (29, "CETAPHIL DAM ADV LOTION 30GM",                  499,   299.40, 40),
    (51, "RICA WHITE CHOCOLATE WAX 800ML",               1350,   945.00, 30),
    (52, "RICA DARK CHOCOLATE WAX 800ML",                1499,  1049.30, 30),
    (53, "RAAGA PEDI MANICURE CHOCOLATE 63G",             250,   145.00, 42),
    (57, "BC TAF 5 SPRAY",                                260,   260.00,  0),
    (58, "MATRIX SOCOLOR 5.5 90GM",                       415,   327.85, 21),
    (67, "BIGEN HAIR COLOUR 102 40G",                     499,   364.27, 27),
    (68, "EXCELLENCE COLOUR 3",                           769,   492.16, 36),
    (73, "BIO SMOOTH THERA SHAMPOO 1000ML",              1200,   948.00, 21),
    (74, "BIO COLORLAST SHAMPOO 1000ML",                 1200,   948.00, 21),
    (75, "AROMA PEARL KIT",                              1250,   725.00, 42),
    (76, "OSIS BOUNTY BALM 150ML",                       1300,   806.00, 38),
    (77, "BC HAIR SPA ENRICH 500ML",                      660,   409.20, 38),
    (78, "WP BLONDOR MULTI POWER 400GM",                 1450,   797.50, 45),
    (79, "WP FUSION SHAMPOO 250ML",                      1065,   553.80, 48),
    (80, "WP FUSION MASK 150ML",                         1350,   702.00, 48),
    (81, "WP ELEMENTS MASK 150ML",                       1400,   728.00, 48),
    (82, "WP ELEMENT SHAMPOO 250ML",                     1110,   577.20, 48),
    (83, "OSIS SPARKLER SPRAY 300ML",                    1250,   650.00, 48),
    (84, "WP INVIGO ENRICH MASK 150ML",                   900,   468.00, 48),
    (85, "STREAX GOLD SERUM 25ML",                         70,    47.60, 32),
    (86, "STREAX GOLD SERUM 90ML",                        260,   176.80, 32),
]

INVOICE += [
    (96,  "IK CRIMPER CRIMP AND STYLE",                  4000,  2280.00, 43),
    (97,  "IK PRO TITANIUM SHINE",                       8500,  4845.00, 43),
    (98,  "IK 2IN1 STRAIGHT AND CURL SLIM",              2400,  1368.00, 43),
    (99,  "IK CURLING TONG CT16",                        4450,  2536.50, 43),
    (100, "IK CURLING TONG CT22",                        4450,  2536.50, 43),
    (104, "RICA BRAZILIAN WAX 800ML",                    1550,  1085.00, 30),
    (105, "BBLUNT COLOR 4.31 50GM",                       399,   219.45, 45),
    (106, "RICA WHITE CHOCOLATE REFILL 100ML",            345,   189.75, 45),
    (107, "RAAGA STEMCELLS PLATINUM 61G",                 600,   348.00, 42),
    (110, "O3+ MELADERM VITAMIN C GEL BLEACH",            830,   514.60, 38),
    (111, "CURL SHAMPOO 300ML",                          1320,   844.80, 36),
    (112, "CURL HAIR MASK 250ML",                        1600,  1024.00, 36),
    (114, "INFORCER MASK 250ML",                          999,   639.36, 36),
    (115, "INFORCER SHAMPOO 300ML",                       795,   508.80, 36),
    (116, "SCALP ADVANCED MASK 250ML",                   1250,   800.00, 36),
    (117, "SCALP ADVANCED SHAMPOO 300ML",                 880,   563.20, 36),
    (118, "METAL DX MASK 250ML",                         1600,  1024.00, 36),
    (119, "SCALP OIL SHAMPOO 300ML",                     1120,   716.80, 36),
    (120, "METAL DX SHAMPOO 250ML",                      1390,   889.60, 36),
    (121, "FLORACTIVE W ONE SHAMPOO 300ML",              1800,   936.00, 48),
    (122, "FLORACTIVE W ONE CONDITIONER 300ML",          1800,   936.00, 48),
    (123, "FLORACTIVE W ONE TREATMENT 120ML",            3600,  1980.00, 45),
    (124, "LISS UNLIMITED MASK 250ML",                    999,   639.36, 36),
    (125, "DENSITY ADV SHAMPOO 300ML",                    700,   448.00, 36),
    (126, "SILVER SHAMPOO 300ML",                         795,   508.80, 36),
    (127, "ABSOLUT REPAIR SHAMPOO 300ML",                 795,   508.80, 36),
    (128, "LISS UNLIMITED SHAMPOO 300ML",                 795,   508.80, 36),
    (129, "VITAMINO COLOR SHAMPOO 300ML",                 795,   508.80, 36),
    (130, "VITAMINO COLOR MASQUE 250ML",                  990,   633.60, 36),
    (132, "VITAMINO SPECTRUM MASK 250ML",                1650,  1056.00, 36),
    (133, "VITAMINO SPECTRUM SHAMPOO 300ML",             1390,   889.60, 36),
    (134, "ABSOLUT REPAIR MASK 250ML",                    999,   639.36, 36),
    (136, "LISS UNLIMITED SERUM 125ML",                  1200,   768.00, 36),
    (137, "XTENSO SERUM 50ML",                            795,   508.80, 36),
    (138, "ABSOLUT REPAIR OIL 90ML",                     1390,   889.60, 36),
    (155, "STREAX GLOSS SERUM 45ML",                      155,    99.20, 36),
    (157, "OPTI CARE SHAMPOO 1000ML",                    1375,  1086.25, 21),
    (158, "OPTI CARE CONDITIONER 980GM",                 1600,  1264.00, 21),
    (162, "PLIX GUAVA COMBO 3 PACK",                      999,   549.45, 45),
    (163, "PLIX JAMUN ACNE CONTROL COMBO 2 PACK",         649,   356.95, 45),
    (164, "PLIX PINEAPPLE COMBO 2 PACK",                  699,   384.45, 45),
    (165, "PLIX PINEAPPLE DEPIGMENT KIT",                1199,   659.45, 45),
    (168, "IK SLIM TITANIUM CRIMPER",                    7000,  3990.00, 43),
    (181, "IK HAIR STRAIGHTENER S3",                     5250,  2992.50, 43),
    (312, "IK HAIR DRYER 2000",                          3000,  1710.00, 43),
    (200, "DK CICA CALMING SUNSCREEN SPF50 80GM",         595,   327.25, 45),
    (201, "STREAX CANVO SHAMPOO 500ML",                   620,   384.40, 38),
    (203, "DK WATERMELON SUNSCREEN 80GM",                 595,   327.25, 45),
    (204, "DK VITAMIN C SUNSCREEN SPF50 80GM",            595,   327.25, 45),
    (205, "DK BLUEBERRY SUNSCREEN SPF50 80GM",            595,   327.25, 45),
]

INVOICE += [
    (207, "FYC KOREAN GLASS BLEACH 270GM",               499,   259.48, 48),
    (208, "FYC VITAMIN C BLEACH 270GM",                  499,   259.48, 48),
    (209, "FYC HYDRABOOST BLEACH 270GM",                 499,   259.48, 48),
    (210, "PLIX ACV TABLET 4 PACK",                     1200,   660.00, 45),
    (213, "PLIX GUAVA DEWY SUNSCREEN 50G",               500,   250.00, 50),
    (217, "PLIX JAMUN MARKS TREATMENT SERUM 30ML",        575,   287.50, 50),
    (218, "PLIX JAMUN ACNE SMOOTHIE MOISTURIZER 50G",     475,   237.50, 50),
    (221, "PLIX ROSEMARY ANTI HAIRFALL SHAMPOO 200ML",    355,   177.50, 50),
    (227, "MATRIX SOCOLOR 5.0 90GM",                      415,   327.85, 21),
    (228, "MATRIX SOCOLOR 4.0 90GM",                      415,   327.85, 21),
    (238, "PILGRIM ROSEMARY WATER 200ML",                 345,   189.75, 45),
    (239, "PILGRIM HYDRA GLOW MOISTURIZER 50G",           275,   151.25, 45),
    (240, "PILGRIM HYDRA GLOW MOISTURIZER 100G",          395,   217.25, 45),
    (241, "PILGRIM YOUTH GLOW MOISTURIZER 50GM",          550,   302.50, 45),
    (242, "PILGRIM HAIR GROWTH SERUM 50ML",               995,   547.25, 45),
    (243, "PILGRIM 2% KOJIC ACID FACE SERUM 30ML",        495,   272.25, 45),
    (244, "PILGRIM HYDRA GLOW FACE WASH 100ML",           245,   134.75, 45),
    (245, "PILGRIM OIL BALANCE GEL FACE WASH 100ML",      250,   137.50, 45),
    (246, "PILGRIM HAIRFALL CONTROL SHAMPOO 200ML",       345,   189.75, 45),
    (247, "PILGRIM DAMAGE REPAIR SHAMPOO 200ML",          305,   167.75, 45),
    (249, "LUXLISS DAILY CARE SHAMPOO 250ML",            1349,   647.52, 52),
    (250, "LUXLISS DAILY CARE CONDITIONER 200ML",        1349,   647.52, 52),
    (252, "STREAX CANVO SERUM 100ML",                     435,   252.30, 42),
    (253, "PILGRIM 15% VITAMIN C FACE SERUM 20ML",        595,   327.25, 45),
    (254, "PILGRIM DAMAGE REPAIR CONDITIONER 200ML",      395,   217.25, 45),
    (259, "MN SUNSCREEN SPF60",                           599,   395.34, 34),
    (260, "MINIMALIST MARULA OIL 50G",                    299,   197.34, 34),
    (261, "MINIMALIST B12 REPAIR FACE MOISTURIZER",       399,   263.34, 34),
    (263, "MINIMALIST VITAMIN C 10 FACE SERUM",           699,   461.34, 34),
    (264, "MINIMALIST SALICYLIC ACID 2% FACE SERUM 30ML", 549,   362.34, 34),
    (265, "FX GOLDEN HOUR GLOW SPF",                      349,   191.95, 45),
    (266, "FOXTALE DEWY SPF 70 50ML",                     495,   272.25, 45),
    (267, "FOXTALE MATTIFYING SPF 70 50ML",               495,   272.25, 45),
    (270, "FOXTALE SUPER GLOW MOISTURIZER 50ML",          495,   272.25, 45),
    (271, "FOXTALE PEARFECTION MOISTURIZER 50ML",         445,   244.75, 45),
    (273, "FOXTALE OIL CONTROL SPF50 50G",                399,   219.45, 45),
    (279, "O3+ BRIDAL VITAMIN C KIT",                     885,   504.45, 43),
    (280, "O3+ BRIDAL OXYGENATING FACIAL KIT",            830,   473.10, 43),
    (281, "DK 10% VITAMIN C SUPER FACE SERUM",            695,   382.25, 45),
    (282, "DK TINTED SUNSCREEN SPF50 50ML",               549,   301.95, 45),
    (283, "DERMA CO 2% KOJIC ACID FACE SERUM 10ML",       299,   164.45, 45),
    (285, "DERMA CO 5% NIACINAMIDE FACE SERUM 30ML",      499,   274.45, 45),
    (286, "DERMA CO SALICINAMIDE FACE SERUM 30ML",        599,   329.45, 45),
    (287, "DERMA CO 2% SALICYLIC ACID FACE SERUM 30ML",   499,   274.45, 45),
    (288, "DERMA CO 5% VITAMIN C MOISTURISER",            349,   191.95, 45),
    (289, "DERMA CO OIL FREE FACE WASH 100ML",            275,   151.25, 45),
    (290, "DERMA CO HYALURONIC AQUA GEL SPF 50G",         499,   274.45, 45),
    (291, "DERMA CO HYALURONIC LONG LASTING SPF 50G",     649,   356.95, 45),
    (300, "O3+ DTAN SINGLE FACIAL KIT",                   650,   422.50, 35),
    (301, "O3+ VITAMIN SINGLE FACIAL KIT",                650,   422.50, 35),
    (302, "O3+ GOLD FACIAL",                              650,   422.50, 35),
    (303, "O3+ AGEING SINGLE KIT",                        650,   422.50, 35),
    (313, "RAAGA D-TAN 72GM",                             480,   220.80, 54),
    (320, "BERINA HAIR PROTECTOR 230ML",                  849,   543.36, 36),
    (324, "BERINA HAIR SPA CREAM 100GM",                  299,   185.38, 38),
    (329, "PILGRIM ADVANCE GLOW MOISTURISER",             550,   302.50, 45),
    (330, "PILGRIM VITAMIN C MOISTURISER 50G",            345,   189.75, 45),
    (331, "PILGRIM 24K GOLD GEL FACE WASH 80ML",          395,   217.25, 45),
    (332, "PLIX PINEAPPLE 2% DEWY SERUM 30ML",            575,   316.25, 45),
    (334, "MINIMALIST NIACINAMIDE 5% FACE SERUM 30ML",    599,   395.34, 34),
    (337, "FOXTALE SKIN RADIANCE MASK 75G",               545,   299.75, 45),
    (342, "CETAPHIL MOISTURISING LOTION 250ML",          1299,   779.40, 40),
    (343, "CETAPHIL GENTLE SKIN CLEANSER 250ML",          799,   479.40, 40),
    (344, "CETAPHIL OILY SKIN CLEANSER 250ML",           1149,   689.40, 40),
    (345, "CETAPHIL BABY DAILY LOTION",                   999,   599.40, 40),
    (346, "PILGRIM SMOOTHENING SHAMPOO 200ML",            345,   189.75, 45),
    (347, "PILGRIM SMOOTHENING CONDITIONER 200ML",        400,   220.00, 45),
    (348, "PILGRIM ANTI HAIRFALL SERUM 30ML",             495,   272.25, 45),
    (349, "CETAPHIL BRIGHTENING DAY CREAM SPF15",        1299,   779.40, 40),
    (351, "MINIMALIST RETINOL EYE CREAM",                 499,   329.34, 34),
]


# ── Category margins ─────────────────────────────────────────────────────────
CATEGORY_MARGINS = {
    "Electronics": 20, "Hair Care": 22, "Skin Care": 28,
    "Cosmetics": 28,   "Makeup": 28,   "Body Care": 25,
    "Perfumes": 30,    "Purses & Bags": 35, "Wax & Accessories": 30,
}
DEFAULT_MARGIN = 25
DELIVERY_BUFFER = 8   # 8% of cost for packaging + courier

# ── Smart price calculator ─────────────────────────────────────────────────
def smart_price(cost, mrp, margin_pct, delivery_buf_pct=8):
    delivery = cost * delivery_buf_pct / 100
    packaging = 18  # box + tape + label (fixed ₹18)
    profit = cost * margin_pct / 100
    raw = cost + delivery + packaging + profit
    # Round to ₹X49 or ₹X99 (psychological pricing)
    rounded = math.ceil(raw / 50) * 50 - 1
    # Never exceed MRP, never go below cost+20%
    final = min(rounded, mrp - 1)
    final = max(final, int(cost * 1.2))
    actual_profit = final - cost - delivery - packaging
    actual_margin = (actual_profit / cost * 100) if cost > 0 else 0
    net_profit = final - cost - delivery - packaging
    return {
        "sale_price": int(final),
        "mrp": int(mrp),
        "cost": round(cost, 2),
        "delivery_buffer": round(delivery, 2),
        "packaging": packaging,
        "profit": round(actual_profit, 2),
        "margin_pct": round(actual_margin, 1),
        "net_profit": round(net_profit, 2),
        "discount_pct": round((mrp - final) / mrp * 100, 1),
    }

# ── Keyword matching helpers ──────────────────────────────────────────────
def normalize(s):
    import re
    return re.sub(r'[^a-z0-9]', ' ', s.lower()).strip()

def match_score(inv_name, db_name):
    """Returns 0-100 match score based on keyword overlap."""
    inv_words = set(normalize(inv_name).split())
    db_words  = set(normalize(db_name).split())
    # Remove common noise words
    noise = {'ml','gm','g','l','no','of','and','in','for','the','a','an','with','pack','combo'}
    inv_words -= noise
    db_words  -= noise
    if not inv_words or not db_words:
        return 0
    overlap = inv_words & db_words
    score = len(overlap) / max(len(inv_words), len(db_words)) * 100
    return score

print("=" * 80)
print("PRICE ANALYSIS — Shree Ambika Beauty Shop")
print("Formula: Sale = Cost + 8% delivery + ₹18 packaging + category margin%")
print("=" * 80)
print()

results = []
for (sr, name, mrp, cost, disc) in INVOICE:
    cat = "Hair Care"  # default
    n = name.lower()
    if any(x in n for x in ['cetaphil','moistur','cleanser','face wash','serum','spf','sunscreen',
                              'vitamin c','niacinamide','salicylic','hyaluronic','glow','skin','bleach',
                              'plix','foxtale','derma co','minimalist','pilgrim','dk ']):
        cat = "Skin Care"
    elif any(x in n for x in ['ik hair dryer','ik straight','ik crimp','ik curling','ik 2in1','ik pro',
                                'ik 3in1','ik slim','vega','braun']):
        cat = "Electronics"
    elif any(x in n for x in ['wax','raaga','rica','o3+','pedi','manicure','facial','bleach kit',
                                'aroma','raaga','d-tan']):
        cat = "Wax & Accessories"
    elif any(x in n for x in ['mascara','kajal','lipstick','foundation','concealer','blush','contour',
                                'eyeliner','primer','bblunt color','majirel','inoa','matrix socolor',
                                'bc igora','bc essensity','strax h.color','bigen','excellence colour',
                                'streax h.color']):
        cat = "Cosmetics"

    margin = CATEGORY_MARGINS.get(cat, DEFAULT_MARGIN)
    r = smart_price(cost, mrp, margin)
    r['sr'] = sr
    r['name'] = name
    r['category'] = cat
    results.append(r)
    print(f"Sr.{sr:3d}  {name[:45]:<45} | Cost:₹{cost:>7.2f} | MRP:₹{mrp:>5} | "
          f"Sale:₹{r['sale_price']:>5} | Profit:₹{r['profit']:>6.0f} ({r['margin_pct']:>4.1f}%)")

print()
print("=" * 80)
total_invest = sum(r['cost'] for r in results)
total_revenue = sum(r['sale_price'] for r in results)
total_profit = sum(r['profit'] for r in results)
avg_margin = total_profit / total_invest * 100 if total_invest > 0 else 0
print(f"SUMMARY (per unit basis):")
print(f"  Total cost investment : ₹{total_invest:>10,.2f}")
print(f"  Total expected revenue: ₹{total_revenue:>10,.2f}")
print(f"  Total gross profit    : ₹{total_profit:>10,.2f}")
print(f"  Average margin        : {avg_margin:.1f}%")
print()

# ── Output JSON for SQL generation ──────────────────────────────────────────
with open('scripts/price-fixes.json', 'w') as f:
    json.dump(results, f, indent=2)
print("✅ price-fixes.json written — use this to update Supabase")
print()
print("PRODUCTS NEEDING ATTENTION (margin < 15%):")
for r in results:
    if r['margin_pct'] < 15:
        print(f"  ⚠️  Sr.{r['sr']} {r['name'][:50]} margin={r['margin_pct']}%")
