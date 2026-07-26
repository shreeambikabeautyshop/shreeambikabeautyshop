import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

async function getShiprocketToken(): Promise<string> {
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:    process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (!data.token) throw new Error(data.message || "Shiprocket auth failed");
  return data.token;
}

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const shipmentId = searchParams.get("shipment_id");
  const awb        = searchParams.get("awb");
  const orderId    = searchParams.get("order_id"); // shiprocket order_id

  if (!shipmentId && !awb && !orderId) {
    return NextResponse.json({ error: "shipment_id, awb, or order_id required" }, { status: 400 });
  }

  try {
    const token = await getShiprocketToken();
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    let trackData: Record<string, unknown> = {};
    let orderData: Record<string, unknown> = {};

    // ── Fetch by AWB if available ──────────────────────────────────────────
    if (awb) {
      const r = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
        headers, signal: AbortSignal.timeout(10000),
      });
      if (r.ok) trackData = await r.json();
    }

    // ── Fetch order details by shipment_id ─────────────────────────────────
    if (shipmentId) {
      const r = await fetch(`https://apiv2.shiprocket.in/v1/external/shipments/show/${shipmentId}`, {
        headers, signal: AbortSignal.timeout(10000),
      });
      if (r.ok) orderData = await r.json();
    }

    // ── Fetch by order_id if shipment_id not available ─────────────────────
    if (!shipmentId && orderId) {
      const r = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`, {
        headers, signal: AbortSignal.timeout(10000),
      });
      if (r.ok) orderData = await r.json();
    }

    // ── Parse shipping details ─────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shipment = (orderData as any)?.data?.shipments?.[0] || (orderData as any)?.shipments?.[0] || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracking = (trackData as any)?.tracking_data || {};

    const details = {
      awb_code:        shipment.awb_code || tracking.awb_code || awb || null,
      courier_name:    shipment.courier_name || tracking.courier_name || null,
      status:          shipment.status || tracking.current_status || null,
      edd:             shipment.etd || tracking.edd || shipment.edd || null, // Expected Delivery Date
      pickup_date:     shipment.pickup_date || null,
      delivered_date:  shipment.delivered_date || null,
      tracking_url:    awb ? `https://shiprocket.co/tracking/${awb || shipment.awb_code}` : null,
      origin:          tracking.origin || shipment.origin || null,
      destination:     tracking.destination || shipment.destination || null,
      activities:      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tracking.shipment_track_activities || []).slice(0, 5).map((a: any) => ({
          date:    a.date,
          status:  a.activity,
          location: a.location,
        })),
    };

    return NextResponse.json({ success: true, details });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
