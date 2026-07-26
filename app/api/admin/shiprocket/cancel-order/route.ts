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

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { order_db_id, shiprocket_order_id, awb } = await req.json();

    if (!shiprocket_order_id) {
      return NextResponse.json({ error: "No Shiprocket order ID — cannot cancel" }, { status: 400 });
    }

    const token = await getShiprocketToken();

    // Cancel the order in Shiprocket
    const cancelRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ ids: [String(shiprocket_order_id)] }),
      signal: AbortSignal.timeout(15000),
    });
    const cancelData = await cancelRes.json();

    // Check result — Shiprocket returns various formats
    const cancelled =
      cancelRes.ok ||
      cancelData?.message?.toLowerCase().includes("cancel") ||
      cancelData?.status === "cancelled" ||
      Array.isArray(cancelData) && cancelData[0]?.message?.toLowerCase().includes("cancel");

    // If AWB was assigned, also cancel the shipment
    if (awb) {
      try {
        await fetch("https://apiv2.shiprocket.in/v1/external/courier/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ awb: [awb] }),
          signal: AbortSignal.timeout(10000),
        });
      } catch { /* courier cancel is best-effort */ }
    }

    // Update status in our DB
    if (order_db_id) {
      const supabase = getAdmin();
      await supabase
        .from("sabs_orders")
        .update({ status: "rto", updated_at: new Date().toISOString() })
        .eq("id", order_db_id);
    }

    return NextResponse.json({
      success: true,
      message: cancelled
        ? "Order cancelled successfully in Shiprocket"
        : "Cancellation requested — verify in Shiprocket dashboard",
      shiprocket_response: cancelData,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[cancel-order]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
