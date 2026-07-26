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

async function getShiprocketToken(): Promise<string> {
  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error("Shiprocket credentials not configured");
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Auth failed: ${res.status} — ${data.message || ""}`);
  if (!data.token) throw new Error("No token returned");
  return data.token;
}

// POST — mark order as ready to ship (schedules Shiprocket pickup)
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { order_db_id, shipment_id, awb } = await req.json();
    if (!shipment_id) return NextResponse.json({ error: "shipment_id required" }, { status: 400 });

    const token = await getShiprocketToken();

    // Generate pickup for the shipment
    const pickupRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/pickup", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ shipment_id: [shipment_id] }),
      signal: AbortSignal.timeout(15000),
    });
    const pickupData = await pickupRes.json();

    // Generate manifest (packing slip)
    let manifestUrl: string | null = null;
    try {
      const manifestRes = await fetch("https://apiv2.shiprocket.in/v1/external/manifests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ shipment_id: [shipment_id] }),
        signal: AbortSignal.timeout(10000),
      });
      const manifestData = await manifestRes.json();
      manifestUrl = manifestData?.manifest_url || null;
    } catch { /* manifest is optional */ }

    // Generate label (shipping label PDF)
    let labelUrl: string | null = null;
    try {
      const labelRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/label", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ shipment_id: [shipment_id] }),
        signal: AbortSignal.timeout(10000),
      });
      const labelData = await labelRes.json();
      labelUrl = labelData?.label_url || null;
    } catch { /* label is optional */ }

    // Update status in our DB
    if (order_db_id) {
      const supabase = getAdmin();
      await supabase
        .from("sabs_orders")
        .update({
          status:       "ready_to_ship",
          manifest_url: manifestUrl,
          label_url:    labelUrl,
          updated_at:   new Date().toISOString(),
        })
        .eq("id", order_db_id);
    }

    const pickupScheduled = pickupData?.pickup_status === 1 ||
      pickupData?.response?.pickup_scheduled_date != null ||
      pickupData?.pickup_scheduled_date != null;

    return NextResponse.json({
      success:          true,
      pickup_scheduled: pickupScheduled,
      pickup_data:      pickupData,
      manifest_url:     manifestUrl,
      label_url:        labelUrl,
      message:          pickupScheduled
        ? "Pickup scheduled! Courier will arrive to collect the package."
        : "Ready to ship marked. Check Shiprocket for pickup details.",
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[shiprocket/ready-to-ship]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
