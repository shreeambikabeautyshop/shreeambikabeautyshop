"use client";
import { useWishlist } from "@/app/context/WishlistContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaWhatsapp, FaShareAlt } from "react-icons/fa";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";

export default function WishlistPage() {
  const { items, remove } = useWishlist();

  const totalMRP = items.reduce((s, i) => s + i.mrp, 0);
  const totalPrice = items.reduce((s, i) => s + i.price, 0);
  const totalSavings = totalMRP - totalPrice;

  const allWaMsg = encodeURIComponent(
    `Hi Vinod! I want to buy all these products:\n\n` +
    items.map((i, idx) => `${idx + 1}. ${i.name} — ₹${i.price}`).join("\n") +
    `\n\nTotal: ₹${totalPrice.toLocaleString("en-IN")}\n\nPlease confirm availability.`
  );

  const shareWishlistMsg = encodeURIComponent(
    `✨ My Beauty Wishlist from Shree Ambika Beauty Shop!\n\n` +
    items.map(i => `• ${i.name} — ₹${i.price}`).join("\n") +
    `\n\nTotal: ₹${totalPrice.toLocaleString("en-IN")}\n📱 WhatsApp Vinod: +91-8291455297`
  );

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaHeart className="text-brand-primary" size={22} />
                My Favourites
                <span className="text-base font-semibold text-gray-400">({items.length})</span>
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Your saved products</p>
            </div>
            {items.length > 0 && (
              <div className="flex gap-3">
                <a href={`https://wa.me/?text=${shareWishlistMsg}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-4 py-2.5 rounded-xl hover:border-brand-primary hover:text-brand-primary transition-all text-sm">
                  <FaShareAlt size={14} /> Share Wishlist
                </a>
                <a href={`https://wa.me/918291455297?text=${allWaMsg}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold px-4 py-2.5 rounded-xl transition-all text-sm">
                  <FiShoppingCart size={14} /> Order All on WhatsApp
                </a>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty state */
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
              <FaHeart size={60} className="text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">No Favourites Yet</h2>
              <p className="text-gray-400 text-sm mb-6">
                Tap the ♡ heart on any product to save it here
              </p>
              <Link href="/products"
                className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold px-8 py-3 rounded-full hover:bg-brand-dark transition-colors">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_300px] gap-6">
              {/* Products Grid */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {items.map((item) => {
                    const waMsg = encodeURIComponent(
                      `Hi Vinod! I want to order:\n*${item.name}*\nPrice: ₹${item.price}\n\nhttps://shreeambikabeautyshop.vercel.app/products/${item.slug || item.id}`
                    );
                    return (
                      <div key={item.id}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group">
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                          {item.images?.[0] ? (
                            <Image src={item.images[0]} alt={item.name} fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">💄</div>
                          )}
                          {/* Remove button */}
                          <button onClick={() => remove(item.id)}
                            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-all text-gray-400">
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <p className="text-[9px] font-bold text-brand-primary uppercase tracking-wide mb-0.5">{item.brand}</p>
                          <Link href={`/products/${item.slug || item.id}`}>
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight hover:text-brand-primary transition-colors">
                              {item.name}
                            </p>
                          </Link>
                          <div className="flex items-baseline gap-1.5 mb-2.5">
                            <span className="font-bold text-sm text-gray-900">₹{item.price}</span>
                            {item.mrp > item.price && (
                              <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                            )}
                          </div>
                          {/* Action buttons */}
                          <div className="flex gap-1.5">
                            <Link href={`/products/${item.slug || item.id}`}
                              className="flex-1 text-center text-[9px] font-semibold border border-gray-200 text-gray-600 py-1.5 rounded-lg hover:border-brand-primary hover:text-brand-primary transition-colors">
                              View
                            </Link>
                            <a href={`https://wa.me/918291455297?text=${waMsg}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-0.5 text-[9px] font-bold text-white py-1.5 rounded-lg"
                              style={{ background: "#25D366" }}>
                              <FaWhatsapp size={9} /> Buy
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="flex flex-col gap-4">
                {/* Wishlist Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4">Wishlist Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Items</span>
                      <span className="font-semibold text-gray-800">{items.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Total MRP</span>
                      <span className="font-semibold text-gray-400 line-through">₹{totalMRP.toLocaleString("en-IN")}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>You Save</span>
                        <span className="font-bold">₹{totalSavings.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="font-bold text-gray-800">Total Price</span>
                      <span className="font-black text-xl text-gray-900">₹{totalPrice.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-5">
                    <a href={`https://wa.me/918291455297?text=${allWaMsg}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                      <span className="absolute inset-0 pointer-events-none" style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                        animation: "shine-sweep 2.5s ease-in-out infinite",
                        backgroundSize: "200% 100%",
                      }} />
                      <FaWhatsapp size={16} className="relative z-10" />
                      <div className="relative z-10">
                        <p className="text-sm font-black">Buy All on WhatsApp</p>
                        <p className="text-[10px] opacity-75">Vinod: +91-8291455297</p>
                      </div>
                    </a>

                    <a href={`https://wa.me/?text=${shareWishlistMsg}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:border-brand-primary hover:text-brand-primary transition-all text-sm">
                      <FaShareAlt size={13} /> Share Wishlist
                    </a>
                  </div>
                </div>

                {/* Why Shop With Us */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm">Why Shop With Us?</h3>
                  <div className="space-y-2.5">
                    {[
                      { icon: "🏪", text: "Trusted since 2001 — Mumbai's own beauty store" },
                      { icon: "🚚", text: "Same Day Delivery in Mumbai" },
                      { icon: "💰", text: "Competitive prices every time" },
                      { icon: "💬", text: "WhatsApp support — instant reply" },
                      { icon: "🌍", text: "Pan India & Worldwide shipping" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-start gap-2.5">
                        <span className="text-base flex-shrink-0">{item.icon}</span>
                        <p className="text-xs text-gray-600 leading-tight">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
