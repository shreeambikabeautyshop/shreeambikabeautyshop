"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiMinus, FiPlus } from "react-icons/fi";

interface ProductActionsProps {
  productName: string;
  price: number;
  slug: string;
  waMsg: string;
}

export default function ProductActions({ productName, price, slug, waMsg }: ProductActionsProps) {
  const [qty, setQty] = useState(1);

  const finalMsg = encodeURIComponent(
    `Hi Vinod! I want to order:\n*${productName}*\nQty: ${qty}\nPrice: ₹${price} each\nTotal: ₹${price * qty}\n\nhttps://shreeambikabeautyshop.vercel.app/products/${slug}`
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">Quantity</span>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-bold text-gray-800">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>
        {qty > 1 && (
          <span className="text-xs text-gray-500">
            Total: <span className="font-bold text-gray-800">₹{(price * qty).toLocaleString("en-IN")}</span>
          </span>
        )}
      </div>

      {/* Buy on WhatsApp button */}
      <a
        href={`https://wa.me/918291455297?text=${finalMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2.5 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
      >
        {/* Shine sweep animation */}
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
            animation: "shine-sweep 2.5s ease-in-out infinite",
            backgroundSize: "200% 100%",
          }}
        />
        <FaWhatsapp size={22} className="relative z-10" />
        <div className="relative z-10 text-left">
          <p className="font-black text-base leading-tight">Buy on WhatsApp</p>
          <p className="text-xs opacity-80 font-normal">Vinod: +91-8291455297</p>
        </div>
      </a>
    </div>
  );
}
