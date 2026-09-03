"use client";
import { FaWhatsapp, FaPhone } from "react-icons/fa";

export default function WhatsAppFloat() {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2">
      {/* Phone call button — mobile only */}
      <a
        href="tel:+918291455297"
        aria-label="Call Shree Ambika Beauty Shop"
        className="sm:hidden flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-full shadow-xl transition-all hover:scale-105"
        style={{ paddingLeft: "14px", paddingRight: "16px", paddingTop: "10px", paddingBottom: "10px" }}
      >
        <FaPhone size={16} />
        <span className="text-xs font-bold">Call Now</span>
      </a>

      {/* WhatsApp button */}
      <a
        href="https://wa.me/918291455297?text=Hi%20Vinod!%20I%20want%20to%20order%20beauty%20products%20from%20Shree%20Ambika%20Beauty%20Shop."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp — Shree Ambika Beauty Shop"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all hover:scale-105 whatsapp-pulse"
        style={{ paddingLeft: "14px", paddingRight: "18px", paddingTop: "12px", paddingBottom: "12px" }}
      >
        <FaWhatsapp size={24} />
        <span className="text-sm font-bold whitespace-nowrap hidden sm:inline">Order on WhatsApp</span>
        <span className="text-xs font-bold whitespace-nowrap sm:hidden">WhatsApp</span>
      </a>
    </div>
  );
}
