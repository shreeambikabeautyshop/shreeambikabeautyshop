import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Auto-create sabs_orders table if it doesn't exist
async function ensureTable() {
  const supabase = getAdmin();
  const { error } = await supabase.from("sabs_orders").select("id").limit(1);
  if (!error) return; // table exists

  // Table missing — create it via Supabase SQL API
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const sql = `
    create table if not exists public.sabs_orders (
      id                  uuid default gen_random_uuid() primary key,
      sabs_order_id       text not null,
      shiprocket_order_id text,
      shipment_id         text,
      awb                 text,
      courier_name        text,
      estimated_delivery  text,
      customer_name       text not null,
      customer_phone      text,
      product_name        text,
      product_price       numeric,
      delivery_address    text,
      delivery_pincode    text,
      delivery_city       text,
      delivery_state      text,
      status              text default 'new',
      source              text default 'whatsapp',
      manifest_url        text,
      label_url           text,
      created_at          timestamptz default now(),
      updated_at          timestamptz
    );
    grant all on public.sabs_orders to service_role;
  `;

  // Try Supabase pg-meta SQL endpoint
  await fetch(`${url}/pg/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${svcKey}`,
      "apikey": svcKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }).catch(() => {});
}

// ── Get Shiprocket auth token ─────────────────────────────────────────────────
async function getShiprocketToken(): Promise<string> {
  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error("Shiprocket credentials not configured in environment variables");
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (res.status === 403) throw new Error(`Shiprocket account blocked — too many failed attempts. Go to Shiprocket → Settings → API Users → Reset password for ${email}`);
  if (!res.ok) throw new Error(`Shiprocket auth failed: ${res.status} — ${data.message || "Unknown error"}`);
  if (!data.token) throw new Error(`Shiprocket returned no token. Response: ${JSON.stringify(data).slice(0, 100)}`);
  return data.token;
}

