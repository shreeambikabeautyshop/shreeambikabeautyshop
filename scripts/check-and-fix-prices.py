"""
check-and-fix-prices.py
Directly patches all unmatched products from the invoice using Supabase REST API.
Generates targeted SQL for every product we can identify by name.
"""
import urllib.request, json, re, math

SUPA_URL = 'https://aukylplgvwreaovrfher.supabase.co'
SUPA_SVC = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a3lscGxndndyZWFvdnJmaGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA0NjY4MSwiZXhwIjoyMDk5NjIyNjgxfQ.NAb4TEn5_mKyL_zqtf3Z2oRxARLd34VMXokrVplWuBU'

def api_get(path):
    req = urllib.request.Request(
        f'{SUPA_URL}/rest/v1/{path}',
        headers={'apikey': SUPA_SVC, 'Authorization': f'Bearer {SUPA_SVC}'}
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def api_patch(product_id, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f'{SUPA_URL}/rest/v1/products?id=eq.{product_id}',
        data=data,
        headers={
            'apikey': SUPA_SVC,
            'Authorization': f'Bearer {SUPA_SVC}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        method='PATCH'
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def smart_price(cost, mrp, margin_pct=25, delivery_buf=8):
    delivery = cost * delivery_buf / 100
    packaging = 18
    profit = cost * margin_pct / 100
    raw = cost + delivery + packaging + profit
    rounded = math.ceil(raw / 50) * 50 - 1
    final = min(rounded, mrp - 1)
    final = max(final, int(cost * 1.2))
    return int(final)

def normalize(s):
    return re.sub(r'[^a-z0-9]', ' ', s.lower()).strip()

def match(inv_words_set, db_name):
    db_words = set(normalize(db_name).split()) - {'ml','gm','g','l','the','a','an','of','and','with','for','in'}
    if not db_words: return 0
    overlap = inv_words_set & db_words
    return len(overlap) / max(len(inv_words_set), len(db_words)) * 100

# Fetch all products
print("Fetching products from Supabase...")
products = api_get('products?select=id,name,price,mrp,cost_price&limit=500')
print(f"Total: {len(products)}, Without cost: {sum(1 for p in products if p['cost_price'] is None)}")

# All invoice items with cost prices
INVOICE = [
    # name_keywords, cost, mrp, category_margin
    (["streax","canvo","shampoo","conditioner","combo"], 593.80, 999, 22),  # THE SPECIFIC COMBO
    (["streax","canvo","shampoo","500"], 384.40, 620, 22),
    (["streax","canvo","shampoo","1500"], 868.00, 1400, 22),
    (["streax","canvoline","shampoo","300"], 303.80, 490, 22),
    (["streax","canvolien","conditioner","240"], 290.00, 500, 22),
    (["streax","canvo","serum","100"], 252.30, 435, 22),
    (["streax","canvo","hair","straight","intense"], 185.60, 320, 22),
    (["streax","gold","serum","25"], 47.60, 70, 22),
    (["streax","gold","serum","90"], 176.80, 260, 22),
    (["streax","gloss","serum","45"], 99.20, 155, 22),
    (["cetaphil","moisturising","lotion","100"], 473.40, 789, 28),
    (["cetaphil","moisturising","lotion","250"], 779.40, 1299, 28),
    (["cetaphil","gentle","cleanser","125"], 275.40, 459, 28),
    (["cetaphil","gentle","cleanser","250"], 479.40, 799, 28),
    (["cetaphil","oily","cleanser","125"], 449.40, 749, 28),
    (["cetaphil","oily","cleanser","250"], 689.40, 1149, 28),
    (["cetaphil","moisturising","cream","80"], 401.40, 669, 28),
    (["cetaphil","dam","lotion","100"], 459.00, 765, 28),
    (["cetaphil","dam","lotion","30"], 299.40, 499, 28),
    (["cetaphil","baby","daily","lotion"], 599.40, 999, 28),
    (["cetaphil","brightening","day","cream"], 779.40, 1299, 28),
    (["pilgrim","rosemary","water","200"], 189.75, 345, 28),
    (["pilgrim","hydra","glow","moisturizer","50"], 151.25, 275, 28),
    (["pilgrim","hydra","glow","moisturizer","100"], 217.25, 395, 28),
    (["pilgrim","youth","glow","moisturizer"], 302.50, 550, 28),
    (["pilgrim","hair","growth","serum","50"], 547.25, 995, 28),
    (["pilgrim","kojic","acid","serum","30"], 272.25, 495, 28),
    (["pilgrim","hydra","glow","face","wash"], 134.75, 245, 28),
    (["pilgrim","oil","balance","face","wash"], 137.50, 250, 28),
    (["pilgrim","hairfall","control","shampoo"], 189.75, 345, 22),
    (["pilgrim","damage","repair","shampoo"], 167.75, 305, 22),
    (["pilgrim","damage","repair","conditioner"], 217.25, 395, 22),
    (["pilgrim","smoothening","shampoo"], 189.75, 345, 22),
    (["pilgrim","smoothening","conditioner"], 220.00, 400, 22),
    (["pilgrim","vitamin","c","serum","20"], 327.25, 595, 28),
    (["pilgrim","anti","hairfall","serum","30"], 272.25, 495, 28),
    (["pilgrim","advance","glow","moisturiser"], 302.50, 550, 28),
    (["pilgrim","vitamin","c","moisturiser"], 189.75, 345, 28),
    (["pilgrim","gold","face","wash"], 217.25, 395, 28),
    (["minimalist","retinol","eye","cream"], 329.34, 499, 28),
    (["minimalist","niacinamide","5","serum","30"], 395.34, 599, 28),
    (["minimalist","vitamin","c","10","serum"], 461.34, 699, 28),
    (["minimalist","salicylic","acid","2","serum","30"], 362.34, 549, 28),
    (["minimalist","marula","oil","50"], 197.34, 299, 28),
    (["minimalist","b12","repair","moisturizer"], 263.34, 399, 28),
    (["minimalist","sunscreen","spf60"], 395.34, 599, 28),
    (["derma","co","kojic","acid","serum","10"], 164.45, 299, 28),
    (["derma","co","niacinamide","5","serum","30"], 274.45, 499, 28),
    (["derma","co","salicinamide","serum","30"], 329.45, 599, 28),
    (["derma","co","salicylic","acid","serum","30"], 274.45, 499, 28),
    (["derma","co","vitamin","c","moisturiser"], 191.95, 349, 28),
    (["derma","co","oil","free","face","wash"], 151.25, 275, 28),
    (["derma","co","hyaluronic","aqua","gel","spf","50"], 274.45, 499, 28),
    (["derma","co","hyaluronic","long","lasting","spf"], 356.95, 649, 28),
    (["foxtale","dewy","spf","70","50"], 272.25, 495, 28),
    (["foxtale","mattifying","spf","70","50"], 272.25, 495, 28),
    (["foxtale","super","glow","moisturizer"], 272.25, 495, 28),
    (["foxtale","pearfection","moisturizer"], 244.75, 445, 28),
    (["foxtale","oil","control","spf","50"], 219.45, 399, 28),
    (["foxtale","skin","radiance","mask"], 299.75, 545, 28),
    (["o3","bridal","vitamin","c","kit"], 504.45, 885, 30),
    (["o3","bridal","oxygenating","facial"], 473.10, 830, 30),
    (["o3","dtan","single","facial"], 422.50, 650, 30),
    (["o3","vitamin","single","facial"], 422.50, 650, 30),
    (["o3","gold","facial"], 422.50, 650, 30),
    (["o3","ageing","single","kit"], 422.50, 650, 30),
    (["o3","peel","white","chocolate","wax","165"], 240.50, 370, 30),
    (["o3","meladerm","vitamin","c","bleach"], 514.60, 830, 30),
    (["plix","guava","combo","3","pack"], 549.45, 999, 28),
    (["plix","jamun","acne","combo","2","pack"], 356.95, 649, 28),
    (["plix","pineapple","combo","2","pack"], 384.45, 699, 28),
    (["plix","pineapple","depigment","kit"], 659.45, 1199, 28),
    (["plix","acv","tablet","4","pack"], 660.00, 1200, 28),
    (["plix","guava","dewy","sunscreen"], 250.00, 500, 28),
    (["plix","jamun","acne","smoothie","moisturizer"], 237.50, 475, 28),
    (["plix","rosemary","anti","hairfall","shampoo"], 177.50, 355, 22),
    (["plix","jamun","marks","treatment","serum"], 287.50, 575, 28),
    (["plix","pineapple","dewy","serum","30"], 316.25, 575, 28),
    (["rica","white","chocolate","wax","800"], 945.00, 1350, 30),
    (["rica","dark","chocolate","wax","800"], 1049.30, 1499, 30),
    (["rica","brazilian","wax","800"], 1085.00, 1550, 30),
    (["rica","white","chocolate","refill","100"], 189.75, 345, 30),
    (["raaga","wax","white","chocolate","800"], 679.80, 1545, 30),
    (["raaga","pedi","manicure","chocolate","63"], 145.00, 250, 30),
    (["raaga","stemcells","platinum","61"], 348.00, 600, 30),
    (["raaga","d","tan","72"], 220.80, 480, 30),
    (["berina","heat","protector","100"], 319.36, 499, 22),
    (["berina","heat","protector","230"], 543.36, 849, 22),
    (["berina","hair","spa","cream","500"], 585.60, 915, 22),
    (["berina","hair","spa","cream","100"], 185.38, 299, 22),
    (["berina","hair","mousse","300"], 306.56, 479, 22),
    (["ik","hair","dryer","blaze"], 1681.50, 2950, 20),
    (["ik","3","1","express","styler"], 1909.50, 3350, 20),
    (["ik","hair","dryer","pro","2500"], 3990.00, 7000, 20),
    (["ik","hair","dryer","2000"], 1710.00, 3000, 20),
    (["ik","crimper","crimp","style"], 2280.00, 4000, 20),
    (["ik","pro","titanium","shine"], 4845.00, 8500, 20),
    (["ik","2in1","straight","curl","slim"], 1368.00, 2400, 20),
    (["ik","curling","tong","ct16"], 2536.50, 4450, 20),
    (["ik","curling","tong","ct22"], 2536.50, 4450, 20),
    (["ik","slim","titanium","crimper"], 3990.00, 7000, 20),
    (["ik","hair","straightener","s3"], 2992.50, 5250, 20),
    (["liss","unlimited","mask","490"], 1204.50, 1650, 22),
    (["liss","unlimited","mask","250"], 639.36, 999, 22),
    (["liss","unlimited","shampoo","1500"], 1715.50, 2350, 22),
    (["liss","unlimited","shampoo","300"], 508.80, 795, 22),
    (["liss","unlimited","serum","125"], 768.00, 1200, 22),
    (["absolut","repair","shampoo","1.5","1500"], 1788.50, 2450, 22),
    (["absolut","repair","shampoo","300"], 508.80, 795, 22),
    (["absolut","repair","mask","490"], 1204.50, 1650, 22),
    (["absolut","repair","mask","250"], 639.36, 999, 22),
    (["absolut","repair","oil","90"], 889.60, 1390, 22),
    (["xtenso","care","sulfate","shampoo","250"], 668.80, 1045, 22),
    (["xtenso","care","sulfate","mask","196"], 825.60, 1290, 22),
    (["xtenso","care","mask","490"], 1204.50, 1650, 22),
    (["xtenso","care","shampoo","1500"], 1788.50, 2450, 22),
    (["xtenso","care","serum","50"], 508.80, 795, 22),
    (["metal","dx","shampoo","250"], 889.60, 1390, 22),
    (["metal","dx","mask","250"], 1024.00, 1600, 22),
    (["curl","shampoo","300"], 844.80, 1320, 22),
    (["curl","hair","mask","250"], 1024.00, 1600, 22),
    (["inforcer","mask","250"], 639.36, 999, 22),
    (["inforcer","shampoo","300"], 508.80, 795, 22),
    (["scalp","advanced","mask","250"], 800.00, 1250, 22),
    (["scalp","advanced","shampoo","300"], 563.20, 880, 22),
    (["scalp","oil","shampoo","300"], 716.80, 1120, 22),
    (["floractive","shampoo","300"], 936.00, 1800, 22),
    (["floractive","conditioner","300"], 936.00, 1800, 22),
    (["floractive","treatment","120"], 1980.00, 3600, 22),
    (["vitamino","color","shampoo","300"], 508.80, 795, 22),
    (["vitamino","color","masque","250"], 633.60, 990, 22),
    (["vitamino","spectrum","mask","250"], 1056.00, 1650, 22),
    (["vitamino","spectrum","shampoo","300"], 889.60, 1390, 22),
    (["density","shampoo","300"], 448.00, 700, 22),
    (["silver","shampoo","300"], 508.80, 795, 22),
    (["luxliss","daily","shampoo","250"], 647.52, 1349, 22),
    (["luxliss","daily","conditioner","200"], 647.52, 1349, 22),
    (["bio","smooth","shampoo","1000"], 948.00, 1200, 22),
    (["bio","colorlast","shampoo","1000"], 948.00, 1200, 22),
    (["opti","care","shampoo","1000"], 1086.25, 1375, 22),
    (["opti","care","conditioner","980"], 1264.00, 1600, 22),
    (["osis","sparkler","spray","300"], 650.00, 1250, 22),
    (["osis","bounty","balm","150"], 806.00, 1300, 22),
    (["bc","hair","spa","enrich","500"], 409.20, 660, 22),
    (["wp","blondor","multi","power","400"], 797.50, 1450, 22),
    (["wp","fusion","shampoo","250"], 553.80, 1065, 22),
    (["wp","fusion","mask","150"], 702.00, 1350, 22),
    (["wp","elements","mask","150"], 728.00, 1400, 22),
    (["wp","element","shampoo","250"], 577.20, 1110, 22),
    (["wp","invigo","enrich","mask","150"], 468.00, 900, 22),
    (["bblunt","color","4.31","50"], 219.45, 399, 28),
    (["matrix","socolor","5.5","90"], 327.85, 415, 28),
    (["matrix","socolor","5.0","90"], 327.85, 415, 28),
    (["matrix","socolor","4.0","90"], 327.85, 415, 28),
    (["bigen","hair","colour","102"], 364.27, 499, 28),
    (["dk","cica","calming","sunscreen"], 327.25, 595, 28),
    (["dk","watermelon","sunscreen"], 327.25, 595, 28),
    (["dk","vitamin","c","sunscreen","spf50"], 327.25, 595, 28),
    (["dk","blueberry","sunscreen"], 327.25, 595, 28),
    (["dk","vitamin","c","super","serum"], 382.25, 695, 28),
    (["dk","tinted","sunscreen","spf50"], 301.95, 549, 28),
    (["fyc","korean","glass","bleach"], 259.48, 499, 28),
    (["fyc","vitamin","c","bleach"], 259.48, 499, 28),
    (["fyc","hydraboost","bleach"], 259.48, 499, 28),
]

noise = {'ml','gm','g','l','the','a','an','of','and','with','for','in','combo','kit','pack','care','professional','line','salon'}

updates = []
used_db_ids = set()

for (keywords, cost, inv_mrp, margin) in INVOICE:
    kw_set = set(keywords) - noise
    best_score = 0
    best_p = None
    for p in products:
        if p['id'] in used_db_ids:
            continue
        score = match(kw_set, p['name'])
        if score > best_score:
            best_score = score
            best_p = p
    if best_score >= 30 and best_p:
        used_db_ids.add(best_p['id'])
        new_price = smart_price(cost, inv_mrp, margin)
        # Use DB mrp if it looks right, else use invoice mrp
        use_mrp = best_p['mrp'] if abs(best_p['mrp'] - inv_mrp) < inv_mrp * 0.3 else inv_mrp
        updates.append({
            'id': best_p['id'],
            'name': best_p['name'],
            'old_price': best_p['price'],
            'new_price': new_price,
            'mrp': int(use_mrp),
            'cost': cost,
            'margin': margin,
            'score': best_score
        })

print(f"\nMatched {len(updates)} products to update\n")

# Write SQL
sql = ["-- Auto-generated targeted price updates",
       "-- All products identified from invoice\n"]
total_profit = 0
for u in sorted(updates, key=lambda x: -x['score']):
    profit = u['new_price'] - u['cost'] - u['cost']*0.08 - 18
    total_profit += profit
    change = "UP" if u['new_price'] > u['old_price'] else "DOWN"
    sql.append(f"-- {u['name'][:55]}")
    sql.append(f"-- Cost:{u['cost']:.0f} Sale:{u['new_price']} (was {u['old_price']:.0f}) Profit:{profit:.0f} Match:{u['score']:.0f}% {change}")
    sql.append(f"UPDATE products SET price={u['new_price']}, mrp={u['mrp']}, cost_price={u['cost']}")
    sql.append(f"WHERE id = '{u['id']}';\n")

sql.append(f"-- Total: {len(updates)} products, Est. profit/sell-through: Rs.{total_profit:.0f}")

with open('supabase-price-updates-v2.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql))

print(f"Written to supabase-price-updates-v2.sql")
print(f"Est. profit per sell-through: Rs.{total_profit:.0f}")
print()
print("KEY CHANGES:")
for u in sorted(updates, key=lambda x: abs(x['new_price'] - x['old_price']), reverse=True)[:20]:
    arrow = "↑" if u['new_price'] > u['old_price'] else "↓"
    diff = abs(int(u['new_price']) - int(u['old_price']))
    print(f"  {arrow} Rs.{diff:4d} | {u['name'][:50]:<50} | Rs.{u['old_price']:.0f} -> Rs.{u['new_price']}")
