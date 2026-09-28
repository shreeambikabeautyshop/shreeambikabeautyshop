"use client";
import { useEffect, useState } from "react";
import { FiShoppingCart, FiCheck, FiX } from "react-icons/fi";
import { cldImg } from "@/app/lib/cloudinary-img";
import Link from "next/link";

interface CartToastItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
}

interface Props {
  item: CartToastItem | null;
  onClose: () => void;
}

export default function CartAddedToast({ item, onClose }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!item) { setShow(false); return; }
    // Small delay then show
    const t1 = setTimeout(() => setShow(true), 50);
    // Auto close after 3.5s
    const t2 = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 400);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-[9999] transition-all duration-400 ${
        show
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
      }`}
      style={{ transitionProperty: "opacity, transform" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-green-200 overflow-hidden w-72">

        {/* Green header */}
        <div className="bg-green-500 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <FiCheck size={12} />
            </div>
            <span className="text-sm font-bold">Added to Cart!</span>
          </div>
          <button onClick={() => { setShow(false); setTimeout(onClose, 400); }}
            className="text-white/70 hover:text-white transition-colors">
            <FiX size={14} />
          </button>
        </div>

        {/* Product mini card */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-light flex-shrink-0 border border-gray-100">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cldImg(item.image, 64)} alt={item.name}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">{item.brand}</p>
            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
            <p className="text-sm font-black text-gray-900 mt-1">₹{item.price}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 pb-3 flex gap-2">
          <Link href="/cart"
            className="flex-1 flex items-center justify-center gap-1.5 bg-brand-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
            <FiShoppingCart size={12} /> View Cart
          </Link>
          <button onClick={() => { setShow(false); setTimeout(onClose, 400); }}
            className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Continue Shopping
          </button>
        </div>

        {/* Progress bar — auto close indicator */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-green-400 rounded-full"
            style={{
              width: show ? "0%" : "100%",
              transition: show ? "width 3.5s linear" : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