// ── Create order in Shiprocket ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      order_id,
      order_date,
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_pincode,
      product_name,
      product_price,
      product_quantity = 1,
      weight           = 0.3,
      length           = 10,
      breadth          = 10,
      height           = 5,
    } = body;

    if (!customer_name || !delivery_address || !delivery_pincode) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, delivery_address, delivery_pincode" },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken();

    const sabsOrderId = order_id || `SABS-${Date.now()}`;

    const orderPayload = {
      order_id:                 sabsOrderId,
      order_date:               order_date || new Date().toISOString().split("T")[0],
      pickup_location:          "work",
      channel_id:               "",
      comment:                  "Order from shreeambikabeauty.com — WhatsApp",
      billing_customer_name:    customer_name.split(" ")[0] || customer_name,
      billing_last_name:        customer_name.split(" ").slice(1).join(" ") || "",
      billing_address:          delivery_address,
      billing_city:             delivery_city || "Mumbai",
      billing_pincode:          String(delivery_pincode),
      billing_state:            delivery_state || "Maharashtra",
      billing_country:          "India",
      billing_email:            customer_email || "shreeambikabeautyshop@gmail.com",
      billing_phone:            String(customer_phone).replace(/\D/g, "").slice(-10),
      shipping_is_billing:      true,
      order_items: [{
        name:          product_name || "Beauty Product",
        sku:           `SKU-${Date.now()}`,
        units:         product_quantity,
        selling_price: String(product_price || 0),
        discount:      "",
        tax:           "",
        hsn:           3304,
      }],
      payment_method:      "Prepaid",
      shipping_charges:    0,
      giftwrap_charges:    0,
      transaction_charges: 0,
      total_discount:      0,
      sub_total:           product_price || 0,
      length,
      breadth,
      height,
      weight,
    };

    const createRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(orderPayload),
      signal: AbortSignal.timeout(15000),
    });

    const createData = await createRes.json();
    console.log("[create-order] Shiprocket response keys:", Object.keys(createData).join(", "));
    console.log("[create-order] order_id:", createData.order_id, "shipment_id:", createData.shipment_id, "payload:", JSON.stringify(createData).slice(0, 300));

    if (!createRes.ok) {
      return NextResponse.json(
        { error: createData.message || "Shiprocket order creation failed", details: createData },
        { status: 400 }
      );
    }

    // Shiprocket adhoc API returns shipment_id at root OR inside payload array
    const shipmentId: string = String(
      createData.shipment_id ||
      createData.payload?.[0]?.shipment_id ||
      createData.order?.shipment_id ||
      ""
    );
    const shiprocketOrderId: string = String(
      createData.order_id ||
      createData.payload?.[0]?.order_id ||
      ""
    );
    let awb: string | null                 = null;
    let courierName: string | null         = null;
    let estimatedDeliveryDate: string | null = null;

    // ── Auto-assign cheapest courier to get AWB ───────────────────────────
    if (shipmentId) {
      try {
        // serviceability by postcode (more reliable than by shipment_id)
        const pickupPin  = "400068"; // Dahisar East — your pickup pincode
        const deliveryPin = String(delivery_pincode) || "400001";

        const rateRes = await fetch(
          `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPin}&delivery_postcode=${deliveryPin}&weight=${weight}&cod=0&declared_value=${product_price || 399}`,
          { headers: { "Authorization": `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }
        );
        const rateData = await rateRes.json();

        type CourierOption = {
          courier_company_id: number;
          courier_name: string;
          freight_charge: number;
          estimated_delivery_days: number;
        };

        const couriers: CourierOption[] = rateData?.data?.available_courier_companies || [];

        if (couriers.length > 0) {
          const sorted = couriers.sort((a, b) => (a.freight_charge || 0) - (b.freight_charge || 0));
          const best   = sorted[0];

          const assignRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ shipment_id: String(shipmentId), courier_id: String(best.courier_company_id) }),
            signal: AbortSignal.timeout(15000),
          });
          const assignData = await assignRes.json();

          if (assignData?.awb_assign_status === 1 || assignData?.response?.data?.awb_code) {
            awb          = assignData?.response?.data?.awb_code || assignData?.awb_code || null;
            courierName  = best.courier_name;
            const deliveryDays = best.estimated_delivery_days || 5;
            const edd = new Date();
            edd.setDate(edd.getDate() + deliveryDays);
            estimatedDeliveryDate = edd.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
          }
        }
      } catch {
        // AWB auto-assign failed — order still created
      }
    }

    let dbError: string | null = null;
    // ── Save to our sabs_orders table ─────────────────────────────────────
    try {
      await ensureTable();
      const supabase = getAdmin();
      const { error: dbErr } = await supabase.from("sabs_orders").insert([{
        sabs_order_id:       sabsOrderId,
        shiprocket_order_id: shiprocketOrderId,
        shipment_id:         shipmentId,
        awb,
        courier_name:        courierName,
        estimated_delivery:  estimatedDeliveryDate,
        customer_name,
        customer_phone:      String(customer_phone || ""),
        product_name:        product_name || "Beauty Product",
        product_price:       product_price || 0,
        delivery_address:    delivery_address || null,
        delivery_pincode:    String(delivery_pincode || ""),
        delivery_city:       delivery_city || "Mumbai",
        delivery_state:      delivery_state || "Maharashtra",
        status:              "new",
        source:              "whatsapp",
      }]);
      if (dbErr) {
        dbError = dbErr.message;
        console.error("[create-order] DB insert error:", dbErr.message, dbErr.code);
      }
    } catch (dbSaveErr) {
      dbError = dbSaveErr instanceof Error ? dbSaveErr.message : String(dbSaveErr);
      console.error("[create-order] DB save exception:", dbError);
    }

    return NextResponse.json({
      success:             true,
      sabs_order_id:       sabsOrderId,
      shiprocket_order_id: shiprocketOrderId,
      shipment_id:         shipmentId,
      awb,
      courier_name:        courierName,
      estimated_delivery:  estimatedDeliveryDate,
      db_saved:            !dbError,
      db_error:            dbError,
      message:             awb
        ? `Order created & courier assigned! AWB: ${awb} | EDD: ${estimatedDeliveryDate}`
        : "Order created in Shiprocket. Courier assignment pending.",
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[shiprocket/create-order]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
