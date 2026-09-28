"use client";
import { useEffect, useState } from "react";
import { FiShoppingCart, FiCheck } from "react-icons/fi";
import { cldImg } from "@/app/lib/cloudinary-img";

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
  const [visible, setVisible] = useState(false);
  const [flying, setFlying]   = useState(false);

  useEffect(() => {
    if (!item) return;
    setVisible(true);
    setFlying(false);

    // After 2s, start flying animation
    const flyTimer = setTimeout(() => setFlying(true), 2000);
    // After animation done, close
    const closeTimer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);

    return () => { clearTimeout(flyTimer); clearTimeout(closeTimer); };
  }, [item, onClose]);

  if (!item || !visible) return null;

  return (
    <>
      {/* Backdrop blur — subtle */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateY(-20px) scale(0.9); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fly-to-cart {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          60%  { transform: translate(30vw, -40vh) scale(0.5); opacity: 0.8; }
          100% { transform: translate(45vw, -90vh) scale(0.1); opacity: 0; }
        }
        .cart-toast-enter { animation: slide-in 0.3s ease-out forwards; }
        .cart-toast-fly   { animation: fly-to-cart 0.9s ease-in forwards; }
      `}</style>

      <div
        className={`fixed bottom-24 right-4 z-[999] ${flying ? "cart-toast-fly" : "cart-toast-enter"}`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 overflow-hidden w-64">
          {/* Green header */}
          <div className="bg-green-500 text-white px-4 py-2 flex items-center gap-2">
            <FiCheck size={16} />
            <span className="text-sm font-bold">Added to Cart!</span>
          </div>

          {/* Product mini card */}
          <div className="flex items-center gap-3 p-3">
            {/* Image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand-light flex-shrink-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cldImg(item.image, 56)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-brand-primary uppercase">{item.brand}</p>
              <p className="text-xs font-semibold text-gray-800 line-clamp-2">{item.name}</p>
              <p className="text-sm font-black text-gray-900 mt-0.5">₹{item.price}</p>
            </div>
          </div>

          {/* View Cart CTA */}
          <div className="px-3 pb-3">
            <a
              href="/cart"
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-xs font-bold py-2 rounded-xl hover:bg-brand-dark transition-colors"
            >
              <FiShoppingCart size={12} /> View Cart
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
