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

    // Sort by cost (cheapest first) and by speed (fewest days first)
    const byCost  = [...couriers].sort((a, b) => (a.freight_charge || 0) - (b.freight_charge || 0));
    const bySpeed = [...couriers].sort((a, b) => (a.estimated_delivery_days || 99) - (b.estimated_delivery_days || 99));

    const cheapest = byCost[0];
    const fastest  = bySpeed[0];

    // Build 3 distinct options: Standard, Fast, Express
    // Standard = cheapest courier
    // Express  = fastest courier
    // Fast     = best balance (cheapest among those that deliver in ≤ fastest+1 days, or second cheapest)
    const standardCharge = (cheapest.freight_charge || 0) + (cod ? (cheapest.cod_charges || 0) : 0);
    const expressCharge  = (fastest.freight_charge  || 0) + (cod ? (fastest.cod_charges  || 0) : 0);

    // Fast option: cheapest courier that is faster than standard (but not same as express unless only 2 couriers)
    const fasterThanStandard = byCost.filter(
      c => (c.estimated_delivery_days || 99) < (cheapest.estimated_delivery_days || 99)
    );
    const fastCourier = fasterThanStandard.length > 0
      ? fasterThanStandard[0]         // cheapest among faster ones
      : byCost[1] || cheapest;        // fallback: second cheapest, or same as standard

    const fastCharge = (fastCourier.freight_charge || 0) + (cod ? (fastCourier.cod_charges || 0) : 0);

    // Deduplicate options by courier name
    const seen   = new Set<string>();
    const opts: Array<{ label: string; tag: string; courier: string; charge: number; days: number }> = [];
    const push = (label: string, tag: string, c: Courier) => {
      if (seen.has(c.courier_name)) return;
      seen.add(c.courier_name);
      opts.push({
        label,
        tag,
        courier: c.courier_name,
        charge:  (c.freight_charge || 0) + (cod ? (c.cod_charges || 0) : 0),
        days:    c.estimated_delivery_days,
      });
    };

    push("Standard", "standard", cheapest);
    push("Fast",     "fast",     fastCourier);
    push("Express",  "express",  fastest);

    // If only 1 unique courier, still return it as a single option
    return NextResponse.json({
      success:   true,
      available: true,
      pincode,
      // Legacy fields (cheapest) — kept for backward compat
      charge:  standardCharge,
      days:    cheapest.estimated_delivery_days,
      courier: cheapest.courier_name,
      // Structured options for the new delivery selector UI
      options: opts,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
