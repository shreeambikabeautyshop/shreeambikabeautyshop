"use client";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiMinus, FiPlus } from "react-icons/fi";

interface Props {
  productName: string;
  price: number;
  slug: string;
}

export default function ProductActions({ productName, price, slug }: Props) {
  const [qty, setQty] = useState(1);

  const msg = encodeURIComponent(
    `Hi Vinod! I want to order:\n*${productName}*\nQty: ${qty}\nPrice: ₹${price} each\nTotal: ₹${price * qty}\n\nhttps://shreeambikabeautyshop.vercel.app/products/${slug}`
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">Quantity</span>
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <FiMinus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-black text-gray-800">{qty}</span>
          <button onClick={() => setQty(q => q + 1)}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <FiPlus size={14} />
          </button>
        </div>
        {qty > 1 && (
          <span className="text-xs text-gray-500">
            Total: <span className="font-bold text-gray-900">₹{(price * qty).toLocaleString("en-IN")}</span>
          </span>
        )}
      </div>

      {/* Buy on WhatsApp */}
      <a href={`https://wa.me/918291455297?text=${msg}`}
        target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-3 text-white font-bold py-4 rounded-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
        <span className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
          animation: "shine-sweep 2.5s ease-in-out infinite",
          backgroundSize: "200% 100%",
        }} />
        <FaWhatsapp size={22} className="relative z-10" />
        <div className="relative z-10 text-left">
          <p className="font-black text-base leading-tight">Buy on WhatsApp</p>
          <p className="text-xs opacity-80">Vinod: +91-8291455297</p>
        </div>
      </a>
    </div>
  );
}
