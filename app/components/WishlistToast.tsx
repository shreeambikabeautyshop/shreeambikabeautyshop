"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { FiX } from "react-icons/fi";

interface ToastProps {
  item: { name: string; image?: string; added: boolean } | null;
  onClose: () => void;
}

export default function WishlistToast({ item, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (item) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 400);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-[9999] transition-all duration-400 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      style={{ maxWidth: "320px" }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl border-l-4 overflow-hidden ${
        item.added ? "border-brand-primary" : "border-gray-300"
      }`}>
        <div className="flex items-start gap-3 p-4">
          {/* Product thumbnail */}
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-light flex-shrink-0">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <FaHeart size={12} className={item.added ? "text-brand-primary" : "text-gray-400"} />
              <p className="text-xs font-bold text-gray-700">
                {item.added ? "Added to Favourites!" : "Removed from Favourites"}
              </p>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.name}</p>
            {item.added && (
              <Link href="/wishlist"
                onClick={() => { setVisible(false); setTimeout(onClose, 400); }}
                className="text-[10px] font-bold text-brand-primary hover:underline">
                View My Favourites →
              </Link>
            )}
          </div>

          {/* Close */}
          <button onClick={() => { setVisible(false); setTimeout(onClose, 400); }}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0">
            <FiX size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-full ${item.added ? "bg-brand-primary" : "bg-gray-400"} rounded-full`}
            style={{ animation: "progress-shrink 3s linear forwards" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
