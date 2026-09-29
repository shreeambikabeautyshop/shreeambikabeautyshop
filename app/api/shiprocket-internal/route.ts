/**
 * Internal Shiprocket order creation — no admin auth required
 * Called from verify-payment after successful payment
 * Uses INTERNAL_SECRET for security
 */
import { NextRequest, NextResponse } from "next/server";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "sabs-internal-2026";

async function getShiprocketToken(): Promise<string> {
  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error("Shiprocket credentials not configured");
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json();
  if (!res.ok || !data.token) throw new Error(`Shiprocket auth failed: ${data.message || res.status}`);
  return data.token;
}

export async function POST(req: NextRequest) {
  // Verify internal secret
  const secret = req.headers.get("x-internal-secret");
  if (secret !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    order_id, order_date, customer_name, customer_phone,
    delivery_address, delivery_city, delivery_state, delivery_pincode,
    items, grand_total, delivery_charge, weight,
    courier_name,   // optional — preferred courier name from user selection
  } = body;

  try {
    const token = await getShiprocketToken();

    // Build order items
    const orderItems = (items || []).map((item: { name: string; price: number; qty?: number }) => ({
      name:          item.name,
      sku:           item.name.toLowerCase().replace(/\s+/g, "-").slice(0, 40),
      units:         item.qty || 1,
      selling_price: String(item.price || 0),
      discount:      "",
      tax:           "",
      hsn:           3304,
    }));

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const safeWeight = Math.max(0.1, weight || 0.3);

    const payload = {
      order_id:             order_id,
      order_date:           order_date || new Date().toISOString().split("T")[0],
      pickup_location:      "work",           // matches admin route — your Shiprocket pickup name
      channel_id:           "",
      comment:              "Order from shreeambikabeauty.com — Online Payment",
      billing_customer_name: (customer_name || "Customer").split(" ")[0],
      billing_last_name:    (customer_name || "").split(" ").slice(1).join(" ") || "",
      billing_address:      delivery_address || "Dahisar East",
      billing_city:         delivery_city    || "Mumbai",
      billing_pincode:      String(delivery_pincode || "400068"),
      billing_state:        delivery_state   || "Maharashtra",
      billing_country:      "India",
      billing_email:        "shreeambikabeautyshop@gmail.com",
      billing_phone:        String(customer_phone || "").replace(/\D/g, "").slice(-10),
      shipping_is_billing:  true,
      order_items:          orderItems,
      payment_method:       "Prepaid",
      shipping_charges:     delivery_charge || 0,
      giftwrap_charges:     0,
      transaction_charges:  0,
      total_discount:       0,
      sub_total:            grand_total || 0,
      length:               15,
      breadth:              10,
      height:               5,
      weight:               safeWeight,
    };

    const createRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });

    const createData = await createRes.json();
    console.log("[shiprocket-internal] create response:", JSON.stringify(createData).slice(0, 300));

    if (!createRes.ok) {
      return NextResponse.json({
        error: createData.message || "Shiprocket order creation failed",
        details: createData
      }, { status: 400 });
    }

    const shipmentId       = String(createData.shipment_id       || createData.payload?.[0]?.shipment_id || "");
    const shiprocketOrderId = String(createData.order_id          || createData.payload?.[0]?.order_id    || "");

    // ── Auto-assign courier / AWB ──────────────────────────────────
    let awb: string | null               = null;
    let assignedCourier: string | null   = null;
    let estimatedDelivery: string | null = null;

    if (shipmentId) {
      try {
        const pickupPin   = "400068";
        const deliveryPin = String(delivery_pincode || "400001");

        const rateRes = await fetch(
          `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPin}&delivery_postcode=${deliveryPin}&weight=${safeWeight}&cod=0&declared_value=${grand_total || 399}`,
          { headers: { "Authorization": `Bearer ${token}` }, signal: AbortSignal.timeout(12000) }
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
          // Prefer the courier the user selected; fall back to cheapest
          let preferred = couriers.find(
            c => courier_name && c.courier_name.toLowerCase().includes(courier_name.toLowerCase().split(" ")[0])
          );
          if (!preferred) {
            preferred = couriers.sort((a, b) => (a.freight_charge || 0) - (b.freight_charge || 0))[0];
          }

          const assignRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ shipment_id: shipmentId, courier_id: String(preferred.courier_company_id) }),
            signal: AbortSignal.timeout(15000),
          });
          const assignData = await assignRes.json();
          console.log("[shiprocket-internal] AWB assign:", JSON.stringify(assignData).slice(0, 200));

          if (assignData?.awb_assign_status === 1 || assignData?.response?.data?.awb_code) {
            awb              = assignData?.response?.data?.awb_code || assignData?.awb_code || null;
            assignedCourier  = preferred.courier_name;
            const edd = new Date();
            edd.setDate(edd.getDate() + (preferred.estimated_delivery_days || 5));
            estimatedDelivery = edd.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
          }
        }
      } catch (awbErr) {
        console.warn("[shiprocket-internal] AWB auto-assign failed (non-blocking):", awbErr);
      }
    }

    return NextResponse.json({
      success:             true,
      shiprocket_order_id: shiprocketOrderId,
      shipment_id:         shipmentId,
      awb,
      courier_name:        assignedCourier,
      estimated_delivery:  estimatedDelivery,
      message: awb
        ? `Order created & courier assigned! AWB: ${awb}`
        : `Shiprocket order created: ${shiprocketOrderId}. AWB pending.`,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[shiprocket-internal]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
