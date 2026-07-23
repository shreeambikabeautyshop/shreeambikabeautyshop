"use client";
/**
 * useWhatsAppOrder — Smart WhatsApp ordering hook
 *
 * 1. Checks if user is logged in
 * 2. If NOT logged in → shows login alert/modal first
 * 3. If logged in → tracks click with source+page+customer info → opens WhatsApp
 */
import { useCallback } from "react";
import { useUser } from "@/app/context/UserContext";
import { usePathname } from "next/navigation";

interface OrderParams {
  productId?: string;
  productName?: string;
  productBrand?: string;
  productPrice?: number;
  source?: string;        // e.g. "product_page", "search_page", "home_hero", "category_page"
  customMessage?: string; // override the default message
}

export function useWhatsAppOrder() {
  const { customer, isLoggedIn, triggerLogin } = useUser();
  const pathname = usePathname();

  const openWhatsApp = useCallback(async (params: OrderParams) => {
    // ── Step 1: Login check ──────────────────────────────────────────────────
    if (!isLoggedIn) {
      // Show login modal with "order" action
      triggerLogin("order");
      return; // Don't open WhatsApp until logged in
    }

    // ── Step 2: Build message with customer info ─────────────────────────────
    const source = params.source || "website";
    const page   = pathname || "/";

    let msg = params.customMessage;
    if (!msg) {
      const lines = [
        `Hi Vinod! 👋 I want to order from *Shree Ambika Beauty Shop*`,
        ``,
        params.productName  ? `🛍️ *Product:* ${params.productName}` : null,
        params.productBrand ? `🏷️ *Brand:* ${params.productBrand}` : null,
        params.productPrice ? `💰 *Price:* ₹${params.productPrice}` : null,
        ``,
        `👤 *My Name:* ${customer?.full_name || "Customer"}`,
        customer?.phone ? `📞 *Phone:* ${customer.phone}` : null,
        customer?.address ? `📍 *Address:* ${customer.address}${customer.city ? `, ${customer.city}` : ""}` : null,
        ``,
        `📲 *Ordered via:* ${source} | Page: ${page}`,
        `🌐 shreeambikabeauty.com`,
      ].filter(Boolean).join("\n");
      msg = lines;
    }

    // ── Step 3: Track the click ──────────────────────────────────────────────
    try {
      await fetch("/api/track/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id:     params.productId || null,
          product_name:   params.productName || null,
          product_brand:  params.productBrand || null,
          product_price:  params.productPrice || null,
          customer_name:  customer?.full_name || null,
          customer_phone: customer?.phone || null,
          source,
          page_url: `https://www.shreeambikabeauty.com${page}`,
        }),
      });
    } catch { /* non-blocking */ }

    // ── Step 4: Open WhatsApp ────────────────────────────────────────────────
    window.open(`https://wa.me/918291455297?text=${encodeURIComponent(msg)}`, "_blank");
  }, [isLoggedIn, customer, pathname, triggerLogin]);

  return { openWhatsApp, isLoggedIn, customer };
}
