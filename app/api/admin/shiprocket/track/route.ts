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
    const shipment = (orderData as Record<string, unknown> & { data?: { shipments?: Record<string,unknown>[] }; shipments?: Record<string,unknown>[] })?.data?.shipments?.[0] || (orderData as Record<string, unknown> & { shipments?: Record<string,unknown>[] })?.shipments?.[0] || {};
    const tracking = (trackData as Record<string, unknown> & { tracking_data?: Record<string,unknown> })?.tracking_data || {};

    const details = {
      awb_code:        (shipment as Record<string,unknown>).awb_code || (tracking as Record<string,unknown>).awb_code || awb || null,
      courier_name:    (shipment as Record<string,unknown>).courier_name || (tracking as Record<string,unknown>).courier_name || null,
      shipment_id:     (shipment as Record<string,unknown>).id || (shipment as Record<string,unknown>).shipment_id || null,
      status:          (shipment as Record<string,unknown>).status || (tracking as Record<string,unknown>).current_status || null,
      edd:             (shipment as Record<string,unknown>).etd || (tracking as Record<string,unknown>).edd || (shipment as Record<string,unknown>).edd || null,
      pickup_date:     (shipment as Record<string,unknown>).pickup_date || null,
      delivered_date:  (shipment as Record<string,unknown>).delivered_date || null,
      tracking_url:    awb ? `https://shiprocket.co/tracking/${awb || (shipment as Record<string,unknown>).awb_code}` : null,
      origin:          (tracking as Record<string,unknown>).origin || (shipment as Record<string,unknown>).origin || null,
      destination:     (tracking as Record<string,unknown>).destination || (shipment as Record<string,unknown>).destination || null,
      activities:
        ((tracking as Record<string, unknown[]>).shipment_track_activities || []).slice(0, 5).map((a: unknown) => {
          const act = a as { date: string; activity: string; location: string };
          return { date: act.date, status: act.activity, location: act.location };
        }),
    };

    return NextResponse.json({ success: true, details, shipment_id: details.shipment_id });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
