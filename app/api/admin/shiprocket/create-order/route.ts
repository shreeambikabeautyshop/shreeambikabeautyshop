import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

// ── Get Shiprocket auth token ─────────────────────────────────────────────────
async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
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
  if (!data.token) throw new Error(`Shiprocket returned no token. Response: ${JSON.stringify(data).slice(0,100)}`);

  return data.token;
}

// ── Create order in Shiprocket ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      order_id,        // unique order ID (we generate)
      order_date,      // ISO date string
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
      weight = 0.3,    // kg — default for cosmetics
      length = 10,     // cm
      breadth = 10,
      height = 5,
    } = body;

    if (!customer_name || !delivery_address || !delivery_pincode) {
      return NextResponse.json({ error: "Missing required fields: customer_name, delivery_address, delivery_pincode" }, { status: 400 });
    }

    const token = await getShiprocketToken();

    // Build order payload for Shiprocket
    const orderPayload = {
      order_id:           order_id || `SABS-${Date.now()}`,
      order_date:         order_date || new Date().toISOString().split("T")[0],
      pickup_location:    "Primary",   // your default pickup in Shiprocket
      channel_id:         "",
      comment:            "Order from shreeambikabeauty.com — WhatsApp",
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
      order_items: [
        {
          name:             product_name || "Beauty Product",
          sku:              `SKU-${Date.now()}`,
          units:            product_quantity,
          selling_price:    String(product_price || 0),
          discount:         "",
          tax:              "",
          hsn:              3304,   // HSN code for beauty/cosmetics
        },
      ],
      payment_method:     "Prepaid",
      shipping_charges:   0,
      giftwrap_charges:   0,
      transaction_charges: 0,
      total_discount:     0,
      sub_total:          product_price || 0,
      length,
      breadth,
      height,
      weight,
    };

    const createRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
      signal: AbortSignal.timeout(15000),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json({
        error: createData.message || "Shiprocket order creation failed",
        details: createData,
      }, { status: 400 });
    }

    const shipmentId = createData.shipment_id;
    let awb: string | null = null;
    let courierName: string | null = null;
    let estimatedDeliveryDate: string | null = null;

    // ── Auto-assign cheapest courier to get AWB ───────────────────────────
    if (shipmentId) {
      try {
        // Step 1: get available couriers for this shipment
        const rateRes = await fetch(
          `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?shipment_id=${shipmentId}`,
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
          // Pick cheapest available courier
          const sorted = couriers.sort((a, b) => (a.freight_charge || 0) - (b.freight_charge || 0));
          const best = sorted[0];

          // Step 2: assign courier → this generates AWB
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
            // Calculate expected delivery date
            const deliveryDays = best.estimated_delivery_days || 5;
            const edd = new Date();
            edd.setDate(edd.getDate() + deliveryDays);
            estimatedDeliveryDate = edd.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
          }
        }
      } catch {
        // AWB auto-assign failed — order is still created, just no AWB yet
      }
    }

    return NextResponse.json({
      success:             true,
      shiprocket_order_id: createData.order_id,
      shipment_id:         shipmentId,
      awb:                 awb,
      courier_name:        courierName,
      estimated_delivery:  estimatedDeliveryDate,
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
