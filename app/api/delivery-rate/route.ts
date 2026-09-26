/**
 * Public delivery rate API — for cart page
 * Calculates Shiprocket delivery charges for a given pincode + weight
 */
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory token cache (reuse within same serverless instance)
let _cachedToken: string | null = null;
let _tokenExpiry = 0;

async function getShiprocketToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error("Shiprocket not configured");

  const res  = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (!res.ok || !data.token) throw new Error("Shiprocket auth failed");

  _cachedToken = data.token;
  _tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23 hours
  return data.token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pincode,
      weight = 0.5,    // kg
      cod    = false,
      value  = 500,    // declared value
    } = body;

    if (!pincode || String(pincode).length !== 6) {
      return NextResponse.json(
        { error: "Valid 6-digit pincode required" },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken();

    const url =
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?` +
      `pickup_postcode=400068` +      // Dahisar East
      `&delivery_postcode=${pincode}` +
      `&weight=${weight}` +
      `&cod=${cod ? 1 : 0}` +
      `&declared_value=${value}`;

    const res  = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` },
      signal:  AbortSignal.timeout(10000),
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "Could not fetch delivery rates" }, { status: 400 });
    }

    type Courier = {
      courier_name: string; freight_charge: number; cod_charges: number;
      estimated_delivery_days: number; rating: number;
    };

    const couriers = (data.data?.available_courier_companies || []) as Courier[];

    if (couriers.length === 0) {
      return NextResponse.json({
        success: true,
        available: false,
        message: "Delivery not available to this pincode. Please visit the store or contact us.",
        pincode,
      });
    }

    // Sort by total charge
    const sorted = [...couriers].sort(
      (a, b) => (a.freight_charge || 0) - (b.freight_charge || 0)
    );
    const cheapest = sorted[0];

    // Fastest
    const fastest = [...couriers].sort(
      (a, b) => (a.estimated_delivery_days || 99) - (b.estimated_delivery_days || 99)
    )[0];

    const charge = (cheapest.freight_charge || 0) + (cod ? (cheapest.cod_charges || 0) : 0);

    return NextResponse.json({
      success:   true,
      available: true,
      pincode,
      charge,                          // cheapest total
      days:      cheapest.estimated_delivery_days,
      courier:   cheapest.courier_name,
      fastest: {
        charge:  (fastest.freight_charge || 0) + (cod ? (fastest.cod_charges || 0) : 0),
        days:    fastest.estimated_delivery_days,
        courier: fastest.courier_name,
      },
      options: sorted.slice(0, 3).map(c => ({
        courier: c.courier_name,
        charge:  (c.freight_charge || 0) + (cod ? (c.cod_charges || 0) : 0),
        days:    c.estimated_delivery_days,
      })),
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
