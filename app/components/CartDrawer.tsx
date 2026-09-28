"use client";
import { useEffect } from "react";
import Link from "next/link";
import { FiX, FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/app/context/CartContext";
import { useSettings } from "@/app/context/SettingsContext";
import { cldImg } from "@/app/lib/cloudinary-img";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, remove, updateQty, subtotal, totalItems } = useCart();
  const { show_price } = useSettings();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[1001] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiShoppingCart size={18} className="text-brand-primary" />
            <h2 className="font-bold text-gray-900 text-base">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <FiX size={18} />
          </button>
        </div>

        {/* ── Items List ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="font-semibold text-gray-700 mb-1">Cart is empty</p>
              <p className="text-xs text-gray-400 mb-6">Add products to see them here</p>
              <button onClick={onClose}>
                <Link href="/products"
                  className="flex items-center gap-2 bg-brand-primary text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-brand-dark transition-colors">
                  <FiShoppingBag size={14} /> Browse Products
                </Link>
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-gray-50 rounded-2xl p-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                  {item.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cldImg(item.images[0], 64)} alt={item.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-brand-primary uppercase tracking-wide">{item.brand}</p>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                  {show_price && (
                    <p className="text-sm font-black text-gray-900 mt-0.5">₹{item.price}</p>
                  )}

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => item.qty === 1 ? remove(item.id) : updateQty(item.id, item.qty - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">
                        <FiMinus size={10} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-gray-800">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">
                        <FiPlus size={10} />
                      </button>
                    </div>
                    {show_price && item.qty > 1 && (
                      <span className="text-xs text-gray-400">= ₹{item.price * item.qty}</span>
                    )}
                    <button onClick={() => remove(item.id)}
                      className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer — Subtotal + CTA ── */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
              {show_price && (
                <span className="font-black text-lg text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 -mt-1">
              No GST • Delivery charges calculated at checkout
            </p>

            {/* Go to Cart CTA */}
            <Link href="/cart" onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3.5 rounded-2xl transition-colors text-sm">
              <FiShoppingCart size={15} />
              Go to Cart — Checkout
            </Link>

            {/* Continue shopping */}
            <button onClick={onClose}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
