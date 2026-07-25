"use client";
import { useCallback } from "react";
import { useUser } from "@/app/context/UserContext";
import { usePathname } from "next/navigation";

interface OrderParams {
  productId?: string;
  productName?: string;
  productBrand?: string;
  productPrice?: number;
  source?: string;
  customMessage?: string;
}

export function useWhatsAppOrder() {
  const { customer, isLoggedIn, triggerLogin } = useUser();
  const pathname = usePathname();

  const openWhatsApp = useCallback(async (params: OrderParams) => {
    // Not logged in — show login modal first
    if (!isLoggedIn) {
      triggerLogin("order");
      return;
    }

    const source = params.source || "website";
    const page   = pathname || "/";

    // ── Build clean message (NO emojis — they cause ? in WhatsApp URL) ───────
    let msg = params.customMessage;
    if (!msg) {
      const lines: string[] = [
        `Hi Vinod! I want to order from *Shree Ambika Beauty Shop*`,
        ``,
      ];
      if (params.productName)  lines.push(`*Product:* ${params.productName}`);
      if (params.productBrand) lines.push(`*Brand:* ${params.productBrand}`);
      if (params.productPrice) lines.push(`*Price:* Rs.${params.productPrice}`);
      lines.push(``);
      lines.push(`*My Name:* ${customer?.full_name || "Customer"}`);
      if (customer?.phone)   lines.push(`*Phone:* ${customer.phone}`);
      if (customer?.address) {
        const addr = customer.city
          ? `${customer.address}, ${customer.city}`
          : customer.address;
        lines.push(`*Delivery Address:* ${addr}`);
      }
      lines.push(``);
      lines.push(`*Source:* ${source} | ${page}`);
      lines.push(`shreeambikabeauty.com`);
      msg = lines.join("\n");
    }

    // ── Track the click ───────────────────────────────────────────────────────
    try {
      fetch("/api/track/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id:     params.productId    || null,
          product_name:   params.productName  || null,
          product_brand:  params.productBrand || null,
          product_price:  params.productPrice || null,
          customer_name:  customer?.full_name || null,
          customer_phone: customer?.phone     || null,
          source,
          page_url: `https://www.shreeambikabeauty.com${page}`,
        }),
      }).catch(() => {});
    } catch { /* non-blocking */ }

    // ── Open WhatsApp ─────────────────────────────────────────────────────────
    window.open(`https://wa.me/918291455297?text=${encodeURIComponent(msg)}`, "_blank");
  }, [isLoggedIn, customer, pathname, triggerLogin]);

  return { openWhatsApp, isLoggedIn, customer };
}
