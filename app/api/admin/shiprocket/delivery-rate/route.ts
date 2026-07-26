import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
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

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const pickup_postcode    = searchParams.get("pickup") || "400068"; // Dahisar East
  const delivery_postcode  = searchParams.get("delivery") || "";
  const weight             = parseFloat(searchParams.get("weight") || "0.3");
  const cod                = searchParams.get("cod") === "1";
  const declared_value     = parseFloat(searchParams.get("value") || "500");

  if (!delivery_postcode) {
    return NextResponse.json({ error: "delivery postcode required" }, { status: 400 });
  }

  try {
    const token = await getShiprocketToken();

    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?` +
      `pickup_postcode=${pickup_postcode}` +
      `&delivery_postcode=${delivery_postcode}` +
      `&weight=${weight}` +
      `&cod=${cod ? 1 : 0}` +
      `&declared_value=${declared_value}`;

    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message || "Rate fetch failed" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const couriers = (data.data?.available_courier_companies || []) as any[];

    if (couriers.length === 0) {
      return NextResponse.json({
        success: true,
        delivery_postcode,
        couriers: [],
        cheapest: null,
        fastest: null,
        message: "No courier available for this pincode",
      });
    }

    // Sort by freight charge
    const sorted = couriers.sort((a, b) => (a.freight_charge || 0) - (b.freight_charge || 0));

    const cheapest = sorted[0];
    const fastest  = couriers.sort((a, b) => (a.estimated_delivery_days || 99) - (b.estimated_delivery_days || 99))[0];

    return NextResponse.json({
      success: true,
      delivery_postcode,
      pickup_postcode,
      weight,
      couriers: sorted.slice(0, 5).map(c => ({
        name:           c.courier_name,
        charge:         c.freight_charge,
        cod_charges:    c.cod_charges || 0,
        total:          (c.freight_charge || 0) + (cod ? (c.cod_charges || 0) : 0),
        delivery_days:  c.estimated_delivery_days,
        rating:         c.rating,
      })),
      cheapest: {
        name:  cheapest.courier_name,
        total: (cheapest.freight_charge || 0) + (cod ? (cheapest.cod_charges || 0) : 0),
        days:  cheapest.estimated_delivery_days,
      },
      fastest: {
        name:  fastest.courier_name,
        total: (fastest.freight_charge || 0) + (cod ? (fastest.cod_charges || 0) : 0),
        days:  fastest.estimated_delivery_days,
      },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
